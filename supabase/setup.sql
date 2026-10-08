-- ---------------------------------------------------------------------
-- A. Fungsi pembantu: otomatis mengisi updated_at
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;


-- ---------------------------------------------------------------------
-- B. business_settings  (kontak, sosial media, logo, peta; selalu 1 baris, id = 1)
-- ---------------------------------------------------------------------
create table if not exists public.business_settings (
  id int primary key default 1,
  whatsapp text,
  phone text,
  email text,
  address text,
  operating_hours text,
  website_url text,
  logo_url text,
  favicon_url text,
  map_lat double precision,
  map_lng double precision,
  photo_max_dimension integer not null default 1600,
  instagram_url text,
  facebook_url text,
  tiktok_url text,
  youtube_url text,
  updated_at timestamptz not null default now(),
  constraint business_settings_singleton check (id = 1)
);

-- Untuk database lama: tambahkan kolom yang belum ada.
alter table public.business_settings add column if not exists whatsapp text;
alter table public.business_settings add column if not exists phone text;
alter table public.business_settings add column if not exists email text;
alter table public.business_settings add column if not exists address text;
alter table public.business_settings add column if not exists operating_hours text;
alter table public.business_settings add column if not exists website_url text;
alter table public.business_settings add column if not exists logo_url text;
alter table public.business_settings add column if not exists favicon_url text;
alter table public.business_settings add column if not exists map_lat double precision;
alter table public.business_settings add column if not exists map_lng double precision;
alter table public.business_settings add column if not exists photo_max_dimension integer not null default 1600;
alter table public.business_settings add column if not exists instagram_url text;
alter table public.business_settings add column if not exists facebook_url text;
alter table public.business_settings add column if not exists tiktok_url text;
alter table public.business_settings add column if not exists youtube_url text;

-- Kolom notifikasi (fitur sudah dihapus dari aplikasi).
alter table public.business_settings drop column if exists notify_new_order_email;
alter table public.business_settings drop column if exists notify_urgent_whatsapp;
alter table public.business_settings drop column if exists notify_daily_report;
alter table public.business_settings drop column if exists notify_email;

drop trigger if exists business_settings_set_updated_at on public.business_settings;
create trigger business_settings_set_updated_at
  before update on public.business_settings
  for each row execute function public.set_updated_at();

alter table public.business_settings enable row level security;

drop policy if exists "business_settings_select_public" on public.business_settings;
drop policy if exists "business_settings_upsert_public" on public.business_settings;
drop policy if exists "business_settings_update_public" on public.business_settings;
drop policy if exists "business_settings_insert_auth_only" on public.business_settings;
drop policy if exists "business_settings_update_auth_only" on public.business_settings;

create policy "business_settings_select_public"
  on public.business_settings for select
  to anon, authenticated
  using (true);

insert into public.business_settings (id) values (1) on conflict (id) do nothing;


-- ---------------------------------------------------------------------
-- C. site_media  (foto website; slot-nya didaftarkan di kode, barisnya muncul saat admin upload)
-- ---------------------------------------------------------------------
create table if not exists public.site_media (
  key text primary key,
  url text not null,
  label text not null,
  category text not null,
  updated_at timestamptz not null default now()
);

drop trigger if exists site_media_set_updated_at on public.site_media;
create trigger site_media_set_updated_at
  before update on public.site_media
  for each row execute function public.set_updated_at();

alter table public.site_media enable row level security;

drop policy if exists "site_media_select_public" on public.site_media;
drop policy if exists "site_media_upsert_public" on public.site_media;
drop policy if exists "site_media_update_public" on public.site_media;
drop policy if exists "site_media_insert_auth_only" on public.site_media;
drop policy if exists "site_media_update_auth_only" on public.site_media;
drop policy if exists "site_media_delete_auth_only" on public.site_media;

create policy "site_media_select_public"
  on public.site_media for select
  to anon, authenticated
  using (true);


