"use client";

import * as React from "react";
import { ImageIcon, Upload, Trash2, Loader2, Link2, ImageOff, RefreshCw } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { compressImage, DEFAULT_PHOTO_MAX_DIMENSION } from "@/lib/imageResize";
import { getBusinessSettingsRemote } from "@/lib/settings";

interface MediaItem {
  key: string;
  label: string;
  category: string;
  url: string | null;
  updatedAt: string | null;
}

export default function AdminMediaPage() {
  const { toast } = useToast();
  const [items, setItems] = React.useState<MediaItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [busyKey, setBusyKey] = React.useState<string | null>(null);
  const [urlKey, setUrlKey] = React.useState<string | null>(null);
  const [urlValue, setUrlValue] = React.useState("");
  const fileRef = React.useRef<HTMLInputElement>(null);
  const targetKey = React.useRef<string | null>(null);
  // Dimensi maksimum foto diambil dari Pengaturan (Admin > Pengaturan > Dimensi Foto).
  const [maxSide, setMaxSide] = React.useState(DEFAULT_PHOTO_MAX_DIMENSION);

  React.useEffect(() => {
    getBusinessSettingsRemote().then((s) => setMaxSide(s.photoMaxDimension || DEFAULT_PHOTO_MAX_DIMENSION));
  }, []);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/secure/admin/media", { cache: "no-store" });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) throw new Error(json?.error || `Gagal (${res.status})`);
      setItems(json.items);
    } catch (e) {
      toast({ variant: "error", title: "Gagal memuat foto", description: e instanceof Error ? e.message : undefined });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    load();
  }, [load]);

  const call = async (method: "PATCH" | "DELETE", body: unknown) => {
    const res = await fetch("/api/secure/admin/media", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) throw new Error(json?.error || `Gagal (${res.status})`);
  };

  const pickFile = (key: string) => {
    targetKey.current = key;
    fileRef.current?.click();
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const key = targetKey.current;
    e.target.value = "";
    if (!file || !key) return;
    setBusyKey(key);
    try {
      const small = await compressImage(file, maxSide);
      const fd = new FormData();
      fd.append("key", key);
      fd.append("file", small);
      const res = await fetch("/api/secure/admin/media", { method: "POST", body: fd });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) throw new Error(json?.error || `Gagal (${res.status})`);
      toast({ variant: "success", title: "Foto diperbarui" });
      await load();
    } catch (err) {
      toast({ variant: "error", title: "Gagal upload", description: err instanceof Error ? err.message : undefined });
    } finally {
      setBusyKey(null);
    }
  };

  const saveUrl = async (key: string) => {
    setBusyKey(key);
    try {
      await call("PATCH", { key, url: urlValue });
      toast({ variant: "success", title: "URL foto disimpan" });
      setUrlKey(null);
      setUrlValue("");
      await load();
    } catch (err) {
      toast({ variant: "error", title: "Gagal menyimpan", description: err instanceof Error ? err.message : undefined });
    } finally {
      setBusyKey(null);
    }
  };

  const remove = async (item: MediaItem) => {
    if (!window.confirm(`Hapus foto "${item.label}"? Slot akan kosong sampai diunggah lagi.`)) return;
    setBusyKey(item.key);
    try {
      await call("DELETE", { key: item.key });
      toast({ variant: "success", title: "Foto dihapus" });
      await load();
    } catch (err) {
      toast({ variant: "error", title: "Gagal menghapus", description: err instanceof Error ? err.message : undefined });
    } finally {
      setBusyKey(null);
    }
  };

  const groups = React.useMemo(() => {
    const m = new Map<string, MediaItem[]>();
    items.forEach((i) => m.set(i.category, [...(m.get(i.category) ?? []), i]));
    return Array.from(m.entries());
  }, [items]);

  return (
    <DashboardLayout
      title="Foto Website"
      subtitle="Ganti foto beranda dan galeri hasil jahitan. Perubahan langsung tampil di website."
    >
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={onFile} />

      <div className="mb-5 flex justify-end">
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Muat ulang
        </Button>
      </div>

      {loading && items.length === 0 ? (
        <div className="flex items-center justify-center py-20 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Memuat foto...
        </div>
      ) : (
        <div className="space-y-10">
          {groups.map(([category, list]) => (
            <section key={category}>
              <div className="mb-3 flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-brand-green" />
                <h2 className="font-bold text-brand-text">{category}</h2>
                <Badge variant="outline">{list.length}</Badge>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {list.map((item) => {
                  const busy = busyKey === item.key;
                  return (
                    <Card key={item.key} className="overflow-hidden">
                      <div className="relative aspect-square bg-brand-bg">
                        {item.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.url} alt={item.label} className="h-full w-full object-cover" loading="lazy" />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-slate-400">
                            <ImageOff className="h-6 w-6" />
                            <span className="text-[11px]">Belum ada foto</span>
                          </div>
                        )}
                        {busy && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                            <Loader2 className="h-6 w-6 animate-spin text-brand-green" />
                          </div>
                        )}
                      </div>
                      <CardContent className="space-y-3 p-4">
                        <div>
                          <div className="text-sm font-semibold text-brand-text leading-snug">{item.label}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{item.key}</div>
                        </div>

                        {urlKey === item.key ? (
                          <div className="space-y-2">
                            <input
                              value={urlValue}
                              onChange={(e) => setUrlValue(e.target.value)}
                              placeholder="https://..."
                              className="w-full rounded-lg border border-brand-border px-3 py-2 text-xs"
                            />
                            <div className="flex gap-2">
                              <Button size="sm" className="flex-1" disabled={busy || !urlValue} onClick={() => saveUrl(item.key)}>
                                Simpan
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setUrlKey(null)}>
                                Batal
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Button size="sm" className="flex-1" disabled={busy} onClick={() => pickFile(item.key)}>
                              <Upload className="h-3.5 w-3.5" />
                              {item.url ? "Ganti" : "Upload"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={busy}
                              title="Pakai URL gambar"
                              onClick={() => {
                                setUrlKey(item.key);
                                setUrlValue("");
                              }}
                            >
                              <Link2 className="h-3.5 w-3.5" />
                            </Button>
                            {item.url && (
                              <Button size="sm" variant="outline" disabled={busy} title="Hapus foto" onClick={() => remove(item)}>
                                <Trash2 className="h-3.5 w-3.5 text-red-500" />
                              </Button>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}