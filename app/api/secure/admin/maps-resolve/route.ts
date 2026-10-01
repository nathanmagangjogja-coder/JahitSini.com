import { NextRequest, NextResponse } from "next/server";
import { validateAdminSession } from "@/lib/adminApiGuard";
import { isShortGoogleMapsLink, parseCoordsFromText } from "@/lib/mapsLink";

export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  const isAdmin = await validateAdminSession(request);
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const url = typeof body?.url === "string" ? body.url.trim() : "";
  if (!url || !isShortGoogleMapsLink(url)) {
    return NextResponse.json({ success: false, error: "Bukan link Google Maps yang dikenali." }, { status: 400 });
  }

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(url, { redirect: "follow", signal: ctrl.signal });
    clearTimeout(timer);

    const finalUrl = res.url || url;
    let coords = parseCoordsFromText(finalUrl);
    if (!coords) {
      const html = await res.text().catch(() => "");
      coords = parseCoordsFromText(html);
    }

    if (!coords) {
      return NextResponse.json(
        { success: false, error: "Koordinat tidak ditemukan dari link ini. Coba salin koordinat manual dari Google Maps." },
        { status: 422 }
      );
    }
    return NextResponse.json({ success: true, ...coords });
  } catch {
    return NextResponse.json({ success: false, error: "Gagal membuka link. Coba lagi." }, { status: 502 });
  }
}