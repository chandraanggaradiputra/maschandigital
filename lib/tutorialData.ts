import { TutorialModule, TutorialChapter } from "@/types/tutorial";

export interface TutorialStep {
  title: string;
  description: string;
}

export interface TutorialItem {
  id: string;
  title: string;
  summary: string;
  category: "PWA & Notifikasi" | "Katalog & Testimoni" | "Penjualan & WhatsApp" | "Akun & Langganan";
  iconName: string;
  badge?: string;
  steps: TutorialStep[];
}

export const tutorialCategories = [
  "Semua Panduan",
  "PWA & Notifikasi",
  "Katalog & Testimoni",
  "Penjualan & WhatsApp",
  "Akun & Langganan",
] as const;

export const tutorialData: TutorialItem[] = [
  // -------------------------------------------------------------
  // KATEGORI: PWA & NOTIFIKASI MOBILE
  // -------------------------------------------------------------
  {
    id: "pwa-install-guide",
    title: "Cara Memasang Aplikasi Mas Chan Digital di HP Android (PWA)",
    summary:
      "Pasang aplikasi Mas Chan Digital langsung ke layar utama ponsel Anda tanpa perlu membuka browser secara manual.",
    category: "PWA & Notifikasi",
    iconName: "Smartphone",
    badge: "Fitur Baru",
    steps: [
      {
        title: "1. Buka Website di Ponsel",
        description:
          "Buka situs resmi https://maschandigital.id menggunakan peramban Google Chrome atau Brave di ponsel Android Anda.",
      },
      {
        title: "2. Ketuk Banner 'Pasang Mas Chan Digital'",
        description:
          "Tunggu sejenak hingga muncul banner mengambang di layar ponsel Anda bertuliskan 'Pasang Mas Chan Digital', lalu ketuk tombol biru 'Pasang'.",
      },
      {
        title: "3. Alternatif Menu Peramban",
        description:
          "Jika banner tidak muncul, ketuk tanda titik tiga (⋮) di pojok kanan atas browser Anda, lalu pilih opsi 'Tambahkan ke Layar Utama' atau 'Instal Aplikasi'.",
      },
      {
        title: "4. Akses Instan dari Layar Utama",
        description:
          "Ikon aplikasi Mas Chan Digital akan otomatis muncul di layar beranda ponsel Anda dan siap digunakan layaknya aplikasi Android resmi tanpa bilah browser.",
      },
    ],
  },
  {
    id: "web-push-activation-guide",
    title: "Cara Mengaktifkan Notifikasi Web Push di Smartphone",
    summary:
      "Dapatkan notifikasi bergetar dan bersuara seketika saat ada pemberitahuan penting, info ulasan disetujui, atau pembaruan toko.",
    category: "PWA & Notifikasi",
    iconName: "Bell",
    badge: "Penting",
    steps: [
      {
        title: "1. Buka Aplikasi di Ponsel",
        description:
          "Buka Mas Chan Digital dari ikon layar utama ponsel Anda atau peramban smartphone.",
      },
      {
        title: "2. Setujui Izin Notifikasi",
        description:
          "Saat muncul kotak dialog kecil 'Aktifkan Notifikasi Mas Chan Digital' di bagian atas layar, ketuk tombol 'Ya' dan pilih 'Izinkan' (Allow) pada peramban.",
      },
      {
        title: "3. Notifikasi Aktif Secara Otomatis",
        description:
          "Ponsel Anda kini telah terdaftar. Anda akan menerima notifikasi langsung di bilah status Android setiap kali testimoni produk Anda disetujui atau saat ada pesan penting dari Admin.",
      },
    ],
  },

  // -------------------------------------------------------------
  // KATEGORI: KATALOG & TESTIMONI PELANGGAN
  // -------------------------------------------------------------
  {
    id: "submit-customer-testimonials",
    title: "Cara Memasukkan Testimoni Pelanggan Setia ke Halaman Produk",
    summary:
      "Bawa ulasan nyata pelanggan dari chat WhatsApp atau transaksi offline Anda ke halaman produk untuk meningkatkan kepercayaan pembeli baru.",
    category: "Katalog & Testimoni",
    iconName: "MessageSquareQuote",
    badge: "Unggulan",
    steps: [
      {
        title: "1. Masuk ke Dasbor Produk Toko",
        description:
          "Login ke akun vendor Anda, buka menu Dasbor, lalu pilih 'Kelola Produk' (/dashboard/products).",
      },
      {
        title: "2. Pilih Produk & Klik Edit",
        description:
          "Pilih produk yang ingin ditambahkan ulasannya, lalu klik tombol 'Edit' untuk membuka formulir produk.",
      },
      {
        title: "3. Buka Bagian 'Testimoni & Kepuasan Pelanggan'",
        description:
          "Gulir ke bagian bawah halaman di bawah formulir produk utama, lalu ketuk tombol '+ Ajukan Testimoni Baru'.",
      },
      {
        title: "4. Isi Data Ulasan Pelanggan",
        description:
          "Pilih bintang kepuasan (1–5 bintang), masukkan Nama Pelanggan beserta asal daerahnya (misal: Ibu Hj. Maryam - Kasemen, Serang), dan ketik kutipan testimoni asli dari pelanggan setia Anda.",
      },
      {
        title: "5. Moderasi Super Admin & Terbit Resmi",
        description:
          "Klik 'Ajukan Testimoni'. Ulasan akan berstatus Pending dan langsung diperiksa oleh Super Admin. Setelah disetujui, testimoni langsung tayang di halaman produk lengkap dengan bintang emas ulasan Google!",
      },
    ],
  },
  {
    id: "upload-products-guide",
    title: "Panduan Mengunggah Produk Fisik & Digital",
    summary:
      "Tata cara menambahkan katalog dagangan UMKM, foto produk berkualitas, deskripsi menarik, dan penetapan harga resmi.",
    category: "Katalog & Testimoni",
    iconName: "PackagePlus",
    steps: [
      {
        title: "1. Buka Menu Tambah Produk",
        description:
          "Masuk ke Dasbor Vendor dan klik tombol '+ Tambah Produk Baru' (/dashboard/products/new).",
      },
      {
        title: "2. Unggah Foto Produk Berkualitas",
        description:
          "Unggah foto produk yang jelas dan terang (format JPG, PNG, atau JFIF). Foto yang menarik terbukti melipatgandakan minat klik pembeli.",
      },
      {
        title: "3. Tentukan Judul, Kategori & Harga Resmi",
        description:
          "Gunakan judul produk yang mudah dicari (misal: Madu Akasia Murni 500gr), pilih kategori yang cocok, dan cantumkan harga asli tanpa manipulasi.",
      },
      {
        title: "4. Tulis Deskripsi Sesuai Kaidah Syariat",
        description:
          "Jelaskan spesifikasi, keunggulan, dan kondisi barang secara jujur dan transparan untuk menjauhi unsur ketidakjelasan (tadlis) dalam perniagaan.",
      },
    ],
  },
  {
    id: "variable-products-guide",
    title: "Panduan Menjual Produk Variasi (Ukuran, Rasa, & Bobot)",
    summary:
      "Hemat kuota etalase toko Anda dengan menyatukan opsi ukuran, pilihan rasa, atau bobot dalam satu halaman produk tunggal yang profesional.",
    category: "Katalog & Testimoni",
    iconName: "Layers",
    badge: "Fitur Baru",
    steps: [
      {
        title: "1. Aktifkan Opsi Produk Variasi",
        description:
          "Saat mengisi atau mengedit produk di formulir dasbor (/dashboard/products/new), centang toggle 'Produk Variasi (Multi Varian)'.",
      },
      {
        title: "2. Masukkan Pilihan Varian & Harga",
        description:
          "Tambahkan minimal 2 variasi (contoh: '250 Gram' seharga Rp 35.000 dan '500 Gram' seharga Rp 65.000). Atur nama varian, harga satuan, dan ketersediaan stok masing-masing.",
      },
      {
        title: "3. Tampilan Cerdas di Etalase & Pesanan WhatsApp",
        description:
          "Setelah disimpan, kartu produk di etalase toko Anda otomatis menyajikan rentang harga pintar (misal: 'Rp 35.000 - Rp 65.000'). Pembeli dapat memilih varian secara instan saat memesan via WhatsApp.",
      },
    ],
  },
  {
    id: "service-commerce-guide",
    title: "Panduan Layanan Jasa & Keahlian Lokal Kota Serang",
    summary:
      "Daftarkan jasa servis AC, instalasi kanopi, konsultasi legalitas, atau reparasi komputer dengan skema tarif transparan dan jangkauan wilayah kecamatan.",
    category: "Katalog & Testimoni",
    iconName: "Wrench",
    badge: "Layanan Jasa",
    steps: [
      {
        title: "1. Pilih Mode Layanan Jasa & Keahlian",
        description:
          "Pada bagian awal formulir produk, pilih opsi '🛠️ Layanan Jasa & Keahlian'. Formulir akan beradaptasi secara otomatis dan mengunci kategori utama ke 'Layanan Jasa'.",
      },
      {
        title: "2. Tentukan Skema Tarif & Tombol WhatsApp",
        description:
          "Pilih model tarif yang sesuai: Mulai Dari (Starting At), Konsultasi / Survei, atau Tarif Tetap. Tentukan tombol Call-to-Action WhatsApp (Panggil Teknisi, Reservasi Jadwal, atau Konsultasi Kebutuhan).",
      },
      {
        title: "3. Tentukan Cakupan Wilayah Kecamatan",
        description:
          "Pilih kecamatan yang Anda jangkau di Kota Serang. Toko dengan Paket Starter mencakup 1 kecamatan domisili toko Anda, sedangkan Paket Langganan Berbayar dapat menjangkau seluruh 6 kecamatan Kota Serang.",
      },
    ],
  },

  // -------------------------------------------------------------
  // KATEGORI: PENJUALAN & WHATSAPP
  // -------------------------------------------------------------
  {
    id: "direct-whatsapp-orders",
    title: "Cara Melayani Pesanan & Chat Pembeli via WhatsApp (0% Fee)",
    summary:
      "Pahami bagaimana calon pembeli menghubungi toko Anda langsung via drawer chat dan mengirimkan rincian pesanan otomatis ke WhatsApp Anda.",
    category: "Penjualan & WhatsApp",
    iconName: "MessageCircle",
    badge: "0% Potongan",
    steps: [
      {
        title: "1. Pastikan Nomor WhatsApp Profil Toko Aktif",
        description:
          "Pastikan nomor WhatsApp yang Anda daftarkan di Profil Toko (/dashboard/profile) selalu aktif dan menggunakan format resmi Indonesia (contoh: 082298148474).",
      },
      {
        title: "2. Fitur 'Tanya Penjual' Mengambang",
        description:
          "Di halaman produk dan profil toko Anda, calon pembeli dapat mengetuk tombol hijau mengambang untuk memilih pertanyaan cepat atau mengetik pesan langsung yang otomatis terhubung ke WhatsApp Anda.",
      },
      {
        title: "3. Menerima Rincian Pesanan Instan",
        description:
          "Ketika pembeli menekan tombol 'Lengkapi Pesanan', mereka akan mengisi nama, pilihan kurir lokal/COD, dan kecamatan di Kota Serang. Rincian ini otomatis tersusun menjadi format pesan rapi di WhatsApp Anda.",
      },
      {
        title: "4. Transaksi 100% Keuntungan Toko",
        description:
          "Seluruh pembayaran dari pembeli langsung ditransfer ke rekening toko Anda atau dibayar tunai saat COD. Mas Chan Digital tidak memotong komisi transaksi sepeser pun (0% gateway fee).",
      },
    ],
  },

  // -------------------------------------------------------------
  // KATEGORI: AKUN & LANGGANAN
  // -------------------------------------------------------------
  {
    id: "vendor-registration-setup",
    title: "Cara Mendaftar & Mengatur Identitas Toko UMKM",
    summary:
      "Langkah awal bergabung menjadi mitra resmi Mas Chan Digital untuk menjangkau ribuan konsumen di 6 kecamatan Kota Serang.",
    category: "Akun & Langganan",
    iconName: "Store",
    steps: [
      {
        title: "1. Buka Halaman Daftar Toko",
        description:
          "Akses menu 'Daftar Toko' (/register) dan lengkapi nama toko, email aktif, nama pemilik, dan nomor WhatsApp bisnis Anda.",
      },
      {
        title: "2. Paket Starter UMKM Gratis Selamanya",
        description:
          "Setiap mitra baru langsung mendapatkan Paket Starter UMKM (kuota 3 produk) secara Gratis Selamanya tanpa syarat biaya bulanan.",
      },
      {
        title: "3. Lengkapi Alamat & Titik Temu di Kota Serang",
        description:
          "Di menu profil toko, cantumkan kelurahan dan kecamatan (Serang, Cipocok Jaya, Kasemen, Taktakan, Curug, atau Walantaka) agar pembeli mudah memilih opsi pengiriman lokal.",
      },
    ],
  },
  {
    id: "subscription-billing-guide",
    title: "Cara Upgrade Paket Langganan & Konfirmasi 4 E-Wallet",
    summary:
      "Panduan menambah kuota produk toko hingga tak terbatas (Unlimited) melalui pembayaran transfer E-Wallet resmi.",
    category: "Akun & Langganan",
    iconName: "CreditCard",
    steps: [
      {
        title: "1. Buka Menu Tagihan & Paket",
        description:
          "Masuk ke menu Dasbor Toko dan pilih halaman 'Langganan & Tagihan' (/dashboard/billing).",
      },
      {
        title: "2. Pilih Paket yang Dibutuhkan",
        description:
          "Pilih paket sesuai kebutuhan kuota Anda (Bulanan, 3 Bulan, 6 Bulan Unlimited, atau 1 Tahun VIP Unlimited).",
      },
      {
        title: "3. Transfer ke 4 E-Wallet Resmi",
        description:
          "Lakukan transfer nominal sesuai invoice ke nomor resmi 0822-9814-8474 a.n. Chandra Anggara Diputra (tersedia DANA, OVO, GoPay, dan ShopeePay).",
      },
      {
        title: "4. Unggah Bukti Struk & Konfirmasi",
        description:
          "Unggah foto struk transfer di halaman billing dan klik konfirmasi. Admin akan segera memverifikasi dan masa aktif toko Anda otomatis bertambah.",
      },
    ],
  },
];

