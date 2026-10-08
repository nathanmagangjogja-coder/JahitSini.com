export type SocialPlatform = "instagram" | "facebook" | "tiktok" | "youtube";

const RULES: Record<SocialPlatform, { hosts: string[]; build: (user: string) => string; label: string }> = {
  instagram: { hosts: ["instagram.com"], build: (u) => `https://instagram.com/${u}`, label: "Instagram" },
  facebook: { hosts: ["facebook.com", "fb.com", "fb.me"], build: (u) => `https://facebook.com/${u}`, label: "Facebook" },
  tiktok: { hosts: ["tiktok.com"], build: (u) => `https://tiktok.com/@${u}`, label: "TikTok" },
  youtube: { hosts: ["youtube.com", "youtu.be"], build: (u) => `https://youtube.com/@${u}`, label: "YouTube" },
};

export const socialLabel = (p: SocialPlatform) => RULES[p].label;

/**
 * Rapikan input admin menjadi URL profil yang aman.
 * - Kosong -> "" (artinya ikon disembunyikan)
 * - "@username" / "username" -> dibuatkan URL profilnya
 * - Tanpa https:// -> ditambahkan
 * - Harus http(s) dan domainnya sesuai platform; selain itu -> null (tidak valid)
 */
export function normalizeSocialUrl(platform: SocialPlatform, input: unknown): string | null {
  if (typeof input !== "string") return null;
  let v = input.trim();
  if (!v) return "";
  if (v.length > 300) return null;

  const rule = RULES[platform];
  if (/^@?[A-Za-z0-9._-]+$/.test(v)) return rule.build(v.replace(/^@/, ""));
  if (!/^https?:\/\//i.test(v)) v = `https://${v}`;

  try {
    const url = new URL(v);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    const host = url.hostname.toLowerCase().replace(/^www\./, "").replace(/^m\./, "");
    const ok = rule.hosts.some((h) => host === h || host.endsWith(`.${h}`));
    return ok ? url.toString() : null;
  } catch {
    return null;
  }
}