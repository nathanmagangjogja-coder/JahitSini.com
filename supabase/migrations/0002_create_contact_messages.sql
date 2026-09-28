-- 0002_create_contact_messages.sql
-- Menyimpan pesan dari form "Hubungi Kami".

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  subject text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists contact_messages_created_at_idx on public.contact_messages (created_at desc);
create index if not exists contact_messages_is_read_idx on public.contact_messages (is_read);

alter table public.contact_messages enable row level security;

-- Siapa saja boleh mengirim pesan (form publik)
drop policy if exists "contact_messages_insert_public" on public.contact_messages;
create policy "contact_messages_insert_public"
  on public.contact_messages for insert
  to anon, authenticated
  with check (true);

-- Dibaca oleh panel admin. Sama seperti orders, ini masih permissive (anon boleh SELECT)
-- karena project belum punya server-side admin auth dengan service role key.
drop policy if exists "contact_messages_select_public" on public.contact_messages;
create policy "contact_messages_select_public"
  on public.contact_messages for select
  to anon, authenticated
  using (true);

drop policy if exists "contact_messages_update_public" on public.contact_messages;
create policy "contact_messages_update_public"
  on public.contact_messages for update
  to anon, authenticated
  using (true)
  with check (true);
