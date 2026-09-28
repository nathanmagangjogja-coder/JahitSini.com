"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, Scissors, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { buildWhatsAppLink, getBusinessSettingsRemote, type BusinessSettings } from "@/lib/settings";

const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "/layanan", label: "Layanan" },
  { href: "/cara-kerja", label: "Cara Kerja" },
  { href: "/hasil-jahitan", label: "Hasil Jahitan" },
  { href: "/faq", label: "FAQ" },
  { href: "/hubungi-kami", label: "Hubungi Kami" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [waLink, setWaLink] = useState<string | null>(null);

  useEffect(() => {
    getBusinessSettingsRemote().then((settings: BusinessSettings) => {
      setWaLink(buildWhatsAppLink(settings, "Halo Jahitsini, saya ingin konsultasi."));
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-brand-border/60 bg-white/80 backdrop-blur-md">
      <div className="container-app flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2" aria-label="Jahitsini.com - Beranda">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-green to-emerald-400 shadow-soft">
            <Scissors className="h-5 w-5 text-white" aria-hidden="true" />
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-lg font-bold tracking-tight text-brand-text">
              Jahitsini<span className="text-brand-green">.com</span>
            </span>
            <span className="text-[10px] font-medium text-slate-500 -mt-0.5">
              Jahit & Permak Profesional
            </span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1" aria-label="Navigasi utama">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "px-3.5 py-2 text-sm font-medium rounded-xl transition-colors",
                  active
                    ? "text-brand-green bg-brand-bg"
                    : "text-slate-600 hover:text-brand-text hover:bg-brand-bg"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          {waLink ? (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="!text-brand-green !border-brand-green/30 hover:!bg-brand-bg"
            >
              <a href={waLink} target="_blank" rel="noopener noreferrer" aria-label="Chat WhatsApp">
                <MessageCircle className="h-4 w-4" />
                <span className="sr-only lg:not-sr-only">WhatsApp</span>
              </a>
            </Button>
          ) : null}
          <Button variant="outline" size="sm" asChild>
            <Link href="/tracking">Lacak Pesanan</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/layanan">Pesan Jasa</Link>
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Tutup menu navigasi" : "Buka menu navigasi"}
          aria-expanded={open}
          aria-controls="mobile-menu-panel"
          className="lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-xl hover:bg-brand-bg text-brand-text"
        >
          {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </div>

      {open && (
        <div
          id="mobile-menu-panel"
          role="dialog"
          aria-modal="true"
          aria-label="Menu navigasi mobile"
          className="lg:hidden border-t border-brand-border bg-white"
        >
          <div className="container-app py-3 flex flex-col gap-1">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "px-3.5 py-3 text-sm font-medium rounded-xl",
                    active
                      ? "text-brand-green bg-brand-bg"
                      : "text-slate-600 hover:bg-brand-bg"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="flex flex-col gap-2 pt-3 mt-1 border-t border-brand-border">
              {waLink ? (
                <Button
                  variant="outline"
                  asChild
                  className="!text-brand-green !border-brand-green/30"
                >
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setOpen(false)}
                  >
                    <MessageCircle className="h-4 w-4" />
                    Chat WhatsApp
                  </a>
                </Button>
              ) : null}
              <Button variant="outline" asChild>
                <Link href="/tracking" onClick={() => setOpen(false)}>
                  Lacak Pesanan
                </Link>
              </Button>
              <Button asChild>
                <Link href="/layanan" onClick={() => setOpen(false)}>
                  Pesan Jasa
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
