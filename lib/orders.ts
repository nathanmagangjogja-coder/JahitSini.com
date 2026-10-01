import { OrderStatus } from "./data";
import { services } from "./data";
import { supabase } from "./supabase";

export interface OrderPhoto {
  id: string;
  url: string;
  label: string;
}

export interface OrderNote {
  id: string;
  author: string;
  role: "customer" | "admin";
  message: string;
  timestamp: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  serviceId: string;
  serviceName: string;
  category: string;
  categoryLabel: string;
  quantity: number;
  difficulty: "mudah" | "sedang" | "sulit";
  notes?: string;
  priceEstimate?: number;
  priceFinal?: number;
  status: OrderStatus;
  createdAt: string;
  estimatedDone?: string;
  photos: OrderPhoto[];
  timeline: {
    status: OrderStatus;
    note?: string;
    timestamp: string;
  }[];
  customerNotes: OrderNote[];
}

const now = new Date();
const daysAgo = (d: number) =>
  new Date(now.getTime() - d * 24 * 60 * 60 * 1000).toISOString();

export const sampleOrders: Order[] = [
  {
    id: "ord_001",
    orderNumber: "JS-20260914-001",
    customerName: "Andi Pratama",
    customerPhone: "081234567890",
    customerEmail: "andi.pratama@mail.com",
    serviceId: "permak-jas",
    serviceName: services.find((s) => s.id === "permak-jas")?.name || "Permak Jas",
    category: "permak",
    categoryLabel: "Permak",
    quantity: 1,
    difficulty: "sedang",
    notes:
      "Jas navy, ukuran badan perlu diperkecil di bagian pinggang dan lengan. Panjang celana jas juga perlu dipotong 2cm.",
    priceEstimate: 95000,
    priceFinal: 100000,
    status: "sewing",
    createdAt: daysAgo(3),
    estimatedDone: daysAgo(-2),
    photos: [
      {
        id: "p1",
        label: "Foto jas depan",
        url: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=navy%20business%20suit%20laid%20flat%20top%20view%20soft%20studio%20lighting&image_size=square",
      },
      {
        id: "p2",
        label: "Detail lengan",
        url: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=close%20up%20suit%20jacket%20sleeve%20too%20long%20soft%20lighting&image_size=square",
      },
    ],
    timeline: [
      { status: "received", timestamp: daysAgo(3), note: "Pakaian diterima di workshop" },
      { status: "checking", timestamp: daysAgo(2.5), note: "Pemeriksaan kondisi jas selesai" },
      { status: "estimation", timestamp: daysAgo(2), note: "Estimasi biaya: Rp 100.000, 3 hari kerja" },
      { status: "approved", timestamp: daysAgo(1.8), note: "Pelanggan menyetujui estimasi" },
      { status: "sewing", timestamp: daysAgo(1), note: "Sedang dikerjakan oleh penjahit senior" },
    ],
    customerNotes: [
      {
        id: "n1",
        author: "Admin Jahitsini",
        role: "admin",
        message: "Terima kasih atas pesanannya, Pak Andi! Jas sudah kami terima ya. Kami akan segera proses.",
        timestamp: daysAgo(3),
      },
      {
        id: "n2",
        author: "Andi Pratama",
        role: "customer",
        message: "Terima kasih. Mohon perhatikan bagian lapisan dalam jas ya, jangan sampai lepas.",
        timestamp: daysAgo(2.7),
      },
      {
        id: "n3",
        author: "Admin Jahitsini",
        role: "admin",
        message: "Siap, Pak. Estimasi Rp 100.000 dengan pengerjaan 3 hari. Apakah disetujui?",
        timestamp: daysAgo(2),
      },
    ],
  },
  {
    id: "ord_002",
    orderNumber: "JS-20260913-234",
    customerName: "Siti Rahayu",
    customerPhone: "085678901234",
    customerEmail: "siti@mail.com",
    serviceId: "resleting-jaket",
    serviceName: services.find((s) => s.id === "resleting-jaket")?.name || "Ganti Resleting Jaket",
    category: "resleting",
    categoryLabel: "Resleting",
    quantity: 1,
    difficulty: "mudah",
    notes: "Jaket parasut hitam, resleting macet sekitar 20cm, ingin diganti yang baru.",
    priceEstimate: 55000,
    priceFinal: 55000,
    status: "done",
    createdAt: daysAgo(6),
    estimatedDone: daysAgo(4),
    photos: [
      {
        id: "p1",
        label: "Foto jaket",
        url: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=black%20parachute%20jacket%20laid%20flat%20soft%20lighting&image_size=square",
      },
    ],
    timeline: [
      { status: "received", timestamp: daysAgo(6) },
      { status: "checking", timestamp: daysAgo(5.5) },
      { status: "estimation", timestamp: daysAgo(5), note: "Estimasi Rp 55.000" },
      { status: "approved", timestamp: daysAgo(4.8) },
      { status: "sewing", timestamp: daysAgo(4) },
      { status: "qc", timestamp: daysAgo(3.2), note: "Resleting berfungsi lancar" },
      { status: "done", timestamp: daysAgo(3), note: "Pakaian siap diambil" },
    ],
    customerNotes: [],
  },
  {
    id: "ord_003",
    orderNumber: "JS-20260915-088",
    customerName: "Budi Santoso",
    customerPhone: "089876543210",
    serviceId: "reparasi-jahit-sobekan",
    serviceName: services.find((s) => s.id === "reparasi-jahit-sobekan")?.name || "Jahit Sobekan",
    category: "reparasi",
    categoryLabel: "Reparasi",
    quantity: 2,
    difficulty: "sedang",
    notes: "2 celana jeans sobek di bagian lutut. Mohon ditambal agar rapi.",
    priceEstimate: 65000,
    status: "checking",
    createdAt: daysAgo(0.5),
    photos: [],
    timeline: [
      { status: "received", timestamp: daysAgo(0.5), note: "Pesanan baru masuk via website" },
      { status: "checking", timestamp: new Date().toISOString() },
    ],
    customerNotes: [],
  },
  {
    id: "ord_004",
    orderNumber: "JS-20260912-156",
    customerName: "Dewi Lestari",
    customerPhone: "081122334455",
    serviceId: "permak-kecilkan-baju",
    serviceName: services.find((s) => s.id === "permak-kecilkan-baju")?.name || "Kecilkan Baju",
    category: "permak",
    categoryLabel: "Permak",
    quantity: 3,
    difficulty: "sedang",
    notes: "3 kemeja batik perlu dikecilkan di bagian badan.",
    priceEstimate: 150000,
    priceFinal: 160000,
    status: "qc",
    createdAt: daysAgo(4),
    estimatedDone: daysAgo(0),
    photos: [],
    timeline: [
      { status: "received", timestamp: daysAgo(4) },
      { status: "checking", timestamp: daysAgo(3.5) },
      { status: "estimation", timestamp: daysAgo(3), note: "Estimasi Rp 160.000" },
      { status: "approved", timestamp: daysAgo(2.8) },
      { status: "sewing", timestamp: daysAgo(2) },
      { status: "qc", timestamp: daysAgo(0.2) },
    ],
    customerNotes: [],
  },
  {
    id: "ord_005",
    orderNumber: "JS-20260910-042",
    customerName: "Rizky Maulana",
    customerPhone: "087712345678",
    serviceId: "aksesoris-ganti-kancing",
    serviceName: services.find((s) => s.id === "aksesoris-ganti-kancing")?.name || "Ganti Kancing",
    category: "aksesoris",
    categoryLabel: "Aksesoris",
    quantity: 1,
    difficulty: "mudah",
    notes: "Ganti 5 kancing baju koko dengan kancing perak.",
    priceEstimate: 25000,
    status: "estimation",
    createdAt: daysAgo(1),
    photos: [],
    timeline: [
      { status: "received", timestamp: daysAgo(1) },
      { status: "checking", timestamp: daysAgo(0.8) },
      { status: "estimation", timestamp: daysAgo(0.3) },
    ],
    customerNotes: [],
  },
];

