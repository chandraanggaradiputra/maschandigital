import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MessageCircle,
  ExternalLink,
  Tag,
  Store,
  ShieldCheck,
  XCircle,
  Lock,
  Eye,
} from "lucide-react";
import { Product } from "@/types";
import { formatRupiah, generateWhatsAppProductUrl } from "@/lib/utils";
import { checkStoreStatus, StoreStatus } from "@/lib/storeStatus";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface ProductCardProps {
  product: Product;
  className?: string;
  vendorStoreStatus?: StoreStatus;
}

const CANONICAL_SITE_URL = "https://maschandigital.id";

export function ProductCard({
  product,
  className,
  vendorStoreStatus,
}: ProductCardProps) {
  const primaryCategory = product.categories?.[0]?.name || "Umum";
  const mainImage =
    product.images?.[0]?.src ||
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80";

  const hasSale = Boolean(product.on_sale && product.sale_price);
  const isAffiliate =
    product.type === "affiliate" && Boolean(product.external_url);

  const formattedSalePrice = hasSale ? formatRupiah(product.sale_price) : "";
  const formattedRegularPrice = formatRupiah(
    product.regular_price || product.price,
  );

  // Evaluasi Status Jam Buka & Libur Toko Vendor
  const storeStatus =
    vendorStoreStatus ||
    checkStoreStatus(
      product.vendor?.store_hours,
      product.vendor?.vacation_mode,
    );

  // Gunakan URL deterministik konsisten antara Server dan Client (Anti-Hydration Mismatch)
  const productUrl = `${CANONICAL_SITE_URL}/products/${product.slug}`;

  const waUrl = generateWhatsAppProductUrl({
    whatsappNumber: product.vendor?.whatsapp_number || "6282298148474",
    productName: product.name,
    price: hasSale ? formattedSalePrice : formattedRegularPrice,
    productUrl: productUrl,
    vendorName: product.vendor?.store_name,
  });

  const viewsCount =
    typeof product.views_count === "number" ? product.views_count : 0;

  return (
    <article
      aria-labelledby={`product-title-${product.id}`}
      className={`@container group flex flex-col bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-subtle hover:shadow-card-hover transition-all duration-300 overflow-hidden ${className || ""}`}
    >
      {/* Media */}
      <figure className="relative bg-slate-100 dark:bg-slate-900 m-0 w-full aspect-square overflow-hidden">
        <Link
          href={`/products/${product.slug}`}
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 w-full h-full"
          tabIndex={0}
          aria-label={`Lihat detail produk ${product.name}`}
        >
          <Image
            src={mainImage}
            alt={`Foto produk ${product.name}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>

        {/* Category Badge */}
        <figcaption className="top-3 left-3 z-10 absolute">
          <Badge
            variant="primary"
            className="bg-white/90 dark:bg-slate-900/90 shadow-sm backdrop-blur-md"
          >
            <Tag className="mr-1 w-3 h-3" aria-hidden="true" />
            <span>{primaryCategory}</span>
          </Badge>
        </figcaption>

        {/* Status Promo / Libur / Tutup Badge */}
        <div className="top-3 right-3 z-10 absolute flex flex-col items-end gap-1">
          {storeStatus.isVacation ? (
            <Badge
              variant="danger"
              className="bg-rose-600/90 shadow-sm font-bold text-white"
            >
              <XCircle className="mr-1 w-3 h-3" />
              <span>LIBUR</span>
            </Badge>
          ) : !storeStatus.isOpen ? (
            <Badge
              variant="neutral"
              className="bg-slate-800/90 shadow-sm font-bold text-white"
            >
              <Lock className="mr-1 w-3 h-3" />
              <span>TUTUP</span>
            </Badge>
          ) : hasSale ? (
            <Badge variant="danger" className="shadow-sm font-bold">
              <span>PROMO</span>
            </Badge>
          ) : null}
        </div>
      </figure>

      {/* Product Content & Details */}
      <div className="flex flex-col flex-1 p-4 sm:p-5">
        <header className="mb-1.5">
          <div className="flex justify-between items-center gap-1 mb-1">
            <Link
              href={`/vendors/${product.vendor?.slug || "vendor"}`}
              className="inline-flex items-center gap-1 focus-visible:outline-none font-semibold text-slate-500 hover:text-brand-800 dark:hover:text-brand-400 dark:text-slate-400 text-xs focus-visible:underline truncate transition-colors"
              aria-label={`Toko ${product.vendor?.store_name}`}
            >
              <Store
                className="w-3.5 h-3.5 text-brand-700 dark:text-brand-400 shrink-0"
                aria-hidden="true"
              />
              <span className="truncate">
                {product.vendor?.store_name || "Vendor Serang"}
              </span>
              {product.vendor?.is_verified && (
                <ShieldCheck
                  className="w-3.5 h-3.5 text-emerald-500 shrink-0"
                  aria-label="Vendor Terverifikasi"
                />
              )}
            </Link>

            {/* Indikator Status Toko Real-Time */}
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                storeStatus.isVacation
                  ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                  : storeStatus.isOpen
                    ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
              }`}
              title={
                storeStatus.isVacation
                  ? "Toko sedang mode libur"
                  : storeStatus.isOpen
                    ? "Toko buka (siap terima pesanan WhatsApp)"
                    : "Toko sedang tutup"
              }
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  storeStatus.isVacation
                    ? "bg-amber-500"
                    : storeStatus.isOpen
                      ? "bg-emerald-500 animate-pulse"
                      : "bg-slate-400"
                }`}
              />
              <span>
                {storeStatus.isVacation
                  ? "Libur"
                  : storeStatus.isOpen
                    ? "Buka"
                    : "Tutup"}
              </span>
            </span>
          </div>

          <h3
            id={`product-title-${product.id}`}
            className="mt-1 font-slab font-bold text-slate-900 dark:group-hover:text-brand-400 dark:text-white group-hover:text-brand-800 text-sm @[300px]:text-base line-clamp-2 leading-snug transition-colors"
          >
            <Link
              href={`/products/${product.slug}`}
              className="focus-visible:outline-none focus-visible:underline"
            >
              {product.name}
            </Link>
          </h3>
        </header>

        {/* Price & Views Count Row */}
        <div
          className="flex flex-wrap justify-between items-center gap-2 mt-auto mb-4 pt-2"
          aria-label="Informasi Harga dan Tayangan"
        >
          <div className="flex items-baseline gap-2">
            <span className="sr-only">Harga saat ini:</span>
            <span className="font-slab font-black text-brand-800 dark:text-brand-400 text-base @[300px]:text-lg">
              {hasSale ? formattedSalePrice : formattedRegularPrice}
            </span>
            {hasSale && (
              <>
                <span className="sr-only">Harga sebelum diskon:</span>
                <del className="text-slate-400 dark:text-slate-500 text-xs line-through">
                  {formattedRegularPrice}
                </del>
              </>
            )}
          </div>

          {/* Indikator Jumlah Dilihat (WCFM Views) */}
          <div
            className="flex items-center gap-1 font-medium text-[11px] text-slate-400 dark:text-slate-500 shrink-0"
            title={`Produk telah dilihat ${viewsCount.toLocaleString("id-ID")} kali`}
          >
            <Eye
              className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500"
              aria-hidden="true"
            />
            <span>{viewsCount.toLocaleString("id-ID")}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <footer className="flex @[280px]:flex-row flex-col gap-2 pt-1 border-slate-100 dark:border-slate-800/80 border-t">
          {storeStatus.isVacation ? (
            <Button
              variant="outline"
              size="sm"
              fullWidth
              disabled
              className="bg-slate-100 dark:bg-slate-900 opacity-75 py-2.5 border-slate-200 dark:border-slate-800 text-slate-400 text-xs cursor-not-allowed"
              title="Pemesanan ditutup sementara karena toko sedang libur"
            >
              <XCircle
                className="mr-1.5 w-3.5 h-3.5 text-amber-500 shrink-0"
                aria-hidden="true"
              />
              <span>Toko Sedang Libur</span>
            </Button>
          ) : !storeStatus.isOpen ? (
            <Button
              variant="outline"
              size="sm"
              fullWidth
              disabled
              className="bg-slate-100 dark:bg-slate-900 opacity-75 py-2.5 border-slate-200 dark:border-slate-800 text-slate-400 text-xs cursor-not-allowed"
              title="Pemesanan dibuka kembali saat jam operasional toko aktif"
            >
              <Lock
                className="mr-1.5 w-3.5 h-3.5 text-rose-500 shrink-0"
                aria-hidden="true"
              />
              <span>Toko Sedang Tutup</span>
            </Button>
          ) : (
            <>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-whatsapp-500"
                aria-label={`Pesan ${product.name} lewat chat WhatsApp ke ${product.vendor?.store_name}`}
              >
                <Button
                  variant="whatsapp"
                  size="sm"
                  fullWidth
                  className="text-xs"
                >
                  <MessageCircle
                    className="fill-white mr-1 w-4 h-4"
                    aria-hidden="true"
                  />
                  <span>Pesan via WhatsApp</span>
                </Button>
              </a>

              {isAffiliate && (
                <a
                  href={product.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  aria-label={`Beli ${product.name} melalui tautan affiliasi resmi vendor`}
                >
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    className="text-xs"
                  >
                    <ExternalLink
                      className="mr-1 w-3.5 h-3.5"
                      aria-hidden="true"
                    />
                    <span>{product.button_text || "Beli via Link"}</span>
                  </Button>
                </a>
              )}
            </>
          )}
        </footer>
      </div>
    </article>
  );
}
