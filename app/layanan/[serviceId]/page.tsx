import type { Metadata } from "next";
import { getServiceByIdRemote } from "@/lib/services";
import { formatRupiah } from "@/lib/utils";
import { ServiceDetailClient } from "./ServiceDetailClient";

// Harga/durasi bisa diubah admin kapan saja, jadi jangan di-cache saat build.
export const dynamic = "force-dynamic";

type Props = { params: { serviceId: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = await getServiceByIdRemote(params.serviceId);
  if (!service) {
    return { title: "Layanan tidak ditemukan - Jahitsini.com" };
  }
  return {
    title: `${service.name} - Jahitsini.com`,
    description: `${service.description} Mulai dari ${formatRupiah(service.priceStart)}, estimasi ${service.duration}.`,
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  // Dirender di server (bagus untuk SEO): database dulu, fallback ke data statis.
  // Kalau tetap tidak ketemu, client component akan mencoba sekali lagi di browser.
  const initialService = await getServiceByIdRemote(params.serviceId);
  return <ServiceDetailClient serviceId={params.serviceId} initialService={initialService} />;
}