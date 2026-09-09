import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ShareButton } from "@/components/ui/ShareButton";
import type { Metadata } from "next";
import {
  Store,
  MapPin,
  MessageCircle,
  Star,
  ShieldCheck,
  Package,
  Building2,
  Calendar,
  Mail,
  Phone,
  Clock,
  XCircle,
  MessageSquare,
} from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { ProductCard } from "@/components/cards/ProductCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { getVendorBySlug, getVendorProducts } from "@/lib/api/wordpress";
import { generateWhatsAppVendorUrl, formatIndonesianDate } from "@/lib/utils";
import { checkStoreStatus } from "@/lib/storeStatus";
import { StoreHours } from "@/types";
import { VendorWhatsAppChat } from "@/components/chat/VendorWhatsAppChat";
import { VendorJsonLd } from "@/components/seo/VendorJsonLd";
import { cn } from "../../../lib/utils";

// Halaman ini menampilkan status buka/tutup toko yang dinamis
export const dynamic = "force-dynamic";

type VendorPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: VendorPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;

  if (!slug) {
    return { title: "Vendor Tidak Ditemukan - Mas Chan Digital" };
  }

  const vendor = await getVendorBySlug(slug);
  if (!vendor) {
    return { title: "Vendor Tidak Ditemukan - Mas Chan Digital" };
  }

  const seoTitle =
    vendor.store_seo?.seoTitle ||
    `${vendor.store_name} - Toko Resmi di Kota Serang | Mas Chan Digital`;

  const rawDescription = vendor.description?.trim();
  const fallbackDescription = `Kunjungi profil toko ${vendor.store_name} di Kota Serang. Lihat katalog produk dan pesan langsung via WhatsApp.`;
  const seoDesc =
    rawDescription ||
    vendor.store_seo?.metaDescription ||
    fallbackDescription;

  // Foto Profil / Avatar Toko, dengan fallback avatar default
  const mainImage =
    vendor.avatar ||
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&auto=format&fit=crop&q=80";

  const canonicalUrl = `/vendors/${slug}`;
  const fullVendorUrl = `https://maschandigital.id/vendors/${slug}`;

  return {
    title: seoTitle,
    description: seoDesc,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: seoTitle,
      description: seoDesc,
      url: fullVendorUrl,
      siteName: "Mas Chan Digital",
      locale: "id_ID",
      type: "website",
      images: [
        {
          url: mainImage,
          width: 800,
          height: 800,
          alt: `Foto Profil Toko ${vendor.store_name} di Mas Chan Digital`,
        },
      ],
    },
    twitter: {
      card: "summary",
      title: seoTitle,
      description: seoDesc,
      images: [mainImage],
    },
  };
}

