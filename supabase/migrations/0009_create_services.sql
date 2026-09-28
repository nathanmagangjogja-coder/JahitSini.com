-- 0009_create_services.sql
-- Tabel katalog layanan, supaya admin bisa tambah/edit/hapus layanan sendiri
-- lewat /admin/services tanpa perlu edit kode. Field foto/gambar belum ada
-- di migration ini (menyusul nanti kalau upload gambar layanan dikerjakan).

create table if not exists public.services (
  id text primary key,
  name text not null,
  description text not null,
  price_start integer not null,
  duration text not null,
  category text not null check (category in ('permak', 'reparasi', 'resleting', 'aksesoris')),
  icon text not null default 'scissors',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists services_set_updated_at on public.services;
create trigger services_set_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

alter table public.services enable row level security;

drop policy if exists "services_select_public" on public.services;
create policy "services_select_public"
  on public.services for select
  to anon, authenticated
  using (true);

drop policy if exists "services_insert_public" on public.services;
create policy "services_insert_public"
  on public.services for insert
  to anon, authenticated
  with check (true);

drop policy if exists "services_update_public" on public.services;
create policy "services_update_public"
  on public.services for update
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "services_delete_public" on public.services;
create policy "services_delete_public"
  on public.services for delete
  to anon, authenticated
  using (true);

-- Seed 13 layanan yang sudah ada sebelumnya, supaya tidak ada yang hilang saat migrasi.
insert into public.services (id, name, description, price_start, duration, category, icon) values
  ('permak-potong-celana', 'Potong Celana', 'Potong panjang celana sesuai ukuran kaki dengan hasil jahitan rapi.', 25000, '1-2 hari', 'permak', 'scissors'),
  ('permak-kecilkan-baju', 'Kecilkan Baju', 'Kecilkan ukuran baju baik di bagian badan, lengan, maupun bagian lain.', 45000, '2-3 hari', 'permak', 'shirt'),
  ('permak-besarkan-pakaian', 'Besarkan Pakaian', 'Besarkan ukuran pakaian dengan menyisipkan kain tambahan yang serasi.', 60000, '2-4 hari', 'permak', 'maximize'),
  ('permak-jas', 'Permak Jas', 'Permak detail jas: lengan, badan, celana jas agar presisi dan rapi.', 85000, '3-5 hari', 'permak', 'briefcase'),
  ('permak-jaket', 'Permak Jaket', 'Ubah ukuran jaket sesuai bentuk badan, tanpa merusak desain asli.', 75000, '3-4 hari', 'permak', 'shirt'),
  ('reparasi-jahit-sobekan', 'Jahit Sobekan', 'Jahit sobekan pada kain dengan jahitan tersembunyi dan rapi.', 20000, '1-2 hari', 'reparasi', 'needle'),
  ('reparasi-tambal-pakaian', 'Tambal Pakaian', 'Tambal bagian pakaian yang bolong dengan kain patch yang cocok.', 30000, '1-2 hari', 'reparasi', 'patch-plus'),
  ('reparasi-perbaikan-jahitan', 'Perbaikan Jahitan', 'Perbaiki jahitan yang lepas atau renggang agar kembali kuat.', 20000, '1 hari', 'reparasi', 'suture'),
  ('resleting-celana', 'Ganti Resleting Celana', 'Ganti resleting celana dengan ukuran dan kualitas sesuai aslinya.', 35000, '1-2 hari', 'resleting', 'zap'),
  ('resleting-jaket', 'Ganti Resleting Jaket', 'Ganti resleting jaket dengan presisi tinggi, cocok untuk jaket tebal.', 50000, '2-3 hari', 'resleting', 'zap'),
  ('resleting-tas', 'Ganti Resleting Tas', 'Ganti resleting tas ransel, koper, atau tas jinjing dengan kuat.', 45000, '1-3 hari', 'resleting', 'zap'),
  ('aksesoris-pasang-kancing', 'Pasang Kancing', 'Pasang kancing baru dengan model dan ukuran yang sesuai.', 15000, '1 hari', 'aksesoris', 'circle-dot'),
  ('aksesoris-ganti-kancing', 'Ganti Kancing', 'Lepas kancing lama dan ganti dengan kancing baru pilihanmu.', 18000, '1 hari', 'aksesoris', 'refresh-cw')
on conflict (id) do nothing;
