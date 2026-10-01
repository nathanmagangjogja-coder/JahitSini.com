import type { Metadata } from "next";
import ContactClient from "./ContactClient";
import { getBusinessSettingsRemote } from "@/lib/settings";

// Halaman ini membaca pengaturan bisnis (termasuk lokasi peta) dari Supabase.
// Tanpa ini, Next.js bisa meng-cache hasil render halaman (termasuk data lama)
// sampai deploy berikutnya, jadi perubahan dari Admin > Pengaturan tidak langsung
// terlihat di sini walau sudah tersimpan ke database.
export const dynamic = "force-dynamic";

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