import Link from "next/link";

import { Button } from "@/components/ui/Button";

import { Scissors, Sparkles, CheckCircle2, TrendingUp, Users, PackageCheck, ArrowRight, Clock, ShieldCheck, BadgeCheck } from "lucide-react";

import { services, categories } from "@/lib/data";
import { getSiteImages, pickSiteImage } from "@/lib/siteImages";
import { SiteImage } from "@/components/ui/SiteImage";
import { Card, CardContent } from "@/components/ui/Card";
import { ServiceIcon } from "@/components/ui/ServiceIcon";
import { Badge } from "@/components/ui/Badge";

/* -------------------------------------------------------------------------- */
/*  Data statis                                                               */
/* -------------------------------------------------------------------------- */

const stats = [
  { icon: PackageCheck, label: "Pesanan Ditangani", value: "1.000+", accent: "from-brand-green to-emerald-400" },
  { icon: Users, label: "Penjahit Berpengalaman", value: "15+", accent: "from-brand-blue to-cyan-500" },
  { icon: Scissors, label: "Jenis Layanan", value: "13+", accent: "from-purple-500 to-fuchsia-400" },
];

const steps = [
  {
    icon: PackageCheck,
    title: "Kirim Pakaian",
    desc: "Pilih layanan, kirim detail, dan kirim pakaian ke workshop kami.",
  },
  {
    icon: Sparkles,
    title: "Proses Jahit",
    desc: "Penjahit ahli mengerjakan pakaianmu dengan standar kualitas tinggi.",
  },
  {
    icon: CheckCircle2,
    title: "Pakaian Siap",
    desc: "Setelah QC, pakaian siap diambil atau dikirim kembali ke alamatmu.",
  },
];

/**
 * `key` = awalan slot gambar di tabel Supabase `site_media` (lihat lib/siteImageSlots.ts).
 * Slot gambar: `${key}_before` dan `${key}_after`
 * → home_work_1_before, home_work_1_after, dst.
 */
const works = [
  {
    key: "home_work_1",
    title: "Permak Jas Custom",
    category: "Permak Jas",
    description: "Jas dipermak presisi, lengan dan badan disesuaikan, hasil rapi seperti baru.",
  },
  {
    key: "home_work_2",
    title: "Perbaikan Jaket Kulit",
    category: "Reparasi",
    description: "Sobekan di bagian saku ditambal dengan teknik tersembunyi, tidak terlihat bekas.",
  },
  {
    key: "home_work_3",
    title: "Ganti Resleting Jaket",
    category: "Resleting",
    description: "Resleting lama rusak diganti dengan resleting berkualitas tinggi, lancar dipakai.",
  },
  {
    key: "home_work_4",
    title: "Permak Celana Jeans",
    category: "Permak Celana",
    description: "Potong panjang celana dengan jahitan rantai asli, hasil natural.",
  },
];

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

