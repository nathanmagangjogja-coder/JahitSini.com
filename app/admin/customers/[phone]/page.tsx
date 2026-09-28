"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft, Phone, Mail, Package, TrendingUp, Clock, Loader2, ArrowRight, ShieldCheck,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getOrdersByCustomerRemote, Order } from "@/lib/orders";
import { statusLabels, OrderStatus } from "@/lib/data";
import { formatRupiah } from "@/lib/utils";

export default function AdminCustomerDetailPage() {
  const params = useParams();
  const phone = decodeURIComponent(String(params.phone || ""));
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!phone) return;
    getOrdersByCustomerRemote(phone).then((data) => {
      setOrders(data);
      setLoading(false);
    });
  }, [phone]);

  const customerName = orders[0]?.customerName || "Pelanggan";
  const customerEmail = orders[0]?.customerEmail;
  const total = orders.reduce((s, o) => s + (o.priceFinal || o.priceEstimate || 0), 0);
  const tier = orders.length >= 3 ? "Premium" : orders.length === 1 ? "Baru" : "Reguler";
  const initials = customerName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <DashboardLayout
      type="admin"
      title="Detail Pelanggan"
      subtitle="Informasi lengkap dan riwayat pesanan pelanggan"
    >
      <Link
        href="/admin/customers"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-text mb-5"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke daftar pelanggan
      </Link>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-slate-400 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" /> Memuat data pelanggan...
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-slate-500">
            Tidak ditemukan pesanan untuk nomor ini.
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 h-fit">
            <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 ring-4 ring-white shadow-card flex items-center justify-center text-white text-xl font-bold">
                {initials}
              </div>
              <div>
                <h3 className="font-bold text-brand-text text-lg">{customerName}</h3>
                <Badge variant={tier === "Premium" ? "warning" : tier === "Baru" ? "blue" : "default"} className="mt-1.5">
                  {tier}
                </Badge>
              </div>
              <div className="w-full space-y-2.5 text-sm border-t border-brand-border pt-4">
                <div className="flex items-center gap-3 text-left">
                  <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                  <div className="font-medium text-brand-text">{phone}</div>
                </div>
                {customerEmail && (
                  <div className="flex items-center gap-3 text-left">
                    <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                    <div className="font-medium text-brand-text truncate">{customerEmail}</div>
                  </div>
                )}
              </div>
              <div className="w-full grid grid-cols-2 gap-3 pt-2">
                <div className="rounded-xl bg-brand-bg p-3">
                  <div className="text-lg font-extrabold text-brand-text">{orders.length}</div>
                  <div className="text-[11px] text-slate-500">Pesanan</div>
                </div>
                <div className="rounded-xl bg-brand-bg p-3">
                  <div className="text-sm font-extrabold text-brand-green">{formatRupiah(total)}</div>
                  <div className="text-[11px] text-slate-500">Total Belanja</div>
                </div>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <a
                  href={`https://wa.me/${phone.replace(/[^0-9]/g, "").replace(/^0/, "62")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Phone className="h-4 w-4" />
                  Hubungi via WhatsApp
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Riwayat Pesanan ({orders.length})</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {orders.map((o) => (
                <Link
                  key={o.id}
                  href={`/tracking?order=${o.orderNumber}`}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-brand-border hover:shadow-soft hover:border-brand-green/30 transition-all bg-white"
                >
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-brand-bg to-green-50 text-brand-green flex items-center justify-center ring-1 ring-brand-border">
                    <Package className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-brand-text text-sm">{o.orderNumber}</h4>
                      <Badge className={`${statusLabels[o.status as OrderStatus].color} border text-[10px]`}>
                        {statusLabels[o.status as OrderStatus].label}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {o.serviceName} · {new Date(o.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-brand-text text-sm">
                      {formatRupiah(o.priceFinal || o.priceEstimate || 0)}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300 shrink-0" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
