import { NextRequest, NextResponse } from "next/server";
import { createSessionCookieValue, ADMIN_COOKIE_NAME, ADMIN_COOKIE_MAX_AGE } from "@/lib/adminSession";
import { verifyAdminPassword } from "@/lib/adminAuth";
import { isBlocked, recordFailure, clearFailures, clientKey } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const key = `login:${clientKey(req)}`;
  if (isBlocked(key)) {
    return NextResponse.json(
      { ok: false, message: "Terlalu banyak percobaan. Coba lagi dalam 15 menit." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  if (!(await verifyAdminPassword(body?.password))) {
    recordFailure(key);
    return NextResponse.json({ ok: false, message: "Password salah" }, { status: 401 });
  }
  clearFailures(key);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, await createSessionCookieValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });
  return res;
}
