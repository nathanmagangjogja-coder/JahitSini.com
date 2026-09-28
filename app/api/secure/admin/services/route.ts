import { NextRequest, NextResponse } from "next/server";
import { validateAdminSession } from "@/lib/adminApiGuard";
import { getServiceRoleOrThrow } from "@/lib/supabaseServiceRole";
import { cleanList, cleanSteps, cleanFaqs } from "@/lib/serviceDetails";

const CATEGORIES = ["permak", "reparasi", "resleting", "aksesoris"];

const fail = (status: number, error: string) =>
  NextResponse.json({ success: false, error }, { status });

const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : undefined);

function slugify(name: string, category: string) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  return `${category}-${slug || "layanan"}`;
}

/** Ubah body dari admin menjadi kolom tabel `services`. Hanya field yang dikirim yang diisi. */
function toPayload(body: any): Record<string, unknown> {
  const p: Record<string, unknown> = {};
  const name = text(body.name, 120);
  if (name !== undefined) p.name = name;
  const description = text(body.description, 500);
  if (description !== undefined) p.description = description;
  if (body.priceStart !== undefined) p.price_start = Math.max(0, Math.round(Number(body.priceStart) || 0));
  const duration = text(body.duration, 60);
  if (duration !== undefined) p.duration = duration;
  if (typeof body.category === "string" && CATEGORIES.includes(body.category)) p.category = body.category;
  const icon = text(body.icon, 40);
  if (icon !== undefined) p.icon = icon;

  const longDescription = text(body.longDescription, 6000);
  if (longDescription !== undefined) p.long_description = longDescription;
  const priceNotes = text(body.priceNotes, 2000);
  if (priceNotes !== undefined) p.price_notes = priceNotes;
  if (body.includes !== undefined) p.includes = cleanList(body.includes);
  if (body.tips !== undefined) p.tips = cleanList(body.tips);
  if (body.steps !== undefined) p.steps = cleanSteps(body.steps);
  if (body.faqs !== undefined) p.faqs = cleanFaqs(body.faqs);
  return p;
}

function dbError(error: { message: string }) {
  console.error("admin/services error:", error);
  const missingColumn = /column|schema cache/i.test(error.message);
  return fail(
    500,
    missingColumn
      ? "Kolom detail layanan belum ada di database. Jalankan supabase/migrations/0011_service_details.sql dulu."
      : process.env.NODE_ENV === "development"
      ? error.message
      : "Gagal menyimpan ke database."
  );
}

async function guard(request: NextRequest) {
  return (await validateAdminSession(request)) ? null : fail(401, "Unauthorized");
}

export async function POST(request: NextRequest) {
  const denied = await guard(request);
  if (denied) return denied;
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") return fail(400, "Invalid request body");
    const payload = toPayload(body);
    if (!payload.name || !payload.description || !payload.duration || !payload.price_start || !payload.category) {
      return fail(400, "Nama, deskripsi, harga, durasi, dan kategori wajib diisi.");
    }

    const sb = await getServiceRoleOrThrow();
    let id = slugify(String(payload.name), String(payload.category));
    const { data: existing } = await sb.from("services").select("id").eq("id", id).maybeSingle();
    if (existing) id = `${id}-${Math.random().toString(36).slice(2, 6)}`;

    const { error } = await sb.from("services").insert({ id, ...payload });
    if (error) return dbError(error);
    return NextResponse.json({ success: true, id });
  } catch (e) {
    console.error("POST /api/secure/admin/services:", e);
    return fail(500, "Internal error");
  }
}

export async function PATCH(request: NextRequest) {
  const denied = await guard(request);
  if (denied) return denied;
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body.id !== "string") return fail(400, "id layanan wajib diisi.");
    const payload = toPayload(body);
    if (Object.keys(payload).length === 0) return fail(400, "Tidak ada data yang diubah.");

    const sb = await getServiceRoleOrThrow();
    // upsert: layanan bawaan (statis) yang belum ada di database ikut tersimpan saat diedit pertama kali.
    const { data: existing } = await sb.from("services").select("id").eq("id", body.id).maybeSingle();
    if (existing) {
      const { error } = await sb.from("services").update(payload).eq("id", body.id);
      if (error) return dbError(error);
    } else {
      const { error } = await sb.from("services").insert({ id: body.id, ...payload });
      if (error) return dbError(error);
    }
    return NextResponse.json({ success: true, id: body.id });
  } catch (e) {
    console.error("PATCH /api/secure/admin/services:", e);
    return fail(500, "Internal error");
  }
}

export async function DELETE(request: NextRequest) {
  const denied = await guard(request);
  if (denied) return denied;
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body.id !== "string") return fail(400, "id layanan wajib diisi.");
    const sb = await getServiceRoleOrThrow();
    const { error } = await sb.from("services").update({ is_active: false }).eq("id", body.id);
    if (error) return dbError(error);
    return NextResponse.json({ success: true, id: body.id });
  } catch (e) {
    console.error("DELETE /api/secure/admin/services:", e);
    return fail(500, "Internal error");
  }
}