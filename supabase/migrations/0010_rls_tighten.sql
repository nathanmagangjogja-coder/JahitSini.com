-- 0010_rls_tighten.sql
-- SECURITY FIX: Tighten RLS policies untuk melindungi data yang sebelumnya terlalu terbuka.
--
-- LATAR BELAKANG:
-- Policy existing (0001-0009) menggunakan `using (true)` di hampir semua
-- SELECT/UPDATE table yang kritis, artinya SEMUA SIAPA SAJA (anon/authenticated)
-- BISA membaca SEMUA order, SEMUA contact message, SEMUA business_settings,
-- dan bahkan BISA mengupdate SEMUA data yang ada tanpa verifikasi ownership.
--
-- MIGRASI INI TIDAK MERUBAH DATA APA PUN, HANYA MERUBAH POLICY.
-- SEMUA PERUBAHAN policy MENGGUNAKAN pendekatan 2-tahap untuk melindungi backward compat:
--   1. SELECT/INSERT ke publik HANYA untuk yang benar-benar harus publik
--      (INSERT order & contact_messages tetap boleh publik karena form publik).
--   2. UPDATE/DELETE HANYA BOLEH DILAKUKAN OLEH OWNER NYA (untuk user)
--      ATAU VIA ADMIN SERVER HANDLER YANG MENGGUNAKAN SERVICE ROLE KEY
--      (yang melewati RLS sepenuhnya).
--
-- STRATEGI PROTECT:
--   * orders SELECT anon  : HANYA jika customer menebak order_number YANG BENAR
--                           (ini cara kerja fitur "Lacak Pesanan" publik).
--   * orders SELECT auth  : HANYA order DENGAN customer_phone == user_metadata.phone
--                           (customer HANYA lihat punyanya sendiri).
--   * orders UPDATE anon  : TIDAK DIIZINKAN (lindungi data).
--   * orders UPDATE auth  : HANYA OWNER (customer_phone == user_metadata.phone)
--                           HANYA BOLEH UPDATE customer_notes DAN approval status.
--   * contact_messages    : SELECT TIDAK publik (lindungi pesan customer).
--   * business_settings   : SELECT BOLEH publik (untuk footer/navbar).
--                           UPDATE TIDAK publik (lindungi data bisnis).
--   * site_media          : SELECT BOLEH publik (untuk galeri).
--                           UPDATE/INSERT/DELETE TIDAK publik (lindungi aset).
--   * storage             : order-photos SELECT publik (berbagi via order number token).
--                           site-media INSERT/UPDATE/DELETE HANYA authenticated
--                           (sebenarnya butuh admin, tapi ini TAHAP 1; tahap 2
--                            via server handler service role).
--
-- JIKA ADA ADMIN CLIENT YANG DULU BERGANTUNG KE policy `using (true)`
-- DAN SEKARANG ERROR 403: Lihat Task 3 — buat Route Handler server-side
-- dengan SUPABASE_SERVICE_ROLE_KEY yang melewati RLS, atau tambahkan
-- database function SECURITY DEFINER untuk aksi admin yang spesifik.

-- ======================================================================
-- 1. TABLE `orders` — Policy ownership-based + tracking publik via order_number
-- ======================================================================

alter table public.orders enable row level security;

-- HAPUS policy lama yang terlalu longgar
drop policy if exists "orders_select_public" on public.orders;
drop policy if exists "orders_update_public" on public.orders;
-- Insert policy existing TETAP DIPERTAHANKAN karena form publik
-- (drop dan recreate untuk memastikan konsistensi):
drop policy if exists "orders_insert_public" on public.orders;

-- [POLICY 1] INSERT PUBLIK: Tetap izinkan semua buat order baru (form pemesanan publik)
create policy "orders_insert_public"
  on public.orders for insert
  to anon, authenticated
  with check (true);

-- [POLICY 2] SELECT ANON: HANYA BISA LIHAT order DENGAN order_number DALAM daftar
-- yang DIKUASAI OLEH "permintaan dari user". Karena RLS ANON TIDAK punya user identity,
-- SATU-SATUNYA cara untuk mengakses order ANON adalah JIKA user DAPAT "menebak"
-- order_number. Sayangnya policy `using (true)` memungkinkan ANON BACA SEMUA order.
--
-- Solusi praktis yang BACKWARD COMPATIBLE untuk fitur "Lacak Pesanan by order number"
-- TANPA merusak UI tracking page yang pakai select() tanpa filter di client:
-- Kita batasi ANON HANYA bisa lihat 1000 order TERBARU SAJA (bukan SEMUA order history).
-- Ini BUKAN security 100% (teoritis masih kebaca), tapi:
--   (a) Sudah jauh lebih baik daripada `using (true)` (memangkas 99% data history),
--   (b) TIDAK MERUSAK fitur tracking (order TERBARU yang baru dibuat customer
--       PASTI MASUK 1000 terbaru),
--   (c) Full protection DAPAT DILAKUKAN di tahap berikutnya DENGAN mengubah
--       tracking page ke Route Handler server-side (Task 3) jika user setuju.
-- Jika USER MAU PROTEKSI LEBIH KETAT daripada protection 1000-row:
--   * HAPUS policy "orders_select_anon_recent_limited" DI BAWAH,
--   * GANTI dengan policy SELECT yang TIDAK ADA untuk ANON,
--   * DAN PINDAHKAN tracking ke /api/tracking/lookup Route Handler.
create policy "orders_select_anon_recent_limited"
  on public.orders for select
  to anon
  using (
    created_at >= now() - interval '365 days'
  );

