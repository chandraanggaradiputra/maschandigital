// Tambahkan di baris atas file:
export const revalidate = 60; // Refresh katalog produk setiap 60 detik

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Store, ShieldCheck, MapPin, Tag, CheckCircle2 } from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { ProductCard } from "@/components/cards/ProductCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { OrderSection } from "@/components/product/OrderSection";
import { VendorTawkChat } from "@/components/chat/VendorTawkChat";
import { ProductJsonLd } from "@/components/seo/ProductJsonLd";
import {
  getProductBySlug,
  getProducts,
  getVendorBySlug,
} from "@/lib/api/wordpress";
import { formatRupiah } from "@/lib/utils";
import { checkStoreStatus } from "@/lib/storeStatus";

// Jaring pengaman eksplisit — konsisten dengan halaman lain yang menampilkan
// status buka/tutup toko (lihat catatan yang sama di app/page.tsx dkk).
export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;

  if (!slug) {
    return { title: "Produk Tidak Ditemukan - Mas Chan Digital" };
  }

  const product = await getProductBySlug(slug);
  if (!product) {
    return { title: "Produk Tidak Ditemukan - Mas Chan Digital" };
  }

  const seoTitle =
    product.seo?.meta_title || `${product.name} - Mas Chan Digital Serang`;
  const seoDesc =
    product.seo?.meta_description ||
    product.short_description ||
    `Beli ${product.name} langsung dari vendor lokal ${product.vendor?.store_name || "Serang"} via WhatsApp. Bebas biaya admin.`;
  const mainImg =
    product.images[0]?.src || "https://maschandigital.id/mas-chan-digital.webp";

  return {
    title: seoTitle,
    description: seoDesc,
    keywords: product.seo?.focus_keyword
      ? [product.seo.focus_keyword, "Marketplace Serang", "Mas Chan Digital"]
      : undefined,
    openGraph: {
      title: seoTitle,
      description: seoDesc,
      url: `https://maschandigital.id/products/${product.slug}`,
      siteName: "Mas Chan Digital",
      locale: "id_ID",
      type: "article",
      images: [
        {
          url: mainImg,
          width: 1200,
          height: 630,
          alt: `Foto produk ${product.name} di Mas Chan Digital`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDesc,
      images: [mainImg],
    },
  };
}

export default async function SingleProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;

  if (!slug) {
    notFound();
  }

  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const allProducts = await getProducts();
  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 4);
  const vendor = product.vendor?.slug
    ? await getVendorBySlug(product.vendor.slug)
    : null;

  // Cek Status Jam Buka & Libur Toko Vendor
  const storeStatus = checkStoreStatus(
    vendor?.store_hours,
    vendor?.vacation_mode,
  );

  const hasSale = Boolean(product.on_sale && product.sale_price);
  const isAffiliate =
    product.type === "affiliate" && Boolean(product.external_url);

  const currentPrice = hasSale
    ? product.sale_price
    : product.regular_price || product.price;
  const discountPercent =
    hasSale && product.regular_price
      ? Math.round(
          ((parseFloat(product.regular_price) -
            parseFloat(product.sale_price)) /
            parseFloat(product.regular_price)) *
            100,
        )
      : 0;

  const productUrl = `https://maschandigital.id/products/${product.slug}`;

  return (
    <article
      aria-labelledby="product-main-title"
      className="space-y-8 sm:space-y-12 py-6 sm:py-10"
    >
      {/* Product Json LTD */}
      <ProductJsonLd product={product} />

      {/* Breadcrumb */}
      <SectionContainer className="py-0">
        <nav aria-label="Navigasi Breadcrumb">
          <ol className="flex items-center gap-2 m-0 p-0 text-slate-500 dark:text-slate-400 text-xs sm:text-sm list-none">
            <li>
              <Link
                href="/"
                className="focus-visible:outline-none hover:text-brand-800 dark:hover:text-brand-400 focus-visible:underline transition-colors"
              >
                Beranda
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                href="/products"
                className="focus-visible:outline-none hover:text-brand-800 dark:hover:text-brand-400 focus-visible:underline transition-colors"
              >
                Produk
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li
              aria-current="page"
              className="max-w-xs sm:max-w-md font-semibold text-slate-800 dark:text-slate-200 truncate"
            >
              {product.name}
            </li>
          </ol>
        </nav>
      </SectionContainer>

      {/* Main Product Showcase */}
      <SectionContainer className="py-0">
        <div className="items-start gap-8 lg:gap-12 grid grid-cols-1 lg:grid-cols-12">
          {/* Left: Product Image */}
          <div className="space-y-4 lg:col-span-6">
            <figure className="group relative bg-white dark:bg-surface-darkCard shadow-card-hover m-0 border border-slate-200/80 dark:border-slate-800 rounded-3xl aspect-square overflow-hidden">
              <Image
                src={
                  product.images[0]?.src ||
                  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"
                }
                alt={`Foto utama produk ${product.name}`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />

              <figcaption className="top-4 left-4 z-10 absolute flex flex-wrap gap-2">
                {product.categories.map((cat) => (
                  <Badge
                    key={cat.id || cat.slug}
                    variant="primary"
                    className="bg-white/95 dark:bg-slate-900/95 shadow-sm px-3 py-1 text-xs"
                  >
                    <Tag className="mr-1 w-3 h-3" aria-hidden="true" />
                    <span>{cat.name}</span>
                  </Badge>
                ))}
              </figcaption>

              {hasSale && (
                <div className="top-4 right-4 z-10 absolute">
                  <Badge
                    variant="danger"
                    className="shadow-md px-3 py-1 font-bold text-xs"
                  >
                    <span className="sr-only">Status Diskon: </span>HEMAT{" "}
                    {discountPercent}%
                  </Badge>
                </div>
              )}
            </figure>
          </div>

          {/* Right: Info & CTA */}
          <div className="space-y-6 lg:col-span-6">
            {/* Vendor Header Box */}
            <aside
              aria-label="Informasi Toko Penjual"
              className="flex justify-between items-center gap-4 bg-white dark:bg-surface-darkCard shadow-subtle p-3.5 border border-slate-200/80 dark:border-slate-800 rounded-2xl"
            >
              <Link
                href={`/vendors/${product.vendor?.slug || "vendor-serang"}`}
                className="group flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                aria-label={`Lihat profil toko ${product.vendor?.store_name || "Vendor"}`}
              >
                <div className="relative flex justify-center items-center bg-brand-50 dark:bg-brand-950/80 border border-brand-100 dark:border-brand-900 rounded-xl w-10 h-10 overflow-hidden font-bold text-brand-700 dark:text-brand-400 shrink-0">
                  {vendor?.avatar || product.vendor?.avatar ? (
                    <Image
                      src={vendor?.avatar || product.vendor?.avatar || ""}
                      alt={`Avatar ${product.vendor?.store_name || "Vendor"}`}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  ) : (
                    <Store className="w-5 h-5" aria-hidden="true" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 font-slab font-bold text-slate-900 dark:group-hover:text-brand-400 dark:text-white group-hover:text-brand-800 text-sm transition-colors">
                    <span>{product.vendor?.store_name || "Vendor Serang"}</span>
                    {product.vendor?.is_verified && (
                      <ShieldCheck
                        className="w-4 h-4 text-emerald-500 shrink-0"
                        aria-label="Vendor Terverifikasi"
                      />
                    )}
                  </div>
                  <address className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs not-italic">
                    <MapPin
                      className="w-3 h-3 text-brand-600"
                      aria-hidden="true"
                    />
                    <span>
                      {vendor?.location_district
                        ? `Kec. ${vendor.location_district}, Kota Serang`
                        : "Kota Serang, Banten"}
                    </span>
                  </address>
                </div>
              </Link>

              <Link
                href={`/vendors/${product.vendor?.slug || "vendor-serang"}`}
              >
                <Button variant="outline" size="sm" className="text-xs">
                  <span>Kunjungi Toko</span>
                </Button>
              </Link>
            </aside>

            {/* Product Title */}
            <header className="space-y-2">
              <h1
                id="product-main-title"
                className="font-slab font-black text-slate-900 dark:text-white text-2xl sm:text-3xl leading-tight"
              >
                {product.name}
              </h1>
              {product.short_description && (
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  {product.short_description}
                </p>
              )}
            </header>

            {/* Price Box */}
            <div className="space-y-1 bg-brand-50/70 dark:bg-brand-950/40 p-4 sm:p-5 border border-brand-100 dark:border-brand-900/60 rounded-2xl">
              <span className="font-semibold text-brand-800 dark:text-brand-300 text-xs uppercase tracking-wider">
                Harga Resmi Vendor
              </span>
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="sr-only">Harga: </span>
                <span className="font-slab font-black text-brand-900 dark:text-brand-400 text-2xl sm:text-3xl">
                  {formatRupiah(currentPrice)}
                </span>
                {hasSale && (
                  <>
                    <span className="sr-only">Harga asli: </span>
                    <del className="text-slate-400 text-sm sm:text-base line-through">
                      {formatRupiah(product.regular_price)}
                    </del>
                  </>
                )}
              </div>
              <p className="pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                * Transaksi langsung dengan penjual, tanpa biaya admin atau
                potongan gateway.
              </p>
            </div>

            {/* Store Status + Order Actions (Client Component — lihat komentar di OrderSection.tsx) */}
            <OrderSection
              initialStoreStatus={storeStatus}
              storeHours={vendor?.store_hours}
              vacationMode={vendor?.vacation_mode}
              whatsappNumber={
                product.vendor?.whatsapp_number || "6285213655126"
              }
              vendorName={product.vendor?.store_name || "Admin Toko"}
              productName={product.name}
              unitPrice={parseFloat(currentPrice) || 0}
              productUrl={productUrl}
              isAffiliate={isAffiliate}
              affiliateUrl={product.external_url}
              affiliateButtonText={product.button_text}
            />

            <VendorTawkChat
              enabled={vendor?.chat_integration?.enabled ?? false}
              propertyId={vendor?.chat_integration?.property_id ?? ""}
              widgetId={vendor?.chat_integration?.widget_id ?? ""}
            />

            <ul className="flex justify-between items-center m-0 p-0 px-1 pt-2 text-slate-500 dark:text-slate-400 text-xs list-none">
              <li className="flex items-center gap-1.5">
                <CheckCircle2
                  className="w-4 h-4 text-emerald-500"
                  aria-hidden="true"
                />
                <span>Respon Cepat Vendor</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2
                  className="w-4 h-4 text-emerald-500"
                  aria-hidden="true"
                />
                <span>100% Produk Lokal Asli</span>
              </li>
            </ul>

            {/* Full Description */}
            <section
              aria-labelledby="desc-heading"
              className="space-y-4 pt-6 border-slate-200 dark:border-slate-800 border-t"
            >
              <h2
                id="desc-heading"
                className="font-slab font-bold text-slate-900 dark:text-white text-lg"
              >
                Deskripsi Lengkap Produk
              </h2>
              <div className="space-y-3 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                <p>{product.description}</p>
              </div>
            </section>
          </div>
        </div>
      </SectionContainer>

      {/* Related Products Section */}
      <SectionContainer
        aria-labelledby="related-heading"
        className="py-6 sm:py-10 border-slate-200 dark:border-slate-800 border-t"
      >
        <header className="mb-6">
          <h2
            id="related-heading"
            className="font-slab font-bold text-slate-900 dark:text-white text-xl sm:text-2xl"
          >
            Produk Terkait di Kota Serang
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
            Rekomendasi produk lainnya dari UMKM lokal Serang
          </p>
        </header>

        <div className="gap-4 sm:gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {relatedProducts.map((relProduct) => (
            <ProductCard key={relProduct.id} product={relProduct} />
          ))}
        </div>
      </SectionContainer>
    </article>
  );
}
