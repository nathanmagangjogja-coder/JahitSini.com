"use client";

import { sanitizeDigits } from "@/lib/inputGuards";

import * as React from "react";
import {
  Mail, Phone, MapPin, Globe, Clock, Bell, Save, ShieldCheck, Loader2, ImageIcon,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input, Textarea } from "@/components/ui/Input";
import { getBusinessSettingsRemote, updateBusinessSettingsRemote, BusinessSettings } from "@/lib/settings";
import { parseCoordsFromText, isShortGoogleMapsLink } from "@/lib/mapsLink";
import { useToast } from "@/components/ui/Toast";
import { BrandAssetUploader } from "@/components/admin/BrandAssetUploader";

const defaultSettings: BusinessSettings = {
  whatsapp: "",
  phone: "",
  email: "",
  address: "",
  operatingHours: "Senin-Jumat: 08.00-17.00",
  websiteUrl: "",
  mapLat: null,
  mapLng: null,
  notifyNewOrderEmail: true,
  notifyUrgentWhatsapp: true,
  notifyDailyReport: false,
  photoMaxDimension: 1600,
};

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [cfg, setCfg] = React.useState<BusinessSettings>(defaultSettings);
  const [loading, setLoading] = React.useState(true);
  const [savingInfo, setSavingInfo] = React.useState(false);
  const [savingNotif, setSavingNotif] = React.useState<string | null>(null);
  const [savingPhoto, setSavingPhoto] = React.useState(false);
  const [photoDimError, setPhotoDimError] = React.useState("");
  const [savingMap, setSavingMap] = React.useState(false);
  const [mapError, setMapError] = React.useState("");
  const [resolvingLink, setResolvingLink] = React.useState(false);
  // Satu kolom tempel: admin cukup salin link/koordinat dari Google Maps ke sini.
  const [mapPasteInput, setMapPasteInput] = React.useState("");
  const [parsedCoords, setParsedCoords] = React.useState<{ lat: number; lng: number } | null>(null);

  React.useEffect(() => {
    getBusinessSettingsRemote().then((data) => {
      setCfg(data);
      setLoading(false);
    });

    // Lokasi peta diambil terpisah lewat /api/workshop-location (bukan dari
    // getBusinessSettingsRemote di atas), supaya tidak kena cache/merge lokal
    // apa pun dan selalu menampilkan apa yang benar-benar tersimpan di database.
    fetch("/api/workshop-location", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (typeof json?.lat === "number" && typeof json?.lng === "number") {
          setParsedCoords({ lat: json.lat, lng: json.lng });
          setMapPasteInput(`${json.lat}, ${json.lng}`);
        }
      })
      .catch(() => {});
  }, []);

  const showAvailable = !cfg.whatsapp && !cfg.phone && !cfg.email && !cfg.address;

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingInfo(true);
    const ok = await updateBusinessSettingsRemote({
      whatsapp: cfg.whatsapp,
      phone: cfg.phone,
      email: cfg.email,
      address: cfg.address,
      operatingHours: cfg.operatingHours,
      websiteUrl: cfg.websiteUrl,
    });
    setSavingInfo(false);
    toast(
      ok
        ? { variant: "success", title: "Pengaturan tersimpan" }
        : { variant: "error", title: "Gagal menyimpan", description: "Pastikan Supabase sudah dikonfigurasi." }
    );
  };

  const handleToggleNotif = async (key: keyof BusinessSettings, value: boolean) => {
    setCfg((c) => ({ ...c, [key]: value }));
    setSavingNotif(key);
    const ok = await updateBusinessSettingsRemote({ [key]: value } as Partial<BusinessSettings>);
    setSavingNotif(null);
    if (!ok) {
      toast({ variant: "error", title: "Gagal menyimpan preferensi" });
      setCfg((c) => ({ ...c, [key]: !value }));
    }
  };

  const handleSavePhotoDimension = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhotoDimError("");
    if (!Number.isFinite(cfg.photoMaxDimension) || cfg.photoMaxDimension < 400 || cfg.photoMaxDimension > 4000) {
      setPhotoDimError("Isi angka antara 400 dan 4000 piksel.");
      return;
    }
    setSavingPhoto(true);
    const ok = await updateBusinessSettingsRemote({ photoMaxDimension: cfg.photoMaxDimension });
    setSavingPhoto(false);
    toast(
      ok
        ? { variant: "success", title: "Dimensi foto tersimpan", description: `Foto baru akan diperkecil maks. ${cfg.photoMaxDimension}px.` }
        : { variant: "error", title: "Gagal menyimpan", description: "Pastikan Supabase sudah dikonfigurasi." }
    );
  };

  /** Coba pahami isi kolom tempel: koordinat langsung, link panjang, atau link pendek (via server). */
  const handleParseMapInput = async (raw: string) => {
    const text = raw.trim();
    setMapError("");
    if (!text) {
      setParsedCoords(null);
      return;
    }

    const direct = parseCoordsFromText(text);
    if (direct) {
      setParsedCoords(direct);
      return;
    }

    if (isShortGoogleMapsLink(text)) {
      setResolvingLink(true);
      setParsedCoords(null);
      try {
        const res = await fetch("/api/secure/admin/maps-resolve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: text }),
        });
        const json = await res.json().catch(() => null);
        if (res.ok && json?.success) {
          setParsedCoords({ lat: json.lat, lng: json.lng });
        } else {
          setMapError(json?.error || "Gagal membaca link. Coba tempel koordinatnya langsung.");
        }
      } catch {
        setMapError("Gagal membaca link. Coba tempel koordinatnya langsung.");
      } finally {
        setResolvingLink(false);
      }
      return;
    }

    setParsedCoords(null);
    setMapError("Lokasi tidak dikenali. Tempel link Google Maps, atau koordinat hasil klik-kanan (mis. -6.200000, 106.816666).");
  };

  const handleSaveMap = async (e: React.FormEvent) => {
    e.preventDefault();
    setMapError("");

    if (!mapPasteInput.trim()) {
      setSavingMap(true);
      const ok = await updateBusinessSettingsRemote({ mapLat: null, mapLng: null });
      setSavingMap(false);
      setCfg((c) => ({ ...c, mapLat: null, mapLng: null }));
      toast(ok ? { variant: "success", title: "Lokasi peta dikosongkan" } : { variant: "error", title: "Gagal menyimpan" });
      return;
    }

    if (!parsedCoords) {
      setMapError("Tempel dulu link atau koordinat lokasi yang valid sebelum menyimpan.");
      return;
    }

    setSavingMap(true);
    const ok = await updateBusinessSettingsRemote({ mapLat: parsedCoords.lat, mapLng: parsedCoords.lng });
    setSavingMap(false);
    setCfg((c) => ({ ...c, mapLat: parsedCoords.lat, mapLng: parsedCoords.lng }));
    toast(
      ok
        ? { variant: "success", title: "Lokasi peta tersimpan" }
        : { variant: "error", title: "Gagal menyimpan", description: "Pastikan Supabase sudah dikonfigurasi." }
    );
  };

  const notifOptions: { key: keyof BusinessSettings; title: string; desc: string }[] = [
    {
      key: "notifyNewOrderEmail",
      title: "Email Pesanan Baru",
      desc: "Dapatkan email setiap ada pesanan masuk",
    },
    {
      key: "notifyUrgentWhatsapp",
      title: "WhatsApp Notifikasi Penting",
      desc: "Kirim WA untuk pesanan darurat",
    },
    {
      key: "notifyDailyReport",
      title: "Laporan Harian Pendapatan",
      desc: "Ringkasan pendapatan harian via email",
    },
  ];

  return (
    <DashboardLayout
      type="admin"
      title="Pengaturan Sistem"
      subtitle="Kelola konfigurasi bisnis, kontak, dan pengaturan umum"
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-slate-400 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" /> Memuat pengaturan...
        </div>
      ) : (
      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-6">
        <Card>
          <CardHeader className="pb-4 flex-row flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-lg">Informasi Bisnis</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Data kontak yang ditampilkan di website
              </p>
            </div>
            <Badge variant={showAvailable ? "warning" : "success"}>
              {showAvailable ? "Belum Dikonfigurasi" : "Aktif"}
            </Badge>
          </CardHeader>
          <CardContent className="pt-0">
            <form className="space-y-4" onSubmit={handleSaveInfo}>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-brand-text flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    Nomor WhatsApp
                  </label>
                  <Input
                    placeholder="6281234567890"
                    inputMode="numeric"
                    value={cfg.whatsapp}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const clean = sanitizeDigits(raw);
                      if (clean !== raw) toast({ variant: "error", title: "Nomor hanya boleh angka" });
                      setCfg((c) => ({ ...c, whatsapp: clean }));
                    }}
                  />
                  <p className="text-xs text-slate-500">Gunakan format kode negara tanpa tanda +</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-brand-text flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    Nomor Telepon
                  </label>
                  <Input
                    placeholder="021-xxxxxxx"
                    value={cfg.phone}
                    onChange={(e) => setCfg((c) => ({ ...c, phone: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-brand-text flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  Email Bisnis
                </label>
                <Input
                  type="email"
                  placeholder="hello@jahitsini.com"
                  value={cfg.email}
                  onChange={(e) => setCfg((c) => ({ ...c, email: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-brand-text flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  Alamat Lengkap Workshop
                </label>
                <Textarea
                  placeholder="Jl. Contoh No. 123, Jakarta Selatan..."
                  rows={3}
                  value={cfg.address}
                  onChange={(e) => setCfg((c) => ({ ...c, address: e.target.value }))}
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-brand-text flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    Jam Operasional
                  </label>
                  <Input
                    value={cfg.operatingHours}
                    onChange={(e) => setCfg((c) => ({ ...c, operatingHours: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-brand-text flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-slate-400" />
                    Website URL
                  </label>
                  <Input
                    value={cfg.websiteUrl}
                    onChange={(e) => setCfg((c) => ({ ...c, websiteUrl: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end pt-2">
                <Button type="submit" disabled={savingInfo} className="w-full sm:w-auto">
                  {savingInfo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {savingInfo ? "Menyimpan..." : "Simpan Pengaturan"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

          <Card>
            <CardHeader className="pb-4 flex-row flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle className="text-lg">Notifikasi Admin</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pemberitahuan untuk aktivitas sistem
                </p>
              </div>
              <Badge variant="success">
                <Bell className="h-3 w-3" />
                Aktif
              </Badge>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {notifOptions.map((o) => (
                // Seluruh baris jadi satu tombol sentuh (label), bukan cuma sakelarnya —
                // jauh lebih mudah dipencet di layar HP yang kecil.
                <label
                  key={o.key}
                  className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-brand-border hover:bg-brand-bg/60 active:bg-brand-bg transition-colors cursor-pointer select-none"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-brand-text">{o.title}</div>
                    <div className="text-xs text-slate-500">{o.desc}</div>
                  </div>
                  <span className="relative inline-flex h-6 w-11 items-center shrink-0">
                    <input
                      type="checkbox"
                      checked={cfg[o.key] as boolean}
                      disabled={savingNotif === o.key}
                      onChange={(e) => handleToggleNotif(o.key, e.target.checked)}
                      className="peer sr-only"
                    />
                    <span className="w-full h-full bg-brand-border rounded-full peer-checked:bg-brand-green transition-colors" />
                    <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-soft peer-checked:translate-x-5 transition-transform" />
                  </span>
                </label>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white via-brand-bg/40 to-green-50 border-brand-green/20">
            <CardContent className="p-5 flex items-center gap-3">
              <div className="h-11 w-11 shrink-0 rounded-xl bg-gradient-to-br from-brand-green to-emerald-400 text-white flex items-center justify-center shadow-soft">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-brand-text">Tersimpan di Database</h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Perubahan di atas langsung tersimpan ke Supabase dan tampil di seluruh
                  website. Env var <code className="px-1 py-0.5 bg-white rounded text-brand-green font-medium">BUSINESS_*</code> hanya dipakai sebagai nilai awal.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Lokasi Peta</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Titik koordinat workshop, ditampilkan sebagai peta di halaman Hubungi Kami
              </p>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <form onSubmit={handleSaveMap} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-brand-text">
                    Link atau koordinat dari Google Maps
                  </label>
                  <div className="relative">
                    <Input
                      placeholder="Tempel di sini: link share Google Maps, atau -6.200000, 106.816666"
                      value={mapPasteInput}
                      autoComplete="off"
                      autoCapitalize="off"
                      autoCorrect="off"
                      spellCheck={false}
                      inputMode="text"
                      className="pr-9"
                      onChange={(e) => setMapPasteInput(e.target.value)}
                      onBlur={(e) => handleParseMapInput(e.target.value)}
                      onPaste={(e) => {
                        const text = e.clipboardData.getData("text");
                        // Tunda sedikit supaya nilai input sudah ter-update sebelum diproses.
                        setTimeout(() => handleParseMapInput(text), 0);
                      }}
                    />
                    {resolvingLink && (
                      <Loader2 className="h-4 w-4 animate-spin text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    )}
                  </div>
                  {parsedCoords && !resolvingLink && (
                    <p className="text-xs text-emerald-600 flex items-center gap-1.5">
                      <ShieldCheck className="h-3 w-3" />
                      Lokasi terbaca: {parsedCoords.lat.toFixed(6)}, {parsedCoords.lng.toFixed(6)}
                    </p>
                  )}
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  Paling mudah: buka Google Maps di HP atau komputer, cari lokasi workshop, tekan
                  tombol <strong>Bagikan</strong> lalu <strong>Salin link</strong>, kemudian tempel
                  link itu di kolom di atas — koordinatnya terbaca otomatis. Cara lain: klik kanan
                  tepat di titik lokasi lalu klik angka koordinat yang muncul untuk menyalinnya, lalu
                  tempel di sini. Kosongkan kolom untuk menyembunyikan peta.
                </p>

                <div className="rounded-2xl border border-brand-border overflow-hidden aspect-video bg-brand-bg/40">
                  {parsedCoords ? (
                    <iframe
                      key={`${parsedCoords.lat}-${parsedCoords.lng}`}
                      title="Pratinjau lokasi workshop"
                      src={`https://www.google.com/maps?q=${parsedCoords.lat},${parsedCoords.lng}&z=16&output=embed`}
                      className="w-full h-full border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-center px-4">
                      <p className="text-xs text-slate-400">
                        {resolvingLink ? "Membaca link..." : "Tempel link atau koordinat untuk melihat pratinjau peta"}
                      </p>
                    </div>
                  )}
                </div>

                {mapError && <p className="text-xs text-red-500">{mapError}</p>}
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end">
                  <Button type="submit" disabled={savingMap || resolvingLink} className="w-full sm:w-auto">
                    {savingMap ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {savingMap ? "Menyimpan..." : "Simpan Lokasi"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Logo & Brand</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Atur tampilan logo dan identitas brand
              </p>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <BrandAssetUploader
                  kind="logo"
                  label="Logo Header"
                  hint="SVG / PNG · maks 200 KB"
                  accept=".svg,.png,image/svg+xml,image/png"
                  maxKB={200}
                  currentUrl={cfg.logoUrl}
                  onChange={(url) => setCfg((c) => ({ ...c, logoUrl: url || undefined }))}
                />
                <BrandAssetUploader
                  kind="favicon"
                  label="Favicon"
                  hint="ICO / PNG · 32x32 px · maks 100 KB"
                  accept=".ico,.png,image/png,image/x-icon"
                  maxKB={100}
                  currentUrl={cfg.faviconUrl}
                  onChange={(url) => setCfg((c) => ({ ...c, faviconUrl: url || undefined }))}
                />
              </div>
              <p className="text-xs text-slate-500">
                Logo menggantikan ikon dan teks brand di header, footer, dan sidebar admin. Favicon
                muncul di tab browser. Hapus file untuk kembali ke tampilan bawaan.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-brand-green" />
                Dimensi Foto
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Batas ukuran (sisi terpanjang) untuk foto pakaian & foto website yang diunggah
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              <form onSubmit={handleSavePhotoDimension} className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-brand-text">Maksimum (piksel)</label>
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={400}
                      max={4000}
                      step={50}
                      value={cfg.photoMaxDimension}
                      onChange={(e) =>
                        setCfg((c) => ({ ...c, photoMaxDimension: Number(e.target.value) || 0 }))
                      }
                      className="w-full sm:max-w-[140px]"
                    />
                    <span className="text-xs text-slate-500">px (400-4000)</span>
                  </div>
                  {photoDimError && <p className="text-xs text-red-500">{photoDimError}</p>}
                  <p className="text-xs text-slate-400">
                    Foto yang diunggah pelanggan maupun admin akan diperkecil otomatis di browser
                    supaya sisi terpanjangnya tidak melebihi angka ini, sebelum diunggah.
                  </p>
                </div>
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end">
                  <Button type="submit" size="sm" disabled={savingPhoto} className="w-full sm:w-auto">
                    {savingPhoto ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    {savingPhoto ? "Menyimpan..." : "Simpan"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      )}
    </DashboardLayout>
  );
}