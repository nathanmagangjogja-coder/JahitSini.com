import type { Metadata } from "next";
import Link from "next/link";
import { GalleryHorizontalEnd, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getSiteImages, pickSiteImage } from "@/lib/siteImages";
import { SiteImage } from "@/components/ui/SiteImage";

export const metadata: Metadata = {
  title: "Hasil Jahitan - Portofolio Jahitsini.com",
  description:
    "Lihat portofolio hasil jahitan, permak, dan reparasi Jahitsini.com untuk berbagai jenis pakaian.",
};

/**
 * `key` = awalan slot gambar di tabel Supabase `site_media` (lihat lib/siteImageSlots.ts).
 * Foto diambil dari `${key}_before` dan `${key}_after`
 * → gallery_1_before, gallery_1_after, dst.
 */
const portfolio = [
  {
    key: "gallery_1",
    title: "Permak Jas Pengantin",
    category: "Permak Jas",
    description:
      "Jas pengantin dipermak presisi di bagian lengan, pinggang, dan panjang celana. Hasil seperti jahitan custom.",
  },
  {
    key: "gallery_2",
    title: "Permak Kemeja Kantor",
    category: "Permak Baju",
    description:
      "Kecilkan badan dan lengan kemeja pria, hasil pas di badan dan nyaman untuk aktivitas kantor.",
  },
  {
    key: "gallery_3",
    title: "Tambal Jaket Kulit",
    category: "Reparasi",
    description:
      "Tambal bagian saku jaket kulit yang sobek dengan teknik jahitan tersembunyi.",
  },
  {
    key: "gallery_4",
    title: "Ganti Resleting Tas",
    category: "Resleting",
    description:
      "Ganti resleting laptop bag rusak dengan resleting YKK berkualitas tinggi.",
  },
  {
    key: "gallery_5",
    title: "Potong Celana Chino",
    category: "Permak Celana",
    description:
      "Potong panjang celana chino dan pasang kembali jahitan rantai asli agar natural.",
  },
  {
    key: "gallery_6",
    title: "Perbaikan Seragam",
    category: "Reparasi Seragam",
    description:
      "Perbaiki jahitan seragam karyawan yang lepas dan ganti kancing yang hilang.",
  },
  {
    key: "gallery_7",
    title: "Jahit Sobekan Kain Batik",
    category: "Reparasi",
    description:
      "Jahit sobekan halus pada batik dengan benang yang serasi warna, hasil nyaris tak terlihat.",
  },
  {
    key: "gallery_8",
    title: "Besarkan Gaun Pesta",
    category: "Permak Baju",
    description:
      "Besarkan bagian pinggang gaun pesta dengan sisipan kain serasi tanpa merusak desain.",
  },
];

// Foto bisa diganti admin kapan saja, jadi jangan di-cache saat build.
export const dynamic = "force-dynamic";

export default async function HasilJahitanPage() {
  const images = await getSiteImages();
  const img = (key: string) => pickSiteImage(images, key);
  return (
    <>
      <section className="relative border-b border-brand-border/60 bg-gradient-to-b from-brand-bg/80 via-white to-white">
        <div className="container-app pt-14 pb-16 sm:pt-16 sm:pb-20">
          <div className="max-w-3xl">
            <Badge variant="warning" className="mb-4 px-3 py-1.5">
              <GalleryHorizontalEnd className="h-3.5 w-3.5" />
              Galeri Portofolio
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-brand-text">
              Hasil Jahitan <span className="text-brand-green">Sebelum & Sesudah</span>
            </h1>
            <p className="mt-4 text-lg text-slate-600 leading-relaxed max-w-2xl">
              Kumpulan transformasi pakaian yang sudah kami tangani. Buktikan
              sendiri kualitas jahitan rapi dan presisi dari Jahitsini.com.
            </p>
          </div>
        </div>
      </section>

      <section className="container-app py-12 sm:py-16">
        <div className="grid sm:grid-cols-2 gap-6">
          {portfolio.map((p) => (
            <div
              key={p.key}
              className="group rounded-2xl border border-brand-border bg-white overflow-hidden shadow-soft hover:shadow-card hover:border-brand-green/30 transition-all"
            >
              <div className="grid grid-cols-2">
                <div className="relative aspect-square overflow-hidden border-r border-brand-border/70 bg-slate-100">
                  <SiteImage src={img(`${p.key}_before`)} alt={`${p.title} - sebelum`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3 bg-slate-900/75 backdrop-blur text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                    SEBELUM
                  </div>
                </div>
                <div className="relative aspect-square overflow-hidden bg-slate-100">
                  <SiteImage src={img(`${p.key}_after`)} alt={`${p.title} - sesudah`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3 bg-brand-green text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-soft">
                    SESUDAH
                  </div>
                </div>
              </div>
              <div className="p-5 sm:p-6 space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h3 className="font-bold text-brand-text text-lg">{p.title}</h3>
                  <Badge variant="success">{p.category}</Badge>
                </div>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  {p.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 rounded-3xl bg-gradient-to-br from-brand-bg via-white to-green-50 border border-brand-green/20 p-8 sm:p-10 text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-text">
            Pakaianmu Butuh Perhatian Khusus?
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Konsultasikan kondisi pakaianmu secara gratis. Tim ahli kami siap memberikan
            saran terbaik untuk perbaikan atau permak pakaian favoritmu.
          </p>
          <div className="flex flex-wrap gap-3 justify-center pt-2">
            <Button size="lg" asChild>
              <Link href="/layanan">
                Pesan Jasa Sekarang
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/hubungi-kami">Konsultasi Gratis</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}