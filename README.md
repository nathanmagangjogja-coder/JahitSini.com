# Jahitsini.com — Jasa Jahit, Permak & Reparasi Pakaian

Platform jasa jahit dan permak berbasis web, dibangun dengan **Next.js 14 (App Router)**, **TypeScript**, **TailwindCSS**, dan **Supabase**.

---

## ✨ Fitur Utama

### 🌐 Website Publik

- 🏠 **Beranda** — Hero, statistik, layanan unggulan, cara kerja, portofolio, dan CTA.
- 🧵 **Layanan** — Daftar layanan berdasarkan kategori:
  - Permak
  - Reparasi
  - Resleting
  - Aksesoris
- 🧮 **Kalkulator Estimasi Biaya** — Estimasi harga berdasarkan layanan, tingkat kesulitan, dan jumlah.
- 🔧 **Cara Kerja**
- 📸 **Hasil Jahitan**
- ❓ **FAQ**
- 📞 **Hubungi Kami** — Form kontak; pesan masuk ke dashboard admin.
- 💬 **Pemesanan via WhatsApp** — Form pesanan menghasilkan pesan WhatsApp yang siap dikirim.
- 📍 **Lacak Pesanan** — Menampilkan status, timeline, foto, dan estimasi biaya berdasarkan nomor pesanan.

### 💬 Chat dengan Admin

Fitur chat tersedia pada halaman **Lacak Pesanan**.

- Pelanggan dapat mengirim pesan langsung kepada admin.
- Balasan admin muncul otomatis dengan pengecekan setiap **5 detik**.
- Chat aktif selama pesanan belum selesai.
- Setelah status menjadi **Selesai**, chat tetap aktif selama **1 jam**.
- Setelah 1 jam, chat dinonaktifkan, tetapi riwayat chat tetap dapat dibaca.
- Aturan chat dicek di server melalui `lib/chatPolicy.ts`.
- Batas pesan:
  - Maksimal **500 karakter per pesan**.
  - Maksimal **10 pesan per menit**.

---

## 🛠️ Dashboard Admin

Dashboard admin tersedia di:

```text
/admin
```

Saat ini sistem menggunakan **satu admin**.

### Menu Admin

- 📦 **Pesanan** — Ubah status, harga, dan balas chat.
- 👤 **Pelanggan**
- ✉️ **Pesan Masuk**
- 🧵 **Layanan**
- 🖼️ **Foto Website**
- ⚙️ **Pengaturan**

### Keamanan & Notifikasi

- 🔑 **Ganti Password** — Dilengkapi indikator kekuatan password.
- 🔒 **Sesi Login** — Berlaku selama **1 jam** menggunakan cookie `httpOnly`.
- 📲 **Notifikasi WhatsApp Otomatis** — Dikirim kepada pelanggan saat status pesanan diubah menjadi **Selesai**.
  - Notifikasi berisi tautan chat dan batas waktu chat.
  - Membutuhkan `FONNTE_TOKEN`.
  - Jika token tidak tersedia, admin diarahkan untuk mengirim pesan secara manual melalui `wa.me`.
- Halaman admin tidak menampilkan navbar/footer website publik.

---

# 🚀 Mulai Cepat

## Prasyarat

Pastikan sudah tersedia:

- **Node.js >= 18.17**
- **npm**

## 1. Install Dependencies

```bash
npm install
```

## 2. Salin Environment Variable

### macOS / Linux

```bash
cp .env.example .env.local
```

### Windows

```bat
copy .env.example .env.local
```

## 3. Isi `.env.local`

