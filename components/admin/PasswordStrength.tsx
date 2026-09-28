"use client";

import * as React from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PasswordStrengthResult {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  checks: { label: string; ok: boolean }[];
}

const COMMON = ["password", "12345678", "123456789", "qwerty", "admin", "jahitsini", "sabr", "11111111"];

export function evaluatePassword(pw: string, minLength = 8): PasswordStrengthResult {
  const checks = [
    { label: `Minimal ${minLength} karakter`, ok: pw.length >= minLength },
    { label: "Huruf besar & kecil", ok: /[a-z]/.test(pw) && /[A-Z]/.test(pw) },
    { label: "Mengandung angka", ok: /\d/.test(pw) },
    { label: "Mengandung simbol (!@#$%...)", ok: /[^A-Za-z0-9]/.test(pw) },
  ];

  if (!pw) return { score: 0, label: "", checks };

  let points = checks.filter((c) => c.ok).length;
  if (pw.length >= 12) points += 1;
  if (pw.length < minLength) points = Math.min(points, 1);
  if (COMMON.some((w) => pw.toLowerCase().includes(w))) points = Math.min(points, 2);
  if (/^(.)\1+$/.test(pw)) points = 1;

  const score = (points <= 1 ? 1 : points === 2 ? 2 : points === 3 ? 3 : 4) as 1 | 2 | 3 | 4;
  const label = ["", "Lemah", "Cukup", "Kuat", "Sangat kuat"][score];
  return { score, label, checks };
}

const BAR = ["bg-slate-200", "bg-red-500", "bg-amber-500", "bg-emerald-500", "bg-emerald-600"];
const TEXT = ["text-slate-400", "text-red-500", "text-amber-600", "text-emerald-600", "text-emerald-700"];

export function PasswordStrength({ password, minLength = 8 }: { password: string; minLength?: number }) {
  const { score, label, checks } = React.useMemo(() => evaluatePassword(password, minLength), [password, minLength]);

  return (
    <div className="space-y-2" aria-live="polite">
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={cn("h-1.5 flex-1 rounded-full transition-colors", i <= score ? BAR[score] : "bg-slate-200")}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500">Kekuatan password</span>
        <span className={cn("font-semibold", TEXT[score])}>{label || "-"}</span>
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1">
        {checks.map((c) => (
          <li key={c.label} className={cn("flex items-center gap-1.5 text-[11px]", c.ok ? "text-emerald-600" : "text-slate-400")}>
            {c.ok ? <Check className="h-3 w-3 shrink-0" /> : <X className="h-3 w-3 shrink-0" />}
            {c.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
