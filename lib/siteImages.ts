import { supabase } from "./supabase";

/**
 * GAMBAR WEBSITE — sumber utama: Supabase (tabel `site_media`).
 * Diedit admin lewat /admin/media.
 *
 * Urutan pemakaian per slot:
 *   1. URL di tabel `site_media` (Supabase)      <- yang diedit admin
 *   2. File cadangan  public/images/<key>.jpg     <- kalau slot belum ada di database
 *   3. Kalau keduanya tidak ada, komponen <SiteImage> menampilkan "Foto belum tersedia".
 *
 * Dipanggil dari Server Component. Halaman yang memakainya harus
 * `export const dynamic = "force-dynamic"` supaya perubahan admin langsung tampil.
 */
export type SiteImageMap = Record<string, string>;

export interface SiteMediaRow {
  key: string;
  url: string;
  label: string;
  category: string;
  updated_at?: string;
}

/** Ambil semua baris site_media (untuk halaman publik & admin). */
export async function getSiteMediaRows(): Promise<SiteMediaRow[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("site_media")
      .select("key,url,label,category,updated_at");
    if (error || !data) {
      if (error) console.error("getSiteMediaRows error:", error.message);
      return [];
    }
    return data as SiteMediaRow[];
  } catch (e) {
    console.error("getSiteMediaRows error:", e);
    return [];
  }
}

/** Peta { key: url } dari Supabase. Slot yang tidak ada di DB tidak dimasukkan. */
export async function getSiteImages(): Promise<SiteImageMap> {
  const rows = await getSiteMediaRows();
  const map: SiteImageMap = {};
  for (const r of rows) {
    if (r.key && r.url) map[r.key] = r.url;
  }
  return map;
}

/** Ambil URL untuk satu slot: dari Supabase, kalau tidak ada pakai file cadangan di /public/images. */
export function pickSiteImage(images: SiteImageMap, key: string): string {
  return images[key] || `/images/${key}.jpg`;
}
