"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search, RotateCw, Eye, Edit, Check, Loader2, MessageCircle, Send, ArrowLeft, Trash2,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input, Select } from "@/components/ui/Input";
import { getAllOrdersRemote, updateOrderRemote, deleteOrderRemote, sendAdminReply, subscribeToOrder, Order, type OrderNotifyResult } from "@/lib/orders";
import { statusLabels, OrderStatus, statusTimeline, orderStatusOptions } from "@/lib/data";
import { formatRupiah } from "@/lib/utils";
import { OrderTimeline } from "@/components/ui/OrderTimeline";
import { useToast } from "@/components/ui/Toast";
import { OrderDetailDialog } from "@/components/admin/OrderDetailDialog";
import { OrderActionsMenu } from "@/components/admin/OrderActionsMenu";

function AdminOrdersPageInner() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [search, setSearch] = React.useState("");
  const [editStatus, setEditStatus] = React.useState(false);
  const [newStatus, setNewStatus] = React.useState<OrderStatus | "">("");
  const [newPrice, setNewPrice] = React.useState("");
  const [newNote, setNewNote] = React.useState("");
  const [applying, setApplying] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [chatInput, setChatInput] = React.useState("");
  const [sendingChat, setSendingChat] = React.useState(false);
  const [detailOrder, setDetailOrder] = React.useState<Order | null>(null);
  const paramsApplied = React.useRef(false);
  const [mobileView, setMobileView] = React.useState<"list" | "detail">("list");

  const loadOrders = React.useCallback(async () => {
    const data = await getAllOrdersRemote();
      setOrders(data);
      // Pertahankan pesanan yang sedang dipilih saat data dimuat ulang.
      setSelectedId((prev) => (prev && data.some((o) => o.id === prev) ? prev : data[0]?.id || null));
      setLoading(false);
  }, []);

  React.useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  React.useEffect(() => {
    const customer = searchParams.get("customer");
    if (customer) setSearch(customer);
  }, []);

  // Parameter URL: ?order=NOMOR&edit=1 dan ?status=STATUS (dari dashboard / tombol aksi).
  React.useEffect(() => {
    if (paramsApplied.current || loading) return;
    paramsApplied.current = true;
    const num = searchParams.get("order");
    const st = searchParams.get("status");
    if (st && (orderStatusOptions as string[]).includes(st)) {
      setStatusFilter(st);
      const first = orders.find((o) => o.status === st);
      if (first && !num) setSelectedId(first.id);
    }
    if (num) {
      const found = orders.find((o) => o.orderNumber === num);
      if (found) {
        setSelectedId(found.id);
        setMobileView("detail");
        if (searchParams.get("edit") === "1") setEditStatus(true);
      }
    }
  }, [loading, orders, searchParams]);

  // Chat pelanggan masuk secara live tanpa perlu refresh manual.
  React.useEffect(() => {
    if (!selectedId) return;
    const unsubscribe = subscribeToOrder(selectedId, (updated) => {
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    });
    return unsubscribe;
  }, [selectedId]);

  // Pesan pelanggan baru muncul otomatis (polling 5 detik, hanya saat tab terlihat).
  React.useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible" && !applying && !sendingChat) loadOrders();
    }, 5000);
    return () => clearInterval(id);
  }, [loadOrders, applying, sendingChat]);

  const filtered = orders.filter((o) => {
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    const matchSearch =
      !search ||
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const selected = orders.find((o) => o.id === selectedId) || filtered[0];

  const handleSendChat = async () => {
    if (!chatInput.trim() || !selected) return;
    setSendingChat(true);
    const ok = await sendAdminReply(selected.orderNumber, chatInput.trim());
    setSendingChat(false);
    if (ok) {
      setChatInput("");
      await loadOrders();
    } else {
      toast({ variant: "error", title: "Gagal mengirim pesan" });
    }
  };

  const handleApply = async () => {
    if (!selected) return;
    setApplying(true);
    let waNotify: OrderNotifyResult | null = null;
    const ok = await updateOrderRemote(
      selected.orderNumber,
      {
        status: (newStatus as OrderStatus) || undefined,
        priceFinal: newPrice ? Number(newPrice) : undefined,
        note: newNote || undefined,
      },
      (r) => {
        waNotify = r;
      }
    );
    setApplying(false);

    if (ok) {
      toast({ variant: "success", title: "Perubahan tersimpan" });
      const wa = waNotify as OrderNotifyResult | null;
      if (wa?.sent) {
        toast({ variant: "success", title: "Notifikasi WhatsApp terkirim", description: "Pelanggan diberi tahu pesanan selesai." });
      } else if (wa) {
        toast({
          variant: "error",
          title: "Notifikasi WhatsApp belum terkirim",
          description:
            wa.reason === "not_configured"
              ? "FONNTE_TOKEN belum diisi di .env. Kirim manual lewat tombol WhatsApp pelanggan."
              : `Gagal mengirim (${wa.reason}${wa.detail ? `: ${wa.detail}` : ""}). Kirim manual lewat WhatsApp pelanggan.`,
        });
        if (wa.whatsappLink) window.open(wa.whatsappLink, "_blank", "noopener,noreferrer");
      }
      await loadOrders();
    } else {
      toast({
        variant: "error",
        title: "Gagal menyimpan",
        description: "Perubahan tidak tersimpan di database. Cek SUPABASE_SERVICE_ROLE_KEY di server, lalu coba lagi.",
      });
    }

    setEditStatus(false);
    setNewStatus("");
    setNewPrice("");
    setNewNote("");
  };

  const handleDelete = async () => {
    if (!selected) return;
    const sure = window.confirm(
      `Hapus pesanan ${selected.orderNumber} secara permanen? Tindakan ini tidak bisa dibatalkan.`
    );
    if (!sure) return;

    setDeleting(true);
    const result = await deleteOrderRemote(selected.orderNumber);
    setDeleting(false);

    if (result.ok) {
      toast({ variant: "success", title: "Pesanan dihapus" });
      setSelectedId(null);
      await loadOrders();
    } else {
      toast({ variant: "error", title: "Gagal menghapus", description: result.error });
    }
  };

  return (
    <DashboardLayout
      type="admin"
      title="Kelola Pesanan"
      subtitle="Perbarui status, estimasi, dan detail semua pesanan"
    >
      <Card className="mb-6">
        <CardContent className="p-4 sm:p-5 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center flex-1">
            <div className="relative flex-1 sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nomor / nama pelanggan..."
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-48"
            >
              <option value="all">Semua Status</option>
              {orderStatusOptions.map((s) => (
                <option key={s} value={s}>
                  {statusLabels[s].label}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                loadOrders();
              }}
            >
              <RotateCw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6 lg:grid lg:grid-cols-5 lg:gap-6 lg:space-y-0">
        <Card className={`lg:col-span-3 overflow-hidden ${mobileView === "detail" ? "hidden lg:block" : "block"}`}>
          <CardHeader className="pb-3 border-b border-brand-border/60">
            <CardTitle className="text-base">
              Daftar Pesanan ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 p-0 max-h-[70vh] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-slate-400 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" /> Memuat pesanan...
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-10 text-sm text-slate-400">
                Tidak ada pesanan yang cocok.
              </div>
            ) : (
            filtered.map((o: Order) => {
              const isActive = selected?.id === o.id;
              return (
                <button
                  key={o.id}
                  onClick={() => {
                    setSelectedId(o.id);
                    setMobileView("detail");
                  }}
                  className={`w-full text-left p-4 border-b border-brand-border/60 hover:bg-brand-bg/60 transition-colors ${
                    isActive ? "bg-gradient-to-r from-brand-green/10 to-transparent border-l-4 border-l-brand-green" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 shrink-0 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 ring-2 ring-white shadow-soft flex items-center justify-center text-white text-[11px] font-bold">
                      {o.customerName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap justify-between">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-brand-text">{o.orderNumber}</span>
                          <Badge variant="outline" className="text-[10px]">
                            {o.quantity} pcs
                          </Badge>
                        </div>
                        <Badge className={`${statusLabels[o.status as OrderStatus].color} border text-[10px]`}>
                          {statusLabels[o.status as OrderStatus].label}
                        </Badge>
                      </div>
                      <div className="text-xs font-medium text-brand-text mt-0.5">
                        {o.serviceName}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 flex-wrap mt-0.5">
                        <span>{o.customerName}</span>
                        <span>· {new Date(o.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</span>
                        <span className="font-semibold text-brand-green ml-auto">
                          {formatRupiah(o.priceFinal || o.priceEstimate || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
            )}
          </CardContent>
        </Card>

        {selected && (
          <Card className={`lg:col-span-2 overflow-hidden ${mobileView === "detail" ? "block" : "hidden lg:block"}`}>
            <CardHeader className="pb-3 border-b border-brand-border/60 flex-row items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="lg:hidden mb-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="!h-8 !px-2 text-xs -ml-2 mb-1"
                    onClick={() => setMobileView("list")}
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Kembali ke daftar
                  </Button>
                </div>
                <CardTitle className="text-base">
                  {selected.orderNumber}
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">{selected.serviceName}</p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="!h-8 !w-8 !p-0"
                  aria-label="Lihat detail pesanan"
                  title="Lihat detail"
                  onClick={() => setDetailOrder(selected)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="!h-8 !w-8 !p-0"
                  aria-label="Ubah status"
                  title="Ubah status"
                  onClick={() => setEditStatus(true)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <OrderActionsMenu order={selected} onView={() => setDetailOrder(selected)} />
                {selected.status === "cancelled" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="!h-8 !w-8 !p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                    aria-label="Hapus pesanan"
                    title="Hapus pesanan"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0 p-5 space-y-5 max-h-[70vh] overflow-y-auto">
              {selected.status === "cancelled" && !editStatus && (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5">
                  <p className="text-xs text-red-700">
                    Pesanan ini dibatalkan. Hapus permanen kalau sudah tidak diperlukan.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="!h-7 shrink-0 border-red-300 text-red-600 hover:bg-red-100"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    Hapus Pesanan
                  </Button>
                </div>
              )}
              {!editStatus ? (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-500">STATUS SAAT INI</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="!h-7 !px-2 text-brand-green text-[11px]"
                        onClick={() => setEditStatus(true)}
                      >
                        <Edit className="h-3 w-3" />
                        Ubah
                      </Button>
                    </div>
                    <Badge className={`${statusLabels[selected.status as OrderStatus].color} border text-xs !px-3 !py-1.5`}>
                      {statusLabels[selected.status as OrderStatus].label}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-xl bg-brand-bg/70 p-3 space-y-0.5">
                      <div className="text-slate-500">Harga Final</div>
                      <div className="font-bold text-brand-text text-sm">
                        {formatRupiah(selected.priceFinal || selected.priceEstimate || 0)}
                      </div>
                    </div>
                    <div className="rounded-xl bg-brand-bg/70 p-3 space-y-0.5">
                      <div className="text-slate-500">Pelanggan</div>
                      <div className="font-bold text-brand-text text-sm">{selected.customerName}</div>
                    </div>
                  </div>
                  {selected.notes && (
                    <div>
                      <div className="text-[11px] font-semibold text-slate-500 uppercase mb-1.5">Catatan Pelanggan</div>
                      <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-brand-border leading-relaxed">
                        {selected.notes}
                      </p>
                    </div>
                  )}
                  <div>
                    <div className="text-[11px] font-semibold text-slate-500 uppercase mb-3">Progress Timeline</div>
                    <OrderTimeline currentStatus={selected.status as OrderStatus} size="sm" />
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">Update Status</label>
                    <Select
                      value={newStatus || selected.status}
                      onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                      className="mt-1.5"
                    >
                      {orderStatusOptions.map((s) => (
                        <option key={s} value={s}>
                          {statusLabels[s].label}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">Harga Final (Rp)</label>
                    <Input
                      value={newPrice || (selected.priceFinal || selected.priceEstimate || "")}
                      onChange={(e) => setNewPrice(e.target.value)}
                      placeholder="contoh: 100000"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">Balasan / Catatan Untuk Pelanggan (masuk ke chat)</label>
                    <Input
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Tulis balasan atau catatan untuk pelanggan..."
                      className="mt-1.5"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button variant="outline" className="flex-1" onClick={() => setEditStatus(false)}>
                      Batal
                    </Button>
                    <Button className="flex-1" onClick={handleApply} disabled={applying}>
                      {applying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      {applying ? "Menyimpan..." : "Terapkan"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {selected && (
          <Card className={`lg:col-span-5 overflow-hidden ${mobileView === "detail" ? "block" : "hidden lg:block"}`}>
            <CardHeader className="pb-3 border-b border-brand-border/60">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-brand-green" />
                Chat dengan {selected.customerName}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {selected.customerNotes.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">
                    Belum ada pesan pada pesanan ini.
                  </p>
                ) : (
                  selected.customerNotes.map((n) => (
                    <div
                      key={n.id}
                      className={`flex ${n.role === "admin" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-xs ${
                          n.role === "admin"
                            ? "bg-brand-green text-white rounded-br-sm"
                            : "bg-brand-bg text-brand-text rounded-bl-sm"
                        }`}
                      >
                        <div className="font-semibold mb-0.5 opacity-80">{n.author}</div>
                        <div className="leading-relaxed">{n.message}</div>
                        <div
                          className={`text-[10px] mt-1 ${
                            n.role === "admin" ? "text-white/70" : "text-slate-400"
                          }`}
                        >
                          {new Date(n.timestamp).toLocaleString("id-ID", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-2 pt-1 border-t border-brand-border/60">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendChat();
                    }
                  }}
                  placeholder="Tulis balasan untuk pelanggan..."
                  className="mt-2"
                />
                <Button
                  className="mt-2 shrink-0"
                  onClick={handleSendChat}
                  disabled={sendingChat || !chatInput.trim()}
                >
                  {sendingChat ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <OrderDetailDialog order={detailOrder} onClose={() => setDetailOrder(null)} />
    </DashboardLayout>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={null}>
      <AdminOrdersPageInner />
    </Suspense>
  );
}