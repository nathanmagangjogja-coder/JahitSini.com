"use client";

/**
 * Perkecil foto di browser sebelum diunggah (canvas resize -> JPEG).
 * Sisi terpanjang dibatasi ke `maxSide` (diatur admin di Pengaturan > Dimensi Foto,
 * default 1600px). Kalau foto sudah lebih kecil dari itu, file asli dipakai apa adanya.
 */
export async function compressImage(file: File, maxSide: number): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  if (!maxSide || maxSide <= 0) return file;

  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
    const w = Math.round(bmp.width * scale);
    const h = Math.round(bmp.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(bmp, 0, 0, w, h);
    const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, "image/jpeg", 0.85));
    if (!blob || (blob.size >= file.size && scale === 1)) return file;
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}

export const DEFAULT_PHOTO_MAX_DIMENSION = 1600;