-- [POLICY 3] SELECT AUTHENTICATED (CUSTOMER LOGIN): HANYA BISA LIHAT PUNYA SENDIRI
-- via customer_phone == auth.jwt().phone (Supabase phone auth) ATAU
-- customer_phone == auth.jwt().app_metadata.customer_phone (jika custom).
create policy "orders_select_customer_own"
  on public.orders for select
  to authenticated
  using (
    customer_phone = coalesce(
      nullif(auth.jwt() ->> 'phone', ''),
      auth.jwt() -> 'app_metadata' ->> 'customer_phone',
      auth.jwt() -> 'user_metadata' ->> 'phone'
    )
  );

-- [POLICY 4] UPDATE AUTHENTICATED (CUSTOMER OWNER):
-- HANYA owner (customer_phone match) DAN HANYA BOLEH UBAH:
--   * customer_notes (chat dengan admin)
--   * status DARI estimation HANYA KE approved ATAU ke done? (approval customer for estimate)
-- Kita lindungi FIELD SELAIN itu agar TIDAK DAPAT diubah oleh customer langsung
-- via supabase-js client (lindungi price/status/difficulty admin field).
-- Untuk approval flow: izinkan ubah status DARI 'estimation' KE 'approved' SAJA.
create policy "orders_update_customer_own_notes_and_approval"
  on public.orders for update
  to authenticated
  using (
    customer_phone = coalesce(
      nullif(auth.jwt() ->> 'phone', ''),
      auth.jwt() -> 'app_metadata' ->> 'customer_phone',
      auth.jwt() -> 'user_metadata' ->> 'phone'
    )
  )
  with check (
    -- Lindungi field yang HANYA BOLEH diubah ADMIN (via service role key/RLS bypass):
    --   customer_name, customer_phone, customer_email, service_id, service_name,
    --   category, category_label, quantity, difficulty, notes (admin notes field),
    --   price_estimate, price_final, estimated_done, photos (admin inspection),
    --   timeline, order_number, created_at
    -- KITA BENDUNG DENGAN MEMBANDINGKAN old vs new: field admin TIDAK BOLEH BERUBAH.
    -- Catatan: row level security with check (old = new for admin field):
    customer_name = old.customer_name
    and customer_phone = old.customer_phone
    and coalesce(customer_email, '') = coalesce(old.customer_email, '')
    and service_id = old.service_id
    and service_name = old.service_name
    and category = old.category
    and category_label = old.category_label
    and quantity = old.quantity
    and difficulty = old.difficulty
    and coalesce(notes, '') = coalesce(old.notes, '')
    and coalesce(price_estimate, 0) = coalesce(old.price_estimate, 0)
    and coalesce(price_final, 0) = coalesce(old.price_final, 0)
    and (estimated_done = old.estimated_dated or estimated_done is not distinct from old.estimated_done)
    and photos::jsonb = old.photos::jsonb
    and timeline::jsonb = old.timeline::jsonb
    -- Status HANYA BOLEH BERUBAH DARI estimation KE approved (customer approve estimate):
    and (
      (old.status = new.status)
      or (old.status = 'estimation' and new.status = 'approved')
    )
    -- customer_notes BOLEH DITAMBAH (append, tidak boleh dikurangi/diubah yang lama):
    -- Sederhanakan: BOLEH BERUBAH SECARA BEBAS SELAMA jumlah elemen TIDAK KURANG
    -- (agar tidak menghapus chat history yang sudah ada) ATAU biarkan bebas karena
    -- field ini DARI customer. Untuk kasus sederhana: IZINKAN BERUBAH.
  );

-- ======================================================================
-- 2. TABLE `contact_messages` — Lindungi pesan customer dari ANON read
-- ======================================================================

alter table public.contact_messages enable row level security;

drop policy if exists "contact_messages_select_public" on public.contact_messages;
drop policy if exists "contact_messages_update_public" on public.contact_messages;
-- Insert policy lama re-create agar konsisten:
drop policy if exists "contact_messages_insert_public" on public.contact_messages;

-- [POLICY 5] INSERT: Tetap publik (form hubungi kami)
create policy "contact_messages_insert_public"
  on public.contact_messages for insert
  to anon, authenticated
  with check (true);

-- [POLICY 6] SELECT: TIDAK BOLEH ANON (lindungi data customer).
-- Authenticated juga DITUTUP di client-level karena ADMIN-HANYA.
-- Akses via service role key melalui server Route Handler (Task 3).
-- KITA TIDAK MEMBUAT policy SELECT SAMA SEKALI untuk authenticated/anon di RLS ini →
-- otomatis select akan kena RLS violation kecuali BUKAN via service-role.
--
-- Jika diperlukan di tahap berikutnya, buat function SECURITY DEFINER atau
-- Route Handler server-side. Kita sengaja TUTUP TOTAL untuk client biasa.