export function getOrderByNumber(orderNumber: string): Order | undefined {
  return sampleOrders.find(
    (o) => o.orderNumber.toLowerCase() === orderNumber.toLowerCase()
  );
}

export function getOrdersByCustomer(phone: string): Order[] {
  return sampleOrders.filter((o) => o.customerPhone === phone);
}

const LOCAL_ORDERS_KEY = "jahitsini_local_orders";
const LOCAL_ORDERS_EVENT = "jahitsini:orders-changed";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readLocalOrders(): Order[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_ORDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.map((order) => ({
          ...order,
          photos: order.photos || [],
          timeline: order.timeline || [],
          customerNotes: order.customerNotes || [],
        }))
      : [];
  } catch {
    return [];
  }
}

function writeLocalOrders(orders: Order[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
  window.dispatchEvent(new CustomEvent(LOCAL_ORDERS_EVENT));
}

function mergeOrders(...groups: Order[][]): Order[] {
  const byKey = new Map<string, Order>();
  groups.flat().forEach((order) => {
    const key = order.orderNumber || order.id;
    if (!byKey.has(key)) byKey.set(key, order);
  });
  return Array.from(byKey.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

function findLocalOrSampleOrder(idOrNumber: string): Order | undefined {
  return mergeOrders(readLocalOrders(), sampleOrders).find(
    (order) =>
      order.id === idOrNumber ||
      order.orderNumber.toLowerCase() === idOrNumber.toLowerCase()
  );
}

function updateLocalOrder(
  idOrNumber: string,
  updater: (order: Order) => Order
): boolean {
  const current = findLocalOrSampleOrder(idOrNumber);
  if (!current) return false;

  const updated = updater(current);
  const localOrders = readLocalOrders();
  const idx = localOrders.findIndex(
    (order) => order.id === current.id || order.orderNumber === current.orderNumber
  );
  if (idx >= 0) {
    localOrders[idx] = updated;
  } else {
    localOrders.unshift(updated);
  }
  writeLocalOrders(localOrders);
  return true;
}

function saveLocalOrder(order: Order): Order {
  const localOrders = readLocalOrders();
  const idx = localOrders.findIndex((item) => item.orderNumber === order.orderNumber);
  if (idx >= 0) {
    localOrders[idx] = order;
  } else {
    localOrders.unshift(order);
  }
  writeLocalOrders(localOrders);
  return order;
}

function buildOrderFromInput(input: CreateOrderInput): Order {
  const timestamp = new Date().toISOString();
  return {
    id: `local_${Date.now()}`,
    orderNumber: input.orderNumber,
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    customerEmail: input.customerEmail,
    serviceId: input.serviceId,
    serviceName: input.serviceName,
    category: input.category,
    categoryLabel: input.categoryLabel,
    quantity: input.quantity,
    difficulty: input.difficulty,
    notes: input.notes,
    priceEstimate: input.priceEstimate,
    status: "received",
    createdAt: timestamp,
    photos: input.photos || [],
    timeline: [
      {
        status: "received",
        timestamp,
        note: "Pesanan baru berhasil dibuat",
      },
    ],
    customerNotes: [
      {
        id: `w_${Date.now()}`,
        author: "Admin Jahitsini",
        role: "admin",
        message:
          "Terima kasih telah membuat pesanan! Silakan kirim pakaian ke workshop kami secepatnya ya. Status akan diperbarui setelah pakaian diterima.",
        timestamp,
      },
    ],
  };
}

function fileToDataUrl(file: File): Promise<string | null> {
  if (!isBrowser()) return Promise.resolve(null);
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

// ============================================================
// Fungsi di bawah ini benar-benar membaca/menulis ke Supabase.
// Kalau Supabase belum dikonfigurasi (env var kosong), `supabase`
// akan bernilai null (lihat lib/supabase.ts) dan fungsi ini akan
// otomatis fallback ke data statis di atas supaya situs tetap
// bisa dibuka tanpa error.
// ============================================================

export function mapDbOrderToOrder(row: any): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerEmail: row.customer_email ?? undefined,
    serviceId: row.service_id,
    serviceName: row.service_name,
    category: row.category,
    categoryLabel: row.category_label,
    quantity: row.quantity,
    difficulty: row.difficulty,
    notes: row.notes ?? undefined,
    priceEstimate: row.price_estimate ?? undefined,
    priceFinal: row.price_final ?? undefined,
    status: row.status,
    createdAt: row.created_at,
    estimatedDone: row.estimated_done ?? undefined,
    photos: row.photos ?? [],
    timeline: row.timeline ?? [],
    customerNotes: row.customer_notes ?? [],
  };
}

export interface CreateOrderInput {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  serviceId: string;
  serviceName: string;
  category: string;
  categoryLabel: string;
  quantity: number;
  difficulty: "mudah" | "sedang" | "sulit";
  notes?: string;
  priceEstimate?: number;
  photos?: OrderPhoto[];
}

/** Upload foto pakaian ke Supabase Storage, return URL publik-nya (atau null kalau gagal). */
export async function uploadOrderPhoto(file: File, orderNumber: string): Promise<string | null> {
  if (!supabase) return fileToDataUrl(file);
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${orderNumber}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from("order-photos").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) {
    console.error("uploadOrderPhoto error:", error);
    return null;
  }

  const { data } = supabase.storage.from("order-photos").getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Upload multiple foto pakaian sekaligus (batch).
 * Pakai Promise.allSettled, jadi gagal satu foto tidak membatalkan yang lain.
 * Return hanya foto yang berhasil di-upload sebagai OrderPhoto[].
 */
export async function uploadOrderPhotos(files: File[], orderNumber: string): Promise<OrderPhoto[]> {
  if (!files || files.length === 0) return [];

  const results = await Promise.allSettled(
    files.map(async (file, index) => {
      const url = await uploadOrderPhoto(file, orderNumber);
      if (!url) {
        console.error(`uploadOrderPhotos: gagal upload file index ${index}`, file.name);
        return null;
      }
      return {
        id: `photo_${Date.now()}_${index}`,
        url,
        label: file.name || `Foto pakaian ${index + 1}`,
      } as OrderPhoto;
    })
  );

  const successful: OrderPhoto[] = [];
  results.forEach((result) => {
    if (result.status === "fulfilled" && result.value) {
      successful.push(result.value);
    }
  });

  return successful;
}

/** Simpan order baru ke Supabase. Return null kalau Supabase belum dikonfigurasi. */
export async function createOrderRemote(input: CreateOrderInput): Promise<Order | null> {
  const localOrder = buildOrderFromInput(input);
  if (!supabase) return saveLocalOrder(localOrder);

  const { data, error } = await supabase
    .from("orders")
    .insert({
      order_number: input.orderNumber,
      customer_name: input.customerName,
      customer_phone: input.customerPhone,
      customer_email: input.customerEmail || null,
      service_id: input.serviceId,
      service_name: input.serviceName,
      category: input.category,
      category_label: input.categoryLabel,
      quantity: input.quantity,
      difficulty: input.difficulty,
      notes: input.notes || null,
      price_estimate: input.priceEstimate ?? null,
      photos: input.photos || [],
      status: "received",
      timeline: [
        {
          status: "received",
          timestamp: new Date().toISOString(),
          note: "Pesanan baru berhasil dibuat",
        },
      ],
      customer_notes: [
        {
          id: `w_${Date.now()}`,
          author: "Admin Jahitsini",
          role: "admin",
          message:
            "Terima kasih telah membuat pesanan! Silakan kirim pakaian ke workshop kami secepatnya ya. Status akan diperbarui setelah pakaian diterima.",
          timestamp: new Date().toISOString(),
        },
      ],
    })
    .select()
    .single();

  if (error || !data) {
    console.error("createOrderRemote error:", error);
    return saveLocalOrder(localOrder);
  }
  return mapDbOrderToOrder(data);
}

/** Cari order (di Supabase dulu, fallback ke data contoh statis). */
export async function getOrderByNumberRemote(orderNumber: string): Promise<Order | undefined> {
  if (supabase) {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .ilike("order_number", orderNumber)
      .maybeSingle();
    if (!error && data) return mapDbOrderToOrder(data);
  }
  const local = findLocalOrSampleOrder(orderNumber);
  if (local) return local;
  return getOrderByNumber(orderNumber);
}

/** Semua order untuk panel admin/dashboard. Fallback ke data contoh statis. */
export async function getAllOrdersRemote(): Promise<Order[]> {
  const localOrders = readLocalOrders();
  if (supabase) {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) return mergeOrders(localOrders, data.map(mapDbOrderToOrder));
  }
  return mergeOrders(localOrders, sampleOrders);
}

/** Semua order milik satu pelanggan (dicocokkan dari nomor HP di profil akun). */
export async function getOrdersByCustomerRemote(phone: string): Promise<Order[]> {
  if (!phone) return [];
  const localOrders = readLocalOrders().filter((order) => order.customerPhone === phone);
  if (supabase) {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("customer_phone", phone)
      .order("created_at", { ascending: false });
    if (!error && data) return mergeOrders(localOrders, data.map(mapDbOrderToOrder));
  }
  return mergeOrders(localOrders, getOrdersByCustomer(phone));
}

/**
 * Hapus pesanan secara permanen lewat API admin.
 * Server hanya mengizinkan ini untuk pesanan berstatus "Dibatalkan", jadi
 * ubah status ke Dibatalkan lebih dulu sebelum memanggil ini.
 */
export async function deleteOrderRemote(
  orderNumber: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/secure/admin/orders/${encodeURIComponent(orderNumber)}`, {
      method: "DELETE",
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
      return { ok: false, error: json?.error || `Gagal menghapus (${res.status})` };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Gagal terhubung ke server." };
  }
}

/** Hasil notifikasi WhatsApp otomatis (saat status diubah ke "Selesai"). */
export interface OrderNotifyResult {
  sent: boolean;
  reason?: string;
  detail?: string;
  /** Tautan wa.me berisi pesan siap kirim, dipakai kalau pengiriman otomatis gagal. */
  whatsappLink?: string;
}

/**
 * Kirim perubahan admin ke API server (memakai service role, melewati RLS).
 * Browser anon TIDAK boleh mengubah tabel orders (policy UPDATE anon dicabut di 0010_rls_tighten),
 * dan update yang diblokir RLS tidak mengembalikan error, jadi harus lewat API ini.
 */
async function patchOrderViaAdminApi(
  orderNumber: string,
  body: Record<string, unknown>
): Promise<{ ok: boolean; notFound: boolean; notify?: OrderNotifyResult }> {
  try {
    const res = await fetch(`/api/secure/admin/orders/${encodeURIComponent(orderNumber)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => null);
    return { ok: res.ok && !!json?.success, notFound: res.status === 404, notify: json?.notify };
  } catch {
    return { ok: false, notFound: false };
  }
}

