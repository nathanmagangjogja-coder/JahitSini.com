/**
 * Konfigurasi login admin.
 *
 * Hanya ada SATU admin: baris di tabel Supabase `admin_users` dengan
 * username = ADMIN_USERNAME. Password-nya (hash bcrypt) disimpan di kolom
 * `password_hash` dan bisa diganti dari /admin/password.
 * Baris lain di tabel itu (mis. "superadmin") DIABAIKAN dan tidak bisa login.
 */
export const ADMIN_USERNAME = "admin";

/**
 * Kunci penanda-tangan cookie sesi. Sebaiknya isi env ADMIN_SESSION_SECRET
 * (string acak panjang) di .env / hosting; nilai di bawah hanya cadangan.
 */
export const ADMIN_SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET || "jahitsini-session-secret-ganti-saya";
