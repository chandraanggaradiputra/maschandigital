import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { ProductCatalogView } from "@/components/product/ProductCatalogView";
import { ProductCollectionJsonLd } from "@/components/seo/ProductCollectionJsonLd";
import { getProducts, getCategories } from "@/lib/api/wordpress";

// Status buka/tutup toko per kartu produk berubah tiap menit — jangan
// dibiarkan Next.js render statis sekali lalu disajikan basi.
export const revalidate = 60;
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Katalog Produk UMKM Kota Serang",
  description:
    "Jelajahi seluruh katalog produk kuliner, madu & herbal, fashion batik, dan jasa lokal dari UMKM di 6 kecamatan Kota Serang. Beli langsung via WhatsApp tanpa perantara.",
  openGraph: {
    title: "Katalog Produk UMKM Kota Serang",
    description:
      "Jelajahi seluruh katalog produk kuliner, madu & herbal, fashion batik, dan jasa lokal dari UMKM di 6 kecamatan Kota Serang.",
    url: "https://maschandigital.id/products",
    siteName: "Mas Chan Digital",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/mas-chan-digital.webp",
        width: 1200,
        height: 630,
        alt: "Katalog Produk UMKM Kota Serang - Mas Chan Digital",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Katalog Produk UMKM Kota Serang",
    description: "Jelajahi seluruh katalog produk UMKM pilihan di Kota Serang.",
    images: ["/mas-chan-digital.webp"],
  },
};

export default async function ProductsIndexPage() {
  const allProducts = await getProducts();
  const allCategories = await getCategories();

  return (
    <div className="space-y-8 sm:space-y-12 pb-16">
      {/* 1. Header Banner */}
      <ProductCollectionJsonLd products={allProducts} />
      <header className="relative bg-brand-gradient py-12 sm:py-16 overflow-hidden text-white">
        <div
          className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] opacity-10 pointer-events-none [background-size:16px_16px]"
          aria-hidden="true"
        />

        <SectionContainer className="z-10 relative space-y-4 mx-auto py-0 max-w-4xl text-center">
          {/* Breadcrumb */}
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
                Semua Produk
              </li>
            </ol>
          </nav>

          <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 border border-white/20 rounded-full font-semibold text-amber-300 text-xs">
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            <span>Katalog Lengkap Kota Serang</span>
          </div>

          <h1 className="font-slab font-black text-2xl sm:text-4xl leading-tight">
            Katalog Produk UMKM Kota Serang
          </h1>
          <p className="mx-auto max-w-2xl text-slate-200 text-xs sm:text-sm">
            Temukan aneka produk lokal pilihan, kuliner khas, madu murni,
            fashion batik, dan jasa dari mitra UMKM di 6 kecamatan Kota Serang.
            Transaksi langsung via WhatsApp tanpa potongan biaya.
          </p>
        </SectionContainer>
      </header>

      {/* 2. Main Product Catalog Section */}
      <SectionContainer className="py-0">
        <React.Suspense
          fallback={
            <div className="p-12 text-center text-slate-400 text-sm">
              Memuat katalog produk UMKM Kota Serang...
            </div>
          }
        >
          <ProductCatalogView
            initialProducts={allProducts}
            categories={allCategories}
          />
        </React.Suspense>
      </SectionContainer>
    </div>
  );
}
