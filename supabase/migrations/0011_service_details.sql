alter table public.services add column if not exists long_description text;
alter table public.services add column if not exists includes jsonb not null default '[]'::jsonb;
alter table public.services add column if not exists steps jsonb not null default '[]'::jsonb;
alter table public.services add column if not exists tips jsonb not null default '[]'::jsonb;
alter table public.services add column if not exists price_notes text;
alter table public.services add column if not exists faqs jsonb not null default '[]'::jsonb;

-- Supaya PostgREST langsung mengenali kolom baru.
notify pgrst, 'reload schema';