// -------------------------------------------------------------
// ADAPTER MODUL UNTUK LMS /PANDUAN & /PANDUAN/[SLUG]
// -------------------------------------------------------------
const categoryConfig: Record<
  TutorialItem["category"],
  { moduleNumber: number; title: string; description: string; iconName: string }
> = {
  "PWA & Notifikasi": {
    moduleNumber: 1,
    title: "PWA & Notifikasi Mobile",
    description:
      "Panduan memasang aplikasi Mas Chan Digital di ponsel Android dan mengaktifkan notifikasi Web Push bergetar seketika.",
    iconName: "Smartphone",
  },
  "Katalog & Testimoni": {
    moduleNumber: 2,
    title: "Katalog & Testimoni Pelanggan",
    description:
      "Tata cara mengunggah foto produk berkualitas dan memasukkan testimoni asli pembeli setia ke etalase online Anda.",
    iconName: "MessageSquareQuote",
  },
  "Penjualan & WhatsApp": {
    moduleNumber: 3,
    title: "Penjualan & Direct WhatsApp (0% Fee)",
    description:
      "Panduan melayani pembeli langsung via drawer chat WhatsApp dan menerima rincian pesanan otomatis tanpa komisi.",
    iconName: "MessageCircle",
  },
  "Akun & Langganan": {
    moduleNumber: 4,
    title: "Akun, Profil & Langganan Toko",
    description:
      "Langkah registrasi toko, pengaturan profil UMKM di Kota Serang, dan panduan upgrade paket langganan via E-Wallet.",
    iconName: "Store",
  },
};

