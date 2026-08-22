import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { ShieldCheck, Lock, CheckCircle2, ArrowLeft } from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Kebijakan Privasi - Mas Chan Digital Kota Serang",
  description:
    "Kebijakan perlindungan data pribadi, informasi kontak WhatsApp vendor, dan keamanan pengguna di Mas Chan Digital Kota Serang.",
};

export default function PrivacyPage() {
  return (
    <article
      aria-labelledby="privacy-title"
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
                Kebijakan Privasi
              </li>
            </ol>
          </nav>

          <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 border border-white/20 rounded-full font-semibold text-amber-300 text-xs">
            <Lock className="w-4 h-4" aria-hidden="true" />
            <span>Perlindungan Data & Privasi</span>
          </div>

          <h1
            id="privacy-title"
            className="font-slab font-black text-2xl sm:text-4xl leading-tight"
          >
            Kebijakan Privasi
          </h1>
          <p className="mx-auto max-w-2xl text-slate-200 text-xs sm:text-sm">
            Komitmen Mas Chan Digital dalam menjaga kerahasiaan data pribadi,
            informasi akun, dan nomor WhatsApp para mitra vendor dan pengunjung
            di Kota Serang.
          </p>
          <span className="block pt-1 text-[11px] text-slate-300">
            Berlaku efektif sejak: 22 Agustus 2026
          </span>
        </SectionContainer>
      </header>

      {/* 2. Isi Dokumen Privasi */}
      <SectionContainer className="mx-auto py-0 max-w-4xl">
        <div className="space-y-8 bg-white dark:bg-surface-darkCard shadow-subtle p-6 sm:p-10 border border-slate-200/80 dark:border-slate-800 rounded-3xl text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
          {/* Bagian 1: Data yang Dikumpulkan */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex justify-center items-center bg-brand-50 dark:bg-brand-950/80 rounded-xl w-8 h-8 font-slab font-bold text-brand-800 dark:text-brand-300 shrink-0">
                1
              </div>
              <h2 className="font-slab font-bold text-slate-900 dark:text-white text-base sm:text-lg">
                Informasi yang Kami Kumpulkan
              </h2>
            </div>
            <ul className="space-y-2 p-0 text-xs sm:text-sm list-none">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  <strong>Data Profil Toko Vendor:</strong> Nama toko, nama
                  pemilik toko, alamat email, nomor WhatsApp bisnis, alamat
                  jalan, dan kecamatan di Kota Serang.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  <strong>Katalog Produk:</strong> Foto produk, judul produk,
                  deskripsi, harga, dan tautan eksternal (jika produk afiliasi).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  <strong>Data Pembayaran Langganan:</strong> Nama pemilik
                  rekening pengirim dan foto struk transfer manual untuk
                  verifikasi tagihan paket.
                </span>
              </li>
            </ul>
          </section>

          {/* Bagian 2: Penggunaan Data */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex justify-center items-center bg-brand-50 dark:bg-brand-950/80 rounded-xl w-8 h-8 font-slab font-bold text-brand-800 dark:text-brand-300 shrink-0">
                2
              </div>
              <h2 className="font-slab font-bold text-slate-900 dark:text-white text-base sm:text-lg">
                Bagaimana Data Anda Digunakan
              </h2>
            </div>
            <ul className="space-y-2 p-0 text-xs sm:text-sm list-none">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 w-4 h-4 text-brand-600 shrink-0" />
                <span>
                  Menampilkan etalase katalog produk dan profil toko Anda di
                  halaman publik website.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 w-4 h-4 text-brand-600 shrink-0" />
                <span>
                  Memfasilitasi pembeli agar dapat menghubungi nomor WhatsApp
                  vendor secara langsung dengan format pesan otomatis.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 w-4 h-4 text-brand-600 shrink-0" />
                <span>
                  Mengirimkan pengingat masa aktif paket dan konfirmasi
                  persetujuan perpanjangan langganan di dashboard.
                </span>
              </li>
            </ul>
          </section>

          {/* Bagian 3: Keamanan Data */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex justify-center items-center bg-brand-50 dark:bg-brand-950/80 rounded-xl w-8 h-8 font-slab font-bold text-brand-800 dark:text-brand-300 shrink-0">
                3
              </div>
              <h2 className="font-slab font-bold text-slate-900 dark:text-white text-base sm:text-lg">
                Jaminan Keamanan & Tanpa Penjualan Data
              </h2>
            </div>
            <p>
              <strong>
                Kami menjamin 100% bahwa Mas Chan Digital tidak pernah dan tidak
                akan pernah menjual, menyewakan, atau memperjualbelikan data
                pribadi vendor kepada pihak ketiga mana pun.
              </strong>
            </p>
            <p>
              Seluruh kata sandi akun disimpan dalam bentuk enkripsi satu arah
              (*hashing*) standar industri, dan sesi autentikasi dilindungi oleh
              token JWT dengan enkripsi Base64URL yang aman.
            </p>
          </section>

          {/* Bagian 4: Hak Pengguna */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex justify-center items-center bg-brand-50 dark:bg-brand-950/80 rounded-xl w-8 h-8 font-slab font-bold text-brand-800 dark:text-brand-300 shrink-0">
                4
              </div>
              <h2 className="font-slab font-bold text-slate-900 dark:text-white text-base sm:text-lg">
                Hak Pengelolaan Data Mandiri
              </h2>
            </div>
            <p>
              Setiap vendor memiliki hak penuh untuk memperbarui nomor WhatsApp,
              alamat toko, foto produk, atau deskripsi usaha kapan saja melalui
              panel <strong>Pengaturan Profil Toko</strong> (
              <code>/dashboard/profile</code>).
            </p>
          </section>

          {/* Bagian 5: Kontak */}
          <section className="space-y-3 pt-4 border-slate-100 dark:border-slate-800 border-t">
            <h2 className="font-slab font-bold text-slate-900 dark:text-white text-base">
              Hubungi Pengelola Privasi
            </h2>
            <div className="space-y-1 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl font-mono text-xs">
              <p>
                <strong>WhatsApp:</strong> 0822-9814-8474 (Mas Chan)
              </p>
              <p>
                <strong>Email:</strong> admin@maschandigital.id
              </p>
              <p>
                <strong>Kantor:</strong> Banten Indah Permai Blok E1 No.12A,
                Kota Serang, Banten 42111
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
              href="/syarat-ketentuan"
              className="font-bold text-brand-800 dark:text-brand-400 text-xs hover:underline"
            >
              <span>Baca Syarat & Ketentuan →</span>
            </Link>
          </div>
        </div>
      </SectionContainer>
    </article>
  );
}
