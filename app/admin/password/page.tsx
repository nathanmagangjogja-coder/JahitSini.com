"use client";

import * as React from "react";
import { KeyRound, Loader2, Eye, EyeOff } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { PasswordStrength, evaluatePassword } from "@/components/admin/PasswordStrength";

const MIN = 8;

export default function AdminPasswordPage() {
  const { toast } = useToast();
  const [current, setCurrent] = React.useState("");
  const [next, setNext] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [show, setShow] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (next.length < MIN) return setError(`Password baru minimal ${MIN} karakter.`);
    if (evaluatePassword(next, MIN).score < 2) return setError("Password terlalu lemah. Tambahkan huruf besar, angka, atau simbol.");
    if (next !== confirm) return setError("Konfirmasi password tidak sama.");
    if (next === current) return setError("Password baru harus berbeda dari password lama.");

    setSaving(true);
    try {
      const res = await fetch("/api/secure/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) throw new Error(json?.error || `Gagal (${res.status})`);
      toast({ variant: "success", title: "Password berhasil diganti", description: "Gunakan password baru saat login berikutnya." });
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengganti password.");
    } finally {
      setSaving(false);
    }
  };

  const type = show ? "text" : "password";

  return (
    <DashboardLayout width="narrow" title="Ganti Password" subtitle="Ubah password login admin. Hanya ada satu admin yang mengontrol seluruh dashboard.">
      <Card className="w-full">
        <CardContent className="p-6">
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-brand-text">Password saat ini</label>
              <Input type={type} value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-brand-text">Password baru</label>
              <Input type={type} value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" placeholder={`Minimal ${MIN} karakter`} required />
              <PasswordStrength password={next} minLength={MIN} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-brand-text">Ulangi password baru</label>
              <Input type={type} value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" required />
              {confirm && (
                <p className={next === confirm ? "text-xs text-emerald-600" : "text-xs text-red-500"}>
                  {next === confirm ? "Password cocok." : "Password belum cocok."}
                </p>
              )}
            </div>
            <button type="button" onClick={() => setShow((v) => !v)} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-brand-text">
              {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {show ? "Sembunyikan" : "Tampilkan"} password
            </button>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
              {saving ? "Menyimpan..." : "Simpan Password Baru"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}