/** Update status/harga/catatan order dari panel admin, sekaligus menambah entri timeline. */
export async function updateOrderRemote(
  orderNumber: string,
  changes: { status?: OrderStatus; priceFinal?: number; note?: string },
  onNotify?: (result: OrderNotifyResult) => void
): Promise<boolean> {
  const updateLocal = () =>
    updateLocalOrder(orderNumber, (order) => {
      const nextTimeline = changes.status
        ? [
            ...(order.timeline || []),
            {
              status: changes.status,
              timestamp: new Date().toISOString(),
              note: changes.note || undefined,
            },
          ]
        : order.timeline;
      const nextNotes = changes.note
        ? [
            ...(order.customerNotes || []),
            {
              id: `w_${Date.now()}`,
              author: "Admin Jahitsini",
              role: "admin" as const,
              message: changes.note,
              timestamp: new Date().toISOString(),
            },
          ]
        : order.customerNotes;

      return {
        ...order,
        status: changes.status || order.status,
        priceFinal:
          typeof changes.priceFinal === "number" && !Number.isNaN(changes.priceFinal)
            ? changes.priceFinal
            : order.priceFinal,
        timeline: nextTimeline,
        customerNotes: nextNotes,
      };
    });

  // Tanpa Supabase (mode demo) -> simpan di localStorage.
  if (!supabase) return updateLocal();

  const body: Record<string, unknown> = {};
  if (changes.status) body.status = changes.status;
  if (typeof changes.priceFinal === "number" && !Number.isNaN(changes.priceFinal)) {
    body.price_final = changes.priceFinal;
  }
  if (changes.note) body.note = changes.note;
  if (Object.keys(body).length === 0) return true;

  const result = await patchOrderViaAdminApi(orderNumber, body);
  if (result.ok) {
    if (result.notify) onNotify?.(result.notify);
    return true;
  }
  // Order yang hanya ada di localStorage (mode demo) tidak ada di database.
  if (result.notFound) return updateLocal();
  return false;
}

