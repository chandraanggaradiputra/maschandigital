// Tambahkan di baris atas file:

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Store, ShieldCheck, MapPin, CheckCircle2, FileText } from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { ProductCard } from "@/components/cards/ProductCard";
import { Button } from "@/components/ui/Button";
import { ShareButton } from "@/components/ui/ShareButton";
import { OrderSection } from "@/components/product/OrderSection";
import { VendorWhatsAppChat } from "@/components/chat/VendorWhatsAppChat";
import { ProductReviewsSection } from "@/components/product/ProductReviewsSection";
import { ProductJsonLd } from "@/components/seo/ProductJsonLd";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductViewTracker } from "@/components/product/ProductViewTracker";
import {
  getProductBySlug,
  getProducts,
  getVendorBySlug,
  getProductReviews,
} from "@/lib/api/wordpress";
import { formatRupiah, cn } from "@/lib/utils";
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

  const [allProducts, vendor, reviewsData] = await Promise.all([
    getProducts(),
    product.vendor?.slug
      ? getVendorBySlug(product.vendor.slug)
      : Promise.resolve(null),
    getProductReviews(product.id),
  ]);

  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  // Cek Status Jam Buka & Libur Toko Vendor
  const storeStatus = checkStoreStatus(
    vendor?.store_hours,
    vendor?.vacation_mode,
  );

  const hasSale = Boolean(product.on_sale && product.sale_price);
  const isAffiliate =
    product.type === "affiliate" && Boolean(product.external_url);

  const isVariableProduct = Boolean(
    product.is_variable || (product.variations && product.variations.length > 0),
  );
  const priceRange =
    product.price_range ||
    (product.variations && product.variations.length > 0
      ? {
          min: Math.min(
            ...product.variations
              .map((v) => Number(v.price))
              .filter((p) => !isNaN(p) && p > 0),
          ),
          max: Math.max(
            ...product.variations
              .map((v) => Number(v.price))
              .filter((p) => !isNaN(p) && p > 0),
          ),
        }
      : undefined);

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

  // Pemformat cerdas: jika teks deskripsi lama belum bertag HTML, ubah enter ganda jadi paragraf dan enter tunggal jadi <br/>
  const formattedDescription = (() => {
    const raw = product.description || "";
    if (!raw.trim()) return "<p>Belum ada deskripsi lengkap untuk produk ini.</p>";

    // Jika sudah memiliki tag HTML paragraf, list, atau heading
    if (/<(p|br|ul|ol|li|h[1-6]|blockquote|div)[^>]*>/i.test(raw)) {
      return raw;
    }

    // Jika teks polos dari textarea lama, ubah \n\n menjadi <p> dan \n menjadi <br/>
    return raw
      .split(/\r?\n\r?\n+/)
      .map((paragraph) => `<p>${paragraph.replace(/\r?\n/g, "<br />")}</p>`)
      .join("");
  })();

  return (
    <>
      {/* Product Json LD dengan Schema.org Rich Snippets & Breadcrumb Graph */}
      <ProductJsonLd product={product} reviewsData={reviewsData} />

      <article
        aria-labelledby="product-main-title"
        className="space-y-8 sm:space-y-12 py-6 sm:py-10 pb-28 md:pb-12"
      >
        {/* Pelacak Tayangan Produk Otomatis */}
        <ProductViewTracker product={product} />

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
          {/* Kolom Kiri: Galeri Foto Produk (Sticky di Desktop) */}
          <div className={cn('lg:col-span-6', 'space-y-4', 'lg:sticky', 'lg:top-24', 'self-start')}>
            <ProductGallery
              images={product.images}
              productName={product.name}
              categories={product.categories}
              hasSale={hasSale}
              discountPercent={discountPercent}
            />
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

            {/* Product Title & Share Button */}
            <header className="space-y-2">
              <div className="flex justify-between items-start gap-4">
                <h1
                  id="product-main-title"
                  className="flex-1 font-slab font-black text-slate-900 dark:text-white text-2xl sm:text-3xl leading-tight"
                >
                  {product.name}
                </h1>
                <ShareButton
                  title={product.name}
                  text={`Beli ${product.name} langsung di Mas Chan Digital Kota Serang:`}
                  url={productUrl}
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                />
              </div>
              {product.short_description && (
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  {product.short_description}
                </p>
              )}
            </header>

            {/* Price Box */}
            <div className="space-y-1 bg-brand-50/70 dark:bg-brand-950/40 p-4 sm:p-5 border border-brand-100 dark:border-brand-900/60 rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-brand-800 dark:text-brand-300 text-xs uppercase tracking-wider">
                  {product.business_type === "service"
                    ? "Skema Tarif Layanan"
                    : "Harga Resmi Vendor"}
                </span>
                {product.business_type === "service" ? (
                  <span className="text-[11px] font-semibold bg-sky-100 dark:bg-sky-900/80 text-sky-800 dark:text-sky-200 px-2.5 py-0.5 rounded-full">
                    🛠️ Layanan Jasa
                  </span>
                ) : isVariableProduct ? (
                  <span className="text-[11px] font-semibold bg-brand-100 dark:bg-brand-900/80 text-brand-800 dark:text-brand-200 px-2 py-0.5 rounded-full">
                    Pilihan Varian
                  </span>
                ) : null}
              </div>
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="sr-only">Harga: </span>
                <span className="font-slab font-black text-brand-900 dark:text-brand-400 text-2xl sm:text-3xl">
                  {product.business_type === "service"
                    ? product.price_model === "consultation"
                      ? "Konsultasi Tarif"
                      : product.price_model === "starting_at"
                        ? `Mulai dari ${formatRupiah(currentPrice)}`
                        : formatRupiah(currentPrice)
                    : isVariableProduct && priceRange && priceRange.min > 0
                      ? priceRange.min === priceRange.max
                        ? formatRupiah(priceRange.min)
                        : `${formatRupiah(priceRange.min)} - ${formatRupiah(priceRange.max)}`
                      : formatRupiah(currentPrice)}
                </span>
                {product.business_type !== "service" && !isVariableProduct && hasSale && (
                  <>
                    <span className="sr-only">Harga asli: </span>
                    <del className="text-slate-400 text-sm sm:text-base line-through">
                      {formatRupiah(product.regular_price)}
                    </del>
                  </>
                )}
              </div>
              <p className="pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                {product.business_type === "service"
                  ? "* Konsultasi dan kesepakatan jadwal langsung dengan penyedia jasa via WhatsApp."
                  : "* Transaksi langsung dengan penjual, tanpa biaya admin atau potongan gateway."}
              </p>
            </div>

            {/* Service Areas Badge Section (Jika Layanan Jasa) */}
            {product.business_type === "service" &&
              product.service_areas &&
              product.service_areas.length > 0 && (
                <div className="p-4 bg-sky-50/60 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/40 rounded-2xl space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-sky-900 dark:text-sky-200">
                    <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                    <span>Wilayah Jangkauan Layanan di Kota Serang:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {product.service_areas.map((area) => (
                      <span
                        key={area}
                        className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-sky-200 dark:border-sky-800 text-sky-900 dark:text-sky-200 rounded-lg text-xs font-semibold shadow-2xs"
                      >
                        📍 Kec. {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}

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
              productId={product.id}
              vendorSlug={product.vendor?.slug}
              isVariable={isVariableProduct}
              variations={product.variations}
              businessType={product.business_type}
              priceModel={product.price_model}
              serviceAction={product.service_action}
              serviceAreas={product.service_areas}
            />

            {/* Layanan Direct WhatsApp Chat Drawer Toko */}
            <VendorWhatsAppChat
              whatsappNumber={vendor?.whatsapp_number || product.vendor?.whatsapp_number}
              vendorName={vendor?.store_name || product.vendor?.store_name || "Penjual"}
              productName={product.name}
              productId={product.id}
              kecamatan={vendor?.address?.city || vendor?.location_district || "Kota Serang"}
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

            {/* 1. DESKRIPSI PRODUK LENGKAP */}
            <div className={cn('p-5', 'sm:p-7', 'bg-white', 'dark:bg-slate-900', 'border', 'border-slate-200', 'dark:border-slate-800', 'rounded-2xl', 'shadow-sm', 'space-y-4')}>
              <div className={cn('flex', 'items-center', 'gap-2', 'text-slate-900', 'dark:text-white', 'font-slab', 'font-bold', 'text-lg', 'border-b', 'border-slate-100', 'dark:border-slate-800', 'pb-3')}>
                <FileText className={cn('w-5', 'h-5', 'text-[#093c96]', 'dark:text-blue-400')} />
                <h3>Deskripsi Lengkap Produk</h3>
              </div>

              {/* Render Rich HTML dengan Tipografi Terstruktur */}
              <div
                className={cn('prose', 'prose-slate', 'dark:prose-invert', 'max-w-none', 'text-sm', 'sm:text-base', 'leading-relaxed', 'text-slate-700', 'dark:text-slate-300', '[&_p]:mb-4', '[&_p]:leading-relaxed', 'last:[&_p]:mb-0', '[&_ul]:list-disc', '[&_ul]:pl-6', '[&_ul]:mb-4', '[&_ul]:space-y-1.5', '[&_ol]:list-decimal', '[&_ol]:pl-6', '[&_ol]:mb-4', '[&_ol]:space-y-1.5', '[&_li]:text-slate-700', 'dark:[&_li]:text-slate-300', '[&_strong]:font-bold', '[&_strong]:text-slate-900', 'dark:[&_strong]:text-white', '[&_h1]:text-xl', '[&_h1]:font-bold', '[&_h1]:mb-3', '[&_h2]:text-lg', '[&_h2]:font-bold', '[&_h2]:mb-2.5', '[&_h3]:text-base', '[&_h3]:font-bold', '[&_h3]:mb-2', '[&_blockquote]:border-l-4', '[&_blockquote]:border-[#093c96]', '[&_blockquote]:pl-4', '[&_blockquote]:italic', '[&_blockquote]:my-3', '[&_br]:block', '[&_br]:content-[\'\']', '[&_br]:my-1')}
                dangerouslySetInnerHTML={{ __html: formattedDescription }}
              />
            </div>

            {/* Testimoni & Ulasan Pembeli Otentik */}
            <ProductReviewsSection
              productId={product.id}
              productName={product.name}
              initialReviewsData={reviewsData}
            />
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
            <ProductCard
              key={relProduct.id}
              product={relProduct}
              initialStoreStatus={checkStoreStatus(
                relProduct.vendor?.store_hours,
                relProduct.vendor?.vacation_mode,
              )}
            />
          ))}
        </div>
      </SectionContainer>
    </article>
    </>
  );
}
