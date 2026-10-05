import Link from "next/link";
import { Scissors, MapPin, Phone, Mail, Instagram, Facebook, MessageCircle } from "lucide-react";
import { getBusinessSettingsRemote, buildWhatsAppLink } from "@/lib/settings";

export default async function Footer() {
  const cfg = await getBusinessSettingsRemote();
  const logoUrl = cfg.logoUrl || null;
  const waLink = buildWhatsAppLink(cfg, "Halo Jahitsini, saya ingin bertanya tentang layanan.");
  const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL || "";
  const facebookUrl = process.env.NEXT_PUBLIC_FACEBOOK_URL || "";
  const socialCls =
    "flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-brand-border text-slate-500 hover:text-brand-green hover:border-brand-green/40 transition-colors";
  const showAvailable = !cfg.whatsapp && !cfg.phone && !cfg.email && !cfg.address;

  return (
    <footer className="border-t border-brand-border bg-brand-bg/50 mt-20">
      <div className="container-app py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">{logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="Jahitsini.com" className="h-10 w-auto max-w-[180px] object-contain" />
          ) : (
          <>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-green to-emerald-400 shadow-soft">
                <Scissors className="h-5 w-5 text-white" />
              </span>
              <div className="flex flex-col leading-tight">
                <span className="text-lg font-bold tracking-tight text-brand-text">
                  Jahitsini<span className="text-brand-green">.com</span>
                </span>
              </div>
            </>
          )}</Link>
            <p className="text-sm text-slate-600 leading-relaxed max-w-xs">
              Tempat memperbaiki, mempermakan, dan menjahit ulang pakaian dengan
              mudah, cepat, dan hasil rapi profesional.
            </p>
            <div className="flex items-center gap-2 pt-2">
              {waLink && (
                <a href={waLink} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className={socialCls}>
                  <MessageCircle className="h-4 w-4" />
                </a>
              )}
              {instagramUrl && (
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={socialCls}>
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {facebookUrl && (
                <a href={facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className={socialCls}>
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              <Link href="/hubungi-kami" aria-label="Hubungi Kami" className={socialCls}>
                <Mail className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-brand-text mb-4">Navigasi</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                ["Beranda", "/"],
                ["Layanan", "/layanan"],
                ["Cara Kerja", "/cara-kerja"],
                ["Hasil Jahitan", "/hasil-jahitan"],
                ["FAQ", "/faq"],
                ["Hubungi Kami", "/hubungi-kami"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-slate-600 hover:text-brand-green transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-brand-text mb-4">Layanan Kami</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                "Permak Pakaian",
                "Reparasi Pakaian",
                "Ganti Resleting",
                "Pasang Kancing",
                "Perbaikan Jas",
                "Perbaikan Jaket",
              ].map((item) => (
                <li key={item}>
                  <Link href="/layanan" className="text-slate-600 hover:text-brand-green transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-brand-text mb-4">Kontak</h4>
            {showAvailable ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MessageCircle className="h-4 w-4 text-brand-green mt-1 shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-brand-text">WhatsApp</div>
                    <div className="text-sm text-slate-500 italic">Segera tersedia</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-brand-green mt-1 shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-brand-text">Telepon</div>
                    <div className="text-sm text-slate-500 italic">Segera tersedia</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-brand-green mt-1 shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-brand-text">Email</div>
                    <div className="text-sm text-slate-500 italic">Segera tersedia</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-brand-green mt-1 shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-brand-text">Alamat</div>
                    <div className="text-sm text-slate-500 italic">Segera tersedia</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                {(cfg.whatsapp || waLink) && (
                  <a
                    href={waLink || "#"}
                    target={waLink ? "_blank" : undefined}
                    rel={waLink ? "noopener noreferrer" : undefined}
                    className="flex items-start gap-3 text-slate-600 hover:text-brand-green transition-colors group"
                  >
                    <MessageCircle className="h-4 w-4 text-brand-green mt-1 shrink-0" />
                    <div className="min-w-0">
                      <div className="font-medium text-brand-text group-hover:text-brand-green">
                        WhatsApp
                      </div>
                      <span className="break-all">
                        {cfg.whatsapp || cfg.phone || "Chat via WhatsApp"}
                      </span>
                    </div>
                  </a>
                )}
                {cfg.phone && (
                  <a
                    href={`tel:${cfg.phone.replace(/\s|-/g, "")}`}
                    className="flex items-start gap-3 text-slate-600 hover:text-brand-green transition-colors"
                  >
                    <Phone className="h-4 w-4 text-brand-green mt-1 shrink-0" />
                    <span className="break-all">{cfg.phone}</span>
                  </a>
                )}
                {cfg.email && (
                  <a
                    href={`mailto:${cfg.email}`}
                    className="flex items-start gap-3 text-slate-600 hover:text-brand-green transition-colors"
                  >
                    <Mail className="h-4 w-4 text-brand-green mt-1 shrink-0" />
                    <span className="break-all">{cfg.email}</span>
                  </a>
                )}
                {cfg.address && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cfg.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 text-slate-600 hover:text-brand-green transition-colors"
                  >
                    <MapPin className="h-4 w-4 text-brand-green mt-1 shrink-0" />
                    <span className="break-all">{cfg.address}</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-brand-border flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Jahitsini.com. All rights reserved.
          </p>
          <div className="flex items-center gap-5 text-xs text-slate-500">
            <Link href="/faq" className="hover:text-brand-green">
              Kebijakan Privasi
            </Link>
            <Link href="/faq" className="hover:text-brand-green">
              Syarat & Ketentuan
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}