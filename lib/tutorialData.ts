import { TutorialModule, TutorialChapter } from '@/types/tutorial';

export const TUTORIAL_MODULES: TutorialModule[] = [
  {
    id: 'modul-1-buka-toko',
    moduleNumber: 1,
    title: 'Dasar & Registrasi Toko',
    description: 'Panduan langkah awal mendaftarkan toko UMKM Anda secara gratis dan menerima email sambutan resmi di Kota Serang.',
    iconName: 'Store',
    chapters: [
      {
        slug: 'cara-daftar-toko-gratis',
        title: 'Cara Mendaftar Toko Gratis & Menerima Email Selamat Datang',
        shortDescription: 'Langkah mudah membuka etalase toko online gratis selamanya dan konfirmasi email selamat datang resmi.',
        estimatedMinutes: 3,
        content: {
          overview: 'Mas Chan Digital menyediakan Paket Starter UMKM gratis selamanya untuk membantu seluruh pedagang dan pengrajin lokal di 6 kecamatan Kota Serang memiliki etalase digital resmi, lengkap dengan sistem notifikasi email otomatis.',
          steps: [
            {
              title: '1. Akses Halaman Pendaftaran Vendor',
              description: 'Buka maschandigital.id/vendor/register, klik tombol "Daftar Toko" di Header desktop, atau buka menu "Daftar Jadi Mitra Toko" di navigasi bawah ponsel Anda.',
              tips: 'Pastikan memasukkan alamat email yang aktif dan sering Anda buka sehari-hari di ponsel Anda.',
            },
            {
              title: '2. Masukkan Data Usaha & Nomor WhatsApp',
              description: 'Isi nama pemilik, nama toko yang menarik (misal: "Sate Bandeng Bu Hj. Siti"), alamat email aktif, nomor WhatsApp (format 08xxx), dan pilih kecamatan domisili usaha Anda di Kota Serang.',
            },
            {
              title: '3. Buat Kata Sandi Akun',
              description: 'Tentukan password rahasia untuk login ke Dashboard Toko Anda. Pastikan Anda mencatat atau mengingat password ini.',
            },
            {
              title: '4. Toko Langsung Aktif di Paket Starter UMKM',
              description: 'Setelah klik tombol daftar, akun toko Anda langsung aktif dengan kuota 3 produk gratis selamanya. Anda bisa langsung masuk ke Dashboard Vendor.',
            },
            {
              title: '5. Cek Email Selamat Datang dari Mas Chan Digital',
              description: 'Buka kotak masuk (inbox) email Anda. Anda akan menerima email resmi berjudul "Selamat Datang di Mas Chan Digital, [Nama Toko]!" dari pengirim admin@maschandigital.id yang memuat rincian paket starter dan tombol pintas login ke dashboard.',
              tips: 'Jika tidak ada di Kotak Masuk utama, periksa folder "Spam" atau "Promosi", lalu tandai sebagai "Bukan Spam" agar email notifikasi penting berikutnya selalu masuk lancar.',
            },
          ],
          proTip: 'Simpan alamat pengirim admin@maschandigital.id ke kontak email Anda agar seluruh notifikasi sistem, tagihan, dan pembaruan toko selalu terkirim ke kotak masuk utama.',
          faq: [
            {
              question: 'Apakah pendaftaran ini benar-benar gratis?',
              answer: 'Ya, Paket Starter UMKM 100% gratis selamanya untuk maksimal 3 produk aktif tanpa dipungut biaya registrasi maupun biaya bulanan.',
            },
            {
              question: 'Bagaimana jika email selamat datang belum masuk?',
              answer: 'Email dikirim secara otomatis dalam hitungan detik. Silakan periksa folder Spam/Junk atau segarkan (refresh) aplikasi email Anda.',
            },
          ],
        },
      },
      {
        slug: 'melengkapi-profil-dan-jam-operasional',
        title: 'Mengatur Profil, Logo, dan Jam Buka Toko',
        shortDescription: 'Lengkapi logo, alamat detail, tautan media sosial, dan jadwal jam buka toko Anda.',
        estimatedMinutes: 4,
        content: {
          overview: 'Profil toko yang lengkap dengan logo berkualitas dan jadwal operasional yang jelas akan meningkatkan kepercayaan calon pembeli hingga 80%.',
          steps: [
            {
              title: '1. Buka Menu Pengaturan Toko',
              description: 'Masuk ke Dashboard, lalu klik menu "Pengaturan Profil Toko" (maschandigital.id/dashboard/profile).',
            },
            {
              title: '2. Unggah Logo & Banner Toko',
              description: 'Pada Tab "2. Branding & Foto", unggah foto logo toko (rasio kotak 1:1) dan foto banner toko (rasio lebar 16:9).',
              tips: 'Gunakan foto asli tempat usaha, spanduk warung, atau kemasan produk Anda.',
            },
            {
              title: '3. Atur Jam Operasional Harian',
              description: 'Pada Tab "4. Jam Buka & Libur", centang hari-hari buka Anda dan atur jam operasional (misal: 08:00 - 17:00 WIB).',
            },
            {
              title: '4. Fitur Mode Libur (Vacation Mode)',
              description: 'Jika toko Anda tutup karena cuti, hari raya, atau renovasi, cukup aktifkan tombol "Mode Libur" dan tulis pesan pemberitahuan untuk pelanggan.',
            },
          ],
          proTip: 'Sistem Mas Chan Digital otomatis menyesuaikan jam operasional toko dengan Waktu Indonesia Barat (WIB).',
        },
      },
      {
        slug: 'lupa-dan-reset-kata-sandi',
        title: 'Cara Mengatur Ulang Kata Sandi via Email',
        shortDescription: 'Panduan memulihkan akses login dashboard vendor melalui tautan reset yang dikirim ke email.',
        estimatedMinutes: 3,
        content: {
          overview: 'Jika Anda lupa kata sandi akun toko, Mas Chan Digital menyediakan fitur pemulihan mandiri yang aman dan cepat langsung melalui email terdaftar Anda.',
          steps: [
            {
              title: '1. Buka Halaman Login Vendor',
              description: 'Buka halaman maschandigital.id/vendor/login, lalu klik tautan "Lupa Password?" di samping kolom kata sandi.',
            },
            {
              title: '2. Masukkan Alamat Email Terdaftar',
              description: 'Ketikkan alamat email yang Anda gunakan saat mendaftar toko, kemudian klik tombol "Kirim Tautan Reset Password".',
              tips: 'Pastikan email yang dimasukkan sama persis dengan email saat registrasi toko.',
            },
            {
              title: '3. Buka Email Reset Password dari admin@maschandigital.id',
              description: 'Buka inbox email Anda dan cari email berjudul "Atur Ulang Kata Sandi Akun Mas Chan Digital" dari admin@maschandigital.id.',
            },
            {
              title: '4. Klik Tombol Atur Ulang Kata Sandi',
              description: 'Klik tombol biru "Atur Ulang Kata Sandi" di dalam email untuk membuka formulir pembuatan kata sandi baru.',
            },
            {
              title: '5. Buat Kata Sandi Baru & Terima Email Konfirmasi Keamanan',
              description: 'Masukkan kata sandi baru (minimal 6 karakter), ulangi di kolom konfirmasi, dan klik "Simpan Kata Sandi Baru". Sistem akan memperbarui password Anda dan mengirimkan email konfirmasi bahwa kata sandi telah berhasil diubah.',
            },
          ],
          proTip: 'Tautan reset kata sandi memiliki batas waktu berlaku demi keamanan akun toko Anda. Segera klik tautan begitu email diterima.',
        },
      },
    ],
  },
  {
    id: 'modul-2-kelola-produk',
    moduleNumber: 2,
    title: 'Manajemen Produk & Etalase',
    description: 'Cara mengunggah foto produk yang menarik, memilih kategori berjenjang, dan menentukan harga.',
    iconName: 'Package',
    chapters: [
      {
        slug: 'cara-upload-produk-pertama',
        title: 'Panduan Upload Produk Baru & Foto Berkualitas',
        shortDescription: 'Cara menambahkan barang dagangan baru ke etalase online Anda.',
        estimatedMinutes: 4,
        content: {
          overview: 'Setiap produk yang Anda unggah akan otomatis tampil di Halaman Beranda, Halaman Katalog Semua Produk, Kategori yang relevan, dan Profil Toko Anda.',
          steps: [
            {
              title: '1. Buka Form Tambah Produk',
              description: 'Di ponsel, tekan tombol bulat biru "+ Jual" di tengah navigasi bawah. Di komputer, klik menu "Tambah Produk" di sidebar Dashboard Toko Anda.',
            },
            {
              title: '2. Masukkan Nama & Deskripsi Produk',
              description: 'Tuliskan nama produk secara spesifik (misal: "Sate Bandeng Tanpa Duri Rasa Pedas Khas Serang"). Jelaskan berat bersih, komposisi, atau cara penyajian.',
            },
            {
              title: '3. Tentukan Harga & Harga Promo',
              description: 'Masukkan harga resmi produk dalam Rupiah. Jika sedang ada diskon, masukkan harga promo di kolom "Harga Diskon" untuk memunculkan badge hemat.',
            },
            {
              title: '4. Pilih Kategori & Unggah Foto',
              description: 'Centang kategori yang sesuai pada daftar kategori berjenjang (Produk Fisik, Produk Digital, atau Layanan Jasa) dan unggah foto produk yang jernih langsung ke Media WordPress.',
            },
          ],
          proTip: 'Ambil foto produk dengan pencahayaan alami di siang hari agar warna asli produk terlihat menarik bagi calon pembeli.',
        },
      },
    ],
  },
  {
    id: 'modul-3-transaksi-whatsapp',
    moduleNumber: 3,
    title: 'Transaksi & Pengiriman Serang',
    description: 'Cara menangani pesanan WhatsApp otomatis dan opsi kurir lokal Kota Serang.',
    iconName: 'MessageCircle',
    chapters: [
      {
        slug: 'menangani-pesanan-smart-whatsapp-form',
        title: 'Cara Menerima Pesanan dari Smart WhatsApp Form',
        shortDescription: 'Memahami format pesanan terstruktur otomatis yang dikirimkan oleh pembeli.',
        estimatedMinutes: 3,
        content: {
          overview: 'Mas Chan Digital menggunakan fitur Smart WhatsApp Order Form yang otomatis merinci kuantitas, nama pemesan, dan kecamatan pengiriman di Kota Serang saat pembeli mengklik tombol pesan.',
          steps: [
            {
              title: '1. Membaca Rincian Pesanan Masuk',
              description: 'Pesan yang masuk ke WhatsApp Anda sudah terformat rapi memuat: Nama Barang, Jumlah (Qty), Total Harga, Nama Pemesan, Kecamatan (misal: Cipocok Jaya), dan Pilihan Antar.',
            },
            {
              title: '2. Mengonfirmasi Ketersediaan Stok',
              description: 'Balas pesan pembeli dengan ramah untuk mengonfirmasi ketersediaan stok barang dan nomor rekening pembayaran pribadi Anda (BCA, Mandiri, BRI, BSI, atau QRIS pribadi).',
            },
            {
              title: '3. Kesepakatan Pengiriman atau COD',
              description: 'Sepakati metode antar: menggunakan kurir lokal Serang, ojek online, atau bertemu di titik COD populer (seperti Alun-alun Serang, Stadion Maulana Yusuf, atau Ciceri).',
            },
          ],
          proTip: 'Seluruh keuntungan penjualan 100% milik Anda tanpa ada potongan biaya aplikasi atau komisi perantara.',
        },
      },
    ],
  },
  {
    id: 'modul-4-pemasaran-qr',
    moduleNumber: 4,
    title: 'Promosi & Standee QR Code Toko',
    description: 'Memanfaatkan Standee QR Code untuk mempromosikan katalog online di warung fisik.',
    iconName: 'QrCode',
    chapters: [
      {
        slug: 'cara-cetak-standee-qr-toko',
        title: 'Cara Unduh & Cetak Standee QR Code Meja Kasir',
        shortDescription: 'Hubungkan pembeli di warung fisik Anda ke katalog online dengan memajang QR Standee.',
        estimatedMinutes: 3,
        content: {
          overview: 'Setiap vendor Mas Chan Digital mendapatkan kartu Standee QR Code siap cetak beresolusi tinggi dengan bingkai resmi dan nama toko Anda.',
          steps: [
            {
              title: '1. Buka Tab QR Code Standee di Profil',
              description: 'Masuk ke menu Profil Toko di Dashboard, lalu klik Tab "6. QR Code Standee" atau klik tombol "Lihat QR Code Toko" di bagian atas.',
            },
            {
              title: '2. Unduh Gambar PNG atau Cetak Langsung',
              description: 'Klik tombol "Unduh Gambar PNG" untuk menyimpan file gambar berkualitas tinggi ke HP/laptop Anda, atau klik "Cetak Standee" untuk mencetak langsung di kertas A5/A6.',
            },
            {
              title: '3. Pajang di Meja Kasir atau Etalase',
              description: 'Letakkan standee di meja kasir, etalase warung, atau tempelkan sebagai stiker kemasan produk Anda.',
            },
          ],
          proTip: 'Ajak pelanggan di warung fisik untuk memindai QR Code tersebut agar mereka bisa memesan ulang dari rumah via WhatsApp di kemudian hari.',
        },
      },
    ],
  },
  {
    id: 'modul-5-langganan-paket',
    moduleNumber: 5,
    title: 'Paket Langganan & Notifikasi Pembayaran',
    description: 'Penjelasan opsi upgrade paket, alur notifikasi email tagihan, dan verifikasi pembayaran.',
    iconName: 'CreditCard',
    chapters: [
      {
        slug: 'pilihan-paket-dan-perpanjangan',
        title: 'Panduan Memilih Paket, Konfirmasi Transfer & Notifikasi Email',
        shortDescription: 'Tingkatkan kuota produk toko Anda dengan panduan lengkap alur pembayaran dan notifikasi email resmi.',
        estimatedMinutes: 4,
        content: {
          overview: 'Toko baru otomatis berstatus aktif selamanya di Paket Starter UMKM (Gratis, kuota 3 produk). Jika Anda ingin menambah lebih banyak produk, Mas Chan Digital menyediakan pilihan paket langganan dengan alur notifikasi email otomatis di setiap tahapannya.',
          steps: [
            {
              title: '1. Buka Menu Langganan & Tagihan',
              description: 'Di Dashboard toko, klik menu "Langganan & Tagihan" (maschandigital.id/dashboard/billing) untuk melihat status masa aktif dan kuota produk Anda.',
            },
            {
              title: '2. Pilih Paket & Terima Email Tagihan Resmi',
              description: 'Pilih paket yang diinginkan: Paket 1 Bulan (Rp 30.000 / 10 Produk), Paket 3 Bulan (Rp 90.000 / 10 Produk), Paket 6 Bulan (Rp 160.000 Unlimited), atau Paket 1 Tahun (Rp 280.000 Unlimited). Begitu paket dipilih, sistem otomatis membuatkan nomor invoice resmi (misal: INV-000123) dan mengirimkan rincian tagihan langsung ke email Anda.',
              tips: 'Email tagihan memuat nomor invoice, nominal transfer pas, dan tombol langsung ke halaman pembayaran.',
            },
            {
              title: '3. Transfer Bank Manual & Unggah Bukti Bayar',
              description: 'Lakukan transfer ke rekening resmi Bank Syariah Indonesia (BSI) 7304526968 a.n. Chandra Anggara Diputra. Setelah transfer berhasil, unggah foto bukti struk dan isi nama pemilik rekening pengirim di dashboard.',
            },
            {
              title: '4. Terima Email "Bukti Pembayaran Diterima" & Jaminan Grace Protection',
              description: 'Setelah bukti bayar diunggah, Anda akan menerima email notifikasi bahwa bukti transfer telah diterima. Selama menunggu verifikasi admin (status Pending Approval), toko Anda dijamin TETAP BUKA normal di halaman publik.',
            },
            {
              title: '5. Terima Email "Pembayaran Terverifikasi" & Kuota Baru Aktif',
              description: 'Ketika Admin menyetujui pembayaran di sistem, Anda akan otomatis menerima email "Pembayaran Terverifikasi ✓", masa aktif paket langsung bertambah, dan kuota produk toko Anda langsung diperbarui.',
            },
            {
              title: '6. Notifikasi Pengingat Masa Aktif (H-7)',
              description: 'Sebelum paket berbayar Anda berakhir, sistem akan otomatis mengirimkan email pengingat pada H-7 dan memberikan masa tenggang toleransi 3 hari jika Anda belum sempat memperpanjang.',
            },
          ],
          proTip: 'Jika paket berbayar berakhir, produk lama Anda tetap aman dan tidak akan pernah dihapus. Akun Anda otomatis kembali ke Paket Starter UMKM (Gratis Selamanya).',
          faq: [
            {
              question: 'Apakah ada notifikasi email saat saya memilih paket atau membayar?',
              answer: 'Ya! Setiap tahapan (pembuatan invoice, penerimaan bukti transfer, dan persetujuan verifikasi) memiliki notifikasi email resmi dari admin@maschandigital.id.',
            },
            {
              question: 'Bagaimana jika saya salah klik memilih paket berbayar?',
              answer: 'Selama tagihan belum dibayar (status Unpaid), Anda cukup klik tombol "Batal Pilih Paket" di dashboard billing untuk membatalkan tagihan lama dan memilih paket lain.',
            },
            {
              question: 'Apakah saya wajib berlangganan berbayar?',
              answer: 'Tidak wajib. Anda bebas tetap menggunakan Paket Starter UMKM gratis selamanya untuk 3 produk aktif.',
            },
          ],
        },
      },
    ],
  },
  {
    id: 'modul-6-integrasi-chat',
    moduleNumber: 6,
    title: 'Integrasi Live Chat Toko (Tawk.to)',
    description: 'Panduan opsional menghubungkan live chat gratis Tawk.to di etalase toko Anda.',
    iconName: 'MessageSquare',
    chapters: [
      {
        slug: 'cara-integrasi-live-chat-tawkto',
        title: 'Cara Memasang Widget Live Chat Tawk.to di Toko',
        shortDescription: 'Terima pesan chat langsung dari calon pembeli di website Mas Chan Digital.',
        estimatedMinutes: 4,
        content: {
          overview: 'Selain transaksi via WhatsApp, vendor yang ingin melayani pertanyaan instan pembeli langsung di dalam website dapat mengaktifkan integrasi gratis Tawk.to.',
          steps: [
            {
              title: '1. Buat Akun & Properti di Tawk.to',
              description: 'Daftar akun gratis di tawk.to dan buat properti chat untuk toko Anda.',
            },
            {
              title: '2. Salin Property ID & Widget ID',
              description: 'Di dashboard Tawk.to, buka menu Administration -> Channels -> Chat Widget. Salin Property ID dan Widget ID akun Anda.',
            },
            {
              title: '3. Masukkan ke Dashboard Profil Toko (Tab 7)',
              description: 'Buka Dashboard Vendor -> Pengaturan Profil Toko -> Tab "7. Live Chat Tawk.to". Geser tombol "Aktifkan Live Chat di Toko Saya" ke posisi aktif, masukkan Property ID dan Widget ID, lalu klik "Simpan Semua Pengaturan".',
            },
            {
              title: '4. Chat Otomatis Aktif di Halaman Toko Anda',
              description: 'Widget chat akan otomatis muncul khusus di halaman profil toko dan produk-produk Anda, dan pesan pembeli akan langsung masuk ke aplikasi HP Tawk.to Anda.',
            },
          ],
          proTip: 'Fitur Live Chat bersifat opsional. Jika Anda tidak mengaktifkannya, pembeli tetap dapat menghubungi Anda via WhatsApp seperti biasa.',
        },
      },
    ],
  },
];

export function getAllTutorialChapters(): (TutorialChapter & { moduleTitle: string; moduleId: string; moduleNumber: number })[] {
  const list: (TutorialChapter & { moduleTitle: string; moduleId: string; moduleNumber: number })[] = [];
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
  const index = all.findIndex(c => c.slug === slug);
  if (index === -1) return null;

  return {
    chapter: all[index],
    prev: index > 0 ? all[index - 1] : null,
    next: index < all.length - 1 ? all[index + 1] : null,
  };
}

