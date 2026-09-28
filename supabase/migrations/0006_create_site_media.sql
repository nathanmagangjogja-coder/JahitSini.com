-- 0006_create_site_media.sql
-- Tabel untuk semua foto yang tampil di halaman publik (beranda & galeri hasil jahitan),
-- supaya admin bisa upload/ganti foto sendiri lewat /admin/media tanpa perlu edit kode.
-- Kolom `url` awalnya diisi foto placeholder AI (dari trae.ai) sebagai nilai sementara;
-- begitu admin upload foto baru lewat panel admin, kolom ini akan diperbarui otomatis.

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
create policy "site_media_select_public"
  on public.site_media for select
  to anon, authenticated
  using (true);

drop policy if exists "site_media_upsert_public" on public.site_media;
create policy "site_media_upsert_public"
  on public.site_media for insert
  to anon, authenticated
  with check (true);

drop policy if exists "site_media_update_public" on public.site_media;
create policy "site_media_update_public"
  on public.site_media for update
  to anon, authenticated
  using (true)
  with check (true);

-- Seed: 13 foto di halaman Beranda + 16 foto di halaman Hasil Jahitan (galeri) = 29 slot.
insert into public.site_media (key, url, label, category) values
  ('home_work_1_before', 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=photo%20of%20a%20dark%20navy%20business%20suit%20jacket%20too%20long%20sleeves%20loose%20fit%20on%20hanger%20soft%20studio%20lighting%20white%20background&image_size=square', 'Beranda - Permak Jas (Sebelum)', 'Beranda: Portofolio'),
  ('home_work_1_after', 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=photo%20of%20a%20perfect%20fitted%20navy%20business%20suit%20tailored%20sharp%20fit%20on%20mannequin%20soft%20studio%20lighting%20white%20background&image_size=square', 'Beranda - Permak Jas (Sesudah)', 'Beranda: Portofolio'),
  ('home_work_2_before', 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=photo%20of%20a%20brown%20leather%20jacket%20with%20a%20visible%20tear%20near%20the%20pocket%20soft%20studio%20lighting%20white%20background&image_size=square', 'Beranda - Jaket Kulit (Sebelum)', 'Beranda: Portofolio'),
  ('home_work_2_after', 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=photo%20of%20a%20brown%20leather%20jacket%20fully%20repaired%20clean%20stitching%20no%20visible%20tear%20soft%20studio%20lighting%20white%20background&image_size=square', 'Beranda - Jaket Kulit (Sesudah)', 'Beranda: Portofolio'),
  ('home_work_3_before', 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=photo%20of%20a%20broken%20zipper%20on%20a%20black%20winter%20jacket%20close%20up%20soft%20studio%20lighting&image_size=square', 'Beranda - Resleting Jaket (Sebelum)', 'Beranda: Portofolio'),
  ('home_work_3_after', 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=photo%20of%20a%20new%20high%20quality%20zipper%20installed%20on%20a%20black%20winter%20jacket%20clean%20stitching%20close%20up%20soft%20studio%20lighting&image_size=square', 'Beranda - Resleting Jaket (Sesudah)', 'Beranda: Portofolio'),
  ('home_work_4_before', 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=photo%20of%20too%20long%20blue%20denim%20jeans%20on%20a%20person%20pants%20bunching%20at%20ankles%20side%20view&image_size=square', 'Beranda - Celana Jeans (Sebelum)', 'Beranda: Portofolio'),
  ('home_work_4_after', 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=photo%20of%20perfect%20length%20blue%20denim%20jeans%20on%20a%20person%20clean%20hem%20just%20touching%20shoes%20side%20view&image_size=square', 'Beranda - Celana Jeans (Sesudah)', 'Beranda: Portofolio'),
  ('home_workshop_1', 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=professional%20indonesian%20tailor%20sewing%20on%20industrial%20machine%20bright%20workshop%20natural%20light%20clean%20premium&image_size=landscape_4_3', 'Beranda - Foto Workshop: Menjahit', 'Beranda: Workshop'),
  ('home_workshop_2', 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=close%20up%20hands%20measuring%20a%20shirt%20with%20measuring%20tape%20bright%20soft%20lighting%20premium%20tailor&image_size=portrait_4_3', 'Beranda - Foto Workshop: Mengukur', 'Beranda: Workshop'),
  ('home_workshop_3', 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=close%20up%20replacing%20a%20zipper%20on%20a%20jacket%20professional%20tailor%20workspace%20bright%20clean&image_size=square', 'Beranda - Foto Workshop: Ganti Resleting', 'Beranda: Workshop'),
  ('home_workshop_4', 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=wide%20shot%20of%20clean%20modern%20tailor%20workshop%20with%20multiple%20sewing%20machines%20bright%20minimal&image_size=landscape_16_9', 'Beranda - Foto Workshop: Tampak Luas', 'Beranda: Workshop'),
  ('home_testimonial_1', 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=happy%20indonesian%20customer%20receiving%20freshly%20tailored%20clothes%20from%20a%20friendly%20tailor%20bright%20modern%20workshop%20clean%20premium&image_size=square', 'Beranda - Foto Testimoni Pelanggan', 'Beranda: Testimoni'),
  ('gallery_1_before', 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=unfitted%20wedding%20tuxedo%20jacket%20too%20loose%20on%20mannequin%20soft%20studio%20lighting%20white%20background&image_size=square', 'Galeri - Jas Pengantin (Sebelum)', 'Galeri Hasil Jahitan'),
  ('gallery_1_after', 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=perfectly%20fitted%20elegant%20black%20wedding%20tuxedo%20on%20a%20mannequin%20soft%20premium%20studio%20lighting%20white%20background&image_size=square', 'Galeri - Jas Pengantin (Sesudah)', 'Galeri Hasil Jahitan'),
  ('gallery_2_before', 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=mens%20white%20office%20shirt%20too%20big%20loose%20fit%20on%20hanger%20soft%20studio%20lighting&image_size=square', 'Galeri - Kemeja Kantor (Sebelum)', 'Galeri Hasil Jahitan'),
  ('gallery_2_after', 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=mens%20white%20office%20shirt%20perfect%20slim%20fit%20on%20hanger%20sharp%20tailored%20soft%20lighting&image_size=square', 'Galeri - Kemeja Kantor (Sesudah)', 'Galeri Hasil Jahitan'),
  ('gallery_3_before', 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=black%20leather%20jacket%20with%20a%20big%20tear%20on%20the%20pocket%20area%20soft%20studio%20lighting&image_size=square', 'Galeri - Jaket Kulit (Sebelum)', 'Galeri Hasil Jahitan'),
  ('gallery_3_after', 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=black%20leather%20jacket%20fully%20restored%20clean%20invisible%20repair%20soft%20studio%20lighting&image_size=square', 'Galeri - Jaket Kulit (Sesudah)', 'Galeri Hasil Jahitan'),
  ('gallery_4_before', 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=laptop%20bag%20with%20broken%20zipper%20close%20up%20shot%20soft%20lighting&image_size=square', 'Galeri - Resleting Tas (Sebelum)', 'Galeri Hasil Jahitan'),
  ('gallery_4_after', 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=laptop%20bag%20with%20brand%20new%20high%20quality%20zipper%20clean%20stitching%20soft%20lighting&image_size=square', 'Galeri - Resleting Tas (Sesudah)', 'Galeri Hasil Jahitan'),
  ('gallery_5_before', 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=khaki%20chino%20pants%20too%20long%20bunched%20up%20at%20ankles%20side%20view&image_size=square', 'Galeri - Celana Chino (Sebelum)', 'Galeri Hasil Jahitan'),
  ('gallery_5_after', 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=khaki%20chino%20pants%20perfect%20length%20clean%20hem%20just%20touching%20shoes%20side%20view&image_size=square', 'Galeri - Celana Chino (Sesudah)', 'Galeri Hasil Jahitan'),
  ('gallery_6_before', 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=corporate%20uniform%20shirt%20with%20loose%20seams%20missing%20button%20soft%20lighting&image_size=square', 'Galeri - Seragam (Sebelum)', 'Galeri Hasil Jahitan'),
  ('gallery_6_after', 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=corporate%20uniform%20shirt%20fully%20restored%20new%20buttons%20tight%20seams%20soft%20lighting&image_size=square', 'Galeri - Seragam (Sesudah)', 'Galeri Hasil Jahitan'),
  ('gallery_7_before', 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=indonesian%20batik%20fabric%20with%20a%20visible%20tear%20soft%20lighting%20white%20background&image_size=square', 'Galeri - Kain Batik (Sebelum)', 'Galeri Hasil Jahitan'),
  ('gallery_7_after', 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=indonesian%20batik%20fabric%20with%20invisible%20repair%20clean%20restored%20soft%20lighting&image_size=square', 'Galeri - Kain Batik (Sesudah)', 'Galeri Hasil Jahitan'),
  ('gallery_8_before', 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=elegant%20evening%20gown%20too%20tight%20small%20on%20mannequin%20soft%20premium%20lighting&image_size=square', 'Galeri - Gaun Pesta (Sebelum)', 'Galeri Hasil Jahitan'),
  ('gallery_8_after', 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=elegant%20evening%20gown%20perfectly%20fitted%20on%20mannequin%20flowing%20premium%20soft%20lighting&image_size=square', 'Galeri - Gaun Pesta (Sesudah)', 'Galeri Hasil Jahitan')
on conflict (key) do nothing;
