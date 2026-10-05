"use client";

import * as React from "react";
import Link from "next/link";
import { Users, ArrowRight, Plus, Filter, Search, Eye, Edit, Upload, Loader2, Inbox, ClipboardCheck, FileText, Scissors, ShieldCheck, PackageCheck } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input, Select } from "@/components/ui/Input";
import { getAllOrdersRemote, Order } from "@/lib/orders";
import { statusLabels, OrderStatus, statusTimeline } from "@/lib/data";
import { OrderDetailDialog } from "@/components/admin/OrderDetailDialog";
import { OrderActionsMenu } from "@/components/admin/OrderActionsMenu";

export default function AdminDashboard() {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [search, setSearch] = React.useState("");
  const [activeOnly, setActiveOnly] = React.useState(false);
  const [detailOrder, setDetailOrder] = React.useState<Order | null>(null);

  React.useEffect(() => {
    getAllOrdersRemote().then((data) => {
      setOrders(data);
      setLoading(false);
    });
  }, []);

  const filtered = orders.filter((o) => {
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    const matchSearch =
      !search ||
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.serviceName.toLowerCase().includes(search.toLowerCase());
    const matchActive = !activeOnly || o.status !== "done";
    return matchStatus && matchSearch && matchActive;
  });

  const byStatus = (st: OrderStatus) => orders.filter((o) => o.status === st).length;

  const statCards = [
    {
      title: "Request Baru",
      value: byStatus("received"),
      icon: Inbox,
      accent: "from-slate-500 to-slate-700",
      sub: "Pesanan baru masuk",
      link: "/admin/orders?status=received",
    },
    {
      title: "Menunggu Pemeriksaan",
      value: byStatus("checking"),
      icon: ClipboardCheck,
      accent: "from-yellow-500 to-amber-600",
      sub: "Sedang dicek kondisi",
      link: "/admin/orders?status=checking",
    },
    {
      title: "Menunggu Approval",
      value: byStatus("estimation") + byStatus("approved"),
      icon: FileText,
      accent: "from-blue-500 to-indigo-600",
      sub: "Estimasi menunggu persetujuan",
      link: "/admin/orders?status=estimation",
    },
    {
      title: "Sedang Dikerjakan",
      value: byStatus("sewing"),
      icon: Scissors,
      accent: "from-purple-500 to-fuchsia-600",
      sub: "Dalam proses jahit",
      link: "/admin/orders?status=sewing",
    },
    {
      title: "QC",
      value: byStatus("qc"),
      icon: ShieldCheck,
      accent: "from-orange-500 to-red-500",
      sub: "Quality Control",
      link: "/admin/orders?status=qc",
    },
    {
      title: "Siap/Selesai",
      value: byStatus("done"),
      icon: PackageCheck,
      accent: "from-brand-green to-emerald-500",
      sub: "Total: " + orders.length + " pesanan",
      link: "/admin/orders?status=done",
    },
  ];

  const recentCustomers = React.useMemo(() => {
    const map = new Map<string, { name: string; phone: string; orders: number; lastOrder: string }>();
    orders.forEach((o) => {
      const existing = map.get(o.customerPhone);
      if (existing) {
        existing.orders += 1;
        if (o.createdAt > existing.lastOrder) existing.lastOrder = o.createdAt;
      } else {
        map.set(o.customerPhone, {
          name: o.customerName,
          phone: o.customerPhone,
          orders: 1,
          lastOrder: o.createdAt,
        });
      }
    });
    return Array.from(map.values())
      .sort((a, b) => (a.lastOrder < b.lastOrder ? 1 : -1))
      .slice(0, 4)
      .map((c) => ({
        ...c,
        lastOrder: new Date(c.lastOrder).toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
      }));
  }, [orders]);

  return (
    <DashboardLayout
      type="admin"
      title="Dashboard Admin"
      subtitle="Kelola semua pesanan dan data pelanggan Jahitsini.com"
    >
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
        {statCards.map((s) => (
          <Card key={s.title} className="group hover:shadow-soft transition-all">
            <CardContent className="p-4 sm:p-5">
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${s.accent} text-white shadow-soft mb-3`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div className="text-2xl font-extrabold text-brand-text tracking-tight">
                {s.value}
              </div>
              <div className="text-sm font-semibold text-slate-500 mt-0.5">{s.title}</div>
              <div className="text-xs text-slate-400 mt-1">{s.sub}</div>
              {s.link && (
                <Link
                  href={s.link}
                  className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-brand-green hover:underline"
                >
                  Lihat
                  <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Manajemen Pesanan</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Kelola dan perbarui status pesanan pelanggan
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari pesanan..."
                  className="pl-9 h-9 text-xs w-48"
                />
              </div>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 text-xs w-40"
              >
                <option value="all">Semua Status</option>
                {statusTimeline.map((s) => (
                  <option key={s} value={s}>
                    {statusLabels[s].label}
                  </option>
                ))}
              </Select>
              <Button
                variant={activeOnly ? "default" : "outline"}
                size="sm"
                className="h-9"
                aria-pressed={activeOnly}
                title="Sembunyikan pesanan yang sudah selesai"
                onClick={() => setActiveOnly((v) => !v)}
              >
                <Filter className="h-3.5 w-3.5" />
                {activeOnly ? "Aktif saja" : "Filter"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0 overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-slate-400 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" /> Memuat pesanan...
              </div>
            ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 uppercase tracking-wider border-b border-brand-border">
                  <th className="py-3 pr-4 font-semibold">Pesanan</th>
                  <th className="py-3 pr-4 font-semibold">Pelanggan</th>
                  <th className="py-3 pr-4 font-semibold">Layanan</th>
                  <th className="py-3 pr-4 font-semibold">Status</th>
                  <th className="py-3 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {filtered.map((o: Order) => (
                  <tr key={o.id} className="group hover:bg-brand-bg/40 transition-colors">
                    <td className="py-3 pr-4">
                      <div>
                        <div className="font-semibold text-brand-text text-xs sm:text-sm">
                          {o.orderNumber}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {new Date(o.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                          })}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 ring-2 ring-white shadow-soft flex items-center justify-center text-white text-[11px] font-bold">
                          {o.customerName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-medium text-brand-text text-xs sm:text-sm">
                            {o.customerName}
                          </div>
                          <div className="text-[11px] text-slate-500">{o.customerPhone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="font-medium text-brand-text text-xs sm:text-sm">
                        {o.serviceName}
                      </div>
                      <div className="text-[11px] text-slate-500">{o.quantity} pcs · {o.difficulty}</div>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge className={`${statusLabels[o.status as OrderStatus].color} border`}>
                        {statusLabels[o.status as OrderStatus].label}
                      </Badge>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="!h-8 !w-8 !p-0"
                          aria-label="Lihat detail pesanan"
                          title="Lihat detail"
                          onClick={() => setDetailOrder(o)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="!h-8 !w-8 !p-0 text-brand-blue" title="Ubah status" asChild>
                          <Link href={`/admin/orders?order=${encodeURIComponent(o.orderNumber)}&edit=1`} aria-label="Ubah status">
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <OrderActionsMenu order={o} onView={() => setDetailOrder(o)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </CardContent>
        </Card>

        <Card className="space-y-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              Pelanggan Aktif
              <Link
                href="/admin/customers"
                className="text-xs font-semibold text-brand-green hover:underline flex items-center gap-1"
              >
                Semua
                <ArrowRight className="h-3 w-3" />
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2.5">
            {recentCustomers.map((c) => (
              <div
                key={c.phone}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-brand-bg/70 transition-colors"
              >
                <div className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-500 ring-2 ring-white shadow-soft flex items-center justify-center text-white text-xs font-bold">
                  {c.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-brand-text truncate">{c.name}</div>
                  <div className="text-[11px] text-slate-500 truncate">{c.phone}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-brand-green">{c.orders}x pesan</div>
                  <div className="text-[10px] text-slate-400">{c.lastOrder}</div>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full mt-2" asChild>
              <Link href="/admin/customers">
                <Users className="h-3.5 w-3.5" />
                Kelola Pelanggan
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-br from-brand-bg via-white to-green-50 border-brand-green/20">
        <CardContent className="p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 shrink-0 rounded-2xl bg-gradient-to-br from-brand-green to-emerald-400 text-white flex items-center justify-center shadow-soft">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-brand-text">Update Status Pesanan</h3>
              <p className="text-sm text-slate-600 mt-1 max-w-xl">
                Perbarui status pesanan dan tambahkan catatan untuk memberitahu progress terbaru ke pelanggan.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="lg" asChild>
              <Link href="/admin/orders">
                <Plus className="h-4 w-4" />
                Kelola Pesanan
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      <OrderDetailDialog order={detailOrder} onClose={() => setDetailOrder(null)} />
    </DashboardLayout>
  );
}