import type { Service } from "./data";

export interface ServiceStep {
  title: string;
  description: string;
}
export interface ServiceFaq {
  question: string;
  answer: string;
}

/** Konten detail yang bisa diatur admin (tabel `services`, migration 0011). */
export interface ServiceDetails {
  longDescription: string; // paragraf dipisah baris kosong
  includes: string[]; // "Yang termasuk dalam layanan"
  steps: ServiceStep[]; // tahapan pengerjaan
  tips: string[]; // tips sebelum mengirim pakaian
  priceNotes: string; // penjelasan harga
  faqs: ServiceFaq[];
}

export type ServiceFull = Service & ServiceDetails;

/* ------------------------------------------------------------------ */
/* Teks bawaan per kategori (dipakai kalau layanan belum punya detail) */
/* ------------------------------------------------------------------ */

const categoryDefaults: Record<Service["category"], Partial<ServiceDetails>> = {
  permak: {
    steps: [
      { title: "Konsultasi & pengukuran", description: "Kami mencatat bagian mana yang ingin diubah, lalu menandai ukuran langsung di pakaian atau berdasarkan referensi yang kamu kirim." },
      { title: "Pembongkaran jahitan", description: "Jahitan lama dibuka dengan hati-hati agar kain tidak rusak dan bentuk asli pakaian tetap terjaga." },
      { title: "Penjahitan ulang", description: "Pakaian dijahit ulang sesuai ukuran baru memakai benang yang warna dan ketebalannya serasi." },
      { title: "Finishing & pengecekan", description: "Dirapikan, disetrika, dan dicek ulang ukurannya sebelum dinyatakan selesai." },
    ],
    tips: [
      "Kirim foto pakaian yang sedang dipakai, lengkap dengan tanda bagian yang ingin diubah.",
      "Sertakan ukuran yang diinginkan (misalnya panjang dalam cm) bila kamu sudah tahu.",
      "Cuci dan setrika pakaian lebih dulu agar ukuran tidak berubah setelah dipermak.",
    ],
    priceNotes:
      "Harga mulai dari tertera adalah harga dasar. Biaya akhir bergantung pada jenis kain, banyaknya bagian yang diubah, dan tingkat kesulitan. Harga pasti dikonfirmasi setelah pakaian kami periksa, dan pengerjaan baru dimulai setelah kamu setuju.",
  },
  reparasi: {
    steps: [
      { title: "Pemeriksaan kerusakan", description: "Kami memeriksa letak, ukuran, dan penyebab kerusakan untuk menentukan cara perbaikan yang paling kuat." },
      { title: "Pemilihan bahan", description: "Benang atau kain penambal dipilih yang paling mendekati warna dan tekstur asli pakaian." },
      { title: "Proses perbaikan", description: "Bagian rusak dijahit atau ditambal dengan teknik yang menyembunyikan bekas perbaikan sebisa mungkin." },
      { title: "Pengecekan kekuatan", description: "Jahitan diuji kekuatannya, lalu pakaian dirapikan sebelum dikembalikan." },
    ],
    tips: [
      "Kirim foto dari dekat pada bagian yang rusak supaya perkiraan biaya lebih akurat.",
      "Jangan menarik atau menggunting bagian yang sobek karena bisa memperlebar kerusakan.",
      "Bila kamu punya sisa kain atau benang asli, sertakan saat mengirim pakaian.",
    ],
    priceNotes:
      "Biaya bergantung pada ukuran kerusakan, jenis kain, dan letaknya. Kerusakan kecil biasanya selesai dengan harga dasar, sedangkan kerusakan luas atau di area yang sulit dijangkau bisa lebih tinggi. Harga pasti dikonfirmasi sebelum dikerjakan.",
  },
  resleting: {
    steps: [
      { title: "Pengecekan resleting", description: "Kami memeriksa jenis, panjang, dan ukuran gigi resleting yang terpasang." },
      { title: "Pelepasan resleting lama", description: "Resleting lama dilepas tanpa merusak kain di sekitarnya." },
      { title: "Pemasangan resleting baru", description: "Resleting baru dipasang lurus dan rata dengan jahitan yang kuat." },
      { title: "Uji tarik & finishing", description: "Resleting diuji buka-tutup berulang kali, lalu pakaian dirapikan." },
    ],
    tips: [
      "Sebutkan bila kamu ingin resleting dengan warna atau merek tertentu.",
      "Kosongkan isi saku atau tas sebelum dikirim.",
      "Kirim foto resleting yang rusak, terutama bagian kepala dan giginya.",
    ],
    priceNotes:
      "Harga dasar sudah termasuk ongkos pasang. Harga resleting bergantung pada panjang, bahan (plastik, logam, atau waterproof), dan mereknya, sehingga total biaya dikonfirmasi setelah pemeriksaan.",
  },
  aksesoris: {
    steps: [
      { title: "Pencocokan aksesoris", description: "Kami mencocokkan ukuran, model, dan warna kancing atau aksesoris dengan pakaianmu." },
      { title: "Pelepasan bagian lama", description: "Aksesoris lama dilepas bila perlu, tanpa meninggalkan lubang atau bekas di kain." },
      { title: "Pemasangan", description: "Aksesoris baru dipasang dengan jahitan kuat dan posisi yang sejajar." },
      { title: "Pengecekan", description: "Kami memastikan aksesoris terpasang kokoh dan berfungsi dengan baik." },
    ],
    tips: [
      "Bawa kancing atau aksesoris pilihanmu sendiri agar cocok dengan selera.",
      "Kalau tidak ada, kami bantu carikan yang paling mendekati.",
      "Kirim foto bagian yang ingin dipasangi aksesoris.",
    ],
    priceNotes:
      "Harga dasar dihitung per pakaian. Bila jumlah kancing banyak atau bahannya tebal, biaya bisa menyesuaikan. Harga pasti dikonfirmasi sebelum dikerjakan.",
  },
};

