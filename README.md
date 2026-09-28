# Jahitsini.com - Jasa Jahit, Permak & Reparasi Pakaian

Platform jasa jahit & permak berbasis web, dibangun dengan Next.js 14 (App Router), TypeScript, TailwindCSS, dan Supabase.

## ✨ Fitur Utama

**Website publik**
- 🏠 **Beranda** - Hero, statistik, layanan unggulan, cara kerja, portofolio, dan CTA
- 🧵 **Layanan** - Daftar layanan per kategori (Permak, Reparasi, Resleting, Aksesoris) beserta halaman detail
- 🧮 **Kalkulator Estimasi Biaya** - Estimasi harga berdasarkan layanan, tingkat kesulitan, dan jumlah
- 🔧 **Cara Kerja**, 📸 **Hasil Jahitan**, ❓ **FAQ**
- 📞 **Hubungi Kami** - Form kontak; pesan masuk ke dashboard admin
- 💬 **Pemesanan via WhatsApp** - Form pesanan menghasilkan pesan WhatsApp siap kirim
- 📍 **Lacak Pesanan** - Status, timeline, foto, dan estimasi biaya berdasarkan nomor pesanan
- 💬 **Chat dengan Admin** (di halaman Lacak Pesanan)
  - Pelanggan bisa mengirim pesan langsung ke admin, dan balasan admin muncul otomatis (pengecekan tiap 5 detik).
  - Chat aktif selama pesanan belum selesai.
  - Setelah status **Selesai**, chat tetap aktif **1 jam**, lalu dinonaktifkan (riwayat tetap terbaca). Aturan ini dicek di server (`lib/chatPolicy.ts`).
  - Batas: 500 karakter per pesan, 10 pesan per menit.

**Dashboard admin** (`/admin`, satu admin)
- 📦 Pesanan (ubah status, harga, balas chat), 👤 Pelanggan, ✉️ Pesan masuk, 🧵 Layanan, 🖼️ Foto Website, ⚙️ Pengaturan
- 🔑 **Ganti Password** dengan indikator kekuatan password
- 🔒 Sesi login berlaku **1 jam**, cookie `httpOnly`
- 📲 **Notifikasi WhatsApp otomatis** ke pelanggan saat status diubah ke **Selesai** (berisi tautan chat dan batas waktunya). Butuh `FONNTE_TOKEN`; tanpa token admin diarahkan mengirim manual lewat `wa.me`.
- Halaman admin tidak menampilkan navbar/footer website publik

## 🚀 Mulai Cepat

Prasyarat: Node.js >= 18.17 dan npm.

```bash
# 1. Install dependencies
npm install

# 2. Salin environment variable
cp .env.example .env.local    # Windows: copy .env.example .env.local

# 3. Isi .env.local (lihat bagian Environment di bawah)

# 4. Jalankan development server
npm run dev
```

Buka http://localhost:3000.

Build produksi:

```bash
npm run build
npm run start
```

## ⚙️ Environment

