import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-20 text-center">
      <p className="text-sm font-semibold text-purple-600">Error 404</p>
      <h1 className="mt-2 text-3xl font-bold text-brand-text sm:text-4xl">Halaman tidak ditemukan</h1>
      <p className="mt-3 text-slate-600">
        Alamat yang kamu buka tidak ada atau sudah dipindahkan. Coba kembali ke beranda atau lihat daftar layanan kami.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/">
          <Button>Ke Beranda</Button>
        </Link>
        <Link href="/layanan">
          <Button variant="outline">Lihat Layanan</Button>
        </Link>
      </div>
    </main>
  );
}
