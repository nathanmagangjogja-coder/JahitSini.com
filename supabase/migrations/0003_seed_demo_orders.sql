-- 0003_seed_demo_orders.sql
-- Opsional: seed 2 order contoh, supaya contoh nomor pesanan yang ditampilkan
-- di halaman /tracking ("JS-20260914-001", "JS-20260913-234") tetap bisa dicoba
-- setelah database benar-benar dipakai (bukan lagi data statis di kode).
-- Aman dijalankan berkali-kali karena pakai ON CONFLICT DO NOTHING.

insert into public.orders (
  order_number, customer_name, customer_phone, customer_email,
  service_id, service_name, category, category_label,
  quantity, difficulty, notes, price_estimate, price_final, status,
  photos, timeline, customer_notes
) values (
  'JS-20260914-001', 'Andi Pratama', '081234567890', 'andi.pratama@mail.com',
  'permak-jas', 'Permak Jas', 'permak', 'Permak',
  1, 'sedang',
  'Jas navy, ukuran badan perlu diperkecil di bagian pinggang dan lengan. Panjang celana jas juga perlu dipotong 2cm.',
  95000, 100000, 'sewing',
  '[]'::jsonb,
  '[
    {"status":"received","timestamp":"2026-09-11T09:00:00.000Z","note":"Pakaian diterima di workshop"},
    {"status":"checking","timestamp":"2026-09-11T14:00:00.000Z","note":"Pemeriksaan kondisi jas selesai"},
    {"status":"estimation","timestamp":"2026-09-12T09:00:00.000Z","note":"Estimasi biaya: Rp 100.000, 3 hari kerja"},
    {"status":"approved","timestamp":"2026-09-12T16:00:00.000Z","note":"Pelanggan menyetujui estimasi"},
    {"status":"sewing","timestamp":"2026-09-13T09:00:00.000Z","note":"Sedang dikerjakan oleh penjahit senior"}
  ]'::jsonb,
  '[
    {"id":"n1","author":"Admin Jahitsini","role":"admin","message":"Terima kasih atas pesanannya, Pak Andi! Jas sudah kami terima ya. Kami akan segera proses.","timestamp":"2026-09-11T09:05:00.000Z"},
    {"id":"n2","author":"Andi Pratama","role":"customer","message":"Terima kasih. Mohon perhatikan bagian lapisan dalam jas ya, jangan sampai lepas.","timestamp":"2026-09-11T18:00:00.000Z"}
  ]'::jsonb
)
on conflict (order_number) do nothing;

insert into public.orders (
  order_number, customer_name, customer_phone, customer_email,
  service_id, service_name, category, category_label,
  quantity, difficulty, notes, price_estimate, price_final, status,
  photos, timeline, customer_notes
) values (
  'JS-20260913-234', 'Siti Rahayu', '085678901234', 'siti@mail.com',
  'resleting-jaket', 'Ganti Resleting Jaket', 'resleting', 'Resleting',
  1, 'mudah',
  'Jaket parasut hitam, resleting macet sekitar 20cm, ingin diganti yang baru.',
  55000, 55000, 'done',
  '[]'::jsonb,
  '[
    {"status":"received","timestamp":"2026-09-08T09:00:00.000Z"},
    {"status":"checking","timestamp":"2026-09-08T15:00:00.000Z"},
    {"status":"estimation","timestamp":"2026-09-09T09:00:00.000Z","note":"Estimasi Rp 55.000"},
    {"status":"approved","timestamp":"2026-09-09T13:00:00.000Z"},
    {"status":"sewing","timestamp":"2026-09-10T09:00:00.000Z"},
    {"status":"qc","timestamp":"2026-09-11T11:00:00.000Z","note":"Resleting berfungsi lancar"},
    {"status":"done","timestamp":"2026-09-11T15:00:00.000Z","note":"Pakaian siap diambil"}
  ]'::jsonb,
  '[]'::jsonb
)
on conflict (order_number) do nothing;
