"use client";

import React from "react";
import Link from "next/link";
import {
  Store,
  MapPin,
  MessageCircle,
  Package,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Vendor } from "@/types";
import {
  cn,
  generateWhatsAppVendorUrl,
  resolveVendorDistrict,
} from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { trackWhatsAppClick } from "@/lib/analytics";
import { checkStoreStatus } from "@/lib/storeStatus";

interface VendorCardProps {
  vendor: Vendor;
  className?: string;
}

export function VendorCard({ vendor, className }: VendorCardProps) {
  const storeStatus = checkStoreStatus(
    vendor.store_hours,
    vendor.vacation_mode,
  );

  // Cek apakah vendor berlangganan aktif berbayar
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const vendorSub = (vendor as any).subscription;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const vendorPlan = (vendor as any).plan_id || vendorSub?.plan_id;

  const isPriority = Boolean(
    (vendorSub &&
      vendorSub.status === "active" &&
      vendorSub.plan_id !== "free_forever") ||
    (vendorPlan && vendorPlan !== "free_forever") ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Boolean((vendor as any).is_vip),
  );

  const waUrl = generateWhatsAppVendorUrl({
    whatsappNumber: vendor.whatsapp_number,
    vendorName: vendor.store_name,
  });

  const bannerImg =
    vendor.banner ||
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80";
  const avatarImg =
    vendor.avatar ||
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80";

  return (
    <article
      aria-labelledby={`vendor-title-${vendor.id}`}
      className={cn(
        "group relative flex flex-col justify-between bg-white dark:bg-slate-900 shadow-2xs hover:shadow-md border border-slate-200/90 dark:border-slate-800 rounded-2xl h-full overflow-hidden transition-all duration-300",
        className,
      )}
    >
      {/* Banner Cover & Badges */}
      <figure className="relative bg-slate-100 dark:bg-slate-800 m-0 h-28 @[350px]:h-36 overflow-hidden">
        <img
          src={bannerImg}
          alt={`Banner toko ${vendor.store_name}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
          aria-hidden="true"
        />

        {/* District Location Badge */}
        <div className="top-3 left-3 z-10 absolute">
          <Badge
            variant="neutral"
            className="bg-white/90 dark:bg-slate-900/90 shadow-sm backdrop-blur-md font-semibold text-xs"
          >
            <MapPin
              className="mr-1 w-3 h-3 text-brand-600"
              aria-hidden="true"
            />
            <span>Kec. {resolveVendorDistrict(vendor)}</span>
          </Badge>
        </div>

        {/* Lencana Status Toko & Mitra Prioritas */}
        <div className="top-3 right-3 z-10 absolute flex flex-wrap justify-end items-center gap-1.5">
          {/* Lencana Emas Khusus Toko Berlangganan Aktif */}
          {isPriority && (
            <span className="inline-flex items-center gap-1 bg-amber-500 shadow-xs px-2.5 py-1 rounded-full font-bold text-[10px] text-white shrink-0">
              <Sparkles className="fill-white w-3 h-3 text-white shrink-0" />
              <span>Mitra Prioritas</span>
            </span>
          )}

          {/* Lencana Status Toko (Buka / Tutup) */}
          {storeStatus.isOpen ? (
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/50 shadow-2xs px-2.5 py-1 border border-emerald-200 dark:border-emerald-800 rounded-full font-bold text-[11px] text-emerald-700 dark:text-emerald-400 shrink-0">
              <span className="bg-emerald-500 rounded-full w-1.5 h-1.5 animate-pulse" />
              <span>Buka Sekarang</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/50 shadow-2xs px-2.5 py-1 border border-rose-200 dark:border-rose-800 rounded-full font-bold text-[11px] text-rose-700 dark:text-rose-400 shrink-0">
              <span className="bg-rose-500 rounded-full w-1.5 h-1.5" />
              <span>Toko Tutup</span>
            </span>
          )}
        </div>
      </figure>

      {/* Profile Avatar & Info */}
      <div className="flex flex-col flex-1 justify-between space-y-3 p-4 sm:p-5 pt-0">
        <div className="flex-1 space-y-2">
          <header className="z-10 relative flex justify-between items-end -mt-8 @[350px]:-mt-10 mb-3">
            <div className="bg-white dark:bg-slate-800 shadow-md border-4 border-white dark:border-surface-darkCard rounded-2xl w-16 @[350px]:w-20 h-16 @[350px]:h-20 overflow-hidden">
              <img
                src={avatarImg}
                alt={`Logo toko ${vendor.store_name}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            <div className="flex items-center gap-1.5 font-medium text-slate-500 dark:text-slate-400 text-xs">
              <Package
                className="w-3.5 h-3.5 text-brand-700 dark:text-brand-400"
                aria-hidden="true"
              />
              <span>{vendor.products_count || 0} Produk</span>
            </div>
          </header>

          {/* Vendor Store Name & Address */}
          <div>
            <h3
              id={`vendor-title-${vendor.id}`}
              className="flex items-center gap-1.5 font-slab font-bold text-slate-900 dark:group-hover:text-brand-400 dark:text-white group-hover:text-brand-800 text-base @[350px]:text-lg line-clamp-1 transition-colors"
            >
              <Link
                href={`/vendors/${vendor.slug}`}
                className="focus-visible:outline-none hover:underline focus-visible:underline"
              >
                {vendor.store_name}
              </Link>
              {vendor.is_verified && (
                <ShieldCheck
                  className="w-4 h-4 text-emerald-500 shrink-0"
                  aria-label="Vendor Terverifikasi Kota Serang"
                />
              )}
            </h3>

            <p className="flex-grow mt-1 text-slate-600 dark:text-slate-400 text-xs line-clamp-2 leading-relaxed">
              {vendor.description ||
                "Toko resmi mitra UMKM Kota Serang di Mas Chan Digital."}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <footer className="flex @[280px]:flex-row flex-col gap-2 mt-auto pt-3 border-slate-100 dark:border-slate-800/80 border-t">
          <Link
            href={`/vendors/${vendor.slug}`}
            className="flex-1 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-label={`Kunjungi profil dan katalog toko ${vendor.store_name}`}
          >
            <Button
              variant="outline"
              size="sm"
              fullWidth
              className="font-semibold text-xs"
            >
              <Store className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Kunjungi Toko</span>
            </Button>
          </Link>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              trackWhatsAppClick({
                vendorName: vendor.store_name,
                kecamatan: resolveVendorDistrict(vendor),
              });
            }}
            className="flex-1 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-whatsapp-500"
            aria-label={`Hubungi toko ${vendor.store_name} melalui WhatsApp`}
          >
            <Button
              variant="whatsapp"
              size="sm"
              fullWidth
              className="font-semibold text-xs"
            >
              <MessageCircle
                className="fill-white w-3.5 h-3.5"
                aria-hidden="true"
              />
              <span>WhatsApp</span>
            </Button>
          </a>
        </footer>
      </div>
    </article>
  );
}