// Foto bisa diganti admin kapan saja, jadi jangan di-cache saat build.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const images = await getSiteImages();
  const img = (key: string) => pickSiteImage(images, key);

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-[55%] h-[55%] bg-gradient-to-br from-emerald-100/80 via-green-50/50 to-transparent rounded-full blur-3xl opacity-80" />
          <div className="absolute bottom-0 left-0 w-[45%] h-[45%] bg-gradient-to-tr from-blue-100/60 via-cyan-50/40 to-transparent rounded-full blur-3xl opacity-70" />
        </div>
        <div className="container-app pt-14 pb-20 lg:pt-20 lg:pb-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-7">
              <Badge variant="success" className="w-fit px-3 py-1.5 text-xs">
                <Sparkles className="h-3.5 w-3.5" />
                Jasa Jahit & Permak Terpercaya
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-brand-text leading-[1.05] text-balance">
                Jahit & Permak Profesional,{" "}
                <span className="bg-gradient-to-r from-brand-green via-emerald-500 to-brand-green-dark bg-clip-text text-transparent">
                  Beres Tanpa Ribet.
                </span>
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
                Perbaiki pakaian, permak ukuran, ganti resleting, dan berbagai
                kebutuhan jahit lainnya dengan mudah. Ditangani penjahit ahli,
                hasil rapi, cepat selesai.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button size="lg" asChild>
                  <Link href="/layanan">
                    Pesan Jasa Jahit
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/layanan">Lihat Layanan</Link>
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-brand-border/70">
                {stats.map((s) => (
                  <div key={s.label} className="space-y-1.5">
                    <div className={`text-2xl sm:text-3xl font-extrabold bg-gradient-to-r ${s.accent} bg-clip-text text-transparent`}>
                      {s.value}
                    </div>
                    <div className="text-xs sm:text-sm text-slate-500 leading-snug">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Kolase hero: home_workshop_1 .. home_workshop_4 */}
            <div className="relative">
              <div className="relative grid grid-cols-5 grid-rows-6 gap-3 max-w-xl mx-auto lg:mx-0">
                <div className="col-span-3 row-span-4 rounded-2xl overflow-hidden shadow-card ring-1 ring-brand-border bg-white">
                  <SiteImage src={img("home_workshop_1")} alt="Penjahit profesional" />
                </div>
                <div className="col-span-2 row-span-3 rounded-2xl overflow-hidden shadow-card ring-1 ring-brand-border bg-white">
                  <SiteImage src={img("home_workshop_2")} alt="Mengukur pakaian" />
                </div>
                <div className="col-span-2 row-span-3 rounded-2xl overflow-hidden shadow-card ring-1 ring-brand-border bg-white">
                  <SiteImage src={img("home_workshop_3")} alt="Ganti resleting" />
                </div>
                <div className="col-span-3 row-span-2 rounded-2xl overflow-hidden shadow-card ring-1 ring-brand-border bg-white relative">
                  <SiteImage src={img("home_workshop_4")} alt="Workshop jahit" />
                  <div className="absolute left-4 bottom-4 bg-white/95 backdrop-blur rounded-xl p-3 shadow-soft border border-brand-border flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100 text-brand-green">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-brand-text">Pesanan Selesai</div>
                      <div className="text-[11px] text-slate-500">Standar kualitas premium</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="hidden sm:flex absolute -left-4 top-1/3 bg-white rounded-2xl shadow-card ring-1 ring-brand-border p-3 items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-500">Estimasi selesai</div>
                  <div className="text-sm font-bold text-brand-text">1-3 Hari Kerja</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-16 bg-brand-bg/60 border-y border-brand-border/50">
        <div className="container-app">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {[
              { icon: ShieldCheck, title: "Kualitas Terjamin", desc: "Setiap jahitan melewati QC ketat." },
              { icon: BadgeCheck, title: "Detail Jelas", desc: "Pesan WA untuk info layanan & jadwal." },
              { icon: Clock, title: "Pengerjaan Cepat", desc: "Rata-rata selesai dalam 1-3 hari." },
              { icon: Users, title: "Penjahit Ahli", desc: "Ditangani tim berpengalaman 5+ tahun." },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-brand-border shadow-soft">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-brand-green to-emerald-400 text-white flex items-center justify-center shadow-soft">
                  <f.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-brand-text">{f.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container-app">
          <div className="max-w-2xl mb-10 sm:mb-12">
            <Badge variant="blue" className="mb-3 px-3 py-1.5">
              Layanan Kami
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-text">
              Semua Kebutuhan Jahit, <span className="text-brand-green">Dalam Satu Tempat</span>
            </h2>
            <p className="mt-3 text-slate-600 leading-relaxed">
              Dari permak ukuran, perbaikan sobekan, hingga ganti resleting. Kami
              menangani berbagai jenis pakaian dengan hasil yang rapi dan tahan lama.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/layanan#${c.id}`}
                className="group rounded-2xl border border-brand-border bg-white p-5 shadow-soft hover:shadow-card hover:border-brand-green/40 transition-all"
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div className="h-10 w-10 rounded-xl bg-brand-bg text-brand-green flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-brand-green group-hover:to-emerald-400 group-hover:text-white transition-all">
                    <Scissors className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-brand-green group-hover:translate-x-0.5 transition-all" />
                </div>
                <h3 className="font-bold text-brand-text mb-1">{c.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{c.description}</p>
              </Link>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.slice(0, 6).map((s) => (
              <Card key={s.id} className="group hover:shadow-card hover:border-brand-green/30 transition-all overflow-hidden">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="h-11 w-11 shrink-0 rounded-xl bg-gradient-to-br from-brand-bg to-green-50 text-brand-green flex items-center justify-center ring-1 ring-brand-border group-hover:from-brand-green group-hover:to-emerald-400 group-hover:text-white transition-all">
                      <ServiceIcon name={s.icon} className="h-5 w-5" />
                    </div>
                    <Badge variant="outline" className="uppercase">
                      {s.category}
                    </Badge>
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-brand-text">{s.name}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed min-h-[3rem]">
                      {s.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-end pt-3 border-t border-brand-border/60">
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {s.duration}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Button variant="outline" size="lg" asChild>
              <Link href="/layanan">
                Lihat Semua Layanan
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-brand-bg/60">
        <div className="container-app">
          <div className="max-w-2xl mb-10 sm:mb-14 text-center mx-auto">
            <Badge variant="success" className="mb-3 px-3 py-1.5">
              Cara Kerja
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-text">
              3 Langkah Mudah, <span className="text-brand-green">Pakaian Beres</span>
            </h2>
            <p className="mt-3 text-slate-600">
              Proses simpel, tanpa ribet. Cukup kirim, kami kerjakan, dan pakaian siap pakai kembali.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className="relative rounded-2xl border border-brand-border bg-white p-6 sm:p-7 shadow-soft"
              >
                <div className="absolute -top-4 left-6 h-9 w-9 rounded-xl bg-gradient-to-br from-brand-green to-emerald-400 text-white flex items-center justify-center font-bold shadow-card text-sm">
                  {i + 1}
                </div>
                <div className="h-12 w-12 rounded-xl bg-brand-bg text-brand-green flex items-center justify-center mt-2 mb-4">
                  <step.icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-brand-text text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden md:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10 h-6 w-6 rounded-full bg-white border border-brand-border text-brand-green items-center justify-center shadow-soft">
                    <ArrowRight className="h-3 w-3" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hasil kerja: home_work_N_before / home_work_N_after */}
      <section className="py-16 sm:py-20">
        <div className="container-app">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10 sm:mb-12">
            <div className="max-w-xl">
              <Badge variant="warning" className="mb-3 px-3 py-1.5">
                Hasil Jahitan
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-text">
                Hasil Kerja <span className="text-brand-green">Kami Sebelumnya</span>
              </h2>
              <p className="mt-3 text-slate-600">
                Lihat sendiri transformasi pakaian yang sudah kami tangani untuk ratusan pelanggan.
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/hasil-jahitan">
                Lihat Semua Portofolio
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 gap-5 lg:gap-6">
            {works.map((w) => (
              <div key={w.key} className="rounded-2xl border border-brand-border bg-white overflow-hidden shadow-soft hover:shadow-card transition-all">
                <div className="grid grid-cols-2">
                  <div className="relative aspect-square overflow-hidden border-r border-brand-border/70">
                    <SiteImage src={img(`${w.key}_before`)} alt={`${w.title} - sebelum`} />
                    <div className="absolute top-3 left-3 bg-slate-900/70 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                      SEBELUM
                    </div>
                  </div>
                  <div className="relative aspect-square overflow-hidden">
                    <SiteImage src={img(`${w.key}_after`)} alt={`${w.title} - sesudah`} />
                    <div className="absolute top-3 left-3 bg-brand-green text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-soft">
                      SESUDAH
                    </div>
                  </div>
                </div>
                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h3 className="font-bold text-brand-text">{w.title}</h3>
                    <Badge variant="outline">{w.category}</Badge>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{w.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA: home_testimonial_1 */}
      <section className="py-16 sm:py-20">
        <div className="container-app">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-green via-emerald-500 to-brand-green-dark p-8 sm:p-12 lg:p-14 text-white shadow-card">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 20%, white 0, transparent 40%), radial-gradient(circle at 80% 80%, white 0, transparent 40%)",
              }}
            />
            <div className="relative grid lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <Badge className="!bg-white/20 !text-white !border-white/30">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Promo Awal Tahun
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  Pakaian favoritmu rusak? <br className="hidden sm:block" />
                  Jangan dibuang, <span className="underline decoration-white/40 underline-offset-4">perbaiki saja!</span>
                </h2>
                <p className="text-white/90 max-w-lg leading-relaxed">
                  Konsultasikan kebutuhan jahitmu sekarang. Chat WhatsApp langsung untuk
                  info detail dan pengerjaan oleh penjahit profesional berpengalaman.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Button
                    size="lg"
                    className="bg-white text-brand-green hover:bg-white/90 !shadow-lg"
                    asChild
                  >
                    <Link href="/layanan">
                      Pesan Sekarang
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-transparent text-white border-white/40 hover:bg-white/10 !shadow-none"
                    asChild
                  >
                    <Link href="/hubungi-kami">Hubungi Kami</Link>
                  </Button>
                </div>
              </div>
              <div className="relative hidden lg:block">
                <div className="aspect-square max-w-sm ml-auto rounded-2xl overflow-hidden ring-4 ring-white/20 shadow-card">
                  <SiteImage src={img("home_testimonial_1")} alt="Pelanggan puas" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}