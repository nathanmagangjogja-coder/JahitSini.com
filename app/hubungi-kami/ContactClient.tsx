"use client";

import * as React from "react";
import Link from "next/link";
import {
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  ArrowRight,
  Loader2,
  CheckCircle2,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { sanitizeName, sanitizePhone, isValidName, isValidPhone } from "@/lib/inputGuards";
import { sendContactMessage } from "@/lib/contact";
import { getContactWhatsAppLink } from "@/lib/whatsappOrder";
import { WorkshopMap } from "@/components/shared/WorkshopMap";

interface ContactClientProps {
  whatsapp: string;
  phone: string;
  email: string;
  address: string;
}

export default function ContactClient({
  whatsapp,
  phone,
  email,
  address,
}: ContactClientProps) {
  const showAvailable = !whatsapp && !phone && !email && !address;
  const { toast } = useToast();
  const [submitting, setSubmitting] = React.useState(false);
  const [waLink, setWaLink] = React.useState<string | null>(null);
  const [sentOpen, setSentOpen] = React.useState(false);
  const lastWarnRef = React.useRef<{ name: number; phone: number }>({ name: 0, phone: 0 });

  const warnOnce = (field: "name" | "phone", title: string, description: string) => {
    const now = Date.now();
    if (now - lastWarnRef.current[field] > 1200) {
      toast({ variant: "error", title, description });
      lastWarnRef.current[field] = now;
    }
  };
  const [form, setForm] = React.useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.subject.trim() || !form.message.trim()) {
      toast({
        variant: "error",
        title: "Formulir belum lengkap",
        description: "Nama, WhatsApp, subjek, dan pesan wajib diisi.",
      });
      return;
    }
    if (!isValidName(form.name)) {
      toast({ variant: "error", title: "Nama belum valid", description: "Nama minimal 3 huruf, tanpa angka atau simbol aneh." });
      return;
    }
    if (!isValidPhone(form.phone)) {
      toast({ variant: "error", title: "Nomor WhatsApp belum valid", description: "Isi 9-15 digit angka." });
      return;
    }
    setSubmitting(true);
    const contactInput = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || undefined,
      subject: form.subject.trim(),
      message: form.message.trim(),
    };

    // Tersimpan sebagai arsip di Admin > Pesan (opsional; kegagalan simpan tidak
    // menghalangi pelanggan mengirim pertanyaannya ke WhatsApp).
    await sendContactMessage(contactInput);
    const link = await getContactWhatsAppLink(contactInput);
    setSubmitting(false);

    if (link) {
      setWaLink(link);
      setSentOpen(true);
      setForm({ name: "", phone: "", email: "", subject: "", message: "" });
    } else {
      toast({
        variant: "error",
        title: "Nomor WhatsApp belum diatur",
        description: "Pertanyaanmu tersimpan, tim kami akan menghubungi lewat nomor WhatsApp yang kamu isi.",
      });
      setForm({ name: "", phone: "", email: "", subject: "", message: "" });
    }
  };

  return (
    <>
      <section className="relative border-b border-brand-border/60 bg-gradient-to-b from-brand-bg/80 via-white to-white">
        <div className="container-app pt-14 pb-16 sm:pt-16 sm:pb-20">
          <div className="max-w-3xl">
            <Badge variant="success" className="mb-4 px-3 py-1.5">
              <MessageCircle className="h-3.5 w-3.5" />
              Kontak Kami
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-brand-text">
              Hubungi <span className="text-brand-green">Kami Sekarang</span>
            </h1>
            <p className="mt-4 text-lg text-slate-600 leading-relaxed max-w-2xl">
              Konsultasikan kebutuhan jahitmu secara gratis. Kami siap membantu
              memilihkan layanan yang tepat dan memberikan estimasi biaya awal.
            </p>
          </div>
        </div>
      </section>

      <section className="container-app py-12 sm:py-16">
        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                {/* min-height + style aspectRatio sengaja dobel dengan class Tailwind di bawah:
                    jaga-jaga kalau class arbitrary "aspect-[4/3]" tidak ikut ter-build, kotak
                    peta tidak collapse jadi tinggi 0px (yang akan terlihat seperti "peta kosong"
                    padahal datanya sudah benar). */}
                <div className="aspect-[4/3] min-h-[280px]" style={{ aspectRatio: "4 / 3" }}>
                  <WorkshopMap />
                </div>
              </CardContent>
            </Card>

            <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-4">
              <Card>
                <CardContent className="p-5 flex items-start gap-3">
                  <div className="h-11 w-11 shrink-0 rounded-xl bg-green-50 text-brand-green flex items-center justify-center">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-brand-text">Telepon / WA</h3>
                    <p className="text-sm mt-1">
                      {showAvailable ? (
                        <span className="text-slate-500 italic">
                          Segera tersedia
                        </span>
                      ) : (
                        <span className="text-slate-700">{phone || whatsapp}</span>
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5 flex items-start gap-3">
                  <div className="h-11 w-11 shrink-0 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-brand-text">Email</h3>
                    <p className="text-sm mt-1">
                      {showAvailable ? (
                        <span className="text-slate-500 italic">
                          Segera tersedia
                        </span>
                      ) : (
                        <span className="text-slate-700">{email}</span>
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5 flex items-start gap-3">
                  <div className="h-11 w-11 shrink-0 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-brand-text">Jam Operasional</h3>
                    <ul className="text-sm text-slate-600 mt-1 space-y-0.5">
                      <li>Senin - Jumat: 08.00 - 17.00</li>
                      <li>Sabtu: 08.00 - 14.00</li>
                      <li>Minggu: Tutup</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5 flex items-start gap-3">
                  <div className="h-11 w-11 shrink-0 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-brand-text">Alamat Workshop</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      {showAvailable ? (
                        <span className="italic">Segera tersedia</span>
                      ) : (
                        <span>{address}</span>
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="lg:col-span-3">
            <Card className="h-full">
              <CardContent className="p-6 sm:p-8 space-y-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-text">
                    Kirim Pesan untuk Kami
                  </h2>
                  <p className="mt-2 text-slate-600">
                    Isi formulir di bawah untuk konsultasi atau tanya jawab. Tim
                    kami akan merespons secepatnya (maks. 1x24 jam kerja).
                  </p>
                </div>

                <form
                  className="space-y-4"
                  onSubmit={handleSubmit}
                >
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-brand-text">
                        Nama Lengkap
                      </label>
                      <Input
                        placeholder="Masukkan namamu..."
                        value={form.name}
                        onChange={(e) => {
                          const raw = e.target.value;
                          const clean = sanitizeName(raw);
                          if (clean !== raw) warnOnce("name", "Nama hanya boleh huruf", "Angka dan simbol otomatis dihapus.");
                          setForm((f) => ({ ...f, name: clean }));
                        }}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-brand-text">
                        Nomor WhatsApp
                      </label>
                      <Input
                        placeholder="Contoh: 081234567890"
                        type="tel"
                        inputMode="numeric"
                        value={form.phone}
                        onChange={(e) => {
                          const raw = e.target.value;
                          const clean = sanitizePhone(raw);
                          if (clean !== raw) warnOnce("phone", "Nomor WhatsApp hanya boleh angka", "Huruf dan simbol otomatis dihapus.");
                          setForm((f) => ({ ...f, phone: clean }));
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-brand-text">
                      Email (opsional)
                    </label>
                    <Input
                      placeholder="email@contoh.com"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-brand-text">
                      Subjek Pesan
                    </label>
                    <Input
                      placeholder="Contoh: Konsultasi permak jas pengantin..."
                      value={form.subject}
                      onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-brand-text">
                      Detail Pesan
                    </label>
                    <Textarea
                      placeholder="Jelaskan kebutuhan jahitmu: jenis pakaian, bagian yang diperbaiki, ukuran, dll..."
                      rows={6}
                      value={form.message}
                      onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                    <p className="text-xs text-slate-500 max-w-sm">
                      Dengan mengirim formulir ini, kamu setuju data digunakan
                      hanya untuk keperluan komunikasi terkait pesanan.
                    </p>
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full sm:w-auto"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      {submitting ? "Mengirim..." : "Kirim Pesan"}
                    </Button>
                  </div>
                </form>

                <div className="pt-6 mt-2 border-t border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-brand-text">
                      Butuh Respon Cepat?
                    </h4>
                    <p className="text-sm text-slate-600 mt-0.5">
                      Pesan langsung via WhatsApp untuk respon tercepat.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="lg"
                    asChild
                    disabled={showAvailable}
                  >
                    <Link
                      href={
                        showAvailable
                          ? "#"
                          : `https://wa.me/${whatsapp?.replace(/\D/g, "") || ""}`
                      }
                    >
                      <MessageCircle className="h-4 w-4" />
                      {showAvailable ? "WA Segera Tersedia" : "Chat via WhatsApp"}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {sentOpen && (
        <div className="fixed inset-0 z-[90] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-card w-full max-w-md max-h-[92vh] overflow-y-auto">
            <div className="p-5 pb-0 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="h-10 w-10 shrink-0 rounded-full bg-green-50 text-brand-green flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
                <div>
                  <div className="font-bold text-brand-text">Pertanyaan siap dikirim!</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Satu langkah lagi untuk sampai ke admin kami.
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSentOpen(false)}
                className="text-slate-400 hover:text-slate-600 shrink-0"
                aria-label="Tutup"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5">
              <p className="text-sm text-slate-600 mb-4">
                Klik tombol di bawah untuk mengirim pertanyaanmu ke WhatsApp kami. Tim kami akan
                merespons langsung dari sana.
              </p>
              {waLink && (
                <Button asChild size="lg" className="w-full">
                  <a href={waLink} target="_blank" rel="noopener noreferrer" onClick={() => setSentOpen(false)}>
                    <MessageCircle className="h-4 w-4" />
                    Kirim via WhatsApp
                  </a>
                </Button>
              )}
              <Button variant="outline" className="w-full mt-3" onClick={() => setSentOpen(false)}>
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}