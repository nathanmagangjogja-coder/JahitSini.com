"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, PackageSearch, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { getOrderByNumberRemote, Order } from "@/lib/orders";
import { statusLabels, OrderStatus } from "@/lib/data";
import { OrderTimeline } from "@/components/ui/OrderTimeline";
import { formatRupiah } from "@/lib/utils";
import { OrderChat } from "@/components/tracking/OrderChat";

export default function TrackingClient() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = React.useState("");
  const [found, setFound] = React.useState<Order | null>(null);
  const [notFound, setNotFound] = React.useState(false);
  const [searching, setSearching] = React.useState(false);

  const runSearch = React.useCallback(async (value: string) => {
    setSearching(true);
    setNotFound(false);
    setFound(null);
    const order = await getOrderByNumberRemote(value.trim());
    if (order) {
      setFound(order);
    } else {
      setNotFound(true);
    }
    setSearching(false);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await runSearch(orderNumber);
  };

  // Dukung tautan langsung: /tracking?order=JS-20260914-001
  React.useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("order");
    if (q) {
      setOrderNumber(q);
      runSearch(q);
    }
  }, [runSearch]);

  return (
    <>
      <section className="relative border-b border-brand-border/60 bg-gradient-to-b from-brand-bg/80 via-white to-white">
        <div className="container-app pt-14 pb-14 sm:pt-16">
          <div className="max-w-3xl">
            <Badge variant="blue" className="mb-4 px-3 py-1.5">
              <PackageSearch className="h-3.5 w-3.5" />
              Tracking Pesanan
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-brand-text">
              Lacak Status <span className="text-brand-green">Pesananmu</span>
            </h1>
            <p className="mt-4 text-lg text-slate-600 leading-relaxed max-w-2xl">
              Masukkan nomor pesanan untuk melihat status, estimasi selesai, dan detail pengerjaan secara real-time.
            </p>
          </div>
          <div className="mt-8 max-w-2xl">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="Masukkan nomor pesanan, contoh: JS-20260914-001"
                  className="pl-11 h-12 text-base shadow-soft"
                />
              </div>
              <Button type="submit" size="lg" disabled={searching || !orderNumber.trim()}>
                {searching ? "Mencari..." : "Lacak Pesanan"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
            <p className="text-xs text-slate-500 mt-3">
              Contoh nomor pesanan untuk demo:{" "}
              <code className="px-1.5 py-0.5 bg-brand-bg rounded text-brand-green font-medium">
                JS-20260914-001
              </code>{" "}
              atau{" "}
              <code className="px-1.5 py-0.5 bg-brand-bg rounded text-brand-green font-medium">
                JS-20260913-234
              </code>
            </p>
          </div>
        </div>
      </section>

      <section className="container-app py-12 sm:py-16">
        {notFound && (
          <Card className="mb-8 border-yellow-200 bg-yellow-50/50">
            <CardContent className="p-6 flex items-start gap-4">
              <div className="h-11 w-11 shrink-0 rounded-xl bg-yellow-100 text-yellow-600 flex items-center justify-center">
                <PackageSearch className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-brand-text">Pesanan tidak ditemukan</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Periksa kembali nomor pesananmu. Pastikan format sesuai dengan format: JS-YYYYMMDD-XXX
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {found && (
          <div className="space-y-8">
            <div className="grid lg:grid-cols-5 gap-6">
              <Card className="lg:col-span-3">
                <CardContent className="p-6 sm:p-7 space-y-6">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-xl font-extrabold tracking-tight text-brand-text">
                          {found.orderNumber}
                        </h2>
                        <Badge className={`${statusLabels[found.status as OrderStatus].color} border`}>
                          {statusLabels[found.status as OrderStatus].label}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">
                        Dipesan pada{" "}
                        {new Date(found.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-brand-bg/60 p-5 border border-brand-border space-y-2">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-slate-500 text-xs">Layanan</div>
                        <div className="font-semibold text-brand-text">{found.serviceName}</div>
                      </div>
                      <div>
                        <div className="text-slate-500 text-xs">Kategori</div>
                        <div className="font-semibold text-brand-text">{found.categoryLabel}</div>
                      </div>
                      <div>
                        <div className="text-slate-500 text-xs">Jumlah</div>
                        <div className="font-semibold text-brand-text">{found.quantity} pcs</div>
                      </div>
                      <div>
                        <div className="text-slate-500 text-xs">Tingkat Kesulitan</div>
                        <div className="font-semibold capitalize text-brand-text">
                          {found.difficulty}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-slate-500 text-xs">Estimasi Biaya</div>
                        <div className="font-bold text-brand-green text-lg">
                          {formatRupiah(found.priceFinal || found.priceEstimate || 0)}
                        </div>
                      </div>
                    </div>
                  </div>
                  {found.notes && (
                    <div>
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                        Catatan Pelanggan
                      </div>
                      <p className="text-sm text-slate-700 bg-white p-3 rounded-xl border border-brand-border">
                        {found.notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardContent className="p-6 sm:p-7">
                  <h3 className="font-bold text-brand-text mb-4">Status Timeline</h3>
                  <OrderTimeline currentStatus={found.status as OrderStatus} size="sm" />
                </CardContent>
              </Card>
            </div>

            {found.photos.length > 0 && (
              <Card>
                <CardContent className="p-6 sm:p-7">
                  <h3 className="font-bold text-brand-text mb-4">Foto Pakaian</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {found.photos.map((photo) => (
                      <div
                        key={photo.id}
                        className="rounded-2xl overflow-hidden border border-brand-border bg-white"
                      >
                        <div className="aspect-square bg-slate-100">
                          <img
                            src={photo.url}
                            alt={photo.label}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-2.5">
                          <p className="text-xs font-medium text-brand-text">{photo.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <OrderChat key={found.orderNumber} orderNumber={found.orderNumber} />
          </div>
        )}

        {!found && !notFound && (
          <div className="max-w-3xl mx-auto text-center py-12 sm:py-16">
            <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-green to-emerald-400 text-white flex items-center justify-center shadow-soft mb-5">
              <Search className="h-9 w-9" />
            </div>
            <h3 className="text-xl font-bold text-brand-text">Masukkan Nomor Pesanan</h3>
            <p className="text-slate-600 mt-2 max-w-md mx-auto">
              Nomor pesanan ada di pesan konfirmasi WhatsApp yang kamu kirim ke kami.
            </p>
            <div className="mt-8 grid sm:grid-cols-2 gap-4 max-w-xl mx-auto text-left">
              <Card>
                <CardContent className="p-5">
                  <div className="text-xs text-slate-500">Status Baru Diterima</div>
                  <div className="mt-1 font-bold text-brand-text">7 Status</div>
                  <p className="text-xs text-slate-600 mt-1">
                    Pantau dari diterima sampai selesai.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <div className="text-xs text-slate-500">Update Real-time</div>
                  <div className="mt-1 font-bold text-brand-text">Selalu Terbaru</div>
                  <p className="text-xs text-slate-600 mt-1">
                    Progress diperbarui otomatis setiap perubahan.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </section>
    </>
  );
}