const genericFaqs: ServiceFaq[] = [
  {
    question: "Apakah harga bisa berubah setelah pakaian diperiksa?",
    answer:
      "Harga yang tampil adalah perkiraan awal. Setelah pakaian kami periksa, harga pasti dikonfirmasi lebih dulu dan pengerjaan hanya dimulai setelah kamu setuju.",
  },
  {
    question: "Bagaimana cara memantau pesanan saya?",
    answer:
      "Setelah pesanan dibuat kamu mendapat nomor pesanan. Masukkan nomor itu di halaman Lacak Pesanan untuk melihat tahap pengerjaan terbaru.",
  },
  {
    question: "Bagaimana kalau hasilnya tidak sesuai?",
    answer:
      "Jika ada ketidaksesuaian dari hasil kerja kami, kami perbaiki ulang tanpa biaya tambahan.",
  },
];

/* ------------------------------------------------------------------ */
/* Teks bawaan per layanan (kunci = id layanan)                        */
/* ------------------------------------------------------------------ */

const serviceDefaults: Record<string, Partial<ServiceDetails>> = {
  "permak-potong-celana": {
    longDescription:
      "Layanan potong celana untuk menyesuaikan panjang celana dengan tinggi badan dan model sepatu yang biasa kamu pakai. Cocok untuk celana kerja, celana jeans, celana kain, maupun seragam.\n\nKami menjaga bentuk dan detail bawaan celana. Untuk jeans, kami bisa mempertahankan bekas jahitan asli di ujung kaki (original hem) bila diminta, sehingga hasilnya tetap terlihat seperti dari pabrik.",
    includes: [
      "Pengukuran panjang celana langsung atau sesuai ukuran yang kamu kirim",
      "Pemotongan dan penjahitan ulang bagian ujung kaki",
      "Pilihan hem biasa atau mempertahankan hem asli (khusus jeans)",
      "Penyetrikaan dan pengecekan akhir",
    ],
    tips: [
      "Pakai celana dan sepatu yang biasa kamu kenakan saat foto atau saat mengukur.",
      "Tulis panjang yang diinginkan dari pinggang atau dari selangkangan sampai mata kaki.",
      "Untuk jeans yang akan menyusut, cuci dulu sebelum dipotong.",
    ],
    faqs: [
      { question: "Apakah bisa mempertahankan jahitan asli jeans?", answer: "Bisa. Pilih opsi original hem di kolom catatan. Biaya bisa sedikit lebih tinggi karena teknik jahitnya lebih rumit." },
      { question: "Apakah celana bisa dipanjangkan lagi nanti?", answer: "Hanya jika kain lipatan di bagian dalam masih cukup. Kami sarankan memotong tidak lebih pendek dari yang benar-benar diperlukan." },
    ],
  },
  "permak-kecilkan-baju": {
    longDescription:
      "Kecilkan baju yang terlalu longgar di bagian badan, pinggang, lengan, atau bahu agar jatuhnya pas di badan. Cocok untuk kemeja, kaos, blouse, gamis, dan dress.\n\nKami memperhatikan proporsi pakaian supaya motif, saku, dan kerah tetap simetris setelah diperkecil. Untuk pakaian bermotif garis atau kotak, kami usahakan pola tetap menyambung.",
    includes: [
      "Penandaan bagian yang akan dikecilkan pada saat pemeriksaan",
      "Pembongkaran dan penjahitan ulang sesuai ukuran baru",
      "Penyesuaian lengan, samping badan, atau pinggang",
      "Finishing rapi dan penyetrikaan",
    ],
    tips: [
      "Kirim foto saat baju dipakai dari depan, samping, dan belakang.",
      "Sebutkan bagian mana yang terasa terlalu longgar.",
      "Baju berbahan tipis atau berenda butuh waktu lebih lama, sebutkan di catatan.",
    ],
    faqs: [
      { question: "Berapa ukuran maksimal yang bisa dikecilkan?", answer: "Umumnya 1 sampai 2 ukuran. Lebih dari itu perlu dilihat langsung agar bentuk pakaian tidak berubah." },
      { question: "Apakah baju bermotif bisa dikecilkan?", answer: "Bisa. Kami usahakan motif tetap menyambung, tetapi untuk motif rumit hasil terbaik didapat lewat pemeriksaan langsung." },
    ],
  },
  "permak-besarkan-pakaian": {
    longDescription:
      "Besarkan pakaian yang sudah sempit dengan memanfaatkan sisa kain di lipatan jahitan atau menyisipkan kain tambahan yang serasi. Cocok untuk celana, rok, kemeja, dan pakaian yang ukurannya berubah karena badan bertambah besar.\n\nBatas pembesaran bergantung pada sisa kain di dalam jahitan. Karena itu kami selalu memeriksa lebih dulu dan menjelaskan seberapa besar pakaian bisa dilonggarkan sebelum dikerjakan.",
    includes: [
      "Pemeriksaan sisa kain pada lipatan jahitan",
      "Pelonggaran jahitan atau penyisipan kain pelengkap",
      "Pemilihan kain tambahan dengan warna dan tekstur serasi",
      "Finishing dan pengecekan kenyamanan",
    ],
    tips: [
      "Sebutkan berapa cm atau berapa ukuran yang ingin ditambah.",
      "Kirim foto bagian dalam jahitan supaya sisa kain terlihat.",
      "Bila punya sisa kain asli pakaian, sertakan saat mengirim.",
    ],
    faqs: [
      { question: "Apakah semua pakaian bisa dibesarkan?", answer: "Tidak selalu. Bila sisa kain di jahitan terlalu sedikit, kami akan menawarkan penyisipan kain atau menyarankan opsi lain sebelum dikerjakan." },
    ],
  },
  "permak-jas": {
    longDescription:
      "Permak jas dengan ketelitian tinggi untuk jas formal, jas almamater, maupun jas pernikahan. Kami menangani panjang lengan, lebar badan, bahu, pinggang, sampai celana jas agar potongannya terlihat rapi dan nyaman dipakai.\n\nJas memiliki lapisan dalam dan bahan pelapis, sehingga proses permaknya lebih rumit dibanding pakaian biasa. Karena itu kami mengerjakannya bertahap dan menyediakan waktu pengerjaan yang lebih longgar.",
    includes: [
      "Konsultasi bagian jas yang perlu disesuaikan",
      "Permak lengan, badan, pinggang, atau panjang jas",
      "Permak celana atau rok bagian dari setelan",
      "Fitting ulang bila diperlukan dan penyetrikaan profesional",
    ],
    tips: [
      "Bawa atau kirim jas beserta kemeja yang akan dipakai bersamanya.",
      "Beri tahu tanggal acara agar jadwal pengerjaan bisa disesuaikan.",
      "Sebutkan bila ingin bagian tertentu diubah saja, misalnya hanya panjang lengan.",
    ],
    faqs: [
      { question: "Berapa lama permak jas?", answer: "Rata-rata 3 sampai 5 hari kerja, tergantung bagian yang diubah. Bila ada acara mendesak, sebutkan tanggalnya saat memesan." },
      { question: "Apakah lengan jas bisa dipendekkan?", answer: "Bisa, selama lengan tidak memiliki kancing hiasan yang terlalu banyak. Bila ada, kami atur ulang letaknya agar tetap proporsional." },
    ],
  },
  "permak-jaket": {
    longDescription:
      "Ubah ukuran jaket sesuai bentuk badan tanpa merusak desain aslinya. Cocok untuk jaket kulit sintetis, jaket jeans, bomber, parka, dan jaket kain lainnya.\n\nJaket biasanya punya lapisan dalam dan resleting sehingga kami membongkarnya dengan hati-hati. Bagian yang umum disesuaikan adalah panjang lengan, lebar badan, dan panjang jaket.",
    includes: [
      "Pengukuran ulang lengan, badan, dan panjang jaket",
      "Pembongkaran lapisan dalam bila diperlukan",
      "Penjahitan ulang dengan benang yang sesuai bahan",
      "Pengecekan resleting dan finishing",
    ],
    tips: [
      "Foto jaket saat dipakai dan tandai bagian yang ingin diubah.",
      "Bahan tebal seperti kulit atau parka bisa memakan waktu lebih lama.",
      "Sebutkan bila ada detail yang tidak boleh diubah, misalnya logo atau bordir.",
    ],
    faqs: [
      { question: "Apakah jaket kulit bisa dipermak?", answer: "Bisa untuk beberapa bagian, tetapi lubang bekas jarum pada kulit tidak bisa hilang. Kami jelaskan risikonya saat pemeriksaan." },
    ],
  },
  "reparasi-jahit-sobekan": {
    longDescription:
      "Jahit sobekan pada pakaian dengan teknik yang menyembunyikan bekas perbaikan sebisa mungkin. Cocok untuk sobekan di samping, ketiak, selangkangan, saku, atau bagian kain lain.\n\nSobekan yang ditangani sejak awal biasanya lebih mudah diperbaiki dan hasilnya lebih rapi. Karena itu, sebaiknya pakaian segera dikirim sebelum sobekan melebar.",
    includes: [
      "Pemeriksaan arah dan ukuran sobekan",
      "Penjahitan dengan benang yang warnanya mendekati kain",
      "Penguatan area sekitar sobekan bila perlu",
      "Penyetrikaan dan pengecekan",
    ],
    tips: [
      "Foto sobekan dari dekat dan dari jauh.",
      "Jangan dijahit sendiri dengan lem atau isolasi kain karena akan menyulitkan perbaikan.",
      "Sebutkan bila pakaian sering dipakai di area yang sama agar kami memperkuat jahitannya.",
    ],
    faqs: [
      { question: "Apakah sobekan di tengah kain bisa diperbaiki?", answer: "Bisa, dengan jahitan tersembunyi atau ditambal dari dalam. Hasilnya bergantung pada jenis kain, dan kami jelaskan hasil akhirnya lebih dulu." },
    ],
  },
  "reparasi-tambal-pakaian": {
    longDescription:
      "Tambal bagian pakaian yang bolong atau menipis dengan kain patch yang sesuai. Cocok untuk lutut celana jeans, siku jaket, kaos yang berlubang, dan pakaian anak.\n\nKami menyediakan pilihan patch tersembunyi dari sisi dalam, atau patch yang tampak sebagai hiasan. Pilih sesuai selera, dan kami bantu tentukan yang paling kuat untuk bahan pakaianmu.",
    includes: [
      "Pemilihan kain patch yang cocok warna dan teksturnya",
      "Penambalan dari sisi dalam atau luar sesuai pilihan",
      "Penguatan tepi tambalan agar tidak mudah lepas",
      "Finishing dan pengecekan",
    ],
    tips: [
      "Kirim foto lubang dan sebutkan apakah ingin tambalan tersembunyi atau terlihat.",
      "Bila punya kain patch sendiri, sertakan saat mengirim.",
      "Lubang di area lipatan seperti lutut membutuhkan tambalan yang lebih kuat.",
    ],
    faqs: [
      { question: "Apakah tambalan akan terlihat?", answer: "Untuk tambalan tersembunyi, bekasnya kecil tetapi tetap ada. Bila ingin lebih tampil rapi, kami sarankan patch dekoratif." },
    ],
  },
  "reparasi-perbaikan-jahitan": {
    longDescription:
      "Perbaiki jahitan yang lepas, renggang, atau tidak rata agar pakaian kembali kuat dan rapi. Cocok untuk jahitan samping, bahu, lengan, ujung celana, dan kelim.\n\nKami menjahit ulang mengikuti jalur jahitan asli dengan benang yang lebih kuat sehingga perbaikannya awet dan tidak mengubah bentuk pakaian.",
    includes: [
      "Pemeriksaan seluruh jahitan di area sekitar",
      "Penjahitan ulang mengikuti jalur jahitan asli",
      "Penggunaan benang yang kuat dan warnanya serasi",
      "Pengecekan akhir",
    ],
    tips: [
      "Tandai semua jahitan yang lepas agar tidak ada yang terlewat.",
      "Kirim foto bagian jahitan yang bermasalah.",
      "Bila banyak jahitan yang lepas, sebutkan agar perkiraan biaya lebih akurat.",
    ],
    faqs: [
      { question: "Apakah jahitan lain ikut diperiksa?", answer: "Ya, kami cek area di sekitarnya dan memberi tahu bila ada jahitan lain yang mulai lemah." },
    ],
  },
  "resleting-celana": {
    longDescription:
      "Ganti resleting celana yang macet, rusak, atau giginya lepas dengan resleting baru yang ukuran dan kualitasnya sesuai aslinya. Cocok untuk celana jeans, celana kain, dan celana kerja.\n\nKami mengganti seluruh resleting, bukan hanya kepalanya, supaya tahan lama. Untuk jeans, tersedia resleting logam yang lebih kuat.",
    includes: [
      "Resleting baru sesuai panjang dan jenis celana",
      "Pelepasan resleting lama tanpa merusak kain",
      "Pemasangan lurus dan rata",
      "Uji buka-tutup dan finishing",
    ],
    tips: [
      "Foto bagian depan celana dan resleting yang rusak.",
      "Sebutkan bila ingin warna resleting tertentu.",
      "Celana jeans tebal butuh jarum dan benang khusus, jadi sebutkan bahannya.",
    ],
    faqs: [
      { question: "Apakah hanya kepala resleting yang bisa diganti?", answer: "Bisa untuk beberapa kasus, tetapi kami umumnya menyarankan ganti resleting utuh karena hasilnya lebih awet." },
    ],
  },
  "resleting-jaket": {
    longDescription:
      "Ganti resleting jaket dengan presisi tinggi, termasuk untuk jaket tebal, jaket gunung, dan jaket berlapis. Resleting jaket lebih panjang dan sering putus di bagian bawah, sehingga pemasangannya perlu rapi agar jaket tetap simetris.\n\nKami mencocokkan ukuran dan jenis resleting dengan jaket aslinya, baik yang terbuka penuh maupun yang tertutup satu arah.",
    includes: [
      "Resleting baru sesuai panjang dan jenis jaket",
      "Pembongkaran lapisan dalam dan kerah bila perlu",
      "Pemasangan simetris dan rata di kedua sisi",
      "Uji buka-tutup dan finishing",
    ],
    tips: [
      "Ukur panjang resleting dari atas sampai bawah atau kirim foto lengkap jaket.",
      "Sebutkan apakah resleting terbuka penuh (dua arah) atau satu arah.",
      "Jaket berlapis bulu atau busa membutuhkan waktu lebih lama.",
    ],
    faqs: [
      { question: "Apakah resleting jaket bisa diganti tanpa mengubah tampilan?", answer: "Bisa. Kami memakai resleting dengan ukuran dan warna semirip mungkin, dan mempertahankan posisi jahitan aslinya." },
    ],
  },
  "resleting-tas": {
    longDescription:
      "Ganti resleting tas ransel, koper, atau tas jinjing dengan pemasangan yang kuat. Resleting tas menahan beban lebih besar dibanding pakaian sehingga kami memakai resleting yang lebih tebal dan jahitan yang diperkuat.\n\nBeberapa tas memiliki lapisan busa atau bahan tebal. Kami menyesuaikan teknik jahitnya supaya resleting tetap rata dan mulus.",
    includes: [
      "Resleting baru sesuai panjang dan ketebalan tas",
      "Pelepasan resleting lama termasuk lapisan pelindung",
      "Pemasangan dengan jahitan yang diperkuat",
      "Uji beban buka-tutup",
    ],
    tips: [
      "Kosongkan seluruh isi tas sebelum dikirim.",
      "Foto resleting yang rusak dan sebutkan panjangnya bila tahu.",
      "Untuk koper, sebutkan merek karena ukuran gigi resleting berbeda.",
    ],
    faqs: [
      { question: "Apakah koper bisa dikerjakan?", answer: "Bisa untuk koper kain. Koper keras dengan rangka tertentu perlu diperiksa dulu sebelum kami pastikan." },
    ],
  },
  "aksesoris-pasang-kancing": {
    longDescription:
      "Pasang kancing baru pada pakaian yang kancingnya hilang atau ingin ditambah. Cocok untuk kemeja, jaket, celana, dan cardigan.\n\nKami mencocokkan ukuran, model, dan warna kancing dengan pakaianmu. Jahitan dibuat kuat agar kancing tidak mudah lepas lagi.",
    includes: [
      "Pencocokan kancing dengan pakaian",
      "Pemasangan kancing dengan jahitan kuat",
      "Pengecekan posisi dan lubang kancing",
    ],
    tips: [
      "Bawa kancing cadangan bila punya. Kancing cadangan biasanya terselip di label atau kantong kecil pakaian.",
      "Bila tidak ada, kirim foto kancing lain di pakaian yang sama.",
      "Sebutkan berapa kancing yang perlu dipasang.",
    ],
    faqs: [
      { question: "Apakah kancing sudah termasuk harga?", answer: "Harga dasar untuk ongkos pasang. Kancing baru bisa kami sediakan dengan biaya terpisah bila kamu tidak membawa sendiri." },
    ],
  },
  "aksesoris-ganti-kancing": {
    longDescription:
      "Lepas kancing lama dan ganti dengan kancing baru pilihanmu, misalnya karena kancing rusak, pecah, atau ingin mengubah tampilan pakaian.\n\nCocok untuk mengganti seluruh kancing kemeja, kancing jaket, atau mengganti kancing jeans. Untuk kancing jeans, kami memakai kancing tekan yang kuat.",
    includes: [
      "Pelepasan kancing lama tanpa merusak kain",
      "Pemasangan kancing baru sesuai pilihan",
      "Pengecekan lubang kancing dan kekuatan jahitan",
      "Pilihan kancing pengganti yang kami sediakan",
    ],
    tips: [
      "Tentukan model dan warna kancing yang diinginkan sebelum dikerjakan.",
      "Pastikan ukuran kancing baru sesuai lubang kancing yang ada.",
      "Bila ingin mengganti semua kancing, sebutkan jumlahnya di catatan.",
    ],
    faqs: [
      { question: "Apakah kancing jeans bisa diganti?", answer: "Bisa. Kami menggunakan kancing tekan logam yang dipasang dengan alat khusus sehingga kuat dan rapi." },
    ],
  },
};

