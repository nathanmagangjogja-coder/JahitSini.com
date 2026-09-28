"use client";

import * as React from "react";
import Link from "next/link";
import { MoreHorizontal, Eye, Copy, MessageCircle, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import type { Order } from "@/lib/orders";

/** Menu aksi tambahan untuk satu pesanan (tombol titik tiga). */
export function OrderActionsMenu({ order, onView }: { order: Order; onView: () => void }) {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const copy = async () => {
    setOpen(false);
    try {
      await navigator.clipboard.writeText(order.orderNumber);
      toast({ variant: "success", title: "Nomor pesanan disalin", description: order.orderNumber });
    } catch {
      toast({ variant: "error", title: "Gagal menyalin", description: order.orderNumber });
    }
  };

  const wa = `https://wa.me/${order.customerPhone.replace(/[^0-9]/g, "").replace(/^0/, "62")}`;
  const item =
    "flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-brand-text hover:bg-brand-bg";

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="sm"
        className="!h-8 !w-8 !p-0 text-slate-500"
        aria-label="Aksi lainnya"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-9 z-30 w-52 overflow-hidden rounded-xl border border-brand-border bg-white py-1 shadow-card"
        >
          <button
            type="button"
            role="menuitem"
            className={item}
            onClick={() => {
              setOpen(false);
              onView();
            }}
          >
            <Eye className="h-3.5 w-3.5 text-slate-400" /> Lihat detail
          </button>
          <button type="button" role="menuitem" className={item} onClick={copy}>
            <Copy className="h-3.5 w-3.5 text-slate-400" /> Salin nomor pesanan
          </button>
          <a role="menuitem" className={item} href={wa} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
            <MessageCircle className="h-3.5 w-3.5 text-slate-400" /> WhatsApp pelanggan
          </a>
          <Link
            role="menuitem"
            className={item}
            href={`/admin/customers/${encodeURIComponent(order.customerPhone)}`}
            onClick={() => setOpen(false)}
          >
            <User className="h-3.5 w-3.5 text-slate-400" /> Riwayat pelanggan
          </Link>
        </div>
      )}
    </div>
  );
}
