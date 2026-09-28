import { supabase } from "./supabase";

export interface BusinessSettings {
  whatsapp: string;
  phone: string;
  email: string;
  address: string;
  operatingHours: string;
  websiteUrl: string;
  notifyNewOrderEmail: boolean;
  notifyUrgentWhatsapp: boolean;
  notifyDailyReport: boolean;
}

const LOCAL_SETTINGS_KEY = "jahitsini_business_settings";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function envDefaults(): BusinessSettings {
  return {
    whatsapp: process.env.BUSINESS_WHATSAPP || process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP || "",
    phone: process.env.BUSINESS_PHONE || "",
    email: process.env.BUSINESS_EMAIL || "",
    address: process.env.BUSINESS_ADDRESS || "",
    operatingHours: "Senin-Jumat: 08.00-17.00",
    websiteUrl: process.env.NEXT_PUBLIC_SITE_URL || "",
    notifyNewOrderEmail: true,
    notifyUrgentWhatsapp: true,
    notifyDailyReport: false,
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
 * Hubungi Kami) maupun Client Component (form admin/settings). Kalau Supabase
 * belum dikonfigurasi atau baris belum ada, fallback ke env var BUSINESS_*.
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

  const fallback = envDefaults();
  return {
    whatsapp: local.whatsapp ?? data.whatsapp ?? fallback.whatsapp,
    phone: local.phone ?? data.phone ?? fallback.phone,
    email: local.email ?? data.email ?? fallback.email,
    address: local.address ?? data.address ?? fallback.address,
    operatingHours: local.operatingHours ?? data.operating_hours ?? fallback.operatingHours,
    websiteUrl: local.websiteUrl ?? data.website_url ?? fallback.websiteUrl,
    notifyNewOrderEmail: local.notifyNewOrderEmail ?? data.notify_new_order_email ?? true,
    notifyUrgentWhatsapp: local.notifyUrgentWhatsapp ?? data.notify_urgent_whatsapp ?? true,
    notifyDailyReport: local.notifyDailyReport ?? data.notify_daily_report ?? false,
  };
}

export async function updateBusinessSettingsRemote(
  input: Partial<BusinessSettings>
): Promise<boolean> {
  if (!supabase) return saveLocalSettings(input);
  const payload: Record<string, any> = {};
  if (input.whatsapp !== undefined) payload.whatsapp = input.whatsapp;
  if (input.phone !== undefined) payload.phone = input.phone;
  if (input.email !== undefined) payload.email = input.email;
  if (input.address !== undefined) payload.address = input.address;
  if (input.operatingHours !== undefined) payload.operating_hours = input.operatingHours;
  if (input.websiteUrl !== undefined) payload.website_url = input.websiteUrl;
  if (input.notifyNewOrderEmail !== undefined)
    payload.notify_new_order_email = input.notifyNewOrderEmail;
  if (input.notifyUrgentWhatsapp !== undefined)
    payload.notify_urgent_whatsapp = input.notifyUrgentWhatsapp;
  if (input.notifyDailyReport !== undefined)
    payload.notify_daily_report = input.notifyDailyReport;

  const { error } = await supabase.from("business_settings").update(payload).eq("id", 1);
  if (error) return saveLocalSettings(input);
  saveLocalSettings(input);
  return true;
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
  const rawNumber =
    settings.whatsapp ||
    process.env.BUSINESS_WHATSAPP ||
    process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP ||
    "";
  const formatted = formatWhatsAppNumber(rawNumber);
  if (!formatted) return null;
  const baseUrl = `https://wa.me/${formatted}`;
  if (!message) return baseUrl;
  return `${baseUrl}?text=${encodeURIComponent(message)}`;
}
