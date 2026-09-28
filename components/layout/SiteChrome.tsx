"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
export default function SiteChrome({
  navbar,
  footer,
  cta,
  children,
}: {
  navbar: React.ReactNode;
  footer: React.ReactNode;
  cta: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname === "/admin" || pathname?.startsWith("/admin/");

  if (isAdmin) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      {navbar}
      <main className="flex-1">
        {children}
        {cta}
      </main>
      {footer}
    </div>
  );
}