export const TUTORIAL_MODULES: TutorialModule[] = (
  [
    "PWA & Notifikasi",
    "Katalog & Testimoni",
    "Penjualan & WhatsApp",
    "Akun & Langganan",
  ] as const
).map((category) => {
  const config = categoryConfig[category];
  const items = tutorialData.filter((item) => item.category === category);

  return {
    id: `modul-${config.moduleNumber}-${category.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
    moduleNumber: config.moduleNumber,
    title: config.title,
    description: config.description,
    iconName: config.iconName,
    chapters: items.map((item) => ({
      slug: item.id,
      title: item.title,
      shortDescription: item.summary,
      estimatedMinutes: 3,
      content: {
        overview: item.summary,
        steps: item.steps.map((s) => ({
          title: s.title,
          description: s.description,
        })),
        proTip:
          item.badge === "0% Potongan"
            ? "Seluruh transaksi dari WhatsApp langsung masuk ke rekening atau e-wallet toko Anda tanpa potongan komisi sepeser pun."
            : undefined,
      },
    })),
  };
});

export function getAllTutorialChapters(): (TutorialChapter & {
  moduleTitle: string;
  moduleId: string;
  moduleNumber: number;
})[] {
  const list: (TutorialChapter & {
    moduleTitle: string;
    moduleId: string;
    moduleNumber: number;
  })[] = [];

  for (const mod of TUTORIAL_MODULES) {
    for (const ch of mod.chapters) {
      list.push({
        ...ch,
        moduleTitle: mod.title,
        moduleId: mod.id,
        moduleNumber: mod.moduleNumber,
      });
    }
  }
  return list;
}

export function getTutorialBySlug(slug: string) {
  const all = getAllTutorialChapters();
  const index = all.findIndex((c) => c.slug === slug);
  if (index === -1) return null;

  return {
    chapter: all[index],
    prev: index > 0 ? all[index - 1] : null,
    next: index < all.length - 1 ? all[index + 1] : null,
  };
}
