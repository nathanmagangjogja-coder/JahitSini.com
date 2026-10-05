"use client";

import * as React from "react";
import { Upload, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

interface Props {
  kind: "logo" | "favicon";
  label: string;
  hint: string;
  accept: string;
  maxKB: number;
  currentUrl?: string | null;
  onChange: (url: string | null) => void;
}

/** Kotak upload logo/favicon: pilih file -> tersimpan ke storage + database lewat API admin. */
export function BrandAssetUploader({ kind, label, hint, accept, maxKB, currentUrl, onChange }: Props) {
  const { toast } = useToast();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [busy, setBusy] = React.useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > maxKB * 1024) {
      toast({ variant: "error", title: "File terlalu besar", description: `Maksimal ${maxKB} KB.` });
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("kind", kind);
      fd.append("file", file);
      const res = await fetch("/api/secure/admin/brand", { method: "POST", body: fd });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.success) {
        onChange(json.url);
        toast({ variant: "success", title: `${label} tersimpan` });
      } else {
        toast({ variant: "error", title: "Gagal mengunggah", description: json?.error || `Error ${res.status}` });
      }
    } catch {
      toast({ variant: "error", title: "Gagal terhubung ke server" });
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async () => {
    if (!window.confirm(`Hapus ${label}? Tampilan akan kembali ke bawaan.`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/secure/admin/brand?kind=${kind}`, { method: "DELETE" });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.success) {
        onChange(null);
        toast({ variant: "success", title: `${label} dihapus` });
      } else {
        toast({ variant: "error", title: "Gagal menghapus", description: json?.error || `Error ${res.status}` });
      }
    } catch {
      toast({ variant: "error", title: "Gagal terhubung ke server" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border-2 border-dashed border-brand-border bg-brand-bg/30 p-6 text-center">
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleFile} />
      {currentUrl ? (
        <div
          className={`mx-auto mb-3 flex items-center justify-center rounded-xl border border-brand-border bg-white p-2 ${
            kind === "logo" ? "h-16 max-w-[220px]" : "h-16 w-16"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={currentUrl} alt={label} className="max-h-full max-w-full object-contain" />
        </div>
      ) : (
        <Upload className="h-7 w-7 text-slate-400 mx-auto mb-2" />
      )}
      <div className="text-sm font-medium text-brand-text">{label}</div>
      <div className="text-xs text-slate-500 mt-0.5">{hint}</div>
      <div className="mt-3 flex items-center justify-center gap-2">
        <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => inputRef.current?.click()}>
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          {currentUrl ? "Ganti" : "Pilih File"}
        </Button>
        {currentUrl && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={busy}
            className="text-red-500 hover:bg-red-50 hover:text-red-600"
            onClick={handleRemove}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Hapus
          </Button>
        )}
      </div>
    </div>
  );
}
