-- 0005_create_order_photos_bucket.sql
-- Bucket storage untuk foto pakaian yang diupload pelanggan saat membuat pesanan.
-- Jalankan migration ini lewat SQL Editor Supabase (bukan lewat CLI biasa),
-- karena storage.buckets adalah tabel bawaan Supabase Storage.

insert into storage.buckets (id, name, public)
values ('order-photos', 'order-photos', true)
on conflict (id) do nothing;

-- Siapa saja boleh upload foto (form pemesanan publik, tanpa login)
drop policy if exists "order_photos_insert_public" on storage.objects;
create policy "order_photos_insert_public"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'order-photos');

-- Foto bersifat publik supaya bisa ditampilkan di halaman detail order & panel admin
drop policy if exists "order_photos_select_public" on storage.objects;
create policy "order_photos_select_public"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'order-photos');