Lihat bagian [Environment](#️-environment) di bawah.

## 4. Jalankan Development Server

```bash
npm run dev
```

Kemudian buka:

```text
http://localhost:3000
```

---

## 📦 Build Produksi

```bash
npm run build
npm run start
```

---

# ⚙️ Environment

| Variabel | Wajib | Fungsi |
|---|:---:|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Ya | URL project Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Ya | Anon key yang digunakan browser |
| `SUPABASE_SERVICE_ROLE_KEY` | Ya | Digunakan server untuk login admin, chat, dan update pesanan. **Jangan** diberi awalan `NEXT_PUBLIC_`. |
| `ADMIN_SESSION_SECRET` | Ya (produksi) | String acak panjang untuk menandatangani cookie sesi admin |
| `NEXT_PUBLIC_SITE_URL` | Ya (produksi) | Alamat website sebenarnya; digunakan pada tautan pesan WhatsApp |
| `FONNTE_TOKEN` | Opsional | Token Fonnte untuk notifikasi WhatsApp otomatis |
| `ADMIN_RECOVERY_PASSWORD` | Opsional | Pemulihan darurat jika lupa password admin (minimal 8 karakter) |
| `BUSINESS_WHATSAPP` | Opsional | Nomor WhatsApp bisnis, format `62812...` |
| `NEXT_PUBLIC_BUSINESS_WHATSAPP` | Opsional | Nomor WhatsApp bisnis untuk kebutuhan publik |
| `BUSINESS_PHONE` | Opsional | Nomor telepon bisnis |
| `BUSINESS_EMAIL` | Opsional | Email bisnis |
| `BUSINESS_ADDRESS` | Opsional | Alamat bisnis |
| `NEXT_PUBLIC_INSTAGRAM_URL` | Opsional | URL Instagram yang ditampilkan pada footer |
| `NEXT_PUBLIC_FACEBOOK_URL` | Opsional | URL Facebook yang ditampilkan pada footer |

> Kontak bisnis juga dapat diubah melalui **Admin → Pengaturan** tanpa melakukan redeploy.

> **Keamanan:** `.env` dan `.env.local` sudah ada di `.gitignore`. Jangan pernah melakukan commit terhadap file tersebut.

---

# 🗄️ Setup Database — Supabase

Jalankan file pada `supabase/migrations/` **secara berurutan** melalui **Supabase SQL Editor**.

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

### ⚠️ Catatan Migration

- `0003_seed_demo_orders.sql` hanya berisi data contoh dan **jangan dijalankan di produksi**.
- Jangan gunakan:
  - `0000_full_setup.sql`
  - `0007_site_media_admin_policies.sql`
  - `0012` / `0013` (payments)
- File-file tersebut sudah usang atau tidak aman dan sebaiknya dihapus dari repository.

---

## 👤 Tabel `admin_users`

Login admin membaca tabel `admin_users`.

Buat tabel secara manual menggunakan SQL berikut:

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

### Membuat Hash Password

Buat hash bcrypt untuk password awal:

```bash
node -e "console.log(require('bcryptjs').hashSync('PASSWORD_AWAL_ANDA', 10))"
```

Kemudian masukkan hasil hash ke database:

```sql
insert into public.admin_users (username, password_hash, full_name)
values ('admin', '<HASH_DARI_PERINTAH_DI_ATAS>', 'Admin Jahitsini');
```

> Setelah berhasil login, segera ganti password melalui **Admin → Ganti Password**.

---

# 🔑 Login Admin

Buka:

```text
/admin/login
```

Masukkan password admin.

Sistem saat ini hanya memiliki satu admin:

```text
username = admin
```

### Masa Berlaku Sesi

Sesi login berakhir setelah **1 jam**.

### Lupa Password

Jika lupa password:

1. Isi sementara `ADMIN_RECOVERY_PASSWORD`.
2. Login menggunakan password tersebut.
3. Ganti password melalui **Admin → Ganti Password**.
4. Hapus kembali variabel `ADMIN_RECOVERY_PASSWORD`.

---

# 💬 Alur Chat & Notifikasi

1. Pelanggan membuka **Lacak Pesanan**.
2. Pelanggan memasukkan nomor pesanan.
3. Pelanggan dapat membuka kartu **Chat dengan Admin**.
4. Admin membalas melalui:
   - **Admin → Pesanan → kotak chat**, atau
   - kolom balasan pada **Ubah Status**.
5. Saat admin mengubah status pesanan menjadi **Selesai**:
   - WhatsApp otomatis dikirim jika `FONNTE_TOKEN` tersedia.
   - Chat tetap aktif selama **1 jam**.
   - Setelah 1 jam, chat dinonaktifkan.
6. Jika status diubah kembali ke status selain **Selesai**, chat aktif kembali.

### Mengubah Durasi Chat

Untuk mengubah lama waktu chat setelah pesanan selesai, ubah:

```text
CHAT_GRACE_MS
```

pada:

```text
lib/chatPolicy.ts
```

---

# 📁 Struktur Proyek

```text
├── app/
│   ├── page.tsx
│   ├── layanan/
│   ├── cara-kerja/
│   ├── hasil-jahitan/
│   ├── faq/
│   ├── hubungi-kami/
│   ├── tracking/                  # Halaman publik
│   │
│   ├── admin/                     # Dashboard admin
│   │   ├── login/
│   │   ├── password/
│   │   ├── orders/
│   │   ├── customers/
│   │   ├── messages/
│   │   ├── services/
│   │   ├── media/
│   │   └── settings/
│   │
│   ├── api/
│   │   ├── admin-login/           # Sesi admin
│   │   ├── admin-logout/
│   │   ├── chat/[orderNumber]/route.ts
│   │   │                           # Chat pelanggan ↔ admin
│   │   └── secure/admin/...       # API admin (wajib sesi)
│   │
│   ├── globals.css
│   └── layout.tsx                 # Root layout + SiteChrome
│
├── components/
│   ├── admin/                     # OrderDetailDialog,
│   │                               # OrderActionsMenu, PasswordStrength
│   ├── layout/                    # Navbar, Footer,
│   │                               # SiteChrome, DashboardLayout
│   ├── sections/                  # CostCalculator
│   ├── tracking/                  # OrderChat
│   └── ui/                        # Button, Card, Input,
│                                   # Badge, Dialog, dll
│
├── lib/
│   ├── adminSession.ts            # Cookie sesi (1 jam)
│   ├── adminAuth.ts               # Verifikasi & ganti password (bcrypt)
│   ├── chatPolicy.ts              # Aturan chat 1 jam setelah selesai
│   ├── whatsappNotify.ts          # Notifikasi WhatsApp (Fonnte)
│   ├── orders.ts
│   ├── services.ts
│   ├── settings.ts
│   ├── data.ts
│   └── ...
│
├── middleware.ts                  # Proteksi /admin/*
├── supabase/
│   └── migrations/                # SQL database
│
└── public/
```

---

# 🎨 Design System

| Elemen | Nilai | Kegunaan |
|---|---|---|
| Light BG | `#F6FAF8` | Background alternatif |
| Green | `#16A34A` | Primary (CTA, brand) |
| Dark Green | `#15803D` | Hover & link |
| Blue | `#2563EB` | Aksen sekunder |
| Text | `#172033` | Teks utama |
| Border | `#E2E8F0` | Border & garis |

### Border Radius

- `rounded-xl` — **12px** untuk tombol/input.
- `rounded-2xl` — **16px** untuk card/modal.

---

# 🛠️ Scripts

| Command | Deskripsi |
|---|---|
| `npm run dev` | Menjalankan development server di `localhost:3000` |
| `npm run build` | Membuat build produksi |
| `npm run start` | Menjalankan build produksi |
| `npm run lint` | Menjalankan ESLint |
| `npm run typecheck` | Menjalankan `tsc --noEmit` |

---

# 🔒 Catatan Keamanan

- Nomor pesanan adalah satu-satunya kunci untuk melacak pesanan dan chat. Jangan membagikannya kepada sembarang orang.
- Semua penulisan data sensitif (pesanan, chat, admin) dilakukan melalui API server dengan service role.
- Browser tidak boleh menulis langsung ke tabel.
- Isi `ADMIN_SESSION_SECRET` dengan string acak yang panjang di production.
- Jangan commit `.env`.
- Jika `.env` pernah ter-commit, ganti seluruh key di dalamnya.

>>>>>>> f6a9214 (docs: improve README formatting)
