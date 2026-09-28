-- 0004_create_business_settings.sql
-- Satu baris konfigurasi bisnis yang bisa diedit admin dari /admin/settings,
-- menggantikan env var BUSINESS_* yang sifatnya statis (butuh redeploy untuk ubah).
-- Env var tetap dipakai sebagai nilai default/awal (lihat lib/settings.ts).

create table if not exists public.business_settings (
  id int primary key default 1,
  whatsapp text,
  phone text,
  email text,
  address text,
  operating_hours text,
  website_url text,
  notify_new_order_email boolean not null default true,
  notify_urgent_whatsapp boolean not null default true,
  notify_daily_report boolean not null default false,
  updated_at timestamptz not null default now(),
  constraint business_settings_singleton check (id = 1)
);

drop trigger if exists business_settings_set_updated_at on public.business_settings;
create trigger business_settings_set_updated_at
  before update on public.business_settings
  for each row execute function public.set_updated_at();

alter table public.business_settings enable row level security;

-- Baca boleh publik (dipakai Navbar/Footer/Hubungi Kami untuk tampilkan kontak bisnis).
drop policy if exists "business_settings_select_public" on public.business_settings;
create policy "business_settings_select_public"
  on public.business_settings for select
  to anon, authenticated
  using (true);

-- Tulis: permissive sama seperti tabel lain (proteksi sebenarnya ada di app-level
-- lewat gerbang login /admin/login, bukan RLS granular per role).
drop policy if exists "business_settings_upsert_public" on public.business_settings;
create policy "business_settings_upsert_public"
  on public.business_settings for insert
  to anon, authenticated
  with check (true);

drop policy if exists "business_settings_update_public" on public.business_settings;
create policy "business_settings_update_public"
  on public.business_settings for update
  to anon, authenticated
  using (true)
  with check (true);

insert into public.business_settings (id) values (1) on conflict (id) do nothing;
