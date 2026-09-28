import { buildWhatsAppLink, getBusinessSettingsRemote } from "./settings";
import { formatRupiah } from "./utils";

export interface WhatsAppOrderInput {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  serviceName: string;
  categoryLabel?: string;
  quantity: number;
  difficultyLabel: string;
  estimate?: number | null;
  notes?: string;
  photoUrl?: string | null;
}

/** Susun teks pesanan yang akan dikirim ke WhatsApp admin. */
export function buildOrderMessage(o: WhatsAppOrderInput): string {
  const lines = [
    "Halo Jahitsini, saya ingin memesan jasa jahit.",
    "",
    `No. Pesanan: ${o.orderNumber}`,
    `Nama: ${o.customerName}`,
    `No. WhatsApp: ${o.customerPhone}`,
    `Layanan: ${o.serviceName}${o.categoryLabel ? ` (${o.categoryLabel})` : ""}`,
    `Jumlah: ${o.quantity} pcs`,
    `Tingkat kesulitan: ${o.difficultyLabel}`,
  ];
  if (o.estimate) lines.push(`Estimasi biaya: ${formatRupiah(o.estimate)}`);
  if (o.notes) lines.push(`Catatan: ${o.notes}`);
  if (o.photoUrl) lines.push(`Foto pakaian: ${o.photoUrl}`);
  lines.push("", "Mohon dikonfirmasi ya. Terima kasih!");
  return lines.join("\n");
}

/** Buat link wa.me ke nomor bisnis dengan pesan pesanan terisi otomatis. */
export async function getOrderWhatsAppLink(o: WhatsAppOrderInput): Promise<string | null> {
  const settings = await getBusinessSettingsRemote();
  return buildWhatsAppLink(settings, buildOrderMessage(o));
}
