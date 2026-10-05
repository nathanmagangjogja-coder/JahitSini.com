"use client";

import * as React from "react";
import { Scissors, Plus, Edit, Trash2, Search, Loader2, X, Save } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { categories } from "@/lib/data";
import { getServicesRemote, createService, updateService, deleteService, ServiceInput, ServiceFull } from "@/lib/services";
import { listToText, textToList, stepsToText, textToSteps, faqsToText, textToFaqs } from "@/lib/serviceDetails";
import { ServiceIcon } from "@/components/ui/ServiceIcon";
import { useToast } from "@/components/ui/Toast";

interface FormState {
  name: string;
  description: string;
  duration: string;
  category: ServiceInput["category"];
  icon: string;
  longDescription: string;
  includesText: string;
  stepsText: string;
  tipsText: string;
  faqsText: string;
}

const emptyForm: FormState = {
  name: "",
  description: "",
  duration: "",
  category: "permak",
  icon: "scissors",
  longDescription: "",
  includesText: "",
  stepsText: "",
  tipsText: "",
  faqsText: "",
};

const iconOptions = [
  ["scissors", "Gunting"],
  ["shirt", "Baju"],
  ["maximize", "Perbesar"],
  ["briefcase", "Jas / Tas kerja"],
  ["needle", "Jarum"],
  ["patch-plus", "Tambalan"],
  ["suture", "Perbaikan"],
  ["zap", "Resleting"],
  ["circle-dot", "Kancing"],
  ["refresh-cw", "Ganti"],
];

