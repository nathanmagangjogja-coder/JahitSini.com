-- 0008_enable_realtime_orders.sql
-- Mengaktifkan Supabase Realtime untuk tabel orders, supaya chat pelanggan <-> admin
-- bisa update otomatis (live) tanpa perlu refresh halaman manual.

alter publication supabase_realtime add table public.orders;
