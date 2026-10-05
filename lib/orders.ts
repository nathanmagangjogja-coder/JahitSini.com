import { OrderStatus } from "./data";
import { supabase } from "./supabase";

export interface OrderPhoto {
  id: string;
  url: string;
  label: string;
}

export interface OrderNote {
  id: string;
  author: string;
  role: "customer" | "admin";
  message: string;
  timestamp: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  serviceId: string;
  serviceName: string;
  category: string;
  categoryLabel: string;
  quantity: number;
  difficulty: "mudah" | "sedang" | "sulit";
  notes?: string;
  status: OrderStatus;
  createdAt: string;
  estimatedDone?: string;
  photos: OrderPhoto[];
  timeline: {
    status: OrderStatus;
    note?: string;
    timestamp: string;
  }[];
  customerNotes: OrderNote[];
}

export function mapDbOrderToOrder(row: any): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerEmail: row.customer_email ?? undefined,
    serviceId: row.service_id,
    serviceName: row.service_name,
    category: row.category,
    categoryLabel: row.category_label,
    quantity: row.quantity,
    difficulty: row.difficulty,
    notes: row.notes ?? undefined,
    status: row.status,
    createdAt: row.created_at,
    estimatedDone: row.estimated_done ?? undefined,
    photos: row.photos ?? [],
    timeline: row.timeline ?? [],
    customerNotes: row.customer_notes ?? [],
  };
}
export async function getOrderByNumberRemote(orderNumber: string): Promise<Order | undefined> {
  if (!supabase) return undefined;
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .ilike("order_number", orderNumber)
    .maybeSingle();
  if (error || !data) return undefined;
  return mapDbOrderToOrder(data);
}
async function fetchAdminOrders(search?: string): Promise<Order[]> {
  try {
    const qs = new URLSearchParams({ limit: "1000" });
    if (search) qs.set("search", search);
    const res = await fetch(`/api/secure/admin/orders?${qs.toString()}`, { cache: "no-store" });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success || !Array.isArray(json.data)) return [];
    return json.data as Order[];
  } catch {
    return [];
  }
}
export function getAllOrdersRemote(): Promise<Order[]> {
  return fetchAdminOrders();
}
export async function getOrdersByCustomerRemote(phone: string): Promise<Order[]> {
  if (!phone) return [];
  const orders = await fetchAdminOrders(phone);
  return orders.filter((o) => o.customerPhone === phone);
}
export async function deleteOrderRemote(
  orderNumber: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/secure/admin/orders/${encodeURIComponent(orderNumber)}`, {
      method: "DELETE",
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
      return { ok: false, error: json?.error || `Gagal menghapus (${res.status})` };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Gagal terhubung ke server." };
  }
}

/** Hasil notifikasi WhatsApp otomatis (saat status diubah ke "Selesai"). */
export interface OrderNotifyResult {
  sent: boolean;
  reason?: string;
  detail?: string;
  /** Tautan wa.me berisi pesan siap kirim, dipakai kalau pengiriman otomatis gagal. */
  whatsappLink?: string;
}

async function patchOrderViaAdminApi(
  orderNumber: string,
  body: Record<string, unknown>
): Promise<{ ok: boolean; notify?: OrderNotifyResult }> {
  try {
    const res = await fetch(`/api/secure/admin/orders/${encodeURIComponent(orderNumber)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => null);
    return { ok: res.ok && !!json?.success, notify: json?.notify };
  } catch {
    return { ok: false };
  }
}

/** Update status/catatan order dari panel admin, sekaligus menambah entri timeline. */
export async function updateOrderRemote(
  orderNumber: string,
  changes: { status?: OrderStatus; note?: string },
  onNotify?: (result: OrderNotifyResult) => void
): Promise<boolean> {
  const body: Record<string, unknown> = {};
  if (changes.status) body.status = changes.status;
  if (changes.note) body.note = changes.note;
  if (Object.keys(body).length === 0) return true;

  const result = await patchOrderViaAdminApi(orderNumber, body);
  if (result.ok && result.notify) onNotify?.(result.notify);
  return result.ok;
}