// Tambahkan di baris atas file:
export const revalidate = 60; // Refresh profil toko setiap 60 detik

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  Store,
  MapPin,
  MessageCircle,
  Star,
  ShieldCheck,
  Package,
  Calendar,
  Mail,
  Phone,
  Clock,
  XCircle,
} from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { ProductCard } from "@/components/cards/ProductCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getVendorBySlug, getVendorProducts } from "@/lib/api/wordpress";
import { generateWhatsAppVendorUrl } from "@/lib/utils";
import { checkStoreStatus } from "@/lib/storeStatus";
import { StoreHours } from "@/types";
import { VendorTawkChat } from "@/components/chat/VendorTawkChat";
import { VendorJsonLd } from "@/components/seo/VendorJsonLd";

// Halaman ini menampilkan status buka/tutup toko yang berubah tiap menit —
// jangan pernah dibiarkan Next.js render statis sekali lalu disajikan basi.
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

  return {
    title: `${vendor.store_name} - Toko Resmi di Kota Serang | Mas Chan Digital`,
    description:
      vendor.description ||
      `Kunjungi profil toko ${vendor.store_name} di Kota Serang. Lihat katalog produk dan pesan langsung via WhatsApp.`,
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

  const products = await getVendorProducts(vendor.id);
  const storeStatus = checkStoreStatus(
    vendor.store_hours,
    vendor.vacation_mode,
  );

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
      className="space-y-8 sm:space-y-12 pb-12"
    >
      {/* Vendor Json LD */}
      <VendorJsonLd vendor={vendor} />

      {/* Konten */}
      <VendorTawkChat
        enabled={vendor?.chat_integration?.enabled ?? false}
        propertyId={vendor?.chat_integration?.property_id ?? ""}
        widgetId={vendor?.chat_integration?.widget_id ?? ""}
      />

      {/* 1. VENDOR HERO BANNER */}
      <header className="relative bg-slate-900 text-white">
        <figure className="relative bg-slate-800 m-0 w-full h-48 sm:h-72 lg:h-80 overflow-hidden">
          <Image
            src={
              vendor.banner ||
              "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400"
            }
            alt={`Foto banner toko ${vendor.store_name}`}
            fill
            priority
            sizes="100vw"
            className="opacity-75 object-cover"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"
            aria-hidden="true"
          />
        </figure>

        <div className="z-10 relative mx-auto -mt-16 sm:-mt-24 px-4 sm:px-6 lg:px-8 pb-8 max-w-7xl">
          <div className="flex md:flex-row flex-col justify-between md:items-end gap-6">
            {/* Avatar & Store Info */}
            <div className="flex sm:flex-row flex-col items-center sm:items-end gap-5 sm:text-left text-center">
              <div className="relative bg-white dark:bg-slate-800 shadow-card-hover border-4 border-white dark:border-surface-darkCard rounded-3xl w-28 sm:w-36 h-28 sm:h-36 overflow-hidden shrink-0">
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
                <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2">
                  <h1
                    id="vendor-hero-title"
                    className="font-slab font-black text-2xl sm:text-3xl tracking-tight"
                  >
                    {vendor.store_name}
                  </h1>
                  {vendor.is_verified && (
                    <Badge
                      variant="success"
                      className="bg-emerald-500/20 border-emerald-400/30 text-emerald-300"
                    >
                      <ShieldCheck
                        className="mr-1 w-3.5 h-3.5"
                        aria-hidden="true"
                      />
                      <span>Terverifikasi Serang</span>
                    </Badge>
                  )}

                  {/* Status Badge Buka / Tutup / Libur */}
                  {storeStatus.isVacation ? (
                    <Badge
                      variant="danger"
                      className="bg-rose-500/20 border-rose-400/30 text-rose-300"
                    >
                      <XCircle className="mr-1 w-3.5 h-3.5" />
                      <span>Sedang Libur</span>
                    </Badge>
                  ) : storeStatus.isOpen ? (
                    <Badge
                      variant="success"
                      className="bg-emerald-500/20 border-emerald-400/30 text-emerald-300"
                    >
                      <Clock className="mr-1 w-3.5 h-3.5" />
                      <span>Buka Sekarang</span>
                    </Badge>
                  ) : (
                    <Badge
                      variant="neutral"
                      className="bg-slate-500/20 border-slate-400/30 text-slate-300"
                    >
                      <Clock className="mr-1 w-3.5 h-3.5" />
                      <span>Sedang Tutup</span>
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4 text-slate-300 text-xs sm:text-sm">
                  <address className="flex items-center gap-1 not-italic">
                    <MapPin
                      className="w-4 h-4 text-brand-400"
                      aria-hidden="true"
                    />
                    <span>
                      {vendor.location_district
                        ? `Kec. ${vendor.location_district}, Kota Serang`
                        : "Kota Serang"}
                    </span>
                  </address>
                  {vendor.rating && (
                    <span className="flex items-center gap-1 font-semibold text-amber-300">
                      <Star
                        className="fill-amber-400 w-4 h-4 text-amber-400"
                        aria-hidden="true"
                      />
                      <span className="sr-only">Rating: </span>
                      <span>
                        {vendor.rating.toFixed(1)} ({vendor.review_count || 0}{" "}
                        Ulasan)
                      </span>
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Package
                      className="w-4 h-4 text-brand-300"
                      aria-hidden="true"
                    />
                    <span>{products.length} Produk Aktif</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action: Chat WhatsApp */}
            <div className="flex justify-center sm:justify-end items-center gap-3 w-full md:w-auto">
              {storeStatus.isVacation ? (
                <Button
                  variant="outline"
                  size="lg"
                  disabled
                  className="bg-slate-800/80 opacity-80 border-slate-700 w-full text-slate-400 cursor-not-allowed"
                >
                  <XCircle className="mr-2 w-5 h-5 text-amber-400" />
                  <span>Toko Sedang Libur</span>
                </Button>
              ) : !storeStatus.isOpen ? (
                <Button
                  variant="outline"
                  size="lg"
                  disabled
                  className="bg-slate-800/80 opacity-80 border-slate-700 w-full text-slate-400 cursor-not-allowed"
                >
                  <Clock className="mr-2 w-5 h-5 text-slate-400" />
                  <span>Toko Sedang Tutup</span>
                </Button>
              ) : (
                <a
                  href={waVendorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-whatsapp-500 w-full sm:w-auto"
                  aria-label={`Hubungi toko ${vendor.store_name} lewat chat WhatsApp`}
                >
                  <Button
                    variant="whatsapp"
                    size="lg"
                    className="shadow-card-hover w-full font-bold"
                  >
                    <MessageCircle
                      className="fill-white mr-2 w-5 h-5"
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
            className="flex items-start gap-3.5 bg-amber-50 dark:bg-amber-950/70 shadow-subtle p-4 sm:p-5 border border-amber-200 dark:border-amber-800/80 rounded-3xl text-amber-900 dark:text-amber-200"
          >
            <XCircle
              className="mt-0.5 w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0"
              aria-hidden="true"
            />
            <div className="space-y-1">
              <h3 className="font-slab font-bold text-base">
                Pemberitahuan: Toko Kami Sedang Libur
              </h3>
              <p className="text-amber-800 dark:text-amber-300 text-xs sm:text-sm leading-relaxed">
                {vendor.vacation_mode?.vacationMessage ||
                  "Toko kami sedang tutup sementara waktu. Seluruh pemesanan produk akan diproses kembali setelah masa libur berakhir."}
              </p>
            </div>
          </aside>
        </SectionContainer>
      )}

      {/* 2. VENDOR DETAILS & CATALOG */}
      <SectionContainer className="py-0">
        <div className="items-start gap-8 grid grid-cols-1 lg:grid-cols-12">
          {/* Left Sidebar: About Vendor & Operating Hours */}
          <aside
            aria-label="Profil dan Kontak Toko"
            className="space-y-6 lg:col-span-4"
          >
            {/* About Box */}
            <section
              aria-labelledby="about-store-heading"
              className="space-y-4 bg-white dark:bg-surface-darkCard shadow-subtle p-6 border border-slate-200/80 dark:border-slate-800 rounded-3xl"
            >
              <h2
                id="about-store-heading"
                className="flex items-center gap-2 font-slab font-bold text-slate-900 dark:text-white text-base"
              >
                <Store
                  className="w-4 h-4 text-brand-700 dark:text-brand-400"
                  aria-hidden="true"
                />
                <span>Tentang Toko</span>
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                {vendor.description ||
                  "Penyedia produk dan layanan lokal berkualitas di wilayah Kota Serang."}
              </p>

              <address className="space-y-3 pt-4 border-slate-100 dark:border-slate-800 border-t text-slate-600 dark:text-slate-300 text-xs sm:text-sm not-italic">
                {vendor.address?.street_1 && (
                  <div className="flex items-start gap-2.5">
                    <MapPin
                      className="mt-0.5 w-4 h-4 text-brand-600 shrink-0"
                      aria-hidden="true"
                    />
                    <span>
                      {vendor.address.street_1},{" "}
                      {vendor.location_district &&
                        `Kec. ${vendor.location_district}, `}
                      Kota Serang, Banten
                    </span>
                  </div>
                )}
                {vendor.whatsapp_number && (
                  <div className="flex items-center gap-2.5">
                    <Phone
                      className="w-4 h-4 text-brand-600 shrink-0"
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
                  <div className="flex items-center gap-2.5">
                    <Mail
                      className="w-4 h-4 text-brand-600 shrink-0"
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
                  <div className="flex items-center gap-2.5">
                    <Calendar
                      className="w-4 h-4 text-brand-600 shrink-0"
                      aria-hidden="true"
                    />
                    <span>
                      Bergabung Sejak:{" "}
                      <time dateTime={vendor.joined_date}>
                        {vendor.joined_date}
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
                className="space-y-4 bg-white dark:bg-surface-darkCard shadow-subtle p-6 border border-slate-200/80 dark:border-slate-800 rounded-3xl"
              >
                <div className="flex justify-between items-center">
                  <h2
                    id="hours-heading"
                    className="flex items-center gap-2 font-slab font-bold text-slate-900 dark:text-white text-base"
                  >
                    <Clock
                      className="w-4 h-4 text-brand-700 dark:text-brand-400"
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

                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {daysLabel.map(({ key, label }) => {
                    const d = vendor.store_hours?.[key];
                    return (
                      <div
                        key={key}
                        className="flex justify-between items-center py-2"
                      >
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {label}
                        </span>
                        {d?.isOpen ? (
                          <span className="text-slate-500 dark:text-slate-400">
                            {d.openTime} - {d.closeTime}
                          </span>
                        ) : (
                          <span className="font-semibold text-rose-500">
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
            className="space-y-6 lg:col-span-8"
          >
            <header className="flex justify-between items-center">
              <div>
                <h2
                  id="catalog-heading"
                  className="font-slab font-bold text-slate-900 dark:text-white text-xl sm:text-2xl"
                >
                  Katalog Produk Toko
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
                  Daftar produk resmi yang dijual oleh {vendor.store_name}
                </p>
              </div>
              <Badge variant="neutral" className="text-xs">
                {products.length} Produk
              </Badge>
            </header>

            {products.length > 0 ? (
              <div className="gap-4 sm:gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product, idx) => (
                  <ProductCard
                    key={`vendor-product-${vendor.id}-${product.id || idx}-${product.slug || idx}-${idx}`}
                    product={product}
                    vendorStoreStatus={storeStatus}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3 bg-white dark:bg-surface-darkCard p-10 border border-slate-200/80 dark:border-slate-800 rounded-3xl text-center">
                <Package
                  className="mx-auto w-10 h-10 text-slate-400"
                  aria-hidden="true"
                />
                <h3 className="font-slab font-bold text-slate-800 dark:text-white text-base">
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
