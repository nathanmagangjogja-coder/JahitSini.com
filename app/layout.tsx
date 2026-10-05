import type { Metadata } from "next";
import "./globals.css";
import SiteChrome from "@/components/layout/SiteChrome";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MobileStickyCTA from "@/components/ui/MobileStickyCTA";
import { ToastProvider } from "@/components/ui/Toast";
import { getBusinessSettingsRemote } from "@/lib/settings";

const baseMetadata: Metadata = {
  title: "Jahitsini.com - Jasa Jahit, Permak & Reparasi Pakaian",
  description:
    "Jasa jahit, permak, alteration, dan reparasi pakaian secara profesional. Perbaiki pakaian, permak ukuran, ganti resleting dengan mudah dan cepat.",
  keywords: [
    "jahit pakaian",
    "permak pakaian",
    "reparasi pakaian",
    "alteration",
    "ganti resleting",
    "pasang kancing",
    "perbaikan jas",
    "perbaikan jaket",
    "jahit sobekan",
    "jahitsini",
  ],
  authors: [{ name: "Jahitsini.com" }],
  openGraph: {
    title: "Jahitsini.com - Jasa Jahit, Permak & Reparasi Pakaian",
    description:
      "Jasa jahit, permak, alteration, dan reparasi pakaian secara profesional.",
    type: "website",
    locale: "id_ID",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jahitsini.com - Jasa Jahit, Permak & Reparasi Pakaian",
    description:
      "Jasa jahit, permak, alteration, dan reparasi pakaian secara profesional.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

/** Metadata dasar + favicon dari database (kalau admin sudah upload). */
export async function generateMetadata(): Promise<Metadata> {
  try {
    const cfg = await getBusinessSettingsRemote();
    if (cfg.faviconUrl) {
      return { ...baseMetadata, icons: { icon: cfg.faviconUrl, shortcut: cfg.faviconUrl, apple: cfg.faviconUrl } };
    }
  } catch {
    // pakai favicon bawaan
  }
  return baseMetadata;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-white text-brand-text antialiased">
        <ToastProvider>
          <SiteChrome
            navbar={<Navbar />}
            footer={<Footer />}
            cta={<MobileStickyCTA />}
          >
            {children}
          </SiteChrome>
        </ToastProvider>
      </body>
    </html>
  );
}