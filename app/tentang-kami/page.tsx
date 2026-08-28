import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { AboutPageJsonLd } from "@/components/seo/AboutPageJsonLd";
import {
  Store,
  MessageCircle,
  Heart,
  MapPin,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  QrCode,
  HelpCircle,
} from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Tentang Kami - Mas Chan Digital | Marketplace Lokal Kota Serang",
  description:
    "Mengenal Mas Chan Digital, platform marketplace direktori lokal untuk memajukan UMKM di Kota Serang melalui transaksi langsung ke WhatsApp vendor tanpa potongan biaya gateway.",
  openGraph: {
    title: "Tentang Kami - Mas Chan Digital | Marketplace Lokal Kota Serang",
    description:
      "Mengenal Mas Chan Digital, platform marketplace direktori lokal untuk memajukan UMKM di Kota Serang melalui transaksi langsung ke WhatsApp vendor.",
    url: "https://maschandigital.id/tentang-kami",
    siteName: "Mas Chan Digital",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/mas-chan-digital.webp",
        width: 1200,
        height: 630,
        alt: "Tentang Mas Chan Digital - Marketplace UMKM Kota Serang",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tentang Kami - Mas Chan Digital | Marketplace Lokal Kota Serang",
    description:
      "Platform marketplace lokal untuk memajukan UMKM di Kota Serang.",
    images: ["/mas-chan-digital.webp"],
  },
};

