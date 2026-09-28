"use client";

import * as React from "react";
import { ImageOff } from "lucide-react";

interface SiteImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  /** Kelas tambahan untuk kotak placeholder saat gambar belum ada. */
  placeholderClassName?: string;
}

/**
 * Gambar dari folder /public. Kalau file tidak ditemukan,
 * tampil placeholder netral (bukan ikon gambar rusak).
 */
export function SiteImage({
  src,
  alt,
  className = "w-full h-full object-cover",
  placeholderClassName = "bg-brand-bg",
}: SiteImageProps) {
  const [failed, setFailed] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    setFailed(false);
  }, [src]);

  // Tangkap error yang terjadi sebelum React selesai hydrate.
  React.useEffect(() => {
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth === 0) setFailed(true);
  }, [src]);

  if (!src || failed) {
    return (
      <div
        className={`flex h-full w-full flex-col items-center justify-center gap-1.5 text-slate-400 ${placeholderClassName}`}
      >
        <ImageOff className="h-6 w-6" />
        <span className="text-[11px]">Foto belum tersedia</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      loading="lazy"
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