/** Tambah pesan/catatan pelanggan ke order yang sudah ada. */
export async function addCustomerNoteRemote(
  orderId: string,
  note: OrderNote
): Promise<boolean> {
  const updateLocal = () =>
    updateLocalOrder(orderId, (order) => ({
      ...order,
      customerNotes: [...(order.customerNotes || []), note],
    }));

  if (!supabase) return updateLocal();
  const { data: current, error: fetchErr } = await supabase
    .from("orders")
    .select("customer_notes")
    .eq("id", orderId)
    .single();
  if (fetchErr || !current) return updateLocal();

  const updatedNotes = [...(current.customer_notes || []), note];
  const { error } = await supabase
    .from("orders")
    .update({ customer_notes: updatedNotes })
    .eq("id", orderId);

  if (error) return updateLocal();
  return true;
}

/** Admin membalas chat pelanggan pada satu order. */
export async function sendAdminReply(orderNumber: string, message: string): Promise<boolean> {
  if (supabase) {
    const result = await patchOrderViaAdminApi(orderNumber, { admin_reply_message: message });
    if (result.ok) return true;
    if (!result.notFound) return false;
  }
  return addCustomerNoteRemote(orderNumber, {
    id: `n_${Date.now()}`,
    author: "Admin Jahitsini",
    role: "admin",
    message,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Dengarkan perubahan live pada satu order (dipakai untuk chat real-time,
 * baik di halaman pelanggan maupun panel admin). Return fungsi unsubscribe.
 */
export function subscribeToOrder(
  orderId: string,
  onUpdate: (order: Order) => void
): () => void {
  const client = supabase;
  let removeRemote = () => {};

  if (client) {
    const channel = client
      .channel(`order-${orderId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${orderId}` },
        (payload) => {
          onUpdate(mapDbOrderToOrder(payload.new));
        }
      )
      .subscribe();

    removeRemote = () => {
      client.removeChannel(channel);
    };
  }

  if (!isBrowser()) return removeRemote;

  const handleLocalUpdate = () => {
    const updated = findLocalOrSampleOrder(orderId);
    if (updated) onUpdate(updated);
  };

  window.addEventListener(LOCAL_ORDERS_EVENT, handleLocalUpdate);
  window.addEventListener("storage", handleLocalUpdate);

  return () => {
    removeRemote();
    window.removeEventListener(LOCAL_ORDERS_EVENT, handleLocalUpdate);
    window.removeEventListener("storage", handleLocalUpdate);
  };
}