import type { Metadata } from "next";
import { getServiceByIdRemote } from "@/lib/services";
import { ServiceDetailClient } from "./ServiceDetailClient";
export const dynamic = "force-dynamic";

type Props = { params: { serviceId: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = await getServiceByIdRemote(params.serviceId);
  if (!service) {
    return { title: "Layanan tidak ditemukan - Jahitsini.com" };
  }
  return {
    title: `${service.name} - Jahitsini.com`,
    description: `${service.description} Estimasi pengerjaan ${service.duration}.`,
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const initialService = await getServiceByIdRemote(params.serviceId);
  return <ServiceDetailClient serviceId={params.serviceId} initialService={initialService} />;
}