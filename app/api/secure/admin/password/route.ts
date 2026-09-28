import { NextRequest, NextResponse } from "next/server";
import { validateAdminSession } from "@/lib/adminApiGuard";
import { verifyAdminPassword, setAdminPassword, MIN_PASSWORD_LENGTH } from "@/lib/adminAuth";
import { createSessionCookieValue, ADMIN_COOKIE_NAME, ADMIN_COOKIE_MAX_AGE } from "@/lib/adminSession";
import { isBlocked, recordFailure, clearFailures, clientKey } from "@/lib/rateLimit";

export const runtime = "nodejs";

const fail = (status: number, error: string) =>
  NextResponse.json({ success: false, error }, { status });

/** Ganti password admin. JSON: { currentPassword, newPassword } */
export async function POST(request: NextRequest) {
  if (!(await validateAdminSession(request))) return fail(401, "Unauthorized");

  const key = `pwd:${clientKey(request)}`;
  if (isBlocked(key)) return fail(429, "Terlalu banyak percobaan. Coba lagi dalam 15 menit.");

  const body = await request.json().catch(() => null);
  const current = body?.currentPassword;
  const next = body?.newPassword;

  if (typeof next !== "string" || next.length < MIN_PASSWORD_LENGTH) {
    return fail(400, `Password baru minimal ${MIN_PASSWORD_LENGTH} karakter.`);
  }
  if (next.length > 100) return fail(400, "Password baru terlalu panjang (maks 100 karakter).");
  if (next === current) return fail(400, "Password baru harus berbeda dari password lama.");

  if (!(await verifyAdminPassword(current))) {
    recordFailure(key);
    return fail(403, "Password lama salah.");
  }
  clearFailures(key);

  const result = await setAdminPassword(next);
  if (!result.ok) return fail(500, result.error || "Gagal menyimpan password.");

  // Perpanjang sesi supaya admin tidak ter-logout setelah ganti password.
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE_NAME, await createSessionCookieValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });
  return res;
}
