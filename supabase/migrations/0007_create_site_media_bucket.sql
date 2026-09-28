-- 0007_create_site_media_bucket.sql
insert into storage.buckets (id, name, public)
values ('site-media', 'site-media', true)
on conflict (id) do nothing;

drop policy if exists "site_media_bucket_insert_public" on storage.objects;
create policy "site_media_bucket_insert_public"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'site-media');

drop policy if exists "site_media_bucket_select_public" on storage.objects;
create policy "site_media_bucket_select_public"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'site-media');

drop policy if exists "site_media_bucket_update_public" on storage.objects;
create policy "site_media_bucket_update_public"
  on storage.objects for update
  to anon, authenticated
  using (bucket_id = 'site-media');
