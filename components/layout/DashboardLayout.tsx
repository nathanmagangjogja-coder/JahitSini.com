"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Package, Settings, User, LogOut, Scissors, ChevronRight, MessageSquare, Image as ImageIcon, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getAllOrdersRemote } from "@/lib/orders";
import { getBusinessSettingsRemote } from "@/lib/settings";

export interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const adminNavItems: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Pesanan", icon: Package },
  { href: "/admin/customers", label: "Pelanggan", icon: User },
  { href: "/admin/messages", label: "Pesan", icon: MessageSquare },
  { href: "/admin/services", label: "Layanan", icon: Scissors },
  { href: "/admin/media", label: "Foto Website", icon: ImageIcon },
  { href: "/admin/settings", label: "Pengaturan", icon: Settings },
  { href: "/admin/password", label: "Ganti Password", icon: KeyRound },
];

interface SidebarProps {
  type?: "admin";
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  /** Lebar konten maksimum. "narrow" dipakai untuk halaman form (mis. ganti password). */
  width?: "wide" | "narrow";
}

export function DashboardLayout({ title, subtitle, children, width = "wide" }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const items = adminNavItems;
  const homeHref = "/admin";
  const [activeOrderCount, setActiveOrderCount] = React.useState<number | null>(null);
  const [logoUrl, setLogoUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    getBusinessSettingsRemote().then((cfg) => setLogoUrl(cfg.logoUrl || null));
  }, []);

  React.useEffect(() => {
    async function loadCount() {
      const all = await getAllOrdersRemote();
      setActiveOrderCount(all.filter((o) => o.status !== "done").length);
    }
    loadCount();
  }, []);

  const profileName = "Admin Jahitsini";
  const profileInitials = "AJ";
  const profileGradient = "from-emerald-500 via-teal-500 to-cyan-500";
  const profileRole = "Administrator";

  const handleLogout = async () => {
    await fetch("/api/admin-logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-brand-bg/50">
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-brand-border lg:bg-white fixed inset-y-0 left-0 z-30">
        <div className="p-5 border-b border-brand-border">
          <Link href={homeHref} className="flex items-center gap-2.5">{logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="Jahitsini.com" className="h-9 w-auto max-w-[160px] object-contain" />
          ) : (
          <>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-green to-emerald-400 shadow-soft">
              <Scissors className="h-4 w-4 text-white" />
            </span>
            <div className="flex flex-col leading-tight">
              <span className="text-[15px] font-bold tracking-tight text-brand-text">
                Jahitsini<span className="text-brand-green">.com</span>
              </span>
              <span className="text-[10px] font-medium text-slate-500 -mt-0.5">
                Dashboard Admin
              </span>
            </div>
          </>
          )}</Link>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <div className="px-3 pt-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Menu
          </div>
          {items.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                active
                  ? "bg-gradient-to-r from-brand-green/10 to-brand-green/5 text-brand-green border border-brand-green/20 shadow-soft"
                  : "text-slate-600 hover:bg-brand-bg hover:text-brand-text"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", active ? "text-brand-green" : "text-slate-400 group-hover:text-brand-text")} />
              <span className="flex-1">{item.label}</span>
              {item.href === "/admin/orders" &&
                activeOrderCount !== null &&
                activeOrderCount > 0 && (
                  <Badge variant="outline" className="!text-[10px] !px-1.5 !py-0.5">
                    {activeOrderCount}
                  </Badge>
                )}
              {active && <ChevronRight className="h-3.5 w-3.5 text-brand-green" />}
            </Link>
          );
          })}
        </nav>
        <div className="p-3 border-t border-brand-border">
          <div className="rounded-xl bg-brand-bg p-3 flex items-center gap-3">
            <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${profileGradient} ring-4 ring-white shadow-soft flex items-center justify-center text-white text-sm font-bold shrink-0`}>
              {profileInitials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-brand-text truncate">{profileName}</div>
              <div className="text-xs text-slate-500 truncate">{profileRole}</div>
            </div>
            <button
              type="button"
              aria-label="logout"
              onClick={handleLogout}
              className="h-8 w-8 rounded-lg hover:bg-white text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="min-h-screen min-w-0 flex flex-col lg:pl-64">
        <header className="lg:hidden sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-brand-border px-4 h-14 flex items-center justify-between">
          <Link href={homeHref} className="flex items-center gap-2">{logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="Jahitsini.com" className="h-9 w-auto max-w-[160px] object-contain" />
          ) : (
          <>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-green to-emerald-400">
              <Scissors className="h-4 w-4 text-white" />
            </span>
            <span className="font-bold text-brand-text text-sm">
              Jahitsini<span className="text-brand-green">.com</span>
            </span>
          </>
          )}</Link>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-3.5 w-3.5" />
            Keluar
          </Button>
        </header>

        <div className="lg:hidden border-b border-brand-border bg-white overflow-x-auto">
          <div className="flex p-2 gap-1 min-w-max mx-auto w-max">
            {items.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap",
                  active
                    ? "bg-brand-bg text-brand-green"
                    : "text-slate-600 hover:bg-brand-bg"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
          </div>
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className={cn("mx-auto w-full", width === "narrow" ? "max-w-xl" : "max-w-7xl")}>
            <div className="mb-6 text-left">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-text">
                {title}
              </h1>
              {subtitle && <p className="mt-1 text-sm text-slate-500 max-w-2xl">{subtitle}</p>}
            </div>
            {children}
          </div>
        </main>

        <footer className="border-t border-brand-border bg-white px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-7xl mx-auto flex flex-col items-center justify-center gap-3 text-center text-xs text-slate-500">
            <p>© {new Date().getFullYear()} Jahitsini.com · Dashboard Admin</p>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
              <Link href="/" target="_blank" className="hover:text-brand-green">
                Lihat Website
              </Link>
              <Link href="/admin/media" className="hover:text-brand-green">
                Foto Website
              </Link>
              <Link href="/admin/password" className="hover:text-brand-green">
                Ganti Password
              </Link>
              <button type="button" onClick={handleLogout} className="hover:text-red-500">
                Keluar
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}