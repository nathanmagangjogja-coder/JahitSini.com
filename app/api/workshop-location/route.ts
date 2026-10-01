import { NextResponse } from "next/server";
import { supabaseServiceRole } from "@/lib/supabaseServiceRole";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // jangan pernah di-cache Next.js
export async function GET() {
  const sb = supabaseServiceRole();
  if (!sb) {
    return NextResponse.json(
      { success: false, lat: null, lng: null, error: "SUPABASE_SERVICE_ROLE_KEY belum diisi di .env" },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  }

  const { data, error } = await sb
    .from("business_settings")
    .select("map_lat, map_lng")
    .eq("id", 1)
    .maybeSingle();

  const lat = Number(data?.map_lat);
  const lng = Number(data?.map_lng);
  const valid = !error && data && Number.isFinite(lat) && Number.isFinite(lng);

  return NextResponse.json(
    {
      success: true,
      lat: valid ? lat : null,
      lng: valid ? lng : null,
      ...(error ? { dbError: error.message } : {}),
    },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}