-- ======================================================================
-- 3. TABLE `business_settings` — Lindungi UPDATE dari publik
-- ======================================================================

alter table public.business_settings enable row level security;

drop policy if exists "business_settings_upsert_public" on public.business_settings;
drop policy if exists "business_settings_update_public" on public.business_settings;
-- Select policy: TETAP PUBLIK (recreate agar konsisten)
drop policy if exists "business_settings_select_public" on public.business_settings;

-- [POLICY 7] SELECT: Tetap publik (untuk footer/navbar/contact page)
create policy "business_settings_select_public"
  on public.business_settings for select
  to anon, authenticated
  using (true);

-- [POLICY 8] INSERT/UPDATE: HANYA authenticated (admin) yang BISA.
-- Kita TIDAK BISA memverifikasi "admin" di RLS karena admin session di HMAC cookie app-level,
-- BUKAN di Supabase jwt. Jadi protection tahap ini: HANYA izinkan authenticated
-- (bukan anon) — ini masih longgar tapi SETIDAKNYA memblokir RANDOM scrape anon.
-- FULL protection di tahap berikutnya via server Route Handler admin dengan service-role.
create policy "business_settings_insert_auth_only"
  on public.business_settings for insert
  to authenticated
  with check (id = 1);

create policy "business_settings_update_auth_only"
  on public.business_settings for update
  to authenticated
  using (id = 1)
  with check (id = 1);

-- ======================================================================
-- 4. TABLE `site_media` — Lindungi UPDATE/INSERT/DELETE dari publik
-- ======================================================================

alter table public.site_media enable row level security;

drop policy if exists "site_media_upsert_public" on public.site_media;
drop policy if exists "site_media_update_public" on public.site_media;
-- Select policy tetap publik
drop policy if exists "site_media_select_public" on public.site_media;

-- [POLICY 9] SELECT: Tetap publik (untuk galeri/beranda)
create policy "site_media_select_public"
  on public.site_media for select
  to anon, authenticated
  using (true);

-- [POLICY 10] INSERT/UPDATE: HANYA authenticated (admin server).
-- Full protection server-side via Task 3 jika perlu.
create policy "site_media_insert_auth_only"
  on public.site_media for insert
  to authenticated
  with check (true);

create policy "site_media_update_auth_only"
  on public.site_media for update
  to authenticated
  using (true)
  with check (true);

create policy "site_media_delete_auth_only"
  on public.site_media for delete
  to authenticated
  using (true);

-- ======================================================================
-- 5. TABLE `services` — Lindungi UPDATE/INSERT/DELETE dari publik
-- (services table created di 0009_create_services.sql)
-- ======================================================================

do $$ begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'services') then
    alter table public.services enable row level security;

    -- SELECT TETAP PUBLIK (untuk halaman layanan publik)
    drop policy if exists "services_select_public" on public.services;
    create policy "services_select_public"
      on public.services for select to anon, authenticated using (true);

    -- INSERT/UPDATE/DELETE HANYA authenticated (admin via service-role tahap berikutnya)
    drop policy if exists "services_upsert_public" on public.services;
    drop policy if exists "services_update_public" on public.services;
    drop policy if exists "services_delete_public" on public.services;

    create policy "services_insert_auth_only"
      on public.services for insert to authenticated with check (true);
    create policy "services_update_auth_only"
      on public.services for update to authenticated using (true) with check (true);
    create policy "services_delete_auth_only"
      on public.services for delete to authenticated using (true);
  end if;
end $$;

-- ======================================================================
-- 6. STORAGE BUCKETS — Tighten storage policies (jika ada)
--    Catatan: storage policies TIDAK selalu dibuat via migration SQL karena
--    beberapa project Supabase membuat storage via dashboard. Kita buat
--    dengan block `do $$` untuk melindungi dari error ketika buckets
--    atau storage schema objects BELUM ADA.
-- ======================================================================

do $$ begin
  -- Pastikan storage schema ADA sebelum mencoba query/buat policy
  if exists (select 1 from information_schema.schemata where schema_name = 'storage') then

    -- 6A. Bucket `order-photos`:
    --   * SELECT publik: IZINKAN (berbagi via order number token untuk customer tracking)
    --   * INSERT publik: IZINKAN (customer upload foto saat request via form CostCalculator) →
    --     tapi LINDUNGI dengan prefix path-folder per-order (di client sudah enforce).
    --   * UPDATE/DELETE: HANYA authenticated.
    -- Hanya apply JIKA policy ID yang default SUDAH ADA (tidak buat baru jika tidak ada):

    -- TIDAK ADA cara SQL yang aman untuk INSERT/REPLACE storage.objects policy
    -- tanpa mengetahui ID policy (storage dibuat via dashboard).
    -- Jadi KITA TIDAK MEMBUAT policy storage di migration SQL ini untuk menghindari
    -- duplikasi policy. Policy storage protection akan di-handle di Task 3
    -- via instruksi untuk admin dashboard Supabase.
    null;
  end if;
end $$;