-- ---------------------------------------------------------------------
-- D. services  (katalog layanan, tanpa harga)
-- ---------------------------------------------------------------------
create table if not exists public.services (
  id text primary key,
  name text not null,
  description text not null,
  duration text not null,
  category text not null check (category in ('permak', 'reparasi', 'resleting', 'aksesoris')),
  icon text not null default 'scissors',
  is_active boolean not null default true,
  long_description text,
  includes jsonb not null default '[]'::jsonb,
  steps jsonb not null default '[]'::jsonb,
  tips jsonb not null default '[]'::jsonb,
  faqs jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Untuk database lama: kolom detail + buang kolom harga.
alter table public.services add column if not exists long_description text;
alter table public.services add column if not exists includes jsonb not null default '[]'::jsonb;
alter table public.services add column if not exists steps jsonb not null default '[]'::jsonb;
alter table public.services add column if not exists tips jsonb not null default '[]'::jsonb;
alter table public.services add column if not exists faqs jsonb not null default '[]'::jsonb;
alter table public.services drop column if exists price_start;
alter table public.services drop column if exists price_notes;

drop trigger if exists services_set_updated_at on public.services;
create trigger services_set_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

alter table public.services enable row level security;

drop policy if exists "services_select_public" on public.services;
drop policy if exists "services_insert_public" on public.services;
drop policy if exists "services_upsert_public" on public.services;
drop policy if exists "services_update_public" on public.services;
drop policy if exists "services_delete_public" on public.services;
drop policy if exists "services_insert_auth_only" on public.services;
drop policy if exists "services_update_auth_only" on public.services;
drop policy if exists "services_delete_auth_only" on public.services;

-- Baris nonaktif (is_active = false) tetap terbaca supaya layanan yang dihapus admin
-- tidak muncul kembali dari data bawaan di kode. Penyaringannya dilakukan aplikasi.
create policy "services_select_public"
  on public.services for select
  to anon, authenticated
  using (true);

-- 13 layanan awal (diabaikan kalau id-nya sudah ada).
insert into public.services (id, name, description, duration, category, icon) values
  ('permak-potong-celana', 'Potong Celana', 'Potong panjang celana sesuai ukuran kaki dengan hasil jahitan rapi.', '1-2 hari', 'permak', 'scissors'),
  ('permak-kecilkan-baju', 'Kecilkan Baju', 'Kecilkan ukuran baju baik di bagian badan, lengan, maupun bagian lain.', '2-3 hari', 'permak', 'shirt'),
  ('permak-besarkan-pakaian', 'Besarkan Pakaian', 'Besarkan ukuran pakaian dengan menyisipkan kain tambahan yang serasi.', '2-4 hari', 'permak', 'maximize'),
  ('permak-jas', 'Permak Jas', 'Permak detail jas: lengan, badan, celana jas agar presisi dan rapi.', '3-5 hari', 'permak', 'briefcase'),
  ('permak-jaket', 'Permak Jaket', 'Ubah ukuran jaket sesuai bentuk badan, tanpa merusak desain asli.', '3-4 hari', 'permak', 'shirt'),
  ('reparasi-jahit-sobekan', 'Jahit Sobekan', 'Jahit sobekan pada kain dengan jahitan tersembunyi dan rapi.', '1-2 hari', 'reparasi', 'needle'),
  ('reparasi-tambal-pakaian', 'Tambal Pakaian', 'Tambal bagian pakaian yang bolong dengan kain patch yang cocok.', '1-2 hari', 'reparasi', 'patch-plus'),
  ('reparasi-perbaikan-jahitan', 'Perbaikan Jahitan', 'Perbaiki jahitan yang lepas atau renggang agar kembali kuat.', '1 hari', 'reparasi', 'suture'),
  ('resleting-celana', 'Ganti Resleting Celana', 'Ganti resleting celana dengan ukuran dan kualitas sesuai aslinya.', '1-2 hari', 'resleting', 'zap'),
  ('resleting-jaket', 'Ganti Resleting Jaket', 'Ganti resleting jaket dengan presisi tinggi, cocok untuk jaket tebal.', '2-3 hari', 'resleting', 'zap'),
  ('resleting-tas', 'Ganti Resleting Tas', 'Ganti resleting tas ransel, koper, atau tas jinjing dengan kuat.', '1-3 hari', 'resleting', 'zap'),
  ('aksesoris-pasang-kancing', 'Pasang Kancing', 'Pasang kancing baru dengan model dan ukuran yang sesuai.', '1 hari', 'aksesoris', 'circle-dot'),
  ('aksesoris-ganti-kancing', 'Ganti Kancing', 'Lepas kancing lama dan ganti dengan kancing baru pilihanmu.', '1 hari', 'aksesoris', 'refresh-cw')
on conflict (id) do nothing;


-- ---------------------------------------------------------------------
-- E. admin_users  (satu admin; hanya service role yang bisa membaca/menulis)
-- ---------------------------------------------------------------------
create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  password_hash text not null,
  role text not null default 'admin',
  full_name text,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
-- Sengaja TANPA policy: anon/authenticated tidak bisa mengakses tabel ini sama sekali.

-- Baris admin dibuat dengan password ACAK yang tidak diketahui siapa pun.
-- Untuk login pertama: isi ADMIN_RECOVERY_PASSWORD di .env, login (username: admin),
-- lalu ganti password lewat Admin > Ganti Password. Baris yang sudah ada TIDAK diubah.
insert into public.admin_users (username, password_hash, full_name)
values ('admin', '$2b$10$3Hc0h677Tx3lJU0OfGMfsu6h67u9iNZ6XXsGi.8ifMMIivpT1rIFC', 'Admin Jahitsini')
on conflict (username) do nothing;


-- ---------------------------------------------------------------------
-- F. Storage  (bucket publik; unggah hanya lewat API server dengan service role)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('site-media', 'site-media', true)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'brand-assets', 'brand-assets', true, 204800,
  array['image/png', 'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon']
)
on conflict (id) do update
  set public = true,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Cabut policy lama yang mengizinkan SIAPA PUN mengunggah ke bucket.
