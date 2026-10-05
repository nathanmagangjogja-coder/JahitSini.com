"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Lightbulb,
  ShieldCheck,
  SearchX,
} from "lucide-react";
import { categories, services as staticServices } from "@/lib/data";
import { getServiceByIdRemote, getServicesRemote, type ServiceFull } from "@/lib/services";
import { withDetails } from "@/lib/serviceDetails";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Accordion, AccordionItem } from "@/components/ui/Accordion";
import { ServiceIcon } from "@/components/ui/ServiceIcon";
import { ServiceWhatsAppButton } from "@/components/shared/ServiceWhatsAppButton";

interface Props {
  serviceId: string;
  initialService: ServiceFull | null;
}

function SectionTitle({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2.5 text-2xl font-extrabold tracking-tight text-brand-text">
      {icon}
      {children}
    </h2>
  );
}

export function ServiceDetailClient({ serviceId, initialService }: Props) {
  const [service, setService] = React.useState<ServiceFull | null>(initialService);
  const [loading, setLoading] = React.useState(initialService === null);
  const [related, setRelated] = React.useState<ServiceFull[]>(() =>
    staticServices.map((s) => withDetails(s))
  );

  // Server tidak menemukan layanan -> coba ambil dari database di browser.
  React.useEffect(() => {
    if (initialService) return;
    let active = true;
    getServiceByIdRemote(serviceId).then((s) => {
      if (!active) return;
      setService(s);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [serviceId, initialService]);

  // Daftar layanan lain (termasuk buatan admin) untuk bagian "Layanan terkait".
  React.useEffect(() => {
    let active = true;
    getServicesRemote().then((list) => {
      if (active) setRelated(list);
    });
    return () => {
      active = false;
    };
  }, []);


  if (loading) {
    return (
      <div className="container-app py-12 space-y-6">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-24 w-full max-w-2xl" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="container-app py-20 text-center max-w-lg">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-bg text-slate-400">
          <SearchX className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-extrabold text-brand-text">Layanan tidak ditemukan</h1>
        <p className="mt-2 text-slate-600">
          Layanan yang kamu cari mungkin sudah tidak tersedia atau alamatnya salah.
        </p>
        <Button className="mt-6" asChild>
          <Link href="/layanan">Lihat Semua Layanan</Link>
        </Button>
      </div>
    );
  }

  const category = categories.find((c) => c.id === service.category);
  const paragraphs = service.longDescription.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const others = related
    .filter((s) => s.category === service.category && s.id !== service.id)
    .slice(0, 3);

  return (
    <>
      <section className="border-b border-brand-border/60 bg-gradient-to-b from-brand-bg/80 via-white to-white">
        <div className="container-app pt-10 pb-12 sm:pt-12 sm:pb-16">
          <Link
            href="/layanan"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-green transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Semua Layanan
          </Link>

          <div className="mt-6 flex flex-col sm:flex-row sm:items-start gap-5">
            <div className="h-16 w-16 shrink-0 rounded-2xl bg-gradient-to-br from-brand-green to-emerald-400 text-white shadow-soft flex items-center justify-center">
              <ServiceIcon name={service.icon} className="h-8 w-8" />
            </div>
            <div className="max-w-3xl">
              <Badge variant="success" className="mb-3 uppercase text-[11px]">
                {category?.name ?? service.category}
              </Badge>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-text">
                {service.name}
              </h1>
              <p className="mt-3 text-lg text-slate-600 leading-relaxed">{service.description}</p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock className="h-3.5 w-3.5" /> Estimasi pengerjaan
                </div>
                <div className="mt-1 text-xl font-extrabold text-brand-text">{service.duration}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <ShieldCheck className="h-3.5 w-3.5" /> Garansi
                </div>
                <div className="mt-1 text-sm font-semibold text-brand-text">
                  Reparasi ulang gratis bila hasil tidak sesuai
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="container-app py-12 sm:py-16">
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-12">
            {paragraphs.length > 0 && (
              <div className="space-y-4">
                <SectionTitle>Tentang layanan ini</SectionTitle>
                <div className="space-y-3 text-slate-600 leading-relaxed">
                  {paragraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>
            )}

            {service.includes.length > 0 && (
              <div className="space-y-4">
                <SectionTitle>Yang termasuk dalam layanan</SectionTitle>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {service.includes.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 rounded-2xl border border-brand-border bg-white p-4 shadow-soft"
                    >
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-green" />
                      <span className="text-sm text-brand-text leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {service.steps.length > 0 && (
              <div className="space-y-4">
                <SectionTitle>Tahapan pengerjaan</SectionTitle>
                <ol className="space-y-4">
                  {service.steps.map((step, i) => (
                    <li key={i} className="flex gap-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-green text-sm font-bold text-white">
                        {i + 1}
                      </div>
                      <div className="flex-1 rounded-2xl border border-brand-border bg-white p-4 shadow-soft">
                        <div className="font-bold text-brand-text">{step.title}</div>
                        {step.description && (
                          <p className="mt-1 text-sm text-slate-600 leading-relaxed">{step.description}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {service.tips.length > 0 && (
              <div className="rounded-2xl border border-yellow-200 bg-yellow-50/60 p-6">
                <SectionTitle icon={<Lightbulb className="h-6 w-6 text-yellow-600" />}>
                  Tips sebelum mengirim pakaian
                </SectionTitle>
                <ul className="mt-4 space-y-2.5">
                  {service.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 leading-relaxed">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-500" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {service.faqs.length > 0 && (
              <div className="space-y-4">
                <SectionTitle>Pertanyaan umum</SectionTitle>
                <Accordion>
                  {service.faqs.map((f, i) => (
                    <AccordionItem key={i} title={f.question} defaultOpen={i === 0}>
                      {f.answer}
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}

            {others.length > 0 && (
              <div className="space-y-4">
                <SectionTitle>Layanan terkait</SectionTitle>
                <div className="grid sm:grid-cols-3 gap-4">
                  {others.map((s) => (
                    <Card key={s.id} className="h-full">
                      <CardContent className="p-4 space-y-3">
                        <div>
                          <div className="font-bold text-brand-text">{s.name}</div>
                          <div className="text-sm text-slate-500">Estimasi {s.duration}</div>
                        </div>
                        <ServiceWhatsAppButton
                          service={{ name: s.name, categoryLabel: category?.name }}
                          size="sm"
                          variant="secondary"
                          className="w-full"
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:sticky lg:top-24">
            <Card className="overflow-hidden border-brand-green/20">
              <CardContent className="p-6 sm:p-7 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-green to-emerald-400 shadow-soft text-white shrink-0">
                    <ServiceIcon name={service.icon} className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-text text-lg">{service.name}</h3>
                    <p className="text-sm text-slate-500 mt-0.5">Estimasi {service.duration}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Chat langsung dengan admin di WhatsApp untuk konfirmasi detail dan jadwal
                  pengerjaan layanan ini.
                </p>
                <ServiceWhatsAppButton
                  service={{ name: service.name, categoryLabel: category?.name }}
                  size="lg"
                  className="w-full"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}