| Variabel | Wajib | Fungsi |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ya | URL project Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ya | Anon key (dipakai browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | ya | Dipakai server untuk login admin, chat, dan update pesanan. **Jangan** diberi awalan `NEXT_PUBLIC_` |
| `ADMIN_SESSION_SECRET` | ya (produksi) | String acak panjang untuk menandatangani cookie sesi admin |
| `NEXT_PUBLIC_SITE_URL` | ya (produksi) | Alamat website sebenarnya; dipakai di tautan pesan WhatsApp |
| `FONNTE_TOKEN` | opsional | Token Fonnte untuk notifikasi WhatsApp otomatis |
| `ADMIN_RECOVERY_PASSWORD` | opsional | Pemulihan darurat kalau lupa password admin (min. 8 karakter) |
| `BUSINESS_WHATSAPP`, `NEXT_PUBLIC_BUSINESS_WHATSAPP` | opsional | Nomor WhatsApp bisnis, format `62812...` |
| `BUSINESS_PHONE`, `BUSINESS_EMAIL`, `BUSINESS_ADDRESS` | opsional | Kontak yang tampil di website. Kosong = "Segera tersedia" |
| `NEXT_PUBLIC_INSTAGRAM_URL`, `NEXT_PUBLIC_FACEBOOK_URL` | opsional | Ikon sosial media di footer |

Kontak bisnis juga bisa diubah dari **Admin > Pengaturan** tanpa redeploy.

> `.env` / `.env.local` sudah ada di `.gitignore`. Jangan pernah di-commit.

## 🗄️ Setup Database (Supabase)

Jalankan file di `supabase/migrations/` **berurutan** lewat Supabase SQL Editor:

| File | Isi |
|---|---|
| `0001_create_orders.sql` | Tabel pesanan |
| `0002_create_contact_messages.sql` | Pesan dari form kontak |
| `0004_create_business_settings.sql` | Pengaturan bisnis |
| `0005_create_order_photos_bucket.sql` | Bucket foto pakaian |
| `0006_create_site_media.sql` | Tabel foto website |
| `0007_create_site_media_bucket.sql` | Bucket foto website |
| `0008_enable_realtime_orders.sql` | Realtime untuk tabel pesanan |
| `0009_create_services.sql` | Tabel layanan |
| `0010_rls_tighten.sql` | Pengetatan RLS (**wajib**) |
| `0011_service_details.sql` | Kolom detail layanan |

Catatan:
- `0003_seed_demo_orders.sql` hanya data contoh; jangan dijalankan di produksi.
- Jangan pakai `0000_full_setup.sql`, `0007_site_media_admin_policies.sql`, dan `0012`/`0013` (payments); file-file itu sudah usang atau tidak aman dan sebaiknya dihapus dari repo.

### Tabel `admin_users`

Login admin membaca tabel `admin_users`. Buat manual (contoh minimal):

```sql
create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  password_hash text not null,
  role text not null default 'admin',
  full_name text,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
-- Tanpa policy: hanya service role yang bisa membaca/menulis.
```

Buat hash bcrypt untuk password awal, lalu masukkan:

```bash
node -e "console.log(require('bcryptjs').hashSync('PASSWORD_AWAL_ANDA', 10))"
```

```sql
insert into public.admin_users (username, password_hash, full_name)
values ('admin', '<HASH_DARI_PERINTAH_DI_ATAS>', 'Admin Jahitsini');
```

Setelah login, segera ganti password di **Admin > Ganti Password**.

## 🔑 Login Admin

Buka `/admin/login` dan masukkan password admin (hanya ada satu admin: `username = 'admin'`). Sesi berakhir setelah 1 jam. Lupa password? Isi sementara `ADMIN_RECOVERY_PASSWORD`, login dengan itu, ganti password, lalu hapus variabelnya.

## 💬 Alur Chat & Notifikasi

1. Pelanggan membuka **Lacak Pesanan**, memasukkan nomor pesanan, lalu bisa chat lewat kartu **Chat dengan Admin**.
2. Admin membalas dari **Admin > Pesanan** (kotak chat) atau lewat kolom balasan di **Ubah Status**.
3. Saat admin mengubah status ke **Selesai**:
   - WhatsApp otomatis dikirim ke pelanggan (bila `FONNTE_TOKEN` terisi).
   - Chat masih aktif 1 jam, lalu dinonaktifkan. Mengubah status kembali ke selain Selesai mengaktifkan chat lagi.

Untuk mengubah lama chat setelah selesai, ubah `CHAT_GRACE_MS` di `lib/chatPolicy.ts`.

## 📁 Struktur Proyek

```
├── app/
│   ├── page.tsx, layanan/, cara-kerja/, hasil-jahitan/, faq/,
│   │   hubungi-kami/, tracking/          # Halaman publik
│   ├── admin/                            # Dashboard admin
│   │   ├── login/  password/  orders/  customers/
│   │   └── messages/  services/  media/  settings/
│   ├── api/
│   │   ├── admin-login/  admin-logout/   # Sesi admin
│   │   ├── chat/[orderNumber]/route.ts   # Chat pelanggan <-> admin
│   │   └── secure/admin/...              # API admin (wajib sesi)
│   ├── globals.css
│   └── layout.tsx                        # Root layout + SiteChrome
├── components/
│   ├── admin/      # OrderDetailDialog, OrderActionsMenu, PasswordStrength
│   ├── layout/     # Navbar, Footer, SiteChrome, DashboardLayout
│   ├── sections/   # CostCalculator
│   ├── tracking/   # OrderChat
│   └── ui/         # Button, Card, Input, Badge, Dialog, dll
├── lib/
│   ├── adminSession.ts   # Cookie sesi (1 jam)
│   ├── adminAuth.ts      # Verifikasi & ganti password (bcrypt)
│   ├── chatPolicy.ts     # Aturan chat 1 jam setelah selesai
│   ├── whatsappNotify.ts # Notifikasi WhatsApp (Fonnte)
│   ├── orders.ts, services.ts, settings.ts, data.ts, ...
├── middleware.ts         # Proteksi /admin/*
├── supabase/migrations/  # SQL database
└── public/
```

## 🎨 Design System

| Warna | Hex | Kegunaan |
|---|---|---|
| Light BG | `#F6FAF8` | Background alternatif |
| Green | `#16A34A` | Primary (CTA, brand) |
| Dark Green | `#15803D` | Hover & link |
| Blue | `#2563EB` | Aksen sekunder |
| Text | `#172033` | Teks utama |
| Border | `#E2E8F0` | Border & garis |

Radius: `rounded-xl` (12px) untuk tombol/input, `rounded-2xl` (16px) untuk card/modal.

## 🛠️ Scripts

| Command | Deskripsi |
|---|---|
| `npm run dev` | Server development di localhost:3000 |
| `npm run build` | Build produksi |
| `npm run start` | Jalankan build produksi |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

## 🔒 Catatan Keamanan

- Nomor pesanan adalah satu-satunya kunci untuk melacak pesanan dan chat. Jangan membagikannya ke sembarang orang.
- Semua penulisan data sensitif (pesanan, chat, admin) lewat API server dengan service role; browser tidak boleh menulis langsung ke tabel.
- Isi `ADMIN_SESSION_SECRET` dengan string acak panjang di produksi.
- Jangan commit `.env`; kalau pernah ter-commit, ganti semua kunci di dalamnya.

## 📄 Lisensi

© 2026 Jahitsini.com - All rights reserved.#   J a h i t s i n i . c o m - p r i m e - 
 
 
