alter table public.business_settings
  add column if not exists map_lat double precision,
  add column if not exists map_lng double precision;