/* ------------------------------------------------------------------ */
/* Gabungkan data layanan + detail (database > bawaan layanan > kategori) */
/* ------------------------------------------------------------------ */

const notEmpty = (v: unknown): boolean =>
  Array.isArray(v) ? v.length > 0 : typeof v === "string" ? v.trim().length > 0 : v != null;

function pick<K extends keyof ServiceDetails>(
  key: K,
  raw: Partial<ServiceDetails>,
  id: string,
  category: Service["category"]
): ServiceDetails[K] {
  const fromRaw = raw[key];
  if (notEmpty(fromRaw)) return fromRaw as ServiceDetails[K];
  const fromService = serviceDefaults[id]?.[key];
  if (notEmpty(fromService)) return fromService as ServiceDetails[K];
  const fromCategory = categoryDefaults[category]?.[key];
  if (notEmpty(fromCategory)) return fromCategory as ServiceDetails[K];
  return (key === "faqs" ? genericFaqs : key === "longDescription" || key === "priceNotes" ? "" : []) as ServiceDetails[K];
}

export function withDetails(base: Service, raw: Partial<ServiceDetails> = {}): ServiceFull {
  const detail: ServiceDetails = {
    longDescription: pick("longDescription", raw, base.id, base.category) || base.description,
    includes: pick("includes", raw, base.id, base.category),
    steps: pick("steps", raw, base.id, base.category),
    tips: pick("tips", raw, base.id, base.category),
    priceNotes: pick("priceNotes", raw, base.id, base.category),
    faqs: pick("faqs", raw, base.id, base.category),
  };
  return { ...base, ...detail };
}

