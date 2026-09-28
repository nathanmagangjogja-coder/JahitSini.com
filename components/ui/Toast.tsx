"use client";

import * as React from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: "success" | "error";
}

interface ToastContextValue {
  toast: (t: Omit<ToastItem, "id">) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast harus dipakai di dalam <ToastProvider>");
  }
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const toast = React.useCallback((t: Omit<ToastItem, "id">) => {
    const id = `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, 4500);
  }, []);

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cn(
              "flex items-start gap-3 rounded-2xl border p-4 shadow-card bg-white animate-in",
              t.variant === "success" ? "border-brand-green/30" : "border-red-200"
            )}
          >
            <div
              className={cn(
                "h-8 w-8 shrink-0 rounded-xl flex items-center justify-center",
                t.variant === "success"
                  ? "bg-green-50 text-brand-green"
                  : "bg-red-50 text-red-500"
              )}
            >
              {t.variant === "success" ? (
                <CheckCircle2 className="h-4.5 w-4.5" />
              ) : (
                <XCircle className="h-4.5 w-4.5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-brand-text">{t.title}</div>
              {t.description && (
                <div className="text-xs text-slate-500 mt-0.5">{t.description}</div>
              )}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Tutup notifikasi"
              className="text-slate-400 hover:text-slate-600 shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
