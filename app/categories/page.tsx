import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ShoppingBag,
  Utensils,
  Shirt,
  HeartPulse,
  Laptop,
  Smartphone,
  Sprout,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { getCategories } from "@/lib/api/wordpress";

export const metadata: Metadata = {
  title: "Semua Kategori Produk UMKM Kota Serang - Mas Chan Digital",
  description:
    "Jelajahi seluruh sektor kategori produk dan layanan lokal di Kota Serang. Kuliner khas, herbal madu, fashion batik, dan jasa digital terpercaya.",
};

function getCategoryIcon(slug: string, className: string = "w-8 h-8") {
  const s = slug.toLowerCase();
  if (
    s.includes("kuliner") ||
    s.includes("makan") ||
    s.includes("food") ||
    s.includes("snack") ||
    s.includes("bandeng")
  ) {
    return (
      <Utensils className={`${className} text-amber-500`} aria-hidden="true" />
    );
  }
  if (
    s.includes("herbal") ||
    s.includes("madu") ||
    s.includes("kesehatan") ||
    s.includes("obat")
  ) {
    return (
      <HeartPulse
        className={`${className} text-emerald-500`}
        aria-hidden="true"
      />
    );
  }
  if (
    s.includes("fashion") ||
    s.includes("batik") ||
    s.includes("baju") ||
    s.includes("pakaian")
  ) {
    return (
      <Shirt className={`${className} text-rose-500`} aria-hidden="true" />
    );
  }
  if (
    s.includes("digital") ||
    s.includes("jasa") ||
    s.includes("it") ||
    s.includes("web") ||
    s.includes("app")
  ) {
    return (
      <Laptop className={`${className} text-brand-500`} aria-hidden="true" />
    );
  }
  if (s.includes("elektronik") || s.includes("gadget") || s.includes("hp")) {
    return (
      <Smartphone
        className={`${className} text-indigo-500`}
        aria-hidden="true"
      />
    );
  }
  if (
    s.includes("tani") ||
    s.includes("kebun") ||
    s.includes("bibit") ||
    s.includes("tanaman")
  ) {
    return (
      <Sprout className={`${className} text-lime-600`} aria-hidden="true" />
    );
  }
  return (
    <ShoppingBag className={`${className} text-brand-600`} aria-hidden="true" />
  );
}

export default async function CategoriesIndexPage() {
  const categories = await getCategories();

  return (
    <article
      aria-labelledby="all-categories-title"
      className="space-y-8 sm:space-y-12 pb-16"
    >
      {/* Header */}
      <header className="relative bg-brand-gradient py-12 sm:py-16 overflow-hidden text-white">
        <div
          className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] opacity-10 pointer-events-none [background-size:16px_16px]"
          aria-hidden="true"
        />

        <SectionContainer className="z-10 relative space-y-4 mx-auto py-0 max-w-3xl text-center">
          <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full font-semibold text-amber-300 text-xs">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Katalog Sektor Bisnis Kota Serang</span>
          </div>
          <h1
            id="all-categories-title"
            className="font-slab font-black text-2xl sm:text-4xl"
          >
            Semua Kategori Produk & Layanan
          </h1>
          <p className="text-slate-200 text-xs sm:text-sm">
            Pilih kategori usaha di bawah ini untuk menemukan produk terbaik dan
            kontak langsung ke WhatsApp penjual lokal.
          </p>
        </SectionContainer>
      </header>

      {/* Grid Kategori */}
      <SectionContainer className="py-0">
        <div className="gap-4 sm:gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group flex justify-between items-center gap-4 bg-white dark:bg-surface-darkCard shadow-subtle hover:shadow-card-hover p-6 border border-slate-200/80 dark:border-slate-800 rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="flex justify-center items-center bg-slate-50 dark:bg-slate-800 rounded-2xl w-14 h-14 group-hover:scale-110 transition-transform shrink-0">
                  {getCategoryIcon(cat.slug, "w-7 h-7")}
                </div>
                <div>
                  <h2 className="font-slab font-bold text-slate-900 dark:group-hover:text-brand-400 dark:text-white group-hover:text-brand-800 text-base transition-colors">
                    {cat.name}
                  </h2>
                  <span className="text-slate-500 dark:text-slate-400 text-xs">
                    {cat.count
                      ? `${cat.count} Produk Terdaftar`
                      : "Lihat Produk"}
                  </span>
                </div>
              </div>

              <div className="flex justify-center items-center bg-slate-100 dark:bg-slate-800 group-hover:bg-brand-800 rounded-full w-8 h-8 text-slate-400 group-hover:text-white transition-all shrink-0">
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </SectionContainer>
    </article>
  );
}
