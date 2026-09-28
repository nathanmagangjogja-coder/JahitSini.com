"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      window.location.assign("/admin");
    } else {
      setError("Password salah. Silakan coba lagi.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-brand-bg/40">
      <Card className="w-full max-w-sm">
        <CardContent className="p-7">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-brand-green to-emerald-400 text-white flex items-center justify-center shadow-soft mb-3">
              <Lock className="h-5 w-5" />
            </div>
            <h1 className="font-bold text-lg text-brand-text">Login Admin</h1>
            <p className="text-sm text-slate-500 mt-1">
              Masuk untuk mengelola pesanan, layanan, dan pelanggan.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-brand-text">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password admin"
                autoFocus
              />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Memeriksa..." : "Masuk"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}