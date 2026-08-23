import { TutorialModule, TutorialChapter } from "@/types/tutorial";

export const TUTORIAL_MODULES: TutorialModule[] = [
  {
    id: "modul-1-buka-toko",
    moduleNumber: 1,
    title: "Dasar & Registrasi Toko",
    description:
      "Panduan langkah awal mendaftarkan toko UMKM Anda secara gratis di Kota Serang.",
    iconName: "Store",
    chapters: [
      {
        slug: "cara-daftar-toko-gratis",
        title: "Cara Mendaftar Toko Gratis (Paket Starter UMKM)",
        shortDescription:
          "Langkah mudah membuka etalase toko online gratis selamanya tanpa biaya registrasi.",
        estimatedMinutes: 3,
        content: {
          overview:
            "Mas Chan Digital menyediakan Paket Starter UMKM gratis selamanya untuk membantu seluruh pedagang dan pengrajin lokal di 6 kecamatan Kota Serang memiliki etalase digital resmi.",
          steps: [
            {
              title: "1. Akses Halaman Pendaftaran Vendor",
              description:
                'Klik tombol "Daftar Toko" di pojok kanan atas website atau buka halaman maschandigital.id/vendor/register.',
              tips: "Gunakan nomor WhatsApp bisnis yang aktif setiap hari.",
            },
            {
              title: "2. Masukkan Data Usaha & Nomor WhatsApp",
              description:
                'Isi nama pemilik, nama toko yang menarik (misal: "Sate Bandeng Bu Hj. Siti"), alamat email, nomor WhatsApp (format 08xxx), dan pilih kecamatan domisili usaha Anda di Kota Serang.',
            },
            {
              title: "3. Buat Kata Sandi yang Kuat",
              description:
                "Tentukan password rahasia untuk login ke Dashboard Toko Anda. Pastikan Anda mengingat password ini.",
            },
            {
              title: "4. Toko Langsung Aktif",
              description:
                "Setelah mengklik tombol daftar, akun toko Anda langsung aktif dengan kuota 3 produk gratis selamanya. Anda bisa langsung masuk ke Dashboard.",
            },
          ],
          proTip:
            'Pastikan nama toko Anda jelas dan menyertakan kata kunci produk jika memungkinkan (contoh: "Madu Akasia Murni Serang").',
          faq: [
            {
              question: "Apakah pendaftaran ini benar-benar gratis?",
              answer:
                "Ya, Paket Starter UMKM 100% gratis selamanya untuk maksimal 3 produk aktif tanpa dipungut biaya bulanan.",
            },
          ],
        },
      },
      {
        slug: "melengkapi-profil-dan-jam-operasional",
        title: "Mengatur Profil, Logo, dan Jam Buka Toko",
        shortDescription:
          "Lengkapi logo, alamat detail, tautan media sosial, dan jadwal jam buka toko Anda.",
        estimatedMinutes: 4,
        content: {
          overview:
            "Profil toko yang lengkap dengan logo berkualitas dan jadwal operasional yang jelas akan meningkatkan kepercayaan calon pembeli hingga 80%.",
          steps: [
            {
              title: "1. Buka Menu Pengaturan Toko",
              description:
                'Masuk ke Dashboard, lalu klik menu "Pengaturan Profil Toko" (maschandigital.id/dashboard/profile).',
            },
            {
              title: "2. Unggah Logo & Banner Toko",
              description:
                'Pada Tab "2. Branding & Foto", unggah foto logo toko (rasio kotak 1:1) dan foto banner toko (rasio lebar 16:9).',
              tips: "Gunakan foto asli tempat usaha, spanduk warung, atau kemasan produk Anda.",
            },
            {
              title: "3. Atur Jam Operasional Harian",
              description:
                'Pada Tab "4. Jam Buka & Libur", centang hari-hari buka Anda dan atur jam operasional (misal: 08:00 - 17:00 WIB).',
            },
            {
              title: "4. Fitur Mode Libur (Vacation Mode)",
              description:
                'Jika toko Anda tutup karena cuti, hari raya, atau renovasi, cukup aktifkan tombol "Mode Libur" dan tulis pesan pemberitahuan untuk pelanggan.',
            },
          ],
          proTip:
            "Sistem Mas Chan Digital otomatis menyesuaikan jam operasional toko dengan Waktu Indonesia Barat (WIB).",
        },
      },
    ],
  },
  {
    id: "modul-2-kelola-produk",
    moduleNumber: 2,
    title: "Manajemen Produk & Etalase",
    description:
      "Cara mengunggah foto produk yang menarik, menulis deskripsi, dan menentukan harga.",
    iconName: "Package",
    chapters: [
      {
        slug: "cara-upload-produk-pertama",
        title: "Panduan Upload Produk Baru & Foto Berkualitas",
        shortDescription:
          "Cara menambahkan barang dagangan baru ke etalase online Anda.",
        estimatedMinutes: 4,
        content: {
          overview:
            "Setiap produk yang Anda unggah akan otomatis tampil di Halaman Beranda, Halaman Katalog Semua Produk, Kategori yang relevan, dan Profil Toko Anda.",
          steps: [
            {
              title: "1. Buka Menu Produk di Dashboard",
              description:
                'Klik menu "Kelola Produk" lalu tekan tombol "+ Tambah Produk Baru".',
            },
            {
              title: "2. Masukkan Nama & Deskripsi Produk",
              description:
                'Tuliskan nama produk secara spesifik (misal: "Sate Bandeng Tanpa Duri Rasa Pedas Khas Serang"). Jelaskan berat bersih, komposisi, atau cara penyajian.',
            },
            {
              title: "3. Tentukan Harga & Harga Promo",
              description:
                'Masukkan harga resmi produk dalam Rupiah. Jika sedang ada diskon, masukkan harga promo di kolom "Harga Diskon" untuk memunculkan badge hemat.',
            },
            {
              title: "4. Pilih Kategori & Unggah Foto",
              description:
                "Pilih kategori yang tepat (Kuliner, Madu & Herbal, Batik, dll.) dan unggah foto produk yang terang dan jernih.",
            },
          ],
          proTip:
            "Ambil foto produk dengan pencahayaan alami di siang hari agar warna asli produk terlihat menarik.",
        },
      },
    ],
  },
  {
    id: "modul-3-transaksi-whatsapp",
    moduleNumber: 3,
    title: "Transaksi & Pengiriman Serang",
    description:
      "Cara menangani pesanan WhatsApp otomatis dan opsi kurir lokal Kota Serang.",
    iconName: "MessageCircle",
    chapters: [
      {
        slug: "menangani-pesanan-smart-whatsapp-form",
        title: "Cara Menerima Pesanan dari Smart WhatsApp Form",
        shortDescription:
          "Memahami format pesanan terstruktur otomatis yang dikirimkan oleh pembeli.",
        estimatedMinutes: 3,
        content: {
          overview:
            "Mas Chan Digital menggunakan fitur Smart WhatsApp Order Form yang otomatis merinci kuantitas, nama pemesan, dan kecamatan pengiriman di Kota Serang saat pembeli mengklik tombol pesan.",
          steps: [
            {
              title: "1. Membaca Rincian Pesanan Masuk",
              description:
                "Pesan yang masuk ke WhatsApp Anda sudah terformat rapi memuat: Nama Barang, Jumlah (Qty), Total Harga, Nama Pemesan, Kecamatan (misal: Cipocok Jaya), dan Pilihan Antar.",
            },
            {
              title: "2. Mengonfirmasi Ketersediaan Stok",
              description:
                "Balas pesan pembeli dengan ramah untuk mengonfirmasi ketersediaan stok barang dan nomor rekening pembayaran pribadi Anda (BCA, Mandiri, BRI, BSI, atau QRIS pribadi).",
            },
            {
              title: "3. Kesepakatan Pengiriman atau COD",
              description:
                "Sepakati metode antar: menggunakan kurir lokal Serang, ojek online, atau bertemu di titik COD populer (seperti Alun-alun Serang, Stadion Maulana Yusuf, atau Ciceri).",
            },
          ],
          proTip:
            "Seluruh keuntungan penjualan 100% milik Anda tanpa ada potongan biaya aplikasi atau komisi pihak ketiga.",
        },
      },
    ],
  },
  {
    id: "modul-4-pemasaran-qr",
    moduleNumber: 4,
    title: "Promosi & Standee QR Code Toko",
    description:
      "Memanfaatkan Standee QR Code untuk mempromosikan katalog online di warung fisik.",
    iconName: "QrCode",
    chapters: [
      {
        slug: "cara-cetak-standee-qr-toko",
        title: "Cara Unduh & Cetak Standee QR Code Meja Kasir",
        shortDescription:
          "Hubungkan pembeli di warung fisik Anda ke katalog online dengan memajang QR Standee.",
        estimatedMinutes: 3,
        content: {
          overview:
            "Setiap vendor Mas Chan Digital mendapatkan kartu Standee QR Code siap cetak beresolusi tinggi dengan bingkai resmi dan nama toko Anda.",
          steps: [
            {
              title: "1. Buka Tab QR Code Standee di Profil",
              description:
                'Masuk ke menu Profil Toko di Dashboard, lalu klik Tab "6. QR Code Standee" atau klik tombol "Lihat QR Code Toko" di bagian atas.',
            },
            {
              title: "2. Unduh Gambar PNG atau Cetak Langsung",
              description:
                'Klik tombol "Unduh Gambar PNG" untuk menyimpan file gambar berkualitas tinggi ke HP/laptop Anda, atau klik "Cetak Standee" untuk mencetak langsung di kertas A5/A6.',
            },
            {
              title: "3. Pajang di Meja Kasir atau Etalase",
              description:
                "Letakkan standee di meja kasir, etalase warung, atau tempelkan sebagai stiker kemasan produk Anda.",
            },
          ],
          proTip:
            "Ajak pelanggan di warung fisik untuk memindai QR Code tersebut agar mereka bisa memesan ulang dari rumah via WhatsApp di kemudian hari.",
        },
      },
    ],
  },
  {
    id: "modul-5-langganan-paket",
    moduleNumber: 5,
    title: "Paket Langganan & Masa Aktif",
    description:
      "Penjelasan opsi upgrade paket langganan dan verifikasi pembayaran invoice.",
    iconName: "CreditCard",
    chapters: [
      {
        slug: "pilihan-paket-dan-perpanjangan",
        title: "Panduan Memilih Paket & Perpanjangan Langganan",
        shortDescription:
          "Tingkatkan kuota produk toko Anda dengan pilihan paket 1 bulan hingga 1 tahun VIP.",
        estimatedMinutes: 3,
        content: {
          overview:
            "Jika Anda ingin menampilkan lebih dari 3 produk, Mas Chan Digital menyediakan paket langganan terjangkau tanpa biaya tersembunyi.",
          steps: [
            {
              title: "1. Buka Menu Tagihan & Langganan",
              description:
                'Di Dashboard toko, klik menu "Tagihan & Paket" untuk melihat status masa aktif dan kuota produk Anda.',
            },
            {
              title: "2. Pilih Paket yang Diinginkan",
              description:
                "Pilih antara Paket 1 Bulan (Rp 30.000 / 10 Produk), Paket 3 Bulan (Rp 90.000), Paket 6 Bulan (Rp 160.000 Unlimited), atau Paket 1 Tahun VIP (Rp 280.000 Unlimited + Prioritas Beranda).",
            },
            {
              title: "3. Transfer & Unggah Bukti Bayar",
              description:
                "Transfer sesuai nominal pas ke rekening resmi pengelola dan unggah foto struk transfer di formulir konfirmasi pembayaran.",
            },
            {
              title: "4. Perlindungan Grace Protection",
              description:
                "Selama bukti pembayaran menunggu verifikasi admin (*Pending Approval*), toko Anda dijamin tetap aktif buka di publik.",
            },
          ],
          proTip:
            "Jika paket berakhir, produk lama Anda tidak akan pernah dihapus. Sistem hanya membatasi penambahan produk baru.",
        },
      },
    ],
  },
];

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
