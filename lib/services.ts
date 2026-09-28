import { supabase } from "./supabase";
import { services as staticServices, Service } from "./data";
import {
  ServiceDetails,
  ServiceFull,
  withDetails,
  cleanList,
  cleanSteps,
  cleanFaqs,
} from "./serviceDetails";

export type { ServiceFull } from "./serviceDetails";

function mapDbService(row: any): ServiceFull {
  const base: Service = {
    id: row.id,
    name: row.name,
    description: row.description,
    priceStart: row.price_start,
    duration: row.duration,
    category: row.category,
    icon: row.icon,
  };
  return withDetails(base, {
    longDescription: row.long_description ?? "",
    includes: cleanList(row.includes),
    steps: cleanSteps(row.steps),
    tips: cleanList(row.tips),
    priceNotes: row.price_notes ?? "",
    faqs: cleanFaqs(row.faqs),
  });
}

const staticFull = (): ServiceFull[] => staticServices.map((s) => withDetails(s));

/** Ambil semua layanan dari Supabase. Fallback ke data statis kalau belum dikonfigurasi / error. */
export async function getServicesRemote(): Promise<ServiceFull[]> {
  if (!supabase) return staticFull();
  try {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("is_active", true)
      .order("category")
      .order("name");
    if (error || !data || data.length === 0) return staticFull();
    return data.map(mapDbService);
  } catch (e) {
    console.error("getServicesRemote error:", e);
    return staticFull();
  }
}

/**
 * Ambil satu layanan (lengkap dengan konten detail) berdasarkan id.
 * - Ada di database & aktif  -> pakai data database
 * - Ada di database tapi nonaktif (dihapus admin) -> null
 * - Tidak ada di database / database belum siap -> fallback ke data statis
 */
export async function getServiceByIdRemote(id: string): Promise<ServiceFull | null> {
  const staticService = staticServices.find((s) => s.id === id);
  const fallback = staticService ? withDetails(staticService) : null;
  if (!supabase) return fallback;
  try {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return fallback;
    if (data.is_active === false) return null;
    return mapDbService(data);
  } catch (e) {
    console.error("getServiceByIdRemote error:", e);
    return fallback;
  }
}

/* ------------------------------------------------------------------ */
/* Admin: tulis lewat API aman (/api/secure/admin/services)            */
/* ------------------------------------------------------------------ */

export interface ServiceInput extends Partial<ServiceDetails> {
  id?: string;
  name: string;
  description: string;
  priceStart: number;
  duration: string;
  category: "permak" | "reparasi" | "resleting" | "aksesoris";
  icon: string;
}

export interface ServiceResult {
  ok: boolean;
  id?: string;
  error?: string;
}

async function callApi(method: "POST" | "PATCH" | "DELETE", body: unknown): Promise<ServiceResult> {
  try {
    const res = await fetch("/api/secure/admin/services", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
      return { ok: false, error: json?.error || `Gagal (${res.status})` };
    }
    return { ok: true, id: json.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Koneksi gagal" };
  }
}

/** Tambah layanan baru. */
export function createService(input: ServiceInput): Promise<ServiceResult> {
  return callApi("POST", input);
}

/** Update layanan yang sudah ada. */
export function updateService(id: string, input: Partial<ServiceInput>): Promise<ServiceResult> {
  return callApi("PATCH", { ...input, id });
}

/** Hapus layanan (soft delete: is_active = false, supaya order lama yang mereferensikan tetap aman). */
export function deleteService(id: string): Promise<ServiceResult> {
  return callApi("DELETE", { id });
}