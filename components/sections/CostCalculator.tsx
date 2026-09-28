"use client";

import * as React from "react";
import { Calculator, Upload, Sparkles, Loader2, CheckCircle2, X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { services as staticServices, difficultyMultiplier, categories, type Service } from "@/lib/data";
import { formatRupiah, generateOrderNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { createOrderRemote, uploadOrderPhoto } from "@/lib/orders";
import { getOrderWhatsAppLink } from "@/lib/whatsappOrder";
import { useSanitizedInput, sanitizeName, sanitizePhone, isValidName, isValidPhone } from "@/lib/inputGuards";

interface CostCalculatorProps {
  services?: Service[];
  initialServiceId?: string;
  lockService?: boolean;
}

export function CostCalculator({
  services: servicesProp,
  initialServiceId = "",
  lockService = false,
}: CostCalculatorProps = {}) {
  const services = servicesProp && servicesProp.length > 0 ? servicesProp : staticServices;
  const { toast } = useToast();
  const [category, setCategory] = React.useState("");
  const [serviceId, setServiceId] = React.useState(initialServiceId);
  const [difficulty, setDifficulty] = React.useState("mudah");
  const [quantity, setQuantity] = React.useState(1);
  const [notes, setNotes] = React.useState("");
  const [fileName, setFileName] = React.useState("");
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [estimated, setEstimated] = React.useState<number | null>(null);
  const [customerName, handleCustomerNameChange] = useSanitizedInput(
    "",
    sanitizeName,
    toast,
    "Nama hanya boleh huruf",
    "Angka dan simbol otomatis dihapus. Titik, spasi, dan strip masih boleh."
  );
  const [customerPhone, handleCustomerPhoneChange] = useSanitizedInput(
    "",
    sanitizePhone,
    toast,
    "Nomor WhatsApp hanya boleh angka",
    "Huruf dan simbol otomatis dihapus."
  );
  const [successOrder, setSuccessOrder] = React.useState<string | null>(null);
  const [waLink, setWaLink] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const filteredServices = category
    ? services.filter((s) => s.category === category)
    : services;

  const selectedService = services.find((s) => s.id === serviceId);

  React.useEffect(() => {
    setServiceId(initialServiceId);
  }, [initialServiceId]);

  React.useEffect(() => {
    if (selectedService && quantity > 0) {
      const mult = difficultyMultiplier[difficulty]?.multiplier ?? 1;
      const base = selectedService.priceStart * quantity * mult;
      setEstimated(Math.round(base / 1000) * 1000);
    } else {
      setEstimated(null);
    }
  }, [selectedService, quantity, difficulty]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    if (!customerName.trim() || !customerPhone.trim()) {
      toast({
        variant: "error",
        title: "Data belum lengkap",
        description: "Isi nama dan nomor WhatsApp kamu dulu ya.",
      });
      return;
    }
    if (!isValidName(customerName)) {
      toast({
        variant: "error",
        title: "Nama belum valid",
        description: "Nama minimal 3 huruf, tanpa angka atau simbol aneh.",
      });
      return;
    }
    if (!isValidPhone(customerPhone)) {
      toast({
        variant: "error",
        title: "Nomor WhatsApp belum valid",
        description: "Isi nomor 9-15 digit, contoh: 081234567890.",
      });
      return;
    }

    setSubmitting(true);
    const orderNumber = generateOrderNumber();
    const categoryLabel =
      categories.find((c) => c.id === selectedService.category)?.name || selectedService.category;

    let photoUrl: string | null = null;
    if (selectedFile) {
      photoUrl = await uploadOrderPhoto(selectedFile, orderNumber);
    }

    // Simpan pesanan (opsional; kalau database belum tersambung, tetap lanjut ke WhatsApp).
    const created = await createOrderRemote({
      orderNumber,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      category: selectedService.category,
      categoryLabel,
      quantity,
      difficulty: difficulty as "mudah" | "sedang" | "sulit",
      notes: notes.trim() || undefined,
      priceEstimate: estimated ?? undefined,
      photos: photoUrl
        ? [{ id: `photo_${Date.now()}`, url: photoUrl, label: selectedFile?.name || "Foto pakaian" }]
        : undefined,
    });

    const link = await getOrderWhatsAppLink({
      orderNumber,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      serviceName: selectedService.name,
      categoryLabel,
      quantity,
      difficultyLabel: difficultyMultiplier[difficulty]?.label ?? difficulty,
      estimate: estimated,
      notes: notes.trim() || undefined,
      photoUrl: created?.photos?.[0]?.url ?? photoUrl,
    });

    setSubmitting(false);
    setWaLink(link);
    setSuccessOrder(orderNumber);
    toast({
      variant: "success",
      title: "Pesanan siap dikirim!",
      description: "Lanjutkan dengan kirim pesanan lewat WhatsApp.",
    });
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-brand-border bg-white shadow-card p-5 sm:p-7 space-y-5"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-green to-emerald-400 shadow-soft text-white shrink-0">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-brand-text text-lg">Kalkulator Estimasi Biaya</h3>
            <p className="text-sm text-slate-500 mt-0.5">
              Hitung perkiraan biaya sebelum kirim pesanan
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {!lockService && (
            <>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-brand-text">Kategori Layanan</label>
                <Select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setServiceId("");
                  }}
                >
                  <option value="">Semua Kategori</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-brand-text">Jenis Layanan</label>
                <Select value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
                  <option value="">Pilih layanan...</option>
                  {filteredServices.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Select>
              </div>
            </>
          )}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-brand-text">Tingkat Kesulitan</label>
            <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              {Object.entries(difficultyMultiplier).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-brand-text">Jumlah Pakaian</label>
            <Input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-brand-text">Nama Lengkap</label>
            <Input
              placeholder="Masukkan namamu..."
              value={customerName}
              onChange={handleCustomerNameChange}
              inputMode="text"
              autoComplete="name"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-brand-text">Nomor WhatsApp</label>
            <Input
              placeholder="Contoh: 081234567890"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              value={customerPhone}
              onChange={handleCustomerPhoneChange}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-brand-text">Catatan (opsional)</label>
          <Textarea
            placeholder="Contoh: Perbaiki sobekan di bagian saku celana jeans..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-brand-text">Upload Foto Pakaian (opsional)</label>
          <label className="flex flex-col items-center justify-center gap-2 w-full h-32 rounded-xl border-2 border-dashed border-brand-border bg-brand-bg/40 cursor-pointer hover:border-brand-green/50 hover:bg-brand-bg transition-colors">
            <Upload className="h-6 w-6 text-slate-400" />
            <div className="text-xs text-center text-slate-500 px-3">
              {fileName ? (
                <span className="text-brand-green font-medium">{fileName}</span>
              ) : (
                <>
                  Klik untuk upload foto
                  <br />
                  JPG, PNG, maks. 5MB
                </>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                if (f && f.size > 5 * 1024 * 1024) {
                  toast({
                    variant: "error",
                    title: "File terlalu besar",
                    description: "Maksimal ukuran foto 5MB.",
                  });
                  return;
                }
                setSelectedFile(f);
                setFileName(f?.name || "");
              }}
            />
          </label>
        </div>

        <div className="rounded-2xl border border-brand-green/20 bg-gradient-to-br from-brand-bg via-white to-green-50 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand-green" />
              <span className="text-xs font-medium text-brand-green">Estimasi Biaya</span>
            </div>
            {estimated ? (
              <div className="flex items-baseline gap-2 flex-wrap">
                <div className="text-2xl sm:text-3xl font-extrabold text-brand-text tracking-tight">
                  {formatRupiah(estimated)}
                </div>
                <Badge variant="success">Mulai dari</Badge>
              </div>
            ) : (
              <div className="text-xl font-bold text-slate-400">Rp -</div>
            )}
            <p className="text-xs text-slate-500">
              * Harga final akan dikonfirmasi setelah tim memeriksa pakaian.
            </p>
          </div>
          <Button type="submit" size="lg" disabled={!selectedService || submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? "Menyimpan..." : "Buat Pesanan"}
          </Button>
        </div>
      </form>
      {successOrder && (
        <div className="fixed inset-0 z-[90] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-card w-full max-w-md max-h-[92vh] overflow-y-auto">
            <div className="p-5 pb-0 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="h-10 w-10 shrink-0 rounded-full bg-green-50 text-brand-green flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
                <div>
                  <div className="font-bold text-brand-text">Pesanan siap dikirim!</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Nomor pesanan: <span className="font-mono font-semibold">{successOrder}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSuccessOrder(null)}
                className="text-slate-400 hover:text-slate-600 shrink-0"
                aria-label="Tutup"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5">
              <p className="text-sm text-slate-600 mb-4">
                Klik tombol di bawah untuk mengirim detail pesanan ke WhatsApp kami. Tim kami akan
                mengonfirmasi harga final dan jadwal pengerjaan.
              </p>
              {waLink ? (
                <Button asChild size="lg" className="w-full">
                  <a href={waLink} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4" />
                    Kirim Pesanan via WhatsApp
                  </a>
                </Button>
              ) : (
                <p className="text-sm text-red-500">
                  Nomor WhatsApp bisnis belum diatur. Simpan nomor pesananmu dan hubungi kami lewat halaman Hubungi Kami.
                </p>
              )}
              <Button variant="outline" className="w-full mt-3" onClick={() => setSuccessOrder(null)}>
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}