/* ------------------------------------------------------------------ */
/* Pembersih data dari database / form admin                           */
/* ------------------------------------------------------------------ */

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export function cleanList(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map(str).filter(Boolean).slice(0, 30);
}
export function cleanSteps(v: unknown): ServiceStep[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x: any) => ({ title: str(x?.title), description: str(x?.description) }))
    .filter((x) => x.title)
    .slice(0, 20);
}
export function cleanFaqs(v: unknown): ServiceFaq[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x: any) => ({ question: str(x?.question), answer: str(x?.answer) }))
    .filter((x) => x.question && x.answer)
    .slice(0, 20);
}

/* ------------------------------------------------------------------ */
/* Konversi teks <-> data untuk form admin                             */
/* ------------------------------------------------------------------ */

export const listToText = (list: string[]) => list.join("\n");
export const textToList = (text: string) => cleanList(text.split("\n"));

function pairsToText(rows: [string, string][]) {
  return rows.map(([a, b]) => `${a} | ${b}`).join("\n");
}
function textToPairs(text: string): [string, string][] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const i = line.indexOf("|");
      return i === -1 ? [line, ""] : [line.slice(0, i).trim(), line.slice(i + 1).trim()];
    }) as [string, string][];
}

export const stepsToText = (steps: ServiceStep[]) =>
  pairsToText(steps.map((s) => [s.title, s.description]));
export const textToSteps = (text: string): ServiceStep[] =>
  textToPairs(text).map(([title, description]) => ({ title, description }));

export const faqsToText = (faqs: ServiceFaq[]) =>
  pairsToText(faqs.map((f) => [f.question, f.answer]));
export const textToFaqs = (text: string): ServiceFaq[] =>
  textToPairs(text).map(([question, answer]) => ({ question, answer }));