export default async function SingleVendorPage({ params }: VendorPageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;

  if (!slug) {
    notFound();
  }

  const vendor = await getVendorBySlug(slug);

  if (!vendor) {
    notFound();
  }

  const allProducts = await getVendorProducts(vendor.id);
  const storeStatus = checkStoreStatus(
    vendor.store_hours,
    vendor.vacation_mode,
  );

  // 1. Logika Pembatasan Etalase Publik Sesuai Status Langganan
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const vendorSub = (vendor as any).subscription;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const vendorPlanId = (vendor as any).plan_id || vendorSub?.plan_id;

  const isPaidActive = Boolean(
    (vendorSub && vendorSub.status === "active" && vendorSub.plan_id !== "free_forever") ||
    (vendorPlanId && vendorPlanId !== "free_forever")
  );

  // Kuota etalase publik: jika paket berbayar aktif tampilkan semua, jika Starter batasi 3 produk
  const maxPublicLimit = isPaidActive ? (vendorSub?.max_products ?? 999) : 3;
  const publicProducts = allProducts.slice(0, maxPublicLimit);
  const archivedProductsCount = Math.max(0, allProducts.length - publicProducts.length);

  const vendorUrl = `https://maschandigital.id/vendors/${vendor.slug}`;
  const kelurahan =
    vendor.location_subdistrict ||
    vendor.subdistrict ||
    vendor.address?.street_2 ||
    "";
  const kecamatan = vendor.location_district || "";
  const jalan = vendor.address?.street_1 || "";

  const fullAddressParts = [
    jalan,
    kelurahan ? `Kel. ${kelurahan}` : "",
    kecamatan ? `Kec. ${kecamatan}` : "",
    "Kota Serang, Banten",
  ].filter(Boolean);

  const addressQuery =
    fullAddressParts.length > 1
      ? fullAddressParts.join(", ")
      : `${vendor.store_name}, Kota Serang, Banten`;

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressQuery)}`;

  const waVendorUrl = generateWhatsAppVendorUrl({
    whatsappNumber: vendor.whatsapp_number || "6282298148474",
    vendorName: vendor.store_name,
  });

  const daysLabel: { key: keyof StoreHours; label: string }[] = [
    { key: "senin", label: "Senin" },
    { key: "selasa", label: "Selasa" },
    { key: "rabu", label: "Rabu" },
    { key: "kamis", label: "Kamis" },
    { key: "jumat", label: "Jumat" },
    { key: "sabtu", label: "Sabtu" },
    { key: "minggu", label: "Minggu" },
  ];

  return (
    <article
      aria-labelledby="vendor-hero-title"
      className={cn('space-y-8', 'sm:space-y-12', 'pb-12')}
    >
      {/* Vendor Json LD */}
      <VendorJsonLd vendor={vendor} />
      <BreadcrumbJsonLd
        items={[
          { name: "Beranda", url: "/" },
          { name: "Vendor", url: "/vendors" },
          { name: vendor.store_name, url: `/vendors/${vendor.slug}` },
        ]}
      />

      {/* Layanan Direct WhatsApp Chat Drawer Toko */}
      <VendorWhatsAppChat
        whatsappNumber={vendor.whatsapp_number}
        vendorName={vendor.store_name}
        kecamatan={vendor.address?.city || vendor.location_district || "Kota Serang"}
      />

      {/* 1. VENDOR HERO BANNER */}
      <header className={cn('relative', 'bg-slate-900', 'text-white')}>
        <figure className={cn('relative', 'bg-slate-800', 'm-0', 'w-full', 'h-48', 'sm:h-72', 'lg:h-80', 'overflow-hidden')}>
          <Image
            src={
              vendor.banner ||
              "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400"
            }
            alt={`Foto banner toko ${vendor.store_name}`}
            fill
            priority
            sizes="100vw"
            className={cn('opacity-75', 'object-cover')}
          />
          <div
            className={cn('absolute', 'inset-0', 'bg-gradient-to-t', 'from-slate-950', 'via-slate-950/40', 'to-transparent')}
            aria-hidden="true"
          />
        </figure>

        <div className={cn('z-10', 'relative', 'mx-auto', '-mt-16', 'sm:-mt-24', 'px-4', 'sm:px-6', 'lg:px-8', 'pb-8', 'max-w-7xl')}>
          <div className={cn('flex', 'md:flex-row', 'flex-col', 'justify-between', 'md:items-end', 'gap-6')}>
            {/* Avatar & Store Info */}
            <div className={cn('flex', 'sm:flex-row', 'flex-col', 'items-center', 'sm:items-end', 'gap-5', 'sm:text-left', 'text-center')}>
              <div className={cn('relative', 'bg-white', 'dark:bg-slate-800', 'shadow-card-hover', 'border-4', 'border-white', 'dark:border-surface-darkCard', 'rounded-3xl', 'w-28', 'sm:w-36', 'h-28', 'sm:h-36', 'overflow-hidden', 'shrink-0')}>
                <Image
                  src={
                    vendor.avatar ||
                    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300"
                  }
                  alt={`Logo toko ${vendor.store_name}`}
                  fill
                  sizes="144px"
                  className="object-cover"
                />
              </div>

              <div className="space-y-2">
                <div className={cn('flex', 'flex-wrap', 'justify-center', 'sm:justify-start', 'items-center', 'gap-2')}>
                  <h1
                    id="vendor-hero-title"
                    className={cn('font-slab', 'font-black', 'text-2xl', 'sm:text-3xl', 'tracking-tight')}
                  >
                    {vendor.store_name}
                  </h1>
                  {vendor.is_verified && (
                    <Badge
                      variant="success"
                      className={cn('bg-emerald-500/20', 'border-emerald-400/30', 'text-emerald-300')}
                    >
                      <ShieldCheck
                        className={cn('mr-1', 'w-3.5', 'h-3.5')}
                        aria-hidden="true"
                      />
                      <span>Terverifikasi Serang</span>
                    </Badge>
                  )}

                  {/* Status Badge Buka / Tutup / Libur */}
                  {storeStatus.isVacation ? (
                    <Badge
                      variant="danger"
                      className={cn('bg-rose-500/20', 'border-rose-400/30', 'text-rose-300')}
                    >
                      <XCircle className={cn('mr-1', 'w-3.5', 'h-3.5')} />
                      <span>Sedang Libur</span>
                    </Badge>
                  ) : storeStatus.isOpen ? (
                    <Badge
                      variant="success"
                      className={cn('bg-emerald-500/20', 'border-emerald-400/30', 'text-emerald-300')}
                    >
                      <Clock className={cn('mr-1', 'w-3.5', 'h-3.5')} />
                      <span>Buka Sekarang</span>
                    </Badge>
                  ) : (
                    <Badge
                      variant="neutral"
                      className={cn('bg-slate-500/20', 'border-slate-400/30', 'text-slate-300')}
                    >
                      <Clock className={cn('mr-1', 'w-3.5', 'h-3.5')} />
                      <span>Sedang Tutup</span>
                    </Badge>
                  )}
                </div>

                <div className={cn('flex', 'flex-wrap', 'justify-center', 'sm:justify-start', 'items-center', 'gap-4', 'text-slate-300', 'text-xs', 'sm:text-sm')}>
                  <address className={cn('flex', 'items-center', 'gap-1', 'not-italic')}>
                    <MapPin
                      className={cn('w-4', 'h-4', 'text-brand-400')}
                      aria-hidden="true"
                    />
                    <span>
                      {vendor.location_subdistrict || vendor.subdistrict
                        ? `Kel. ${vendor.location_subdistrict || vendor.subdistrict}, `
                        : ""}
                      {vendor.location_district
                        ? `Kec. ${vendor.location_district}, Kota Serang`
                        : "Kota Serang"}
                    </span>
                  </address>

                  {vendor.rating && (
                    <span className={cn('flex', 'items-center', 'gap-1', 'font-semibold', 'text-amber-300')}>
                      <Star
                        className={cn('fill-amber-400', 'w-4', 'h-4', 'text-amber-400')}
                        aria-hidden="true"
                      />
                      <span className="sr-only">Rating: </span>
                      <span>
                        {vendor.rating.toFixed(1)} ({vendor.review_count || 0}{" "}
                        Ulasan)
                      </span>
                    </span>
                  )}

                  {/* Jumlah Produk Aktif di Etalase Publik */}
                  <span className={cn('flex', 'items-center', 'gap-1')}>
                    <Package
                      className={cn('w-4', 'h-4', 'text-brand-300')}
                      aria-hidden="true"
                    />
                    <span>{publicProducts.length} Produk Aktif</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action: Chat WhatsApp & Share */}
            <div className={cn('flex', 'flex-wrap', 'justify-center', 'sm:justify-end', 'items-center', 'gap-3', 'w-full', 'md:w-auto')}>
              <ShareButton
                title={`Toko ${vendor.store_name} - Mas Chan Digital`}
                text={`Kunjungi toko ${vendor.store_name} di Mas Chan Digital Kota Serang:`}
                url={vendorUrl}
                variant="outline"
                size="lg"
                className={cn('bg-white/10', 'hover:bg-white/20', 'border-white/20', 'text-white', 'hover:text-white')}
              />

              {storeStatus.isVacation ? (
                <Button
                  variant="outline"
                  size="lg"
                  disabled
                  className={cn('bg-slate-800/80', 'opacity-80', 'border-slate-700', 'w-full', 'sm:w-auto', 'text-slate-400', 'cursor-not-allowed')}
                >
                  <XCircle className={cn('mr-2', 'w-5', 'h-5', 'text-amber-400')} />
                  <span>Toko Sedang Libur</span>
                </Button>
              ) : !storeStatus.isOpen ? (
                <Button
                  variant="outline"
                  size="lg"
                  disabled
                  className={cn('bg-slate-800/80', 'opacity-80', 'border-slate-700', 'w-full', 'sm:w-auto', 'text-slate-400', 'cursor-not-allowed')}
                >
                  <Clock className={cn('mr-2', 'w-5', 'h-5', 'text-slate-400')} />
                  <span>Toko Sedang Tutup</span>
                </Button>
              ) : (
                <a
                  href={waVendorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn('rounded-xl', 'focus-visible:outline-none', 'focus-visible:ring-2', 'focus-visible:ring-whatsapp-500', 'w-full', 'sm:w-auto')}
                  aria-label={`Hubungi toko ${vendor.store_name} lewat chat WhatsApp`}
                >
                  <Button
                    variant="whatsapp"
                    size="lg"
                    className={cn('shadow-card-hover', 'w-full', 'font-bold')}
                  >
                    <MessageCircle
                      className={cn('fill-white', 'mr-2', 'w-5', 'h-5')}
                      aria-hidden="true"
                    />
                    <span>Chat WhatsApp Toko</span>
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* VACATION MODE NOTICE BANNER */}
      {storeStatus.isVacation && (
        <SectionContainer className="py-0">
          <aside
            aria-label="Pemberitahuan Libur Toko"
            className={cn('flex', 'items-start', 'gap-3.5', 'bg-amber-50', 'dark:bg-amber-950/70', 'shadow-subtle', 'p-4', 'sm:p-5', 'border', 'border-amber-200', 'dark:border-amber-800/80', 'rounded-3xl', 'text-amber-900', 'dark:text-amber-200')}
          >
            <XCircle
              className={cn('mt-0.5', 'w-6', 'h-6', 'text-amber-600', 'dark:text-amber-400', 'shrink-0')}
              aria-hidden="true"
            />
            <div className="space-y-1">
              <h3 className={cn('font-slab', 'font-bold', 'text-base')}>
                Pemberitahuan: Toko Kami Sedang Libur
              </h3>
              <p className={cn('text-amber-800', 'dark:text-amber-300', 'text-xs', 'sm:text-sm', 'leading-relaxed')}>
                {vendor.vacation_mode?.vacationMessage ||
                  "Toko kami sedang tutup sementara waktu. Seluruh pemesanan produk akan diproses kembali setelah masa libur berakhir."}
              </p>
            </div>
          </aside>
        </SectionContainer>
      )}

      {/* 2. VENDOR DETAILS & CATALOG */}
      <SectionContainer className="py-0">
        <div className={cn('items-start', 'gap-8', 'grid', 'grid-cols-1', 'lg:grid-cols-12')}>
          {/* Left Sidebar: About Vendor & Operating Hours */}
          <aside
            aria-label="Profil dan Kontak Toko"
            className={cn('space-y-6', 'lg:col-span-4')}
          >
            {/* About Box */}
            <section
              aria-labelledby="about-store-heading"
              className={cn('space-y-4', 'bg-white', 'dark:bg-surface-darkCard', 'shadow-subtle', 'p-6', 'border', 'border-slate-200/80', 'dark:border-slate-800', 'rounded-3xl')}
            >
              <h2
                id="about-store-heading"
                className={cn('flex', 'items-center', 'gap-2', 'font-slab', 'font-bold', 'text-slate-900', 'dark:text-white', 'text-base')}
              >
                <Store
                  className={cn('w-4', 'h-4', 'text-brand-700', 'dark:text-brand-400')}
                  aria-hidden="true"
                />
                <span>Tentang Toko</span>
              </h2>
              <p className={cn('text-slate-600', 'dark:text-slate-300', 'text-xs', 'sm:text-sm', 'leading-relaxed')}>
                {vendor.description ||
                  "Penyedia produk dan layanan lokal berkualitas di wilayah Kota Serang."}
              </p>

              <address className={cn('space-y-3', 'pt-4', 'border-slate-100', 'dark:border-slate-800', 'border-t', 'text-slate-600', 'dark:text-slate-300', 'text-xs', 'sm:text-sm', 'not-italic')}>
                <div className="space-y-2">
                  <div className={cn('flex', 'items-start', 'gap-2.5')}>
                    <MapPin
                      className={cn('mt-0.5', 'w-4', 'h-4', 'text-brand-600', 'shrink-0')}
                      aria-hidden="true"
                    />
                    <span>
                      {vendor.address?.street_1
                        ? `${vendor.address.street_1}, `
                        : ""}
                      {vendor.location_district
                        ? `Kec. ${vendor.location_district}, `
                        : ""}
                      Kota Serang, Banten
                    </span>
                  </div>
                  <Link
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn('inline-flex', 'items-center', 'gap-1.5', 'ml-6', 'font-bold', 'text-brand-700', 'dark:text-brand-400', 'text-xs', 'hover:underline')}
                    aria-label={`Buka petunjuk arah lokasi ${vendor.store_name} di Google Maps`}
                  >
                    <span>Buka Petunjuk Arah di Google Maps</span>
                    <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>

                {/* Kecamatan & Kelurahan */}
                {(vendor.location_district ||
                  vendor.location_subdistrict ||
                  vendor.subdistrict) && (
                  <div className={cn('flex', 'items-start', 'gap-2.5')}>
                    <Building2
                      className={cn('mt-0.5', 'w-4', 'h-4', 'text-brand-600', 'shrink-0')}
                      aria-hidden="true"
                    />
                    <span>
                      {vendor.location_subdistrict || vendor.subdistrict
                        ? `Kel. ${vendor.location_subdistrict || vendor.subdistrict}, `
                        : ""}
                      {vendor.location_district
                        ? `Kec. ${vendor.location_district}, Kota Serang`
                        : "Kota Serang"}
                    </span>
                  </div>
                )}
                {vendor.whatsapp_number && (
                  <div className={cn('flex', 'items-center', 'gap-2.5')}>
                    <Phone
                      className={cn('w-4', 'h-4', 'text-brand-600', 'shrink-0')}
                      aria-hidden="true"
                    />
                    <a
                      href={`tel:+${vendor.whatsapp_number}`}
                      className="hover:underline"
                    >
                      +{vendor.whatsapp_number}
                    </a>
                  </div>
                )}
                {vendor.email && (
                  <div className={cn('flex', 'items-center', 'gap-2.5')}>
                    <Mail
                      className={cn('w-4', 'h-4', 'text-brand-600', 'shrink-0')}
                      aria-hidden="true"
                    />
                    <a
                      href={`mailto:${vendor.email}`}
                      className="hover:underline"
                    >
                      {vendor.email}
                    </a>
                  </div>
                )}
                {vendor.joined_date && (
                  <div className={cn('flex', 'items-center', 'gap-2.5')}>
                    <Calendar
                      className={cn('w-4', 'h-4', 'text-brand-600', 'shrink-0')}
                      aria-hidden="true"
                    />
                    <span>
                      Bergabung Sejak:{" "}
                      <time dateTime={vendor.joined_date}>
                        {formatIndonesianDate(vendor.joined_date)}
                      </time>
                    </span>
                  </div>
                )}
              </address>
            </section>

            {/* Operating Hours Box */}
            {vendor.store_hours && (
              <section
                aria-labelledby="hours-heading"
                className={cn('space-y-4', 'bg-white', 'dark:bg-surface-darkCard', 'shadow-subtle', 'p-6', 'border', 'border-slate-200/80', 'dark:border-slate-800', 'rounded-3xl')}
              >
                <div className={cn('flex', 'justify-between', 'items-center')}>
                  <h2
                    id="hours-heading"
                    className={cn('flex', 'items-center', 'gap-2', 'font-slab', 'font-bold', 'text-slate-900', 'dark:text-white', 'text-base')}
                  >
                    <Clock
                      className={cn('w-4', 'h-4', 'text-brand-700', 'dark:text-brand-400')}
                      aria-hidden="true"
                    />
                    <span>Jam Buka Toko</span>
                  </h2>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      storeStatus.isVacation
                        ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                        : storeStatus.isOpen
                          ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                          : "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300"
                    }`}
                  >
                    {storeStatus.statusText}
                  </span>
                </div>

                <div className={cn('divide-y', 'divide-slate-100', 'dark:divide-slate-800', 'text-xs')}>
                  {daysLabel.map(({ key, label }) => {
                    const d = vendor.store_hours?.[key];
                    return (
                      <div
                        key={key}
                        className={cn('flex', 'justify-between', 'items-center', 'py-2')}
                      >
                        <span className={cn('font-medium', 'text-slate-700', 'dark:text-slate-300')}>
                          {label}
                        </span>
                        {d?.isOpen ? (
                          <span className={cn('text-slate-500', 'dark:text-slate-400')}>
                            {d.openTime} - {d.closeTime}
                          </span>
                        ) : (
                          <span className={cn('font-semibold', 'text-rose-500')}>
                            Tutup
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </aside>

          {/* Right Area: Products Catalog */}
          <section
            aria-labelledby="catalog-heading"
            className={cn('space-y-6', 'lg:col-span-8')}
          >
            <header className={cn('flex', 'justify-between', 'items-center')}>
              <div>
                <h2
                  id="catalog-heading"
                  className={cn('font-slab', 'font-bold', 'text-slate-900', 'dark:text-white', 'text-xl', 'sm:text-2xl')}
                >
                  Katalog Produk Toko
                </h2>
                <p className={cn('text-slate-500', 'dark:text-slate-400', 'text-xs', 'sm:text-sm')}>
                  Daftar produk resmi yang dijual oleh {vendor.store_name}
                </p>
              </div>
              <Badge variant="neutral" className="text-xs">
                {publicProducts.length} Produk
              </Badge>
            </header>

            {publicProducts.length > 0 ? (
              <div className="space-y-6">
                <div className={cn('gap-4', 'sm:gap-6', 'grid', 'grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3')}>
                  {publicProducts.map((product, idx) => (
                    <ProductCard
                      key={`vendor-product-${vendor.id}-${product.id || idx}-${product.slug || idx}-${idx}`}
                      product={product}
                      vendorStoreStatus={storeStatus}
                    />
                  ))}
                </div>

                {/* Catatan Halus jika Toko Memiliki Produk yang Terarsip */}
                {archivedProductsCount > 0 && (
                  <div className={cn('space-y-2', 'bg-slate-50', 'dark:bg-slate-900/50', 'p-4', 'sm:p-5', 'border', 'border-slate-200', 'dark:border-slate-800', 'border-dashed', 'rounded-2xl', 'text-center')}>
                    <div className={cn('flex', 'justify-center', 'items-center', 'gap-1.5', 'font-bold', 'text-slate-700', 'dark:text-slate-300', 'text-xs')}>
                      <MessageSquare className={cn('w-4', 'h-4', 'text-[#093c96]', 'dark:text-blue-400')} />
                      <span>Menampilkan {publicProducts.length} Produk Unggulan</span>
                    </div>
                    <p className={cn('mx-auto', 'max-w-md', 'text-slate-500', 'dark:text-slate-400', 'text-xs', 'leading-relaxed')}>
                      Toko ini masih memiliki <strong>{archivedProductsCount} produk pilihan lainnya</strong> yang belum ditampilkan di katalog web. Anda dapat menanyakan katalog lengkap atau ketersediaan stok produk lainnya langsung ke WhatsApp penjual.
                    </p>
                    <div className="pt-1">
                      <a
                        href={waVendorUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn('inline-flex', 'items-center', 'gap-1.5', 'bg-emerald-50', 'hover:bg-emerald-100', 'dark:bg-emerald-950/40', 'px-3.5', 'py-1.5', 'border', 'border-emerald-200', 'dark:border-emerald-800', 'rounded-xl', 'font-semibold', 'text-emerald-700', 'dark:text-emerald-300', 'text-xs', 'transition-colors')}
                      >
                        <MessageCircle className={cn('fill-emerald-600', 'w-3.5', 'h-3.5', 'text-emerald-600')} />
                        <span>Tanya Katalog Lain via WhatsApp</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={cn('space-y-3', 'bg-white', 'dark:bg-surface-darkCard', 'p-10', 'border', 'border-slate-200/80', 'dark:border-slate-800', 'rounded-3xl', 'text-center')}>
                <Package
                  className={cn('mx-auto', 'w-10', 'h-10', 'text-slate-400')}
                  aria-hidden="true"
                />
                <h3 className={cn('font-slab', 'font-bold', 'text-slate-800', 'dark:text-white', 'text-base')}>
                  Belum Ada Produk Ditampilkan
                </h3>
              </div>
            )}
          </section>
        </div>
      </SectionContainer>
    </article>
  );
}