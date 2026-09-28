"use client";

import * as React from "react";
import Link from "next/link";
import { Phone, Mail, MessageCircle, Edit } from "lucide-react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { OrderTimeline } from "@/components/ui/OrderTimeline";
import { statusLabels, difficultyMultiplier, OrderStatus } from "@/lib/data";
import { formatRupiah } from "@/lib/utils";
import type { Order } from "@/lib/orders";

const fmtDate = (v?: string, time = false) =>
  v
    ? new Date(v).toLocaleString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        ...(time ? { hour: "2-digit", minute: "2-digit" } : {}),
      })
    : "-";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-brand-bg/70 p-3 space-y-0.5">
      <div className="text-[11px] text-slate-500">{label}</div>
      <div className="text-sm font-semibold text-brand-text break-words">{children}</div>
    </div>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] font-semibold text-slate-500 uppercase mb-2">{children}</div>;
}

/** Detail pesanan hanya-lihat, tampil di dalam dashboard admin (bukan halaman pelanggan). */
export function OrderDetailDialog({
  order,
  onClose,
}: {
  order: Order | null;
  onClose: () => void;
}) {
  const o = order;
  const wa = o ? `https://wa.me/${o.customerPhone.replace(/[^0-9]/g, "").replace(/^0/, "62")}` : "#";
  const status = o ? statusLabels[o.status as OrderStatus] : null;

  return (
    <Dialog
      open={!!o}
      onOpenChange={(v) => !v && onClose()}
      size="lg"
      title={o ? `Detail Pesanan ${o.orderNumber}` : undefined}
      description={o ? `Dibuat ${fmtDate(o.createdAt, true)}` : undefined}
      footer={
        o && (
          <>
            <Button variant="outline" onClick={onClose}>
              Tutup
            </Button>
            <Button asChild>
              <Link href={`/admin/orders?order=${encodeURIComponent(o.orderNumber)}&edit=1`}>
                <Edit className="h-4 w-4" />
                Ubah Status / Harga
              </Link>
            </Button>
          </>
        )
      }
    >
      {o && status && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={`${status.color} border text-xs !px-3 !py-1.5`}>{status.label}</Badge>
            <Badge variant="outline">{o.categoryLabel}</Badge>
          </div>

          <div>
            <Heading>Pelanggan</Heading>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Nama">{o.customerName}</Field>
              <Field label="Telepon / WhatsApp">{o.customerPhone}</Field>
              {o.customerEmail && <Field label="Email">{o.customerEmail}</Field>}
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <Button variant="outline" size="sm" asChild>
                <a href={wa} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-3.5 w-3.5" />
                  WhatsApp
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={`tel:${o.customerPhone.replace(/\s|-/g, "")}`}>
                  <Phone className="h-3.5 w-3.5" />
                  Telepon
                </a>
              </Button>
              {o.customerEmail && (
                <Button variant="outline" size="sm" asChild>
                  <a href={`mailto:${o.customerEmail}`}>
                    <Mail className="h-3.5 w-3.5" />
                    Email
                  </a>
                </Button>
              )}
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/customers/${encodeURIComponent(o.customerPhone)}`}>Riwayat pelanggan</Link>
              </Button>
            </div>
          </div>

          <div>
            <Heading>Layanan</Heading>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Layanan">{o.serviceName}</Field>
              <Field label="Jumlah">{o.quantity} pcs</Field>
              <Field label="Tingkat kesulitan">
                {difficultyMultiplier[o.difficulty]?.label ?? o.difficulty}
              </Field>
              <Field label="Estimasi selesai">{fmtDate(o.estimatedDone)}</Field>
              <Field label="Estimasi harga">{o.priceEstimate ? formatRupiah(o.priceEstimate) : "-"}</Field>
              <Field label="Harga final">{o.priceFinal ? formatRupiah(o.priceFinal) : "Belum ditetapkan"}</Field>
            </div>
          </div>

          {o.notes && (
            <div>
              <Heading>Catatan Pelanggan</Heading>
              <p className="text-sm text-slate-700 bg-white p-3 rounded-xl border border-brand-border leading-relaxed whitespace-pre-line">
                {o.notes}
              </p>
            </div>
          )}

          {o.photos.length > 0 && (
            <div>
              <Heading>Foto Pakaian ({o.photos.length})</Heading>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {o.photos.map((p) => (
                  <a
                    key={p.id}
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-xl overflow-hidden border border-brand-border bg-white"
                  >
                    <div className="aspect-square bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.url} alt={p.label} className="h-full w-full object-cover" loading="lazy" />
                    </div>
                    <div className="p-2 text-xs font-medium text-brand-text truncate">{p.label}</div>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div>
            <Heading>Progress</Heading>
            <OrderTimeline currentStatus={o.status as OrderStatus} size="sm" />
          </div>

          {o.timeline.length > 0 && (
            <div>
              <Heading>Riwayat Perubahan</Heading>
              <ul className="space-y-2">
                {[...o.timeline].reverse().map((t, i) => (
                  <li key={i} className="rounded-xl border border-brand-border p-3 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-brand-text">
                        {statusLabels[t.status as OrderStatus]?.label ?? t.status}
                      </span>
                      <span className="text-slate-400">{fmtDate(t.timestamp, true)}</span>
                    </div>
                    {t.note && <p className="mt-1 text-slate-600 leading-relaxed">{t.note}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <Heading>Percakapan ({o.customerNotes.length})</Heading>
            {o.customerNotes.length === 0 ? (
              <p className="text-xs text-slate-400">Belum ada pesan pada pesanan ini.</p>
            ) : (
              <div className="space-y-2">
                {o.customerNotes.map((n) => (
                  <div key={n.id} className={`flex ${n.role === "admin" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs ${
                        n.role === "admin"
                          ? "bg-brand-green text-white rounded-br-sm"
                          : "bg-brand-bg text-brand-text rounded-bl-sm"
                      }`}
                    >
                      <div className="font-semibold mb-0.5 opacity-80">{n.author}</div>
                      <div className="leading-relaxed">{n.message}</div>
                      <div className={`text-[10px] mt-1 ${n.role === "admin" ? "text-white/70" : "text-slate-400"}`}>
                        {fmtDate(n.timestamp, true)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Dialog>
  );
}
