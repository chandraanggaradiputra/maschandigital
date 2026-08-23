import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import {
  BookOpen,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Store,
  Package,
  MessageCircle,
  QrCode,
  CreditCard,
} from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { TUTORIAL_MODULES, getAllTutorialChapters } from "@/lib/tutorialData";

export const metadata: Metadata = {
  title: "Pusat Panduan & Tutorial Vendor - Mas Chan Digital",
  description:
    "Dokumentasi dan kurikulum tutorial lengkap bagi pelaku UMKM di Kota Serang untuk mengelola toko, katalog produk, dan transaksi WhatsApp di Mas Chan Digital.",
  openGraph: {
    title: "Pusat Panduan & Tutorial Vendor - Mas Chan Digital",
    description:
      "Panduan lengkap cara berjualan dan mengoptimasi toko UMKM di Kota Serang.",
    url: "https://maschandigital.id/panduan",
    siteName: "Mas Chan Digital",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/mas-chan-digital.webp",
        width: 1200,
        height: 630,
        alt: "Panduan Vendor Mas Chan Digital",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pusat Panduan & Tutorial Vendor - Mas Chan Digital",
    description:
      "Panduan lengkap cara berjualan di Mas Chan Digital Kota Serang.",
    images: ["/mas-chan-digital.webp"],
  },
};

export default function PanduanIndexPage() {
  const allChapters = getAllTutorialChapters();

  const getModuleIcon = (iconName: string) => {
    switch (iconName) {
      case "Store":
        return <Store className="w-6 h-6 text-brand-700 dark:text-brand-300" />;
      case "Package":
        return (
          <Package className="w-6 h-6 text-brand-700 dark:text-brand-300" />
        );
      case "MessageCircle":
        return (
          <MessageCircle className="w-6 h-6 text-brand-700 dark:text-brand-300" />
        );
      case "QrCode":
        return (
          <QrCode className="w-6 h-6 text-brand-700 dark:text-brand-300" />
        );
      case "CreditCard":
        return (
          <CreditCard className="w-6 h-6 text-brand-700 dark:text-brand-300" />
        );
      default:
        return (
          <BookOpen className="w-6 h-6 text-brand-700 dark:text-brand-300" />
        );
    }
  };

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      {/* 1. Header Hero Banner */}
      <header className="relative bg-brand-gradient py-14 sm:py-20 overflow-hidden text-white">
        <div
          className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] opacity-10 pointer-events-none [background-size:16px_16px]"
          aria-hidden="true"
        />

        <SectionContainer className="z-10 relative space-y-4 mx-auto py-0 max-w-4xl text-center">
          <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 border border-white/20 rounded-full font-semibold text-amber-300 text-xs">
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            <span>Akademi & Panduan Penjual UMKM</span>
          </div>

          <h1 className="font-slab font-black text-3xl sm:text-5xl leading-tight">
            Pusat Panduan & Tutorial Vendor
          </h1>
          <p className="mx-auto max-w-2xl font-normal text-slate-200 text-xs sm:text-base leading-relaxed">
            Pelajari seluruh tahapan praktis mulai dari membuka toko gratis,
            mengunggah katalog produk berkualitas, mengelola pesanan WhatsApp,
            hingga mencetak Standee QR Code warung Anda di Kota Serang.
          </p>

          <div className="flex justify-center items-center gap-4 pt-2 text-slate-200 text-xs">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{TUTORIAL_MODULES.length} Modul Pembelajaran</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-amber-300" />
              <span>{allChapters.length} Materi Praktis</span>
            </span>
          </div>
        </SectionContainer>
      </header>

      {/* 2. Modules Grid (LMS Course Overview) */}
      <SectionContainer className="py-0">
        <div className="space-y-8 mx-auto max-w-5xl">
          <div className="flex justify-between items-center pb-4 border-slate-200 dark:border-slate-800 border-b">
            <div>
              <h2 className="font-slab font-bold text-slate-900 dark:text-white text-xl sm:text-2xl">
                Kurikulum Panduan Penjualan
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
                Pilih topik materi di bawah ini untuk memulai membaca panduan
              </p>
            </div>
          </div>

          <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
            {TUTORIAL_MODULES.map((mod) => (
              <article
                key={mod.id}
                className="flex flex-col justify-between space-y-6 bg-white dark:bg-surface-darkCard shadow-subtle hover:shadow-card-hover p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 rounded-3xl transition-all"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex justify-center items-center bg-brand-50 dark:bg-brand-950/80 border border-brand-100 dark:border-brand-900 rounded-2xl w-12 h-12">
                      {getModuleIcon(mod.iconName)}
                    </div>
                    <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full font-mono font-bold text-slate-600 dark:text-slate-300 text-xs">
                      Modul {mod.moduleNumber}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="font-slab font-bold text-slate-900 dark:text-white text-lg">
                      {mod.title}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
                      {mod.description}
                    </p>
                  </div>

                  {/* Chapters List within Card */}
                  <div className="space-y-2 pt-2 border-slate-100 dark:border-slate-800/80 border-t">
                    {mod.chapters.map((ch) => (
                      <Link
                        key={ch.slug}
                        href={`/panduan/${ch.slug}`}
                        className="group flex justify-between items-center bg-slate-50 hover:bg-brand-50 dark:bg-slate-900/60 dark:hover:bg-brand-950/60 p-2.5 rounded-xl font-medium text-slate-700 hover:text-brand-800 dark:hover:text-brand-300 dark:text-slate-300 text-xs transition-colors"
                      >
                        <div className="flex items-center gap-2 pr-2 truncate">
                          <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
                          <span className="truncate">{ch.title}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 transition-transform group-hover:translate-x-1 shrink-0">
                          {ch.estimatedMinutes} mnt &rarr;
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href={`/panduan/${mod.chapters[0]?.slug}`}
                    className="inline-flex items-center gap-2 font-bold text-brand-800 dark:text-brand-400 text-xs hover:underline"
                  >
                    <span>Mulai Modul Ini</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </SectionContainer>
    </div>
  );
}
