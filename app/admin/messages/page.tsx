"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Clock, Loader2, Mail, MessageCircle, Search } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import {
  ContactMessage,
  getAllContactMessagesAdmin,
  markContactMessageReadAdmin,
} from "@/lib/contact";
import { useToast } from "@/components/ui/Toast";

export default function AdminMessagesPage() {
  const { toast } = useToast();
  const [messages, setMessages] = React.useState<ContactMessage[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [markingId, setMarkingId] = React.useState<string | null>(null);

  const loadMessages = React.useCallback(async () => {
    const data = await getAllContactMessagesAdmin();
    setMessages(data);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    loadMessages();
    // Pesan baru dari formulir Hubungi Kami muncul otomatis tanpa refresh manual.
    const id = setInterval(() => {
      if (document.visibilityState === "visible") loadMessages();
    }, 15000);
    return () => clearInterval(id);
  }, [loadMessages]);

  const filtered = messages.filter((message) => {
    const term = search.toLowerCase();
    return (
      !term ||
      message.name.toLowerCase().includes(term) ||
      message.phone.toLowerCase().includes(term) ||
      message.subject.toLowerCase().includes(term) ||
      message.message.toLowerCase().includes(term)
    );
  });

  const unreadCount = messages.filter((message) => !message.isRead).length;

  const handleMarkRead = async (messageId: string) => {
    setMarkingId(messageId);
    const ok = await markContactMessageReadAdmin(messageId);
    setMarkingId(null);
    if (ok) {
      setMessages((prev) =>
        prev.map((message) =>
          message.id === messageId ? { ...message, isRead: true } : message
        )
      );
      toast({ variant: "success", title: "Pesan ditandai dibaca" });
    } else {
      toast({ variant: "error", title: "Gagal memperbarui pesan" });
    }
  };

  return (
    <DashboardLayout
      type="admin"
      title="Pesan Masuk"
      subtitle="Kelola pesan dari formulir Hubungi Kami"
    >
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Pesan", value: messages.length, tone: "from-brand-green to-emerald-400" },
          { label: "Belum Dibaca", value: unreadCount, tone: "from-amber-400 to-orange-500" },
          { label: "Sudah Dibaca", value: messages.length - unreadCount, tone: "from-brand-blue to-cyan-500" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${stat.tone} text-white flex items-center justify-center shadow-soft`}>
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-brand-text">{stat.value}</div>
                <div className="text-sm text-slate-500 font-semibold">{stat.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-6">
        <CardContent className="p-4 sm:p-5">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, nomor, subjek, atau isi pesan..."
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Daftar Pesan ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Memuat pesan...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              Belum ada pesan yang cocok.
            </div>
          ) : (
            filtered.map((message) => (
              <div
                key={message.id}
                className="rounded-2xl border border-brand-border bg-white p-4 sm:p-5 hover:border-brand-green/30 hover:shadow-soft transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-brand-text">{message.subject}</h3>
                      <Badge variant={message.isRead ? "default" : "success"}>
                        {message.isRead ? "Dibaca" : "Baru"}
                      </Badge>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span className="font-semibold text-brand-text">{message.name}</span>
                      <span>{message.phone}</span>
                      {message.email && <span>{message.email}</span>}
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(message.createdAt).toLocaleString("id-ID", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-slate-700 leading-relaxed">
                      {message.message}
                    </p>
                  </div>
                  <div className="flex flex-wrap lg:flex-col gap-2 lg:items-stretch">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`https://wa.me/${message.phone.replace(/\D/g, "")}`} target="_blank">
                        <MessageCircle className="h-3.5 w-3.5" />
                        WhatsApp
                      </Link>
                    </Button>
                    {message.email && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`mailto:${message.email}`}>
                          <Mail className="h-3.5 w-3.5" />
                          Email
                        </Link>
                      </Button>
                    )}
                    {!message.isRead && (
                      <Button
                        size="sm"
                        onClick={() => handleMarkRead(message.id)}
                        disabled={markingId === message.id}
                      >
                        {markingId === message.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Check className="h-3.5 w-3.5" />
                        )}
                        Tandai
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}