export default function TentangKamiPage() {
  const districts = [
    {
      name: "Kec. Serang",
      desc: "Jantung kuliner khas, perdagangan, dan pusat perkotaan",
    },
    {
      name: "Kec. Cipocok Jaya",
      desc: "Pusat pemerintahan kota dan kawasan perumahan berkembang",
    },
    {
      name: "Kec. Kasemen",
      desc: "Pusat sejarah Kesultanan Banten & pengrajin batik khas",
    },
    {
      name: "Kec. Taktakan",
      desc: "Sentra agrowisata, durian Jatireja, budidaya madu klanceng & herbal",
    },
    {
      name: "Kec. Curug",
      desc: "Kawasan pusat pemerintahan Provinsi Banten (KP3B) & komoditas lokal",
    },
    {
      name: "Kec. Walantaka",
      desc: "Sentra pertanian & aneka produk olahan pangan kreatif",
    },
  ];

  const advantages = [
    {
      icon: MessageCircle,
      title: "Direct WhatsApp Checkout",
      desc: "Transaksi 100% langsung ke nomor WhatsApp pemilik toko dengan format pesanan otomatis yang terstruktur.",
    },
    {
      icon: ShieldCheck,
      title: "Bebas Biaya Admin (0% Fee)",
      desc: "Tidak ada potongan komisi per transaksi. Seluruh keuntungan penjualan langsung masuk ke rekening pribadi vendor.",
    },
    {
      icon: Store,
      title: "Paket Starter UMKM Gratis",
      desc: "Setiap pelaku usaha di Kota Serang dapat mendaftar dan membuka toko online gratis selamanya (maksimal 3 produk).",
    },
    {
      icon: QrCode,
      title: "QR Code Toko Siap Cetak",
      desc: "Menyediakan fitur cetak standee QR Code untuk dipajang di etalase/meja kasir warung fisik vendor di Kota Serang.",
    },
  ];

  const faqs = [
    {
      q: "Bagaimana cara berbelanja di Mas Chan Digital?",
      a: 'Cukup cari produk yang Anda inginkan, klik tombol "Pesan Cepat via WhatsApp", isi rincian kuantitas dan kecamatan tujuan Anda di Kota Serang, lalu kirim. Anda akan langsung terhubung ke WhatsApp resmi pemilik toko untuk kesepakatan pengiriman.',
    },
    {
      q: "Apakah ada biaya tambahan atau biaya admin untuk pembeli?",
      a: "Tidak ada. Harga yang tertera adalah harga resmi langsung dari penjual tanpa tambahan biaya perantara atau biaya aplikasi.",
    },
    {
      q: "Bagaimana cara mendaftarkan usaha saya sebagai vendor?",
      a: 'Klik tombol "Daftar Toko Gratis" di menu navigasi, isi nama toko, nomor WhatsApp, dan kecamatan Anda di Kota Serang. Toko Anda langsung aktif seketika dengan Paket Starter UMKM.',
    },
  ];

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      {/* 1. HERO BANNER */}
      <AboutPageJsonLd />
      <section
        aria-labelledby="about-hero-title"
        className="relative bg-brand-gradient py-16 sm:py-24 overflow-hidden text-white"
      >
        <div
          className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] opacity-10 pointer-events-none [background-size:16px_16px]"
          aria-hidden="true"
        />

        <div className="relative space-y-4 mx-auto mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl max-w-7xl text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 border border-white/20 rounded-full font-semibold text-amber-300 text-xs">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Mengenal Mas Chan Digital</span>
          </div>
          <h1
            id="about-hero-title"
            className="font-slab font-black text-3xl sm:text-5xl leading-tight"
          >
            Menghubungkan UMKM Serang Langsung ke Pelanggan
          </h1>
          <p className="font-normal text-slate-200 text-sm sm:text-base leading-relaxed">
            Platform marketplace dan direktori lokal Kota Serang yang dirancang
            untuk mempermudah transaksi jual beli tanpa potongan biaya gateway
            dan tanpa perantara rumit.
          </p>
        </div>
      </section>

      {/* 2. LATAR BELAKANG & FILOSOFI BISNIS */}
      <SectionContainer aria-labelledby="vision-heading" className="py-0">
        <div className="items-center gap-8 grid grid-cols-1 md:grid-cols-2">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 bg-brand-100 dark:bg-brand-950/80 px-2.5 py-0.5 rounded-full font-semibold text-brand-800 dark:text-brand-300 text-xs">
              <Heart
                className="fill-rose-500 w-3.5 h-3.5 text-rose-500"
                aria-hidden="true"
              />
              <span>Latar Belakang & Visi</span>
            </div>
            <h2
              id="vision-heading"
              className="font-slab font-bold text-slate-900 dark:text-white text-2xl sm:text-3xl leading-snug"
            >
              Membangun Ekosistem Niaga Lokal yang Berkah & Transparan
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              Banyak pelaku UMKM di Kota Serang menghadapi kendala potongan
              biaya administrasi platform yang tinggi dan sistem pencairan dana
              yang lambat.
            </p>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              <strong>Mas Chan Digital</strong> didirikan oleh{" "}
              <strong>Chandra Anggara Diputra</strong> dengan komitmen
              menghadirkan solusi yang membumi: mempromosikan produk lokal
              secara online sambil memastikan seluruh keuntungan penjualan masuk{" "}
              <strong>100% langsung ke rekening pribadi vendor</strong>.
            </p>
          </div>

          <aside
            aria-label="Metode Transaksi"
            className="space-y-4 bg-white dark:bg-surface-darkCard shadow-card-hover p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 rounded-3xl"
          >
            <h3 className="font-slab font-bold text-slate-900 dark:text-white text-base sm:text-lg">
              2 Saluran Transaksi Utama:
            </h3>

            <article className="flex items-start gap-4 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl">
              <div className="flex justify-center items-center bg-whatsapp-500 shadow-sm rounded-xl w-10 h-10 text-white shrink-0">
                <MessageCircle
                  className="fill-white w-5 h-5"
                  aria-hidden="true"
                />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  1. Direct WhatsApp Order
                </h4>
                <p className="mt-1 text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                  Pemesanan dilengkapi formulir pintar yang otomatis menyusun
                  nama pemesan, kuantitas, dan pilihan kecamatan di Kota Serang.
                </p>
              </div>
            </article>

            <article className="flex items-start gap-4 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl">
              <div className="flex justify-center items-center bg-brand-800 shadow-sm rounded-xl w-10 h-10 text-white shrink-0">
                <ExternalLink className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  2. Link Afiliasi Resmi
                </h4>
                <p className="mt-1 text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                  Untuk produk digital atau layanan khusus, pembeli diarahkan
                  langsung ke halaman pendaftaran resmi vendor.
                </p>
              </div>
            </article>
          </aside>
        </div>
      </SectionContainer>

      {/* 3. KEUNGGULAN PLATFORM */}
      <SectionContainer aria-labelledby="advantages-heading" className="py-0">
        <header className="space-y-2 mx-auto mb-8 max-w-2xl text-center">
          <h2
            id="advantages-heading"
            className="font-slab font-bold text-slate-900 dark:text-white text-2xl sm:text-3xl"
          >
            Mengapa Memilih Mas Chan Digital?
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
            Fitur-fitur yang dirancang khusus untuk kenyamanan UMKM dan warga
            Kota Serang
          </p>
        </header>

        <div className="gap-4 sm:gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {advantages.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={`adv-${idx}`}
                className="space-y-3 bg-white dark:bg-surface-darkCard shadow-subtle p-6 border border-slate-200/80 dark:border-slate-800 rounded-3xl"
              >
                <div className="flex justify-center items-center bg-brand-50 dark:bg-brand-950/80 rounded-2xl w-10 h-10 text-brand-800 dark:text-brand-300">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-slab font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                  {item.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </SectionContainer>

      {/* 4. JANGKAUAN 6 KECAMATAN DI KOTA SERANG */}
      <SectionContainer
        aria-labelledby="district-coverage-heading"
        className="py-0"
      >
        <header className="space-y-2 mx-auto mb-8 max-w-2xl text-center">
          <h2
            id="district-coverage-heading"
            className="font-slab font-bold text-slate-900 dark:text-white text-2xl sm:text-3xl"
          >
            Jangkauan Wilayah di Kota Serang
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
            Mendukung pergerakan ekonomi lokal di 6 kecamatan Kota Serang,
            Banten 42111
          </p>
        </header>

        <ul className="gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 m-0 p-0 list-none">
          {districts.map((item) => (
            <li
              key={item.name}
              className="bg-white dark:bg-surface-darkCard shadow-subtle p-5 border border-slate-200/80 hover:border-brand-500 dark:border-slate-800 rounded-2xl transition-colors"
            >
              <div className="flex items-center gap-2.5 mb-2">
                <MapPin className="w-4 h-4 text-brand-600" aria-hidden="true" />
                <h3 className="font-slab font-bold text-slate-900 dark:text-white text-sm">
                  {item.name}
                </h3>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                {item.desc}
              </p>
            </li>
          ))}
        </ul>
      </SectionContainer>

      {/* 5. FAQ RINGKAS */}
      <SectionContainer
        aria-labelledby="faq-heading"
        className="mx-auto py-0 max-w-4xl"
      >
        <header className="space-y-2 mb-8 text-center">
          <div className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full font-semibold text-slate-700 dark:text-slate-300 text-xs">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Tanya Jawab</span>
          </div>
          <h2
            id="faq-heading"
            className="font-slab font-bold text-slate-900 dark:text-white text-2xl sm:text-3xl"
          >
            Pertanyaan yang Sering Diajukan
          </h2>
        </header>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={`faq-${idx}`}
              className="space-y-2 bg-white dark:bg-surface-darkCard shadow-subtle p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 rounded-2xl"
            >
              <h3 className="font-slab font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                {faq.q}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </SectionContainer>

      {/* 6. CALL TO ACTION (CTA) DAFTAR VENDOR */}
      <SectionContainer className="mx-auto py-0 max-w-4xl">
        <div className="relative space-y-6 bg-brand-gradient shadow-xl p-8 sm:p-12 rounded-3xl overflow-hidden text-white text-center">
          <div className="z-10 relative space-y-3 mx-auto max-w-xl">
            <h2 className="font-slab font-black text-2xl sm:text-3xl">
              Punya Usaha di Kota Serang?
            </h2>
            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
              Buka etalase digital toko Anda sekarang secara gratis dengan Paket
              Starter UMKM dan terima pesanan langsung ke WhatsApp Anda.
            </p>
            <div className="flex sm:flex-row flex-col justify-center items-center gap-3 pt-3">
              <Link href="/vendor/register" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-white hover:bg-slate-100 w-full sm:w-auto font-bold text-brand-900 text-xs sm:text-sm"
                >
                  <span>Daftarkan Toko Anda (Gratis)</span>
                  <ArrowRight className="ml-1.5 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/vendors" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="hover:bg-white/10 border-white/30 w-full sm:w-auto text-white text-xs sm:text-sm"
                >
                  <span>Lihat Toko Lainnya</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </SectionContainer>
    </div>
  );
}
