import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import {
  Store,
  MessageCircle,
  Heart,
  MapPin,
  ArrowRight,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { Button } from "@/components/ui/Button";
import { cn } from "../../lib/utils";

export const metadata: Metadata = {
  title: "Tentang Kami - Mas Chan Digital | Marketplace Lokal Kota Serang",
  description:
    "Mengenal Mas Chan Digital, platform marketplace direktori lokal untuk memajukan UMKM di Kota Serang melalui transaksi langsung ke WhatsApp vendor.",
};

export default function TentangKamiPage() {
  const districts = [
    {
      name: "Kec. Cipocok Jaya",
      desc: "Pusat pemerintahan dan kawasan perumahan berkembang",
    },
    {
      name: "Kec. Serang",
      desc: "Jantung kuliner, perdagangan, dan pusat perkotaan",
    },
    {
      name: "Kec. Kasemen",
      desc: "Pusat sejarah Kesultanan Banten & pengrajin batik",
    },
    {
      name: "Kec. Taktakan",
      desc: "Sentra agrowisata & perkebunan herbal",
    },
    { name: "Kec. Curug", desc: "Kawasan industri kreatif & komoditas lokal" },
    { name: "Kec. Walantaka", desc: "Sentra pertanian & produk olahan pangan" },
  ];

  return (
    <div className={cn('space-y-12', 'sm:space-y-16', 'pb-16')}>
      {/* 1. HERO BANNER */}
      <section
        aria-labelledby="about-hero-title"
        className={cn('relative', 'bg-brand-gradient', 'py-16', 'sm:py-24', 'overflow-hidden', 'text-white')}
      >
        <div
          className={cn('absolute', 'inset-0', 'bg-[radial-gradient(#fff_1px,transparent_1px)]', 'opacity-10', 'pointer-events-none', '[background-size:16px_16px]')}
          aria-hidden="true"
        />

        <div className={cn('relative', 'space-y-4', 'mx-auto', 'mx-auto', 'px-4', 'sm:px-6', 'lg:px-8', 'max-w-3xl', 'max-w-7xl', 'text-center')}>
          <div className={cn('inline-flex', 'items-center', 'gap-2', 'bg-white/10', 'px-3', 'py-1', 'border', 'border-white/20', 'rounded-full', 'font-semibold', 'text-amber-300', 'text-xs')}>
            <Sparkles className={cn('w-3.5', 'h-3.5')} aria-hidden="true" />
            <span>Mengenal Mas Chan Digital</span>
          </div>
          <h1
            id="about-hero-title"
            className={cn('font-slab', 'font-black', 'text-3xl', 'sm:text-5xl', 'leading-tight')}
          >
            Menghubungkan UMKM Serang Langsung ke Pelanggan
          </h1>
          <p className={cn('font-normal', 'text-slate-200', 'text-sm', 'sm:text-base', 'leading-relaxed')}>
            Platform marketplace dan direktori lokal Kota Serang yang dirancang
            untuk mempermudah transaksi jual beli tanpa potongan biaya gateway
            dan tanpa perantara rumit.
          </p>
        </div>
      </section>

      {/* 2. VISI & MISI */}
      <SectionContainer aria-labelledby="vision-heading" className="py-0">
        <div className={cn('items-center', 'gap-8', 'grid', 'grid-cols-1', 'md:grid-cols-2')}>
          <div className="space-y-4">
            <div className={cn('inline-flex', 'items-center', 'gap-1.5', 'bg-brand-100', 'dark:bg-brand-950/80', 'px-2.5', 'py-0.5', 'rounded-full', 'font-semibold', 'text-brand-800', 'dark:text-brand-300', 'text-xs')}>
              <Heart
                className={cn('fill-rose-500', 'w-3.5', 'h-3.5', 'text-rose-500')}
                aria-hidden="true"
              />
              <span>Latar Belakang</span>
            </div>
            <h2
              id="vision-heading"
              className={cn('font-slab', 'font-bold', 'text-slate-900', 'dark:text-white', 'text-2xl', 'sm:text-3xl', 'leading-snug')}
            >
              Mengapa Mas Chan Digital Diciptakan Tanpa Payment Gateway?
            </h2>
            <p className={cn('text-slate-600', 'dark:text-slate-300', 'text-sm', 'leading-relaxed')}>
              Banyak pelaku UMKM di Kota Serang menghadapi kendala biaya
              administrasi gateway tinggi dan pencairan dana yang lambat.
            </p>
            <p className={cn('text-slate-600', 'dark:text-slate-300', 'text-sm', 'leading-relaxed')}>
              <strong>Mas Chan Digital</strong> hadir dengan pendekatan yang
              lebih ramah bagi pelaku usaha lokal:{" "}
              <strong>transaksi 100% langsung</strong> diarahkan ke WhatsApp
              masing-masing pemilik toko atau tautan afiliasi resmi.
            </p>
          </div>

          <aside
            aria-label="Metode Transaksi"
            className={cn('space-y-4', 'bg-white', 'dark:bg-surface-darkCard', 'shadow-card-hover', 'p-8', 'border', 'border-slate-200/80', 'dark:border-slate-800', 'rounded-3xl')}
          >
            <h3 className={cn('font-slab', 'font-bold', 'text-slate-900', 'dark:text-white', 'text-lg')}>
              2 Pilar Transaksi di Mas Chan Digital:
            </h3>

            <article className={cn('flex', 'items-start', 'gap-4', 'bg-slate-50', 'dark:bg-slate-900/60', 'p-4', 'rounded-2xl')}>
              <div className={cn('flex', 'justify-center', 'items-center', 'bg-whatsapp-500', 'rounded-xl', 'w-10', 'h-10', 'text-white', 'shrink-0')}>
                <MessageCircle
                  className={cn('fill-white', 'w-5', 'h-5')}
                  aria-hidden="true"
                />
              </div>
              <div>
                <h4 className={cn('font-bold', 'text-slate-900', 'dark:text-white', 'text-sm')}>
                  1. Direct WhatsApp Chat
                </h4>
                <p className={cn('mt-1', 'text-slate-600', 'dark:text-slate-400', 'text-xs', 'leading-relaxed')}>
                  Setiap klik pemesanan langsung membuka WhatsApp vendor dengan
                  teks pesanan otomatis berisi nama produk, harga, dan tautan
                  produk.
                </p>
              </div>
            </article>

            <article className={cn('flex', 'items-start', 'gap-4', 'bg-slate-50', 'dark:bg-slate-900/60', 'p-4', 'rounded-2xl')}>
              <div className={cn('flex', 'justify-center', 'items-center', 'bg-brand-800', 'rounded-xl', 'w-10', 'h-10', 'text-white', 'shrink-0')}>
                <ExternalLink className={cn('w-5', 'h-5')} aria-hidden="true" />
              </div>
              <div>
                <h4 className={cn('font-bold', 'text-slate-900', 'dark:text-white', 'text-sm')}>
                  2. Link Affiliasi Vendor
                </h4>
                <p className={cn('mt-1', 'text-slate-600', 'dark:text-slate-400', 'text-xs', 'leading-relaxed')}>
                  Untuk produk digital atau layanan khusus, pembeli diarahkan
                  langsung ke website resmi vendor.
                </p>
              </div>
            </article>
          </aside>
        </div>
      </SectionContainer>

      {/* 3. JANGKAUAN WILAYAH */}
      <SectionContainer
        aria-labelledby="district-coverage-heading"
        className="py-0"
      >
        <header className={cn('space-y-2', 'mx-auto', 'mb-8', 'max-w-2xl', 'text-center')}>
          <h2
            id="district-coverage-heading"
            className={cn('font-slab', 'font-bold', 'text-slate-900', 'dark:text-white', 'text-2xl', 'sm:text-3xl')}
          >
            Jangkauan Wilayah di Kota Serang
          </h2>
          <p className={cn('text-slate-500', 'dark:text-slate-400', 'text-xs', 'sm:text-sm')}>
            Mendukung potensi ekonomi lokal di seluruh kecamatan
          </p>
        </header>

        <ul className={cn('gap-4', 'grid', 'grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3', 'm-0', 'p-0', 'list-none')}>
          {districts.map((item) => (
            <li
              key={item.name}
              className={cn('bg-white', 'dark:bg-surface-darkCard', 'shadow-subtle', 'p-5', 'border', 'border-slate-200/80', 'hover:border-brand-500', 'dark:border-slate-800', 'rounded-2xl', 'transition-colors')}
            >
              <div className={cn('flex', 'items-center', 'gap-2.5', 'mb-2')}>
                <MapPin className={cn('w-4', 'h-4', 'text-brand-600')} aria-hidden="true" />
                <h3 className={cn('font-slab', 'font-bold', 'text-slate-900', 'dark:text-white', 'text-sm')}>
                  {item.name}
                </h3>
              </div>
              <p className={cn('text-slate-500', 'dark:text-slate-400', 'text-xs', 'leading-relaxed')}>
                {item.desc}
              </p>
            </li>
          ))}
        </ul>
      </SectionContainer>
    </div>
  );
}
