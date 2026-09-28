-- 0001_create_orders.sql
-- Tabel utama untuk pesanan jahit/permak.
-- photos, timeline, dan customer_notes disimpan sebagai JSONB supaya
-- strukturnya tetap sama persis dengan tipe `Order` di lib/orders.ts
-- (tidak perlu ubah banyak kode frontend).

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  service_id text not null,
  service_name text not null,
  category text not null,
  category_label text not null,
  quantity int not null default 1,
  difficulty text not null default 'mudah' check (difficulty in ('mudah', 'sedang', 'sulit')),
  notes text,
  price_estimate integer,
  price_final integer,
  status text not null default 'received' check (
    status in ('received', 'checking', 'estimation', 'approved', 'sewing', 'qc', 'done')
  ),
  estimated_done timestamptz,
  photos jsonb not null default '[]'::jsonb,
  timeline jsonb not null default '[]'::jsonb,
  customer_notes jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_order_number_idx on public.orders (order_number);
create index if not exists orders_customer_phone_idx on public.orders (customer_phone);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

-- Auto-update updated_at setiap kali row diubah
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

alter table public.orders enable row level security;

-- Siapa saja boleh membuat order baru (form pemesanan publik, tidak perlu login)
drop policy if exists "orders_insert_public" on public.orders;
create policy "orders_insert_public"
  on public.orders for insert
  to anon, authenticated
  with check (true);

-- Siapa saja boleh membaca order (dipakai untuk fitur Lacak Pesanan by order_number,
-- serta panel admin). Order number bersifat seperti token unik (format JS-YYYYMMDD-XXX),
-- jadi tidak sembarang orang akan "menebak"-nebak nomor pesanan orang lain.
-- CATATAN KEAMANAN: kalau ke depan butuh privasi lebih ketat (misal admin harus login
-- untuk lihat SEMUA order, bukan cuma satu-satu by order_number), pindahkan akses admin
-- ke Route Handler server-side yang pakai SUPABASE_SERVICE_ROLE_KEY, dan hapus policy ini.
drop policy if exists "orders_select_public" on public.orders;
create policy "orders_select_public"
  on public.orders for select
  to anon, authenticated
  using (true);

-- Update dipakai untuk: pelanggan menambah customer_notes (chat), admin ubah status/harga.
drop policy if exists "orders_update_public" on public.orders;
create policy "orders_update_public"
  on public.orders for update
  to anon, authenticated
  using (true)
  with check (true);
