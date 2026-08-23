import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import {
  FileText,
  ShieldCheck,
  Store,
  MessageCircle,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan - Mas Chan Digital",
  description:
    "Syarat dan ketentuan resmi penggunaan platform marketplace direktori Mas Chan Digital bagi pengunjung dan vendor UMKM di Kota Serang.",
  openGraph: {
    title: "Syarat & Ketentuan - Mas Chan Digital",
    description:
      "Syarat dan ketentuan resmi penggunaan platform marketplace direktori Mas Chan Digital.",
    url: "https://maschandigital.id/syarat-ketentuan",
    siteName: "Mas Chan Digital",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/mas-chan-digital.webp",
        width: 1200,
        height: 630,
        alt: "Syarat & Ketentuan - Mas Chan Digital Serang",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Syarat & Ketentuan - Mas Chan Digital",
    description:
      "Syarat dan ketentuan resmi penggunaan platform marketplace Mas Chan Digital.",
    images: ["/mas-chan-digital.webp"],
  },
};

export default function TermsPage() {
  return (
    <article
      aria-labelledby="terms-title"
      className="space-y-8 sm:space-y-12 pb-16"
    >
      {/* 1. Header Banner */}
      <header className="relative bg-brand-gradient py-12 sm:py-16 overflow-hidden text-white">
        <div
          className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] opacity-10 pointer-events-none [background-size:16px_16px]"
          aria-hidden="true"
        />

        <SectionContainer className="z-10 relative space-y-4 mx-auto py-0 max-w-4xl text-center">
          <nav
            aria-label="Breadcrumb"
            className="inline-block text-slate-200 text-xs"
          >
            <ol className="flex justify-center items-center gap-2 m-0 p-0 list-none">
              <li>
                <Link href="/" className="hover:underline">
                  Beranda
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="font-bold text-amber-300">
                Syarat & Ketentuan
              </li>
            </ol>
          </nav>

          <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 border border-white/20 rounded-full font-semibold text-amber-300 text-xs">
            <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            <span>Transparansi & Keamanan Transaksi</span>
          </div>

          <h1
            id="terms-title"
            className="font-slab font-black text-2xl sm:text-4xl leading-tight"
          >
            Syarat & Ketentuan Layanan
          </h1>
          <p className="mx-auto max-w-2xl text-slate-200 text-xs sm:text-sm">
            Panduan resmi penggunaan platform marketplace direktori UMKM lokal
            Mas Chan Digital bagi pengunjung, pembeli, dan mitra penjual di Kota
            Serang.
          </p>
          <span className="block pt-1 text-[11px] text-slate-300">
            Terakhir diperbarui: 22 Agustus 2026
          </span>
        </SectionContainer>
      </header>

      {/* 2. Isi Dokumen Legal */}
      <SectionContainer className="mx-auto py-0 max-w-4xl">
        <div className="space-y-8 bg-white dark:bg-surface-darkCard shadow-subtle p-6 sm:p-10 border border-slate-200/80 dark:border-slate-800 rounded-3xl text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
          {/* Bagian 1: Definisi Platform */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex justify-center items-center bg-brand-50 dark:bg-brand-950/80 rounded-xl w-8 h-8 font-slab font-bold text-brand-800 dark:text-brand-300 shrink-0">
                1
              </div>
              <h2 className="font-slab font-bold text-slate-900 dark:text-white text-base sm:text-lg">
                Tentang Platform Mas Chan Digital
              </h2>
            </div>
            <p>
              <strong>Mas Chan Digital</strong> (
              <code>https://maschandigital.id</code>) adalah platform direktori
              dan etalase digital yang menghubungkan pelaku Usaha Mikro, Kecil,
              dan Menengah (UMKM) di wilayah Kota Serang, Banten dengan konsumen
              secara langsung.
            </p>
            <p>
              Platform ini berfungsi sebagai sarana promosi, etalase katalog
              produk, dan jembatan komunikasi. Mas Chan Digital{" "}
              <strong>bukan merupakan pihak perantara keuangan</strong>{" "}
              (*payment gateway*), sehingga seluruh pembayaran dan kesepakatan
              pengiriman berlangsung langsung antara pembeli dan penjual.
            </p>
          </section>

          {/* Bagian 2: Mekanisme Transaksi WhatsApp */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex justify-center items-center bg-brand-50 dark:bg-brand-950/80 rounded-xl w-8 h-8 font-slab font-bold text-brand-800 dark:text-brand-300 shrink-0">
                2
              </div>
              <h2 className="font-slab font-bold text-slate-900 dark:text-white text-base sm:text-lg">
                Model Transaksi Langsung & Bebas Potongan (0% Fee)
              </h2>
            </div>
            <ul className="space-y-2 p-0 list-none">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  <strong>Pemesanan via WhatsApp:</strong> Pembeli mengklik
                  tombol pemesanan pada kartu produk dan akan diarahkan langsung
                  ke nomor WhatsApp resmi milik vendor terkait.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  <strong>Keuntungan Utuh 100%:</strong> Mas Chan Digital tidak
                  memotong persentase fee komisi per penjualan dari transaksi
                  yang terjadi antara pembeli dan penjual.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  <strong>Kesepakatan Mandiri:</strong> Metode pembayaran
                  (transfer langsung/COD), biaya ongkos kirim, dan kurir
                  pengiriman disepakati secara langsung antara pembeli dan
                  vendor melalui percakapan WhatsApp.
                </span>
              </li>
            </ul>
          </section>

          {/* Bagian 3: Kewajiban & Tanggung Jawab Vendor */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex justify-center items-center bg-brand-50 dark:bg-brand-950/80 rounded-xl w-8 h-8 font-slab font-bold text-brand-800 dark:text-brand-300 shrink-0">
                3
              </div>
              <h2 className="font-slab font-bold text-slate-900 dark:text-white text-base sm:text-lg">
                Kewajiban & Tanggung Jawab Penjual (Vendor)
              </h2>
            </div>
            <ul className="space-y-2 p-0 list-none">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  <strong>Keaslian Informasi:</strong> Vendor wajib memberikan
                  informasi yang akurat mengenai nama produk, foto asli,
                  deskripsi, harga, dan ketersediaan stok.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  <strong>Kualitas & Pengiriman:</strong> Vendor bertanggung
                  jawab penuh atas kualitas produk, pengemasan (*packing*) yang
                  aman, pengiriman barang tepat waktu, dan penyelesaian keluhan
                  (*after-sales support*) kepada pembeli.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  <strong>Pengaturan Jam Toko & Libur:</strong> Vendor wajib
                  memperbarui jam operasional dan mengaktifkan fitur *Mode Libur
                  (Vacation Mode)* di dashboard jika toko sedang tidak dapat
                  menerima pesanan.
                </span>
              </li>
            </ul>
          </section>

          {/* Bagian 4: Larangan Konten & Produk */}
          <section className="space-y-3 bg-rose-50/60 dark:bg-rose-950/30 p-5 border border-rose-200 dark:border-rose-900/60 rounded-2xl">
            <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h3 className="font-slab font-bold text-sm sm:text-base">
                Larangan Produk & Konten Ilegal
              </h3>
            </div>
            <p className="text-rose-900/90 dark:text-rose-300 text-xs sm:text-sm">
              Vendor dilarang keras menjual barang-barang yang melanggar hukum
              Republik Indonesia dan norma syariat, termasuk namun tidak
              terbatas pada: narkotika, obat-obatan tanpa izin BPOM, barang
              tiruan ilegal (*counterfeit*), senjata, konten pornografi, produk
              perjudian, dan skema penipuan keuangan.
            </p>
            <p className="text-rose-700 dark:text-rose-400 text-xs">
              Mas Chan Digital berhak menonaktifkan produk atau menghapus akun
              vendor yang melanggar ketentuan ini tanpa pemberitahuan
              sebelumnya.
            </p>
          </section>

          {/* Bagian 5: Ketentuan Paket Langganan Vendor */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex justify-center items-center bg-brand-50 dark:bg-brand-950/80 rounded-xl w-8 h-8 font-slab font-bold text-brand-800 dark:text-brand-300 shrink-0">
                4
              </div>
              <h2 className="font-slab font-bold text-slate-900 dark:text-white text-base sm:text-lg">
                Ketentuan Paket Langganan & Pembayaran Toko
              </h2>
            </div>
            <ul className="space-y-2 p-0 text-xs sm:text-sm list-none">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 w-4 h-4 text-brand-600 shrink-0" />
                <span>
                  <strong>Paket Starter UMKM:</strong> Gratis selamanya dengan
                  batas maksimal 3 produk terdaftar.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 w-4 h-4 text-brand-600 shrink-0" />
                <span>
                  <strong>
                    Paket Berbayar (1 Bulan, 3 Bulan, 6 Bulan, 1 Tahun):
                  </strong>{" "}
                  Menyediakan kuota produk yang lebih besar hingga *Unlimited*
                  dengan pembayaran transfer manual harga pas (*flat price*).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 w-4 h-4 text-brand-600 shrink-0" />
                <span>
                  <strong>
                    Masa Perlindungan (*Grace Protection Window*):
                  </strong>{" "}
                  Vendor yang telah mengunggah bukti bayar dijamin tokonya tetap
                  aktif di halaman publik selama masa tunggu verifikasi admin.
                </span>
              </li>
            </ul>
          </section>

          {/* Bagian 6: Kontak & Bantuan */}
          <section className="space-y-3 pt-4 border-slate-100 dark:border-slate-800 border-t">
            <h2 className="font-slab font-bold text-slate-900 dark:text-white text-base">
              Pusat Bantuan & Klarifikasi
            </h2>
            <div className="space-y-1 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl font-mono text-xs">
              <p>
                <strong>WhatsApp Pengelola:</strong> 0822-9814-8474 (Mas Chan)
              </p>
              <p>
                <strong>Email Resmi:</strong> admin@maschandigital.id
              </p>
              <p>
                <strong>Alamat:</strong> Banten Indah Permai Blok E1 No.12A,
                Kel. Unyur, Kec. Serang, Kota Serang, Banten 42111
              </p>
            </div>
          </section>

          <div className="flex justify-between items-center pt-4">
            <Link href="/">
              <Button variant="outline" size="sm" className="text-xs">
                <ArrowLeft className="mr-1.5 w-3.5 h-3.5" />
                <span>Kembali ke Beranda</span>
              </Button>
            </Link>
            <Link
              href="/kebijakan-privasi"
              className="font-bold text-brand-800 dark:text-brand-400 text-xs hover:underline"
            >
              <span>Baca Kebijakan Privasi →</span>
            </Link>
          </div>
        </div>
      </SectionContainer>
    </article>
  );
}
