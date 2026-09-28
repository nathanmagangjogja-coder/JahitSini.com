import type { Metadata } from "next";
import ContactClient from "./ContactClient";
import { getBusinessSettingsRemote } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Hubungi Kami - Jahitsini.com",
  description:
    "Hubungi Jahitsini.com untuk konsultasi, pemesanan, atau informasi lebih lanjut seputar jasa jahit dan permak.",
};

export default async function HubungiKamiPage() {
  const cfg = await getBusinessSettingsRemote();
  return (
    <ContactClient
      whatsapp={cfg.whatsapp}
      phone={cfg.phone}
      email={cfg.email}
      address={cfg.address}
    />
  );
}
