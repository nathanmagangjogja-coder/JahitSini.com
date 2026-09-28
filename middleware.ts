import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, isSessionValueValid } from "@/lib/adminSession";

// Proteksi /admin dengan satu admin (lihat lib/adminAuth.ts).
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const cookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!(await isSessionValueValid(cookie))) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
