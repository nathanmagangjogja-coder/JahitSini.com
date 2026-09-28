import { NextRequest, NextResponse } from "next/server";
import { supabaseServiceRole } from "@/lib/supabaseServiceRole";
import { getChatState } from "@/lib/chatPolicy";
import type { OrderNote } from "@/lib/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_LEN = 500;
const MAX_NOTES = 500; // batas total pesan per pesanan
const RATE_MAX = 10; // pesan
const RATE_WINDOW_MS = 60 * 1000; // per menit per IP+pesanan
const hits = new Map<string, number[]>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const list = (hits.get(key) || []).filter((t) => now - t < RATE_WINDOW_MS);
  if (list.length >= RATE_MAX) {
    hits.set(key, list);
    return true;
  }
  list.push(now);
  hits.set(key, list);
  return false;
}

const json = (body: Record<string, unknown>, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

async function loadOrder(orderNumber: string) {
  const sb = supabaseServiceRole();
  if (!sb) return { error: "Server belum dikonfigurasi (SUPABASE_SERVICE_ROLE_KEY).", status: 500 as const };
  const { data, error } = await sb
    .from("orders")
    .select("id,order_number,customer_name,status,timeline,customer_notes,updated_at")
    .ilike("order_number", orderNumber)
    .maybeSingle();
  if (error) return { error: "Gagal memuat pesanan.", status: 500 as const };
  if (!data) return { error: "Pesanan tidak ditemukan.", status: 404 as const };
  return { sb, row: data };
}

/** Ambil percakapan + status chat (aktif / ditutup). */
export async function GET(_req: NextRequest, { params }: { params: { orderNumber: string } }) {
  const r = await loadOrder(decodeURIComponent(params.orderNumber));
  if ("error" in r) return json({ success: false, error: r.error }, r.status);
  const chat = getChatState({
    status: r.row.status,
    timeline: r.row.timeline,
    fallbackDoneAt: r.row.updated_at,
  });
  return json({
    success: true,
    status: r.row.status,
    chat,
    notes: (r.row.customer_notes || []) as OrderNote[],
    serverTime: new Date().toISOString(),
  });
}

/** Pelanggan mengirim pesan ke admin. Body: { message } */
export async function POST(req: NextRequest, { params }: { params: { orderNumber: string } }) {
  const orderNumber = decodeURIComponent(params.orderNumber);
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "local";
  if (rateLimited(`chat:${ip}:${orderNumber.toLowerCase()}`)) {
    return json({ success: false, error: "Terlalu banyak pesan. Coba lagi sebentar." }, 429);
  }

  const body = await req.json().catch(() => null);
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  if (!message) return json({ success: false, error: "Pesan tidak boleh kosong." }, 400);
  if (message.length > MAX_LEN) {
    return json({ success: false, error: `Pesan maksimal ${MAX_LEN} karakter.` }, 400);
  }

  const r = await loadOrder(orderNumber);
  if ("error" in r) return json({ success: false, error: r.error }, r.status);

  // Aturan 1 jam dicek di server, jadi tidak bisa dilewati dari browser.
  const chat = getChatState({
    status: r.row.status,
    timeline: r.row.timeline,
    fallbackDoneAt: r.row.updated_at,
  });
  if (!chat.open) {
    return json(
      { success: false, error: "Chat dinonaktifkan karena pesanan sudah selesai lebih dari 1 jam.", chat },
      403
    );
  }

  const current = (r.row.customer_notes || []) as OrderNote[];
  if (current.length >= MAX_NOTES) {
    return json({ success: false, error: "Percakapan sudah mencapai batas pesan." }, 400);
  }

  const note: OrderNote = {
    id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    author: r.row.customer_name || "Pelanggan",
    role: "customer",
    message,
    timestamp: new Date().toISOString(),
  };
  const next = [...current, note];

  const { error } = await r.sb.from("orders").update({ customer_notes: next }).eq("id", r.row.id);
  if (error) return json({ success: false, error: "Gagal mengirim pesan." }, 500);

  return json({ success: true, chat, notes: next });
}