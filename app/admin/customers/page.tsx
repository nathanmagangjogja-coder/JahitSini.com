"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Eye, MessageCircle, Clock, ArrowRight, Users, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input, Select } from "@/components/ui/Input";
import { getAllOrdersRemote, Order } from "@/lib/orders";

export default function AdminCustomersPage() {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [tierFilter, setTierFilter] = React.useState("all");

  React.useEffect(() => {
    getAllOrdersRemote().then((data) => {
      setOrders(data);
      setLoading(false);
    });
  }, []);

  const customerMap = new Map<string, {
    name: string;
    phone: string;
    email?: string;
    orders: Order[];
    lastOrder: string;
    activeOrders: number;
  }>();

  orders.forEach((o) => {
    const existing = customerMap.get(o.customerPhone);
    const isActive = o.status !== "done";
    if (existing) {
      existing.orders.push(o);
      if (isActive) existing.activeOrders += 1;
      if (o.createdAt > existing.lastOrder) existing.lastOrder = o.createdAt;
    } else {
      customerMap.set(o.customerPhone, {
        name: o.customerName,
        phone: o.customerPhone,
        email: o.customerEmail,
        orders: [o],
        lastOrder: o.createdAt,
        activeOrders: isActive ? 1 : 0,
      });
    }
  });

  const allCustomers = Array.from(customerMap.values()).map((c) => ({
    ...c,
    tier: c.orders.length >= 3 ? "Premium" : c.orders.length === 1 ? "Baru" : "Reguler",
  }));

  const customers = allCustomers.filter((c) => {
    const matchSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.toLowerCase().includes(search.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase()));
    const matchTier = tierFilter === "all" || c.tier.toLowerCase() === tierFilter;
    return matchSearch && matchTier;
  });

  const handleExport = () => {
    if (customers.length === 0) return;
    const header = ["Nama", "No. WhatsApp", "Email", "Tier", "Jumlah Pesanan", "Pesanan Terakhir"];
    const rows = customers.map((c) => [
      c.name,
      c.phone,
      c.email || "-",
      c.tier,
      String(c.orders.length),
      new Date(c.lastOrder).toLocaleDateString("id-ID"),
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `pelanggan-jahitsini-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const tierColors: Record<string, string> = {
    Premium: "from-amber-400 via-yellow-500 to-orange-500",
    Reguler: "from-slate-400 via-slate-500 to-slate-600",
    Baru: "from-blue-400 via-cyan-500 to-sky-500",
  };

  return (
    <DashboardLayout
      type="admin"
      title="Kelola Pelanggan"
      subtitle="Lihat data pelanggan, riwayat pesanan, dan tier"
    >
      <Card className="mb-6">
        <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center flex-1">
            <div className="relative flex-1 sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama / nomor HP..."
                className="pl-10"
              />
            </div>
            <Select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="w-full sm:w-48"
            >
              <option value="all">Semua Tier</option>
              <option value="premium">Premium</option>
              <option value="reguler">Reguler</option>
              <option value="baru">Baru</option>
            </Select>
          </div>
          <Button variant="outline" onClick={handleExport} disabled={customers.length === 0}>
            <Users className="h-4 w-4" />
            Export Data
          </Button>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {[
          { title: "Total Pelanggan", value: allCustomers.length, sub: "Terdaftar di sistem", accent: "from-brand-green to-emerald-400" },
          { title: "Pelanggan Premium", value: allCustomers.filter((c) => c.tier === "Premium").length, sub: "3+ riwayat pesanan", accent: "from-amber-400 to-orange-500" },
          { title: "Pelanggan Baru", value: allCustomers.filter((c) => c.tier === "Baru").length, sub: "Baru 1x pesanan", accent: "from-brand-blue to-cyan-500" },
        ].map((s) => (
          <Card key={s.title}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`h-12 w-12 shrink-0 rounded-2xl bg-gradient-to-br ${s.accent} text-white flex items-center justify-center shadow-soft`}>
                <Users className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-brand-text tracking-tight">{s.value}</div>
                <div className="text-sm font-semibold text-slate-500">{s.title}</div>
                <div className="text-xs text-slate-400">{s.sub}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Daftar Pelanggan ({customers.length})</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-slate-400 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" /> Memuat data pelanggan...
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-10 text-sm text-slate-400">
              Tidak ada pelanggan yang cocok dengan pencarian.
            </div>
          ) : (
            customers.map((c) => (
              <div
                key={c.phone}
                className="flex items-center gap-4 p-4 rounded-2xl border border-brand-border hover:shadow-soft hover:border-brand-green/30 transition-all bg-white"
              >
                <div className="relative">
                  <div className={`h-12 w-12 shrink-0 rounded-full bg-gradient-to-br ${tierColors[c.tier]} ring-4 ring-white shadow-soft flex items-center justify-center text-white text-sm font-bold`}>
                    {c.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-brand-text">{c.name}</h3>
                    <Badge variant={c.tier === "Premium" ? "warning" : c.tier === "Baru" ? "blue" : "default"}>
                      {c.tier}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap text-xs text-slate-500 mt-0.5">
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      {c.phone}
                    </span>
                    {c.email && (
                      <span className="truncate max-w-[180px]">{c.email}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Pesanan terakhir: {new Date(c.lastOrder).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-5 shrink-0 text-right">
                  <div>
                    <div className="text-[11px] text-slate-500">Jumlah Pesanan</div>
                    <div className="font-bold text-brand-text">{c.orders.length}x</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button variant="ghost" size="sm" className="!h-8 !w-8 !p-0" asChild>
                    <Link href={`/admin/customers/${encodeURIComponent(c.phone)}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="!h-8 !px-2.5 text-xs" asChild>
                    <Link href={`/admin/customers/${encodeURIComponent(c.phone)}`}>
                      Detail
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}