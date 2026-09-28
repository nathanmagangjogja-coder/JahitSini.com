import type { Metadata } from "next";
import "./globals.css";
import SiteChrome from "@/components/layout/SiteChrome";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MobileStickyCTA from "@/components/ui/MobileStickyCTA";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
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