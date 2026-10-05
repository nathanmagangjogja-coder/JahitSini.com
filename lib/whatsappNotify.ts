export interface NotifyResult {
  sent: boolean;
  reason?: "not_configured" | "invalid_phone" | "provider_error" | "network_error";
  detail?: string;
}

/** 0812… / 812… / +62812… / 62812… -> 62812… (hanya angka). */
export function normalizeIndonesianPhone(raw: string): string | null {
  let d = String(raw || "").replace(/[^0-9]/g, "");
  if (!d) return null;
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("0")) d = "62" + d.slice(1);
  else if (d.startsWith("8")) d = "62" + d;
  if (!/^62\d{8,13}$/.test(d)) return null;
  return d;
}

export function buildOrderDoneMessage(o: {
  customerName: string;
  orderNumber: string;
  serviceName: string;
}): string {
  const site = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/+$/, "");
  const link = site ? `${site}/tracking?order=${encodeURIComponent(o.orderNumber)}` : "";

  return [
    `Halo ${o.customerName},`,
    "",
    `Pesanan *${o.orderNumber}* (${o.serviceName}) sudah *SELESAI* dan siap diambil. Terima kasih telah mempercayakan jahitan Anda kepada Jahitsini.com 🙏`,
    "",
    link
      ? `Cek detail pesananmu di:\n${link}\n\nAda pertanyaan? Balas pesan ini ya.`
      : "Ada pertanyaan? Balas pesan ini ya.",
  ].join("\n");
}

export async function sendWhatsApp(phone: string, message: string): Promise<NotifyResult> {
  const token = process.env.FONNTE_TOKEN;
  if (!token) return { sent: false, reason: "not_configured" };

  const target = normalizeIndonesianPhone(phone);
  if (!target) return { sent: false, reason: "invalid_phone" };

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: { Authorization: token },
      body: new URLSearchParams({ target, message, countryCode: "62" }),
      signal: ctrl.signal,
    });
    const json = await res.json().catch(() => null);
    if (res.ok && json?.status === true) return { sent: true };
    return { sent: false, reason: "provider_error", detail: String(json?.reason || res.status) };
  } catch (e) {
    return { sent: false, reason: "network_error", detail: e instanceof Error ? e.message : undefined };
  } finally {
    clearTimeout(timer);
  }
}