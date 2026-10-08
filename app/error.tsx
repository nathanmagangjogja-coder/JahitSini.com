"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-20 text-center">
      <p className="text-sm font-semibold text-red-600">Terjadi kesalahan</p>
      <h1 className="mt-2 text-3xl font-bold text-brand-text">Maaf, ada yang tidak beres</h1>
      <p className="mt-3 text-slate-600">
        Halaman gagal dimuat. Silakan coba lagi, atau hubungi kami lewat WhatsApp kalau masalah berlanjut.
      </p>
      <div className="mt-8">
        <Button onClick={() => reset()}>Coba Lagi</Button>
      </div>
    </main>
  );
}