-- (Bucket publik tetap bisa dibuka lewat URL-nya tanpa policy.)
do $$
begin
  drop policy if exists "site_media_bucket_insert_public" on storage.objects;
  drop policy if exists "site_media_bucket_select_public" on storage.objects;
  drop policy if exists "site_media_bucket_update_public" on storage.objects;
  drop policy if exists "order_photos_insert_public" on storage.objects;
  drop policy if exists "order_photos_select_public" on storage.objects;
exception
  when insufficient_privilege then
    raise notice 'Tidak punya izin mengubah policy storage; hapus policy lama lewat dashboard: Storage > Policies.';
end
$$;


-- ---------------------------------------------------------------------
-- G. Bersihkan sisa versi lama (pesanan & pesan kontak sudah tidak dipakai aplikasi)
-- ---------------------------------------------------------------------
-- Tabel dibiarkan (data lama aman), tetapi semua policy-nya dicabut. Dengan RLS aktif
-- dan tanpa policy, tabel ini terkunci rapat: tidak bisa dibaca/ditulis lewat anon key.
do $$
begin
  if to_regclass('public.orders') is not null then
    drop policy if exists "orders_insert_public" on public.orders;
    drop policy if exists "orders_select_public" on public.orders;
    drop policy if exists "orders_update_public" on public.orders;
    drop policy if exists "orders_select_anon_recent_limited" on public.orders;
    drop policy if exists "orders_select_customer_own" on public.orders;
    drop policy if exists "orders_update_customer_own_notes_and_approval" on public.orders;
    alter table public.orders drop column if exists price_estimate;
    alter table public.orders drop column if exists price_final;
    alter table public.orders enable row level security;
  end if;

  if to_regclass('public.contact_messages') is not null then
    drop policy if exists "contact_messages_insert_public" on public.contact_messages;
    drop policy if exists "contact_messages_select_public" on public.contact_messages;
    drop policy if exists "contact_messages_update_public" on public.contact_messages;
    alter table public.contact_messages enable row level security;
  end if;
end
$$;


-- ---------------------------------------------------------------------
-- (OPSIONAL, MENGHAPUS DATA PERMANEN) Buang tabel lama sepenuhnya.
-- Hapus tanda "--" di depan dua baris di bawah HANYA kalau kamu yakin
-- data pesanan dan pesan kontak lama tidak diperlukan lagi.
-- Bucket 'order-photos' tidak bisa dihapus lewat SQL: hapus lewat Storage di dashboard.
-- ---------------------------------------------------------------------
-- drop table if exists public.orders cascade;
-- drop table if exists public.contact_messages cascade;


-- Supaya PostgREST langsung mengenali perubahan kolom.
notify pgrst, 'reload schema';


-- ---------------------------------------------------------------------
-- H. Verifikasi: hasil akhir yang tampil di SQL Editor.
-- Yang benar: HANYA ada policy "select" (untuk business_settings, site_media, services).
-- Tabel admin_users, orders, contact_messages tidak boleh punya policy sama sekali.
-- ---------------------------------------------------------------------
select tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
