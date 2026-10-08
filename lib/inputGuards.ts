/**
 * Validasi & pembersihan input di sisi client — murni JS/regex, tanpa dependency
 * tambahan apa pun. Dipakai di semua form yang punya field nama / nomor telepon.
 */

export type Sanitizer = (value: string) => string;

const NAME_MAX = 80;
const PHONE_MAX = 15;

/** Nama: huruf, spasi, titik, apostrof, dan strip saja (untuk nama gelar/majemuk). */
export const sanitizeName: Sanitizer = (value) =>
  value.replace(/[^a-zA-Z\s'.-]/g, "").replace(/\s{2,}/g, " ").slice(0, NAME_MAX);

/** Nomor telepon/WhatsApp: angka saja, boleh diawali "+" sekali di depan. */
export const sanitizePhone: Sanitizer = (value) => {
  const hasPlus = value.trim().startsWith("+");
  const digits = value.replace(/[^0-9]/g, "").slice(0, PHONE_MAX);
  return hasPlus ? `+${digits}` : digits;
};

/** Angka saja, tanpa "+" (dipakai untuk field numerik biasa seperti jumlah). */
export const sanitizeDigits: Sanitizer = (value) => value.replace(/[^0-9]/g, "");

export function isValidName(value: string): boolean {
  const v = value.trim();
  return v.length >= 3 && /^[a-zA-Z\s'.-]+$/.test(v);
}

export function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 9 && digits.length <= 15;
}