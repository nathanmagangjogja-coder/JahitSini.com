import type { Metadata } from "next";
import Link from "next/link";
import {
  PackageCheck,
  Sparkles,
  CheckCircle2,
  Send,
  Search,
  FileText,
  ThumbsUp,
  Pen,
  Award,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Cara Kerja - Jahitsini.com",
  description:
    "Pelajari alur pemesanan jasa jahit dan permak di Jahitsini.com, dari kirim pakaian sampai pakaian siap pakai kembali.",
};

const steps = [
  {
    icon: Send,
    step: "01",
    title: "Pilih Layanan & Kirim Detail",
    desc: "Pilih jenis layanan di halaman Layanan, gunakan kalkulator estimasi biaya, isi detail, dan kirim foto pakaianmu.",
  },
  {
    icon: PackageCheck,
    step: "02",
    title: "Kirim Pakaian ke Workshop",
    desc: "Kirim pakaian via kurir (GoSend, GrabExpress, JNE, dll.) atau datang langsung drop-off ke workshop Jahitsini.",
  },
  {
    icon: Search,
    step: "03",
    title: "Pemeriksaan Detail",
    desc: "Tim kami memeriksa kondisi pakaian, tingkat kesulitan, dan mengonfirmasi detail sesuai permintaanmu.",
  },
  {
    icon: FileText,
    step: "04",
    title: "Estimasi & Persetujuan",
    desc: "Kamu dapat estimasi harga final dan waktu pengerjaan. Jika setuju, proses dilanjutkan; jika tidak, pakaian bisa dikembalikan.",
  },
  {
    icon: Pen,
    step: "05",
    title: "Proses Jahit oleh Ahli",
    desc: "Penjahit profesional mengerjakan pakaianmu dengan standar tinggi. Kamu bisa pantau progress lewat halaman Lacak Pesanan.",
  },
  {
    icon: Award,
    step: "06",
    title: "Quality Control",
    desc: "Setelah selesai, pakaian melewati QC ketat: kerapian jahitan, kecocokan ukuran, dan kebersihan pakaian.",
  },
  {
    icon: ThumbsUp,
    step: "07",
    title: "Pakaian Siap Diambil",
    desc: "Pakaian siap! Bisa diambil langsung di workshop atau dikirim kembali via kurir ke alamatmu.",
  },
];

export default function CaraKerjaPage() {
  return (
    <>
      <section className="relative border-b border-brand-border/60 bg-gradient-to-b from-brand-bg/80 via-white to-white">
        <div className="container-app pt-14 pb-16 sm:pt-16 sm:pb-20">
          <div className="max-w-3xl">
            <Badge variant="blue" className="mb-4 px-3 py-1.5">
              Alur Pemesanan
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-brand-text">
              Cara Kerja <span className="text-brand-green">Jahitsini.com</span>
            </h1>
            <p className="mt-4 text-lg text-slate-600 leading-relaxed max-w-2xl">
              Proses yang transparan dan mudah diikuti. 7 langkah sederhana dari
              pemesanan sampai pakaianmu kembali dalam kondisi terbaik.
            </p>
          </div>
        </div>
      </section>

      <section className="container-app py-12 sm:py-16">
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-4">
            {steps.map((s, i) => (
              <div
                key={s.step}
                className="relative rounded-2xl border border-brand-border bg-white p-5 sm:p-6 shadow-soft hover:shadow-card hover:border-brand-green/30 transition-all"
              >
                <div className="flex items-start gap-5">
                  <div className="relative shrink-0">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-brand-green to-emerald-400 text-white flex items-center justify-center shadow-soft">
                      <s.icon className="h-6 w-6" />
                    </div>
                    <div className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-white border-2 border-brand-green text-brand-green flex items-center justify-center text-xs font-bold shadow-soft">
                      {i + 1}
                    </div>
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className="font-bold text-brand-text text-lg sm:text-xl">{s.title}</h3>
                    <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-24">
            <Card className="border-brand-green/20 bg-gradient-to-br from-brand-bg via-white to-green-50">
              <CardContent className="p-6 sm:p-7 space-y-5">
                <div className="flex items-start gap-3">
                  <div className="h-11 w-11 shrink-0 rounded-xl bg-brand-green text-white flex items-center justify-center shadow-soft">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-text text-lg">Garansi Hasil Rapi</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Jika hasil tidak sesuai dengan kesepakatan, kami reparasi ulang tanpa biaya tambahan.
                    </p>
                  </div>
                </div>
                <ul className="space-y-3 text-sm">
                  {[
                    "Penjahit berpengalaman 5+ tahun",
                    "Harga transparan tanpa biaya tersembunyi",
                    "Update status pesanan real-time",
                    "Konsultasi gratis sebelum pesanan",
                    "Pengerjaan cepat rata-rata 1-3 hari",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-slate-700">
                      <CheckCircle2 className="h-4 w-4 text-brand-green mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col gap-2 pt-2">
                  <Button size="lg" className="w-full" asChild>
                    <Link href="/layanan">
                      Mulai Pesan Jasa
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="w-full" asChild>
                    <Link href="/faq">Lihat FAQ</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-soft">
              <h4 className="font-bold text-brand-text mb-2">Perlu Bantuan?</h4>
              <p className="text-sm text-slate-600 leading-relaxed mb-3">
                Tim kami siap membantu konsultasi kebutuhan jahitmu secara gratis sebelum memesan.
              </p>
              <Button variant="ghost" className="text-brand-green !p-0 h-auto" asChild>
                <Link href="/hubungi-kami">
                  Hubungi Kami Sekarang
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
