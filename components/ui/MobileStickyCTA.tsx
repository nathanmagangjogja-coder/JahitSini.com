"use client";

import * as React from "react";
import Link from "next/link";
import { MessageCircle, Scissors } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { buildWhatsAppLink, getBusinessSettingsRemote, type BusinessSettings } from "@/lib/settings";

export default function MobileStickyCTA() {
  const [waLink, setWaLink] = React.useState<string | null>(null);

  React.useEffect(() => {
    getBusinessSettingsRemote().then((settings: BusinessSettings) => {
      const link = buildWhatsAppLink(
        settings,
        "Halo Jahitsini, saya ingin konsultasi kebutuhan jahit."
      );
      setWaLink(link);
    });
  }, []);

  return (
    <div className="md:hidden sticky bottom-0 left-0 right-0 z-40 backdrop-blur-md bg-white/80 border-t border-brand-border grid grid-cols-2 gap-2 px-3 py-2">
      <Button asChild size="lg" className="w-full">
        <Link href="/layanan">
          <Scissors className="h-4 w-4 shrink-0" />
          <span className="truncate">Lihat Layanan</span>
        </Link>
      </Button>
      <Button
        variant="outline"
        size="lg"
        className="w-full"
        asChild
      >
        {waLink ? (
          <a href={waLink} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-4 w-4 shrink-0" />
            <span className="truncate">Chat WhatsApp</span>
          </a>
        ) : (
          <Link href="/hubungi-kami">
            <MessageCircle className="h-4 w-4 shrink-0" />
            <span className="truncate">Hubungi Kami</span>
          </Link>
        )}
      </Button>
    </div>
  );
}
