"use client";

import * as React from "react";
import { MessageCircle, Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/Button";
import { getServiceInquiryWhatsAppLink } from "@/lib/whatsappOrder";
export function ServiceWhatsAppButton({
  service,
  children,
  ...buttonProps
}: {
  service: { name: string; categoryLabel?: string };
  children?: React.ReactNode;
} & Omit<ButtonProps, "onClick" | "asChild">) {
  const [loading, setLoading] = React.useState(false);

  const handleClick = async () => {
    setLoading(true);
    const link = await getServiceInquiryWhatsAppLink(service);
    setLoading(false);
    if (link) {
      window.open(link, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Button onClick={handleClick} disabled={loading} {...buttonProps}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
      {children ?? "Pesan Jasa"}
    </Button>
  );
}
