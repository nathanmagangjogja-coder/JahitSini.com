import type { Metadata } from "next";
import Link from "next/link";
import { HelpCircle, Search, ArrowRight, Scissors } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Accordion, AccordionItem } from "@/components/ui/Accordion";
import { Input } from "@/components/ui/Input";
import { faqItems } from "@/lib/data";

export const metadata: Metadata = {
  title: "FAQ - Pertanyaan Umum | Jahitsini.com",
  description:
    "Jawaban atas pertanyaan umum seputar jasa jahit, permak, reparasi, dan pengiriman di Jahitsini.com.",
};

export default function FAQPage() {
  const uniqueCategories = Array.from(new Set(faqItems.map((f) => f.category)));

  const categoryMap: Record<string, string> = {
    permak: "Permak Pakaian",
    reparasi: "Reparasi & Jahit",
    resleting: "Ganti Resleting",
    jas: "Perbaikan Jas",
    pengiriman: "Pengiriman & Pickup",
  };

  return (
    <>
      <section className="relative border-b border-brand-border/60 bg-gradient-to-b from-brand-bg/80 via-white to-white">
        <div className="container-app pt-14 pb-16 sm:pt-16 sm:pb-20">
          <div className="max-w-3xl">
            <Badge variant="blue" className="mb-4 px-3 py-1.5">
              <HelpCircle className="h-3.5 w-3.5" />
              Pusat Bantuan
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-brand-text">
              Pertanyaan <span className="text-brand-green">Yang Sering Diajukan</span>
            </h1>
            <p className="mt-4 text-lg text-slate-600 leading-relaxed max-w-2xl">
              Temukan jawaban untuk pertanyaan seputar layanan, waktu
              pengerjaan, dan kebijakan Jahitsini.com.
            </p>
          </div>
          <div className="mt-8 max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                className="pl-11 h-12 text-base shadow-soft"
                placeholder="Cari pertanyaanmu, misal: permak jas..."
              />
            </div>
          </div>
        </div>
      </section>

      <section className="container-app py-12 sm:py-16">
        <div className="grid lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <div className="rounded-2xl border border-brand-border bg-white p-4 shadow-soft lg:sticky lg:top-24">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 pb-2">
                Kategori FAQ
              </div>
              <ul className="space-y-1">
                <li>
                  <a
                    href="#all"
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium bg-brand-bg text-brand-green"
                  >
                    <Scissors className="h-4 w-4" />
                    Semua Pertanyaan
                    <Badge variant="outline" className="ml-auto !text-[10px] !py-0">
                      {faqItems.length}
                    </Badge>
                  </a>
                </li>
                {uniqueCategories.map((c) => {
                  const count = faqItems.filter((f) => f.category === c).length;
                  return (
                    <li key={c}>
                      <a
                        href={`#${c}`}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-brand-bg hover:text-brand-green transition-colors"
                      >
                        {categoryMap[c] || c}
                        <span className="ml-auto text-[10px] text-slate-400 font-medium">{count}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>

          <div className="lg:col-span-3 space-y-8" id="all">
            {uniqueCategories.map((cat) => {
              const items = faqItems.filter((f) => f.category === cat);
              return (
                <div key={cat} id={cat} className="scroll-mt-24 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-1.5 rounded-full bg-brand-green" />
                    <h2 className="text-xl font-bold text-brand-text">
                      {categoryMap[cat] || cat}
                    </h2>
                  </div>
                  <Accordion>
                    {items.map((f, i) => (
                      <AccordionItem key={i} title={f.question} defaultOpen={i === 0 && cat === "permak"}>
                        {f.answer}
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              );
            })}

            <div className="mt-10 rounded-3xl border border-brand-green/20 bg-gradient-to-br from-brand-bg via-white to-green-50 p-7 sm:p-9 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div>
                <h3 className="text-xl font-bold text-brand-text">
                  Jawaban tidak ditemukan?
                </h3>
                <p className="text-slate-600 mt-1">
                  Tim support kami siap membantu menjawab pertanyaanmu secara langsung.
                </p>
              </div>
              <Button size="lg" asChild>
                <Link href="/hubungi-kami">
                  Hubungi Kami
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