export default function AdminServicesPage() {
  const { toast } = useToast();
  const [services, setServices] = React.useState<ServiceFull[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("all");

  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<FormState>(emptyForm);
  const [saving, setSaving] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    setLoading(true);
    getServicesRemote().then((data) => {
      setServices(data);
      setLoading(false);
    });
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const categoryMap: Record<string, string> = {};
  categories.forEach((c) => (categoryMap[c.id] = c.name));

  const filteredServices = services.filter((s) => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "all" || s.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (s: ServiceFull) => {
    setEditingId(s.id);
    setForm({
      name: s.name,
      description: s.description,
      duration: s.duration,
      category: s.category,
      icon: s.icon,
      longDescription: s.longDescription,
      includesText: listToText(s.includes),
      stepsText: stepsToText(s.steps),
      tipsText: listToText(s.tips),
      faqsText: faqsToText(s.faqs),
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.description.trim() || !form.duration.trim()) {
      toast({ variant: "error", title: "Lengkapi semua field", description: "Nama, deskripsi singkat, dan durasi wajib diisi." });
      return;
    }
    const input: ServiceInput = {
      name: form.name.trim(),
      description: form.description.trim(),
      duration: form.duration.trim(),
      category: form.category,
      icon: form.icon,
      longDescription: form.longDescription.trim(),
      includes: textToList(form.includesText),
      steps: textToSteps(form.stepsText),
      tips: textToList(form.tipsText),
      faqs: textToFaqs(form.faqsText),
    };
    setSaving(true);
    const result = editingId ? await updateService(editingId, input) : await createService(input);
    setSaving(false);

    if (result.ok) {
      toast({
        variant: "success",
        title: editingId ? "Layanan diperbarui" : "Layanan ditambahkan",
      });
      setModalOpen(false);
      load();
    } else {
      toast({ variant: "error", title: "Gagal menyimpan", description: result.error || "Coba lagi sebentar." });
    }
  };

  const handleDelete = async (s: ServiceFull) => {
    if (!confirm(`Hapus layanan "${s.name}"? Layanan ini tidak akan tampil lagi di website.`)) return;
    setDeletingId(s.id);
    const result = await deleteService(s.id);
    setDeletingId(null);
    if (result.ok) {
      toast({ variant: "success", title: "Layanan dihapus" });
      load();
    } else {
      toast({ variant: "error", title: "Gagal menghapus", description: result.error });
    }
  };

  return (
    <DashboardLayout
      type="admin"
      title="Kelola Layanan"
      subtitle="Tambah, edit, atau hapus jenis layanan yang tersedia"
    >
      <Card className="mb-6">
        <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center flex-1">
            <div className="relative flex-1 sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama layanan..."
                className="pl-10"
              />
            </div>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full sm:w-48"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
          <Button onClick={openAddModal}>
            <Plus className="h-4 w-4" />
            Tambah Layanan
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {categories.map((c) => {
          const count = services.filter((s) => s.category === c.id).length;
          return (
            <button
              key={c.id}
              onClick={() => setCategoryFilter(categoryFilter === c.id ? "all" : c.id)}
              className={`text-left rounded-2xl border p-4 hover:shadow-soft transition-all ${
                categoryFilter === c.id
                  ? "border-brand-green bg-brand-bg/60"
                  : "border-brand-border bg-white"
              }`}
            >
              <div className="flex items-center gap-2.5 mb-2">
                <div className="h-9 w-9 rounded-xl bg-brand-bg text-brand-green flex items-center justify-center">
                  <Scissors className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500">{count} Layanan</div>
                  <div className="font-bold text-brand-text">{c.name}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <Card>
        <CardHeader className="pb-3 flex-row items-center justify-between gap-3">
          <CardTitle className="text-lg">Daftar Layanan ({filteredServices.length})</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-slate-400 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" /> Memuat layanan...
            </div>
          ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 uppercase tracking-wider border-b border-brand-border">
                <th className="py-3 pr-4 font-semibold">Layanan</th>
                <th className="py-3 pr-4 font-semibold">Kategori</th>
                <th className="py-3 pr-4 font-semibold">Durasi</th>
                <th className="py-3 pr-4 font-semibold">Status</th>
                <th className="py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/60">
              {filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">
                    Tidak ada layanan yang cocok.
                  </td>
                </tr>
              ) : (
                filteredServices.map((s) => (
                  <tr key={s.id} className="hover:bg-brand-bg/40">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br from-brand-bg to-green-50 text-brand-green flex items-center justify-center ring-1 ring-brand-border">
                          <ServiceIcon name={s.icon} className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-brand-text">{s.name}</div>
                          <div className="text-[11px] text-slate-500 line-clamp-1 max-w-xs">{s.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant="outline" className="uppercase">{categoryMap[s.category] || s.category}</Badge>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="text-slate-600">{s.duration}</div>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant="success">Aktif</Badge>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button variant="ghost" size="sm" className="!h-8 !w-8 !p-0" onClick={() => openEditModal(s)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="!h-8 !w-8 !p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(s)}
                          disabled={deletingId === s.id}
                        >
                          {deletingId === s.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          )}
        </CardContent>
      </Card>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-card w-full max-w-3xl max-h-[92vh] overflow-y-auto">
            <div className="sticky top-0 z-10 bg-white flex items-center justify-between p-5 border-b border-brand-border">
              <h3 className="font-bold text-brand-text">
                {editingId ? "Edit Layanan" : "Tambah Layanan Baru"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-6">
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-green">Informasi dasar</h4>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-brand-text">Nama Layanan</label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Contoh: Permak Rok"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-brand-text">Deskripsi Singkat</label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    rows={2}
                    className="min-h-[70px]"
                    placeholder="Satu-dua kalimat, tampil di kartu daftar layanan."
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-brand-text">Durasi</label>
                    <Input
                      value={form.duration}
                      onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                      placeholder="1-2 hari"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-brand-text">Kategori</label>
                    <Select
                      value={form.category}
                      onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ServiceInput["category"] }))}
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-brand-text">Ikon</label>
                    <Select value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}>
                      {iconOptions.map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t border-brand-border pt-6">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-green">Konten halaman detail</h4>
                  <p className="mt-1 text-xs text-slate-500">
                    Ini yang tampil di halaman detail layanan. Bagian yang dikosongkan akan memakai teks standar kategori.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-brand-text">Penjelasan Lengkap</label>
                  <Textarea
                    value={form.longDescription}
                    onChange={(e) => setForm((f) => ({ ...f, longDescription: e.target.value }))}
                    rows={6}
                    placeholder={"Jelaskan layanan ini secara lengkap.\n\nPisahkan paragraf dengan satu baris kosong."}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-brand-text">Yang Termasuk dalam Layanan</label>
                  <Textarea
                    value={form.includesText}
                    onChange={(e) => setForm((f) => ({ ...f, includesText: e.target.value }))}
                    rows={4}
                    placeholder={"Satu poin per baris, contoh:\nPengukuran langsung\nPenjahitan ulang\nPenyetrikaan"}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-brand-text">Tahapan Pengerjaan</label>
                  <Textarea
                    value={form.stepsText}
                    onChange={(e) => setForm((f) => ({ ...f, stepsText: e.target.value }))}
                    rows={5}
                    placeholder={"Satu tahap per baris, format: Judul | Penjelasan\nPemeriksaan | Kami cek kondisi pakaian\nPenjahitan | Dikerjakan oleh penjahit berpengalaman"}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-brand-text">Tips Sebelum Mengirim Pakaian</label>
                  <Textarea
                    value={form.tipsText}
                    onChange={(e) => setForm((f) => ({ ...f, tipsText: e.target.value }))}
                    rows={4}
                    placeholder={"Satu tips per baris"}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-brand-text">Pertanyaan yang Sering Diajukan</label>
                  <Textarea
                    value={form.faqsText}
                    onChange={(e) => setForm((f) => ({ ...f, faqsText: e.target.value }))}
                    rows={5}
                    placeholder={"Satu pertanyaan per baris, format: Pertanyaan | Jawaban\nBerapa lama pengerjaannya? | Rata-rata 1-2 hari kerja."}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {saving ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}