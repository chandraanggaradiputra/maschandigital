"use client";

import React from "react";
import Link from "next/link";
import {
  Store,
  MapPin,
  MessageCircle,
  Package,
  ShieldCheck,
} from "lucide-react";
import { Vendor } from "@/types";
import { cn, generateWhatsAppVendorUrl, resolveVendorDistrict } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { trackWhatsAppClick } from "@/lib/analytics";
import { checkStoreStatus } from "@/lib/storeStatus";

interface VendorCardProps {
  vendor: Vendor;
  className?: string;
}

export function VendorCard({ vendor, className }: VendorCardProps) {
  const storeStatus = checkStoreStatus(vendor.store_hours, vendor.vacation_mode);

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
        "group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 h-full flex flex-col justify-between",
        className
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

        {/* Store Status Badge (Buka/Tutup) */}
        <div className="top-3 right-3 z-10 absolute">
          {storeStatus.isOpen ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Buka Sekarang</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-800 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>Toko Tutup</span>
            </span>
          )}
        </div>
      </figure>

      {/* Profile Avatar & Info */}
      <div className="p-4 sm:p-5 pt-0 flex-1 flex flex-col justify-between space-y-3">
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

            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed flex-grow">
              {vendor.description ||
                "Toko resmi mitra UMKM Kota Serang di Mas Chan Digital."}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <footer className="pt-3 border-t border-slate-100 dark:border-slate-800/80 mt-auto flex @[280px]:flex-row flex-col gap-2">
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

