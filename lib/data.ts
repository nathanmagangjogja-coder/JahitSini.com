export type OrderStatus =
  | "received"
  | "checking"
  | "estimation"
  | "approved"
  | "sewing"
  | "qc"
  | "done";

export interface Service {
  id: string;
  name: string;
  description: string;
  priceStart: number;
  duration: string;
  category: "permak" | "reparasi" | "resleting" | "aksesoris";
  icon: string;
}

export interface Category {
  id: "permak" | "reparasi" | "resleting" | "aksesoris";
  name: string;
  description: string;
}

export const categories: Category[] = [
  {
    id: "permak",
    name: "Permak",
    description: "Ubah ukuran dan bentuk pakaian agar lebih pas di badan.",
  },
  {
    id: "reparasi",
    name: "Reparasi",
    description: "Perbaiki pakaian rusak, sobek, atau jahitan yang lepas.",
  },
  {
    id: "resleting",
    name: "Resleting",
    description: "Ganti resleting rusak pada celana, jaket, atau tas.",
  },
  {
    id: "aksesoris",
    name: "Aksesoris",
    description: "Pasang atau ganti kancing, kait, dan aksesoris pakaian lainnya.",
  },
];

export const services: Service[] = [
  {
    id: "permak-potong-celana",
    name: "Potong Celana",
    description: "Potong panjang celana sesuai ukuran kaki dengan hasil jahitan rapi.",
    priceStart: 25000,
    duration: "1-2 hari",
    category: "permak",
    icon: "scissors",
  },
  {
    id: "permak-kecilkan-baju",
    name: "Kecilkan Baju",
    description: "Kecilkan ukuran baju baik di bagian badan, lengan, maupun bagian lain.",
    priceStart: 45000,
    duration: "2-3 hari",
    category: "permak",
    icon: "shirt",
  },
  {
    id: "permak-besarkan-pakaian",
    name: "Besarkan Pakaian",
    description: "Besarkan ukuran pakaian dengan menyisipkan kain tambahan yang serasi.",
    priceStart: 60000,
    duration: "2-4 hari",
    category: "permak",
    icon: "maximize",
  },
  {
    id: "permak-jas",
    name: "Permak Jas",
    description: "Permak detail jas: lengan, badan, celana jas agar presisi dan rapi.",
    priceStart: 85000,
    duration: "3-5 hari",
    category: "permak",
    icon: "briefcase",
  },
  {
    id: "permak-jaket",
    name: "Permak Jaket",
    description: "Ubah ukuran jaket sesuai bentuk badan, tanpa merusak desain asli.",
    priceStart: 75000,
    duration: "3-4 hari",
    category: "permak",
    icon: "shirt",
  },
  {
    id: "reparasi-jahit-sobekan",
    name: "Jahit Sobekan",
    description: "Jahit sobekan pada kain dengan jahitan tersembunyi dan rapi.",
    priceStart: 20000,
    duration: "1-2 hari",
    category: "reparasi",
    icon: "needle",
  },
  {
    id: "reparasi-tambal-pakaian",
    name: "Tambal Pakaian",
    description: "Tambal bagian pakaian yang bolong dengan kain patch yang cocok.",
    priceStart: 30000,
    duration: "1-2 hari",
    category: "reparasi",
    icon: "patch-plus",
  },
  {
    id: "reparasi-perbaikan-jahitan",
    name: "Perbaikan Jahitan",
    description: "Perbaiki jahitan yang lepas atau renggang agar kembali kuat.",
    priceStart: 20000,
    duration: "1 hari",
    category: "reparasi",
    icon: "suture",
  },
  {
    id: "resleting-celana",
    name: "Ganti Resleting Celana",
    description: "Ganti resleting celana dengan ukuran dan kualitas sesuai aslinya.",
    priceStart: 35000,
    duration: "1-2 hari",
    category: "resleting",
    icon: "zap",
  },
  {
    id: "resleting-jaket",
    name: "Ganti Resleting Jaket",
    description: "Ganti resleting jaket dengan presisi tinggi, cocok untuk jaket tebal.",
    priceStart: 50000,
    duration: "2-3 hari",
    category: "resleting",
    icon: "zap",
  },
  {
    id: "resleting-tas",
    name: "Ganti Resleting Tas",
    description: "Ganti resleting tas ransel, koper, atau tas jinjing dengan kuat.",
    priceStart: 45000,
    duration: "1-3 hari",
    category: "resleting",
    icon: "zap",
  },
  {
    id: "aksesoris-pasang-kancing",
    name: "Pasang Kancing",
    description: "Pasang kancing baru dengan model dan ukuran yang sesuai.",
    priceStart: 15000,
    duration: "1 hari",
    category: "aksesoris",
    icon: "circle-dot",
  },
  {
    id: "aksesoris-ganti-kancing",
    name: "Ganti Kancing",
    description: "Lepas kancing lama dan ganti dengan kancing baru pilihanmu.",
    priceStart: 18000,
    duration: "1 hari",
    category: "aksesoris",
    icon: "refresh-cw",
  },
];

