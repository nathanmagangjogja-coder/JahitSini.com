import type { Metadata } from "next";
import { Scissors, Clock } from "lucide-react";
import { categories } from "@/lib/data";
import { getServicesRemote } from "@/lib/services";
import { Card, CardContent } from "@/components/ui/Card";
import { ServiceIcon } from "@/components/ui/ServiceIcon";
import { Badge } from "@/components/ui/Badge";
import { ServiceWhatsAppButton } from "@/components/shared/ServiceWhatsAppButton";

export const metadata: Metadata = {
  title: "Layanan - Jahitsini.com | Jasa Jahit, Permak & Reparasi Pakaian",
  description:
    "Lihat daftar lengkap layanan Jahitsini.com: permak, reparasi, ganti resleting, sampai pasang kancing. Pilih layanan, lihat detailnya, lalu buat pesanan.",
};

// Daftar layanan bisa diubah admin, jadi selalu ambil data terbaru (tidak di-cache saat build).
export const dynamic = "force-dynamic";

export default async function LayananPage() {
  const services = await getServicesRemote();
  return (
    <>
      <section className="relative border-b border-brand-border/60 bg-gradient-to-b from-brand-bg/80 via-white to-white">
        <div className="container-app pt-14 pb-16 sm:pt-16 sm:pb-20">
          <div className="max-w-3xl">
            <Badge variant="success" className="mb-4 px-3 py-1.5">
              <Scissors className="h-3.5 w-3.5" />
              Daftar Layanan Lengkap
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-brand-text">
              Pilih Layanan yang <span className="text-brand-green">Kamu Butuhkan</span>
            </h1>
            <p className="mt-4 text-lg text-slate-600 leading-relaxed max-w-2xl">
              {services.length} jenis layanan jahit dan permak profesional. Estimasi waktu pengerjaan jelas.
              Pilih layanan, lihat detailnya, lalu buat pesanan.
            </p>
          </div>
        </div>
      </section>

      <section className="container-app py-12 sm:py-16">
        <div className="space-y-12">
          <div className="space-y-12">
            {categories.map((cat) => {
              const catServices = services.filter((s) => s.category === cat.id);
              if (catServices.length === 0) return null;
              return (
                <div key={cat.id} id={cat.id} className="scroll-mt-24 space-y-5">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-text flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-green to-emerald-400 text-white shadow-soft">
                          <Scissors className="h-5 w-5" />
                        </span>
                        {cat.name}
                      </h2>
                      <p className="mt-2 text-sm sm:text-base text-slate-600 ml-14">
                        {cat.description}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {catServices.length} layanan
                    </Badge>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {catServices.map((s) => (
                      <Card key={s.id} className="group hover:shadow-card hover:border-brand-green/30 transition-all overflow-hidden">
                        <CardContent className="p-5 space-y-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="h-11 w-11 shrink-0 rounded-xl bg-gradient-to-br from-brand-bg to-green-50 text-brand-green flex items-center justify-center ring-1 ring-brand-border group-hover:from-brand-green group-hover:to-emerald-400 group-hover:text-white transition-all">
                              <ServiceIcon name={s.icon} className="h-5 w-5" />
                            </div>
                            <Badge variant="success" className="text-[11px] uppercase">
                              {s.category}
                            </Badge>
                          </div>
                          <div className="space-y-1.5">
                            <h3 className="font-bold text-brand-text text-lg">{s.name}</h3>
                            <p className="text-sm text-slate-600 leading-relaxed">
                              {s.description}
                            </p>
                          </div>
                          <div className="flex items-center justify-end pt-3 border-t border-brand-border/60">
                            <div className="text-xs text-slate-500 flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {s.duration}
                            </div>
                          </div>
                          <ServiceWhatsAppButton
                            service={{ name: s.name, categoryLabel: cat.name }}
                            variant="secondary"
                            className="w-full"
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>
    </>
  );
}