"use client";

import { sanitizeDigits } from "@/lib/inputGuards";

import * as React from "react";
import {
  Mail, Phone, MapPin, Globe, Clock, Bell, Save, Upload, ShieldCheck, Loader2,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input, Textarea } from "@/components/ui/Input";
import { getBusinessSettingsRemote, updateBusinessSettingsRemote, BusinessSettings } from "@/lib/settings";
import { useToast } from "@/components/ui/Toast";

const defaultSettings: BusinessSettings = {
  whatsapp: "",
  phone: "",
  email: "",
  address: "",
  operatingHours: "Senin-Jumat: 08.00-17.00",
  websiteUrl: "",
  notifyNewOrderEmail: true,
  notifyUrgentWhatsapp: true,
  notifyDailyReport: false,
};

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [cfg, setCfg] = React.useState<BusinessSettings>(defaultSettings);
  const [loading, setLoading] = React.useState(true);
  const [savingInfo, setSavingInfo] = React.useState(false);
  const [savingNotif, setSavingNotif] = React.useState<string | null>(null);

  React.useEffect(() => {
    getBusinessSettingsRemote().then((data) => {
      setCfg(data);
      setLoading(false);
    });
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
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-4 flex-row items-start justify-between gap-3">
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
                  <p className="text-[11px] text-slate-500">Gunakan format kode negara tanpa tanda +</p>
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
              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={savingInfo}>
                  {savingInfo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {savingInfo ? "Menyimpan..." : "Simpan Pengaturan"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Logo & Brand</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Atur tampilan logo dan identitas brand
              </p>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                {["Logo Header", "Favicon"].map((label) => (
                  <div
                    key={label}
                    className="relative rounded-2xl border-2 border-dashed border-brand-border bg-brand-bg/30 p-6 text-center opacity-70 cursor-not-allowed"
                    title="Fitur upload logo segera hadir"
                  >
                    <Upload className="h-7 w-7 text-slate-400 mx-auto mb-2" />
                    <div className="text-sm font-medium text-brand-text">{label}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {label === "Logo Header" ? "SVG / PNG · maks 200 KB" : "ICO / PNG · 32x32 px"}
                    </div>
                    <Badge variant="outline" className="mt-3">Segera Hadir</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4 flex-row items-start justify-between gap-3">
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
                <div
                  key={o.key}
                  className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-brand-border hover:bg-brand-bg/60 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-brand-text">{o.title}</div>
                    <div className="text-xs text-slate-500">{o.desc}</div>
                  </div>
                  <label className="relative inline-flex h-6 w-11 items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={cfg[o.key] as boolean}
                      disabled={savingNotif === o.key}
                      onChange={(e) => handleToggleNotif(o.key, e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="w-full h-full bg-brand-border rounded-full peer-checked:bg-brand-green transition-colors" />
                    <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-soft peer-checked:translate-x-5 transition-transform" />
                  </label>
                </div>
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
      </div>
      )}
    </DashboardLayout>
  );
}