export const difficultyMultiplier: Record<string, { label: string; multiplier: number }> = {
  mudah: { label: "Mudah", multiplier: 1 },
  sedang: { label: "Sedang", multiplier: 1.4 },
  sulit: { label: "Sulit", multiplier: 1.8 },
};

export const statusLabels: Record<OrderStatus, { label: string; color: string }> = {
  received: { label: "Pesanan diterima", color: "bg-slate-100 text-slate-700 border-slate-200" },
  checking: { label: "Pemeriksaan", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  estimation: { label: "Estimasi", color: "bg-blue-50 text-blue-700 border-blue-200" },
  approved: { label: "Persetujuan", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  sewing: { label: "Proses jahit", color: "bg-purple-50 text-purple-700 border-purple-200" },
  qc: { label: "QC", color: "bg-orange-50 text-orange-700 border-orange-200" },
  done: { label: "Selesai", color: "bg-green-50 text-green-700 border-green-200" },
};

export const statusTimeline: OrderStatus[] = [
  "received",
  "checking",
  "estimation",
  "approved",
  "sewing",
  "qc",
  "done",
];

export interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export const faqItems: FAQItem[] = [
  {
    question: "Berapa lama waktu pengerjaan permak baju?",
    answer: "Waktu pengerjaan permak baju rata-rata 2-3 hari kerja, tergantung tingkat kesulitan. Untuk permak jas bisa memakan waktu 3-5 hari karena butuh presisi tinggi.",
    category: "permak",
  },
  {
    question: "Apakah bisa memperbaiki sobekan di kain jeans yang tebal?",
    answer: "Bisa. Kami menangani berbagai jenis kain termasuk jeans, kanvas, dan bahan tebal lainnya. Jahitan dijamin kuat dan rapi.",
    category: "reparasi",
  },
  {
    question: "Berapa harga ganti resleting celana?",
    answer: "Ganti resleting celana mulai dari Rp 35.000. Harga bisa berbeda tergantung panjang dan merk resleting yang digunakan.",
    category: "resleting",
  },
  {
    question: "Apakah jahitan jas dijamin presisi?",
    answer: "Tentu. Penjahit kami berpengalaman lebih dari 5 tahun dalam menangani jas formal, jas almamater, dan jas pernikahan. Hasil presisi dan nyaman dipakai.",
    category: "jas",
  },
  {
    question: "Apakah tersedia layanan pengiriman?",
    answer: "Saat ini kami menerima drop-off dan pick-up di workshop. Untuk pengiriman via kurir (GoSend, GrabExpress, JNE, dll.) bisa diatur sesuai kesepakatan. Biaya pengiriman ditanggung pelanggan.",
    category: "pengiriman",
  },
  {
    question: "Bagaimana cara menghitung estimasi harga?",
    answer: "Anda bisa menggunakan kalkulator estimasi biaya di halaman Layanan. Masukkan jenis layanan, tingkat kesulitan, dan jumlah pakaian. Untuk harga pasti, tim kami akan memeriksa pakaian secara langsung setelah diterima.",
    category: "harga",
  },
  {
    question: "Apakah permak bisa membatalkan perubahan jika tidak sesuai?",
    answer: "Kami akan mengonfirmasi detail permak sebelum dikerjakan. Jika ada ketidaksesuaian dari hasil kerja kami, kami akan mereparasi ulang tanpa biaya tambahan.",
    category: "permak",
  },
  {
    question: "Bisa memperbaiki seragam sekolah / kantor?",
    answer: "Bisa sekali. Kami berpengalaman menangani seragam sekolah, seragam karyawan, dan seragam komunitas dengan kualitas jahitan yang rapi dan tahan lama.",
    category: "reparasi",
  },
];
