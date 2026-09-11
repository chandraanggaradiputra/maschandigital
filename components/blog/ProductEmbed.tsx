"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MessageCircle,
  ExternalLink,
  Store,
  MapPin,
  Sparkles,
  ShoppingBag,
} from "lucide-react";
import { Product } from "@/types";
import {
  formatRupiah,
  generateWhatsAppProductUrl,
  resolveVendorDistrict,
} from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { trackWhatsAppClick } from "@/lib/analytics";

interface ProductEmbedProps {
  product: Product;
  className?: string;
}

const CANONICAL_SITE_URL = "https://maschandigital.id";

export function ProductEmbed({
  product,
  className = "",
}: ProductEmbedProps) {
  if (!product || !product.slug) {
    return null;
  }

  const primaryCategory = product.categories?.[0]?.name || "Produk UMKM";
  const mainImage =
    product.images?.[0]?.src ||
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80";

  const hasSale = Boolean(product.on_sale && product.sale_price);
  const formattedSalePrice = hasSale ? formatRupiah(product.sale_price) : "";
  const formattedRegularPrice = formatRupiah(
    product.regular_price || product.price,
  );

  const isVariable = Boolean(
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

  let displayedPrice = hasSale ? formattedSalePrice : formattedRegularPrice;
  if (isVariable && priceRange && priceRange.min > 0) {
    if (priceRange.min === priceRange.max) {
      displayedPrice = formatRupiah(priceRange.min);
    } else {
      displayedPrice = `${formatRupiah(priceRange.min)} - ${formatRupiah(priceRange.max)}`;
    }
  }

  const vendorDistrict = resolveVendorDistrict(product.vendor);
  const vendorStoreName = product.vendor?.store_name || "Vendor Mas Chan Digital";
  const vendorSlug = product.vendor?.slug || "vendor";

  const productUrl = `${CANONICAL_SITE_URL}/products/${product.slug}`;

  const waUrl = generateWhatsAppProductUrl({
    whatsappNumber: product.vendor?.whatsapp_number || "6282298148474",
    productName: product.name,
    price: hasSale ? formattedSalePrice : formattedRegularPrice,
    productUrl,
    vendorName: vendorStoreName,
  });

  const handleWhatsAppClick = () => {
    trackWhatsAppClick({
      productId: product.id,
      productName: product.name,
      vendorName: vendorStoreName,
      kecamatan: vendorDistrict,
    });
  };

  return (
    <aside
      aria-label={`Sematan Produk: ${product.name}`}
      className={`my-8 not-prose rounded-2xl border border-brand-200/80 dark:border-brand-900/50 bg-gradient-to-br from-brand-50/50 via-white to-slate-50 dark:from-slate-900 dark:via-surface-darkCard dark:to-slate-950 p-4 sm:p-5 shadow-subtle hover:shadow-card-hover transition-all duration-300 ${className}`}
    >
      {/* Header Label Sematan */}
      <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-200/70 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5 font-semibold text-brand-700 dark:text-brand-400">
          <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Rekomendasi Produk Mas Chan Digital</span>
        </div>
        <div className="flex items-center gap-1.5">
          {isVariable && (
            <Badge variant="neutral" className="text-[11px] font-medium bg-blue-50 text-[#093c96] dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Pilihan Varian
            </Badge>
          )}
          <Badge variant="primary" className="text-[11px] font-medium">
            {primaryCategory}
          </Badge>
        </div>
      </div>

      {/* Konten Kartu Sematan */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-start sm:items-center">
        {/* Foto Produk */}
        <Link
          href={`/products/${product.slug}`}
          className="relative w-full sm:w-32 sm:h-32 aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          aria-label={`Lihat produk ${product.name}`}
        >
          <Image
            src={mainImage}
            alt={`Foto produk ${product.name}`}
            fill
            sizes="(max-width: 640px) 100vw, 128px"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Info Produk & Vendor */}
        <div className="flex-1 min-w-0 w-full">
          <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
            <Link
              href={`/products/${product.slug}`}
              className="hover:text-brand-700 dark:hover:text-brand-400 transition-colors focus-visible:outline-none focus-visible:underline"
            >
              {product.name}
            </Link>
          </h4>

          {/* Harga Rupiah */}
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-lg font-extrabold text-brand-700 dark:text-brand-400">
              {displayedPrice}
            </span>
            {!isVariable && hasSale && (
              <span className="text-xs text-slate-400 line-through">
                {formattedRegularPrice}
              </span>
            )}
          </div>

          {/* Identitas Vendor & Wilayah Kecamatan Serang */}
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
            <Link
              href={`/vendors/${vendorSlug}`}
              className="inline-flex items-center gap-1 font-medium hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              <Store className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" aria-hidden="true" />
              <span className="truncate max-w-[140px] sm:max-w-[200px]">
                {vendorStoreName}
              </span>
            </Link>

            <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              <span>Kec. {vendorDistrict}</span>
            </span>
          </div>

          {/* Tombol Aksi Ramah Jempol */}
          <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
            {isVariable ? (
              <Link
                href={`/products/${product.slug}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-subtle hover:shadow transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.98]"
                aria-label={`Pilih varian produk ${product.name}`}
              >
                <ShoppingBag className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Pilih Varian</span>
              </Link>
            ) : (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleWhatsAppClick}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-whatsapp-500 hover:bg-whatsapp-600 text-white shadow-subtle hover:shadow transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-whatsapp-500 active:scale-[0.98]"
                aria-label={`Pesan ${product.name} via WhatsApp`}
              >
                <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Pesan via WhatsApp</span>
              </a>
            )}

            <Link
              href={`/products/${product.slug}`}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <ShoppingBag className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Detail Produk</span>
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
