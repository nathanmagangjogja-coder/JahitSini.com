"use client";

import * as React from "react";
import { MessageCircle, Send, Loader2, Lock, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import type { OrderNote } from "@/lib/orders";
import type { ChatState } from "@/lib/chatPolicy";

const POLL_MS = 5000;
const MAX_LEN = 500;

function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m} menit ${String(s).padStart(2, "0")} detik`;
}

/** Chat pelanggan -> admin di halaman Lacak Pesanan. */
export function OrderChat({ orderNumber }: { orderNumber: string }) {
  const [notes, setNotes] = React.useState<OrderNote[]>([]);
  const [chat, setChat] = React.useState<ChatState>({ open: true, closesAt: null });
  const [loading, setLoading] = React.useState(true);
  const [input, setInput] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState("");
  const [now, setNow] = React.useState(() => Date.now());
  // Selisih jam server vs browser, supaya hitung mundur akurat.
  const skew = React.useRef(0);
  const listRef = React.useRef<HTMLDivElement>(null);
  const lastCount = React.useRef(0);

  const url = `/api/chat/${encodeURIComponent(orderNumber)}`;

  const load = React.useCallback(async () => {
    try {
      const res = await fetch(url, { cache: "no-store" });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) return;
      if (json.serverTime) skew.current = Date.parse(json.serverTime) - Date.now();
      setNotes(json.notes || []);
      setChat(json.chat);
    } finally {
      setLoading(false);
    }
  }, [url]);

  React.useEffect(() => {
    setLoading(true);
    load();
    const id = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, POLL_MS);
    return () => clearInterval(id);
  }, [load]);

  // Tick tiap detik hanya saat ada hitung mundur.
  React.useEffect(() => {
    if (!chat.closesAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [chat.closesAt]);

  React.useEffect(() => {
    if (notes.length !== lastCount.current) {
      lastCount.current = notes.length;
      const el = listRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    }
  }, [notes.length]);

  const remainingMs = chat.closesAt ? Date.parse(chat.closesAt) - (now + skew.current) : null;
  const closedByTime = remainingMs !== null && remainingMs <= 0;
  const open = chat.open && !closedByTime;

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const message = input.trim();
    if (!message || !open || sending) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        if (json?.chat) setChat(json.chat);
        throw new Error(json?.error || "Gagal mengirim pesan.");
      }
      setNotes(json.notes || []);
      setChat(json.chat);
      setInput("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim pesan.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6 sm:p-7">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h3 className="font-bold text-brand-text flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-brand-green" />
            Chat dengan Admin
          </h3>
          {open ? (
            <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5">
              Aktif
            </span>
          ) : (
            <span className="text-[11px] font-medium text-slate-500 bg-slate-100 border border-slate-200 rounded-full px-2.5 py-0.5">
              Dinonaktifkan
            </span>
          )}
        </div>

        {open && remainingMs !== null && (
          <div className="mb-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            <Clock className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>
              Pesanan sudah selesai. Chat akan dinonaktifkan dalam{" "}
              <strong>{formatRemaining(remainingMs)}</strong>.
            </span>
          </div>
        )}

        <div
          ref={listRef}
          className="h-72 overflow-y-auto rounded-2xl border border-brand-border bg-brand-bg/40 p-3 space-y-2.5"
        >
          {loading ? (
            <p className="text-xs text-slate-400 text-center py-8">Memuat percakapan...</p>
          ) : notes.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">
              Belum ada pesan. Tulis pertanyaanmu untuk admin di bawah.
            </p>
          ) : (
            notes.map((n) => {
              const mine = n.role === "customer";
              return (
                <div key={n.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm",
                      mine
                        ? "bg-brand-green text-white rounded-br-sm"
                        : "bg-white border border-brand-border text-brand-text rounded-bl-sm"
                    )}
                  >
                    {!mine && <div className="text-[11px] font-semibold mb-0.5 text-brand-green">Admin Jahitsini</div>}
                    <div className="leading-relaxed whitespace-pre-wrap break-words">{n.message}</div>
                    <div className={cn("text-[10px] mt-1", mine ? "text-white/70" : "text-slate-400")}>
                      {new Date(n.timestamp).toLocaleString("id-ID", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {!open && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            <Lock className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>
              Chat dinonaktifkan karena pesanan sudah selesai lebih dari 1 jam. Riwayat percakapan tetap bisa
              dibaca. Untuk pertanyaan lanjutan, silakan hubungi kami lewat halaman Hubungi Kami.
            </span>
          </div>
        )}

        <form onSubmit={send} className="mt-3 flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, MAX_LEN))}
            placeholder={open ? "Tulis pesan untuk admin..." : "Chat dinonaktifkan"}
            disabled={!open || sending}
            maxLength={MAX_LEN}
            aria-label="Pesan untuk admin"
          />
          <Button type="submit" disabled={!open || sending || !input.trim()} className="shrink-0">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="sr-only sm:not-sr-only">Kirim</span>
          </Button>
        </form>
        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      </CardContent>
    </Card>
  );
}
