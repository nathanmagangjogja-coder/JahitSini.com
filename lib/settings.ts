import { supabase } from "./supabase";

export interface BusinessSettings {
  whatsapp: string;
  phone: string;
  email: string;
  address: string;
  operatingHours: string;
  websiteUrl: string;
  /** Tautan profil sosial media (kosong = ikon disembunyikan di footer). */
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
  /** Koordinat lokasi workshop untuk peta embed di halaman Hubungi Kami. */
  mapLat: number | null;
  mapLng: number | null;
  /** Sisi terpanjang maksimum (px) untuk foto yang diunggah (pakaian & foto website). */
  photoMaxDimension: number;
  /** URL logo header & favicon (diunggah admin ke bucket brand-assets). Kosong = pakai bawaan. */
  logoUrl?: string;
  faviconUrl?: string;
}

const LOCAL_SETTINGS_KEY = "jahitsini_business_settings";

function parseCoordValue(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function envDefaults(): BusinessSettings {
  return {
    whatsapp: "",
    phone: "",
    email: "",
    address: "",
    operatingHours: "Senin-Jumat: 08.00-17.00",
    websiteUrl: process.env.NEXT_PUBLIC_SITE_URL || "",
    instagramUrl: "",
    facebookUrl: "",
    tiktokUrl: "",
    youtubeUrl: "",
    mapLat: null,
    mapLng: null,
    photoMaxDimension: 1600,
  };
}

function getLocalSettings(): Partial<BusinessSettings> {
  if (!isBrowser()) return {};
  try {
    const raw = window.localStorage.getItem(LOCAL_SETTINGS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalSettings(input: Partial<BusinessSettings>): boolean {
  if (!isBrowser()) return false;
  const current = getLocalSettings();
  window.localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify({ ...current, ...input }));
  return true;
}

/**
 * Ambil pengaturan bisnis. Dipakai baik di Server Component (Footer, halaman
 * Hubungi Kami) maupun Client Component (form admin/settings). Semua data kontak &
 * sosial media diatur dari Admin > Pengaturan (tabel business_settings).
 */
export async function getBusinessSettingsRemote(): Promise<BusinessSettings> {
  const local = getLocalSettings();
  if (!supabase) return { ...envDefaults(), ...local };
  const { data, error } = await supabase
    .from("business_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) return { ...envDefaults(), ...local };

  // PENTING: setelah fetch ke Supabase BERHASIL, data database adalah sumber kebenaran
  // dan harus diutamakan. `local` (localStorage) cuma dipakai kalau kolom di database-nya
  // kosong (mis. admin belum pernah mengisi) atau kalau fetch-nya sendiri gagal total
  // (lihat dua early-return di atas). Sebelumnya urutannya terbalik (local selalu menang),
  // sehingga draf lama di satu browser bisa menutupi perubahan baru di database selamanya.
  const fallback = envDefaults();
  return {
    whatsapp: data.whatsapp ?? local.whatsapp ?? fallback.whatsapp,
    phone: data.phone ?? local.phone ?? fallback.phone,
    email: data.email ?? local.email ?? fallback.email,
    address: data.address ?? local.address ?? fallback.address,
    operatingHours: data.operating_hours ?? local.operatingHours ?? fallback.operatingHours,
    websiteUrl: data.website_url ?? local.websiteUrl ?? fallback.websiteUrl,
    instagramUrl: data.instagram_url ?? local.instagramUrl ?? "",
    facebookUrl: data.facebook_url ?? local.facebookUrl ?? "",
    tiktokUrl: data.tiktok_url ?? local.tiktokUrl ?? "",
    youtubeUrl: data.youtube_url ?? local.youtubeUrl ?? "",
    // Angka dari Supabase kadang datang sebagai string tergantung tipe kolom,
    // jadi di-parse dulu supaya peta tidak gagal muncul hanya karena typeof-nya "string".
    mapLat: parseCoordValue(data.map_lat) ?? local.mapLat ?? fallback.mapLat,
    mapLng: parseCoordValue(data.map_lng) ?? local.mapLng ?? fallback.mapLng,
    photoMaxDimension:
      data.photo_max_dimension ?? local.photoMaxDimension ?? fallback.photoMaxDimension,
    logoUrl: data.logo_url || undefined,
    faviconUrl: data.favicon_url || undefined,
  };
}

/**
 * Simpan pengaturan bisnis. HANYA dipakai di halaman /admin/settings (butuh sesi admin).
 * Ditulis lewat /api/secure/admin/settings (service role di server), BUKAN langsung ke
 * Supabase dari browser: sejak migration 0010_rls_tighten.sql, anon key tidak lagi boleh
 * UPDATE tabel business_settings, jadi menulis langsung akan gagal diam-diam.
 */
export async function updateBusinessSettingsRemote(
  input: Partial<BusinessSettings>
): Promise<boolean> {
  try {
    const res = await fetch("/api/secure/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const json = await res.json().catch(() => null);
    if (res.ok && json?.success) {
      saveLocalSettings(input); // cache lokal, dipakai fallback kalau offline
      return true;
    }
  } catch {
    // lanjut ke fallback lokal di bawah
  }
  return saveLocalSettings(input);
}

export function formatWhatsAppNumber(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("0")) digits = "62" + digits.slice(1);
  else if (!digits.startsWith("62")) digits = "62" + digits;
  if (digits.length < 11) return null;
  return digits;
}

export function buildWhatsAppLink(
  settings: Partial<BusinessSettings>,
  message?: string
): string | null {
  const formatted = formatWhatsAppNumber(settings.whatsapp);
  if (!formatted) return null;
  const baseUrl = `https://wa.me/${formatted}`;
  if (!message) return baseUrl;
  return `${baseUrl}?text=${encodeURIComponent(message)}`;
}