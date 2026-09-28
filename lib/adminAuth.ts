import bcrypt from "bcryptjs";
import { supabaseServiceRole } from "./supabaseServiceRole";
import { ADMIN_USERNAME } from "./adminConfig";

/**
 * Autentikasi satu-satunya admin (server only, runtime Node).
 * Data: tabel `admin_users`, baris username = ADMIN_USERNAME, kolom `password_hash` (bcrypt).
 * Selalu memakai service role — tabel ini TIDAK boleh dibaca lewat anon key.
 */
export const MIN_PASSWORD_LENGTH = 8;

async function fetchAdminRow(): Promise<{ id: string; password_hash: string } | null> {
  const sb = supabaseServiceRole();
  if (!sb) {
    console.error("adminAuth: SUPABASE_SERVICE_ROLE_KEY belum di-set.");
    return null;
  }
  const { data, error } = await sb
    .from("admin_users")
    .select("id,password_hash")
    .eq("username", ADMIN_USERNAME)
    .maybeSingle();
  if (error) {
    console.error("adminAuth: gagal membaca admin_users:", error.message);
    return null;
  }
  return data && typeof data.password_hash === "string" ? data : null;
}

/** true kalau password cocok dengan password admin di database. */
export async function verifyAdminPassword(password: unknown): Promise<boolean> {
  if (typeof password !== "string" || password.length === 0 || password.length > 200) return false;

  const row = await fetchAdminRow();
  if (row) {
    try {
      if (await bcrypt.compare(password, row.password_hash)) return true;
    } catch {
      /* hash tidak valid -> lanjut ke pemulihan */
    }
  }

  // Pemulihan darurat: hanya aktif kalau env ADMIN_RECOVERY_PASSWORD di-set (mis. lupa password).
  const recovery = process.env.ADMIN_RECOVERY_PASSWORD;
  return !!recovery && recovery.length >= MIN_PASSWORD_LENGTH && password === recovery;
}

/** Simpan password baru (di-hash bcrypt) ke baris admin. */
export async function setAdminPassword(newPassword: string): Promise<{ ok: boolean; error?: string }> {
  const sb = supabaseServiceRole();
  if (!sb) return { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY belum di-set di server." };

  const row = await fetchAdminRow();
  if (!row) return { ok: false, error: `User '${ADMIN_USERNAME}' tidak ditemukan di tabel admin_users.` };

  const hash = await bcrypt.hash(newPassword, 10);
  const { error } = await sb.from("admin_users").update({ password_hash: hash }).eq("id", row.id);
  if (error) {
    console.error("adminAuth: gagal update password:", error.message);
    return { ok: false, error: "Gagal menyimpan password baru." };
  }
  return { ok: true };
}
