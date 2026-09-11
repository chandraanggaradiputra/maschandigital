"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  Search,
  Store,
  ExternalLink,
  Trash2,
  Loader2,
  AlertCircle,
  Tag,
  Wrench,
  ShoppingBag,
} from "lucide-react";
import { Product } from "@/types";
import { formatRupiah } from "@/lib/utils";

interface AdminProductsTabProps {
  products: Product[];
  isLoading: boolean;
  onDeleteProduct: (productId: number, productName: string) => Promise<boolean>;
  onRefresh: () => void;
}

export function AdminProductsTab({
  products,
  isLoading,
  onDeleteProduct,
}: AdminProductsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<"all" | "product" | "service">("all");
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter Produk
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Filter tipe
      if (selectedType === "service" && p.business_type !== "service") return false;
      if (selectedType === "product" && p.business_type === "service") return false;

      // Filter teks pencarian
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchName = (p.name || "").toLowerCase().includes(q);
      const matchVendor = (p.vendor?.store_name || "").toLowerCase().includes(q);
      const matchCategory = (p.categories || []).some((c) =>
        c.name.toLowerCase().includes(q)
      );
      return matchName || matchVendor || matchCategory;
    });
  }, [products, searchQuery, selectedType]);

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await onDeleteProduct(productToDelete.id, productToDelete.name);
      setProductToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Header */}
      <div className="space-y-2.5">
        {/* Input Pencarian */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama produk, toko, atau kategori..."
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-800"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Hapus
            </button>
          )}
        </div>

        {/* Filter Tipe Bisnis */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedType("all")}
            className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-xl transition-all ${
              selectedType === "all"
                ? "bg-brand-800 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70"
            }`}
          >
            Semua ({products.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedType("product")}
            className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1 ${
              selectedType === "product"
                ? "bg-brand-800 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Produk Fisik</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedType("service")}
            className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1 ${
              selectedType === "service"
                ? "bg-brand-800 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70"
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Layanan Jasa</span>
          </button>
        </div>
      </div>

      {/* Konten Daftar Produk */}
      {isLoading ? (
        <div className="py-16 text-center space-y-3">
          <Loader2
            className="w-8 h-8 mx-auto animate-spin text-brand-800 dark:text-blue-400"
            aria-hidden="true"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Memuat katalog produk & layanan mitra...
          </p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
            <Package className="w-6 h-6" aria-hidden="true" />
          </div>
          <h2 className="font-slab font-bold text-base text-slate-800 dark:text-slate-200">
            Produk Tidak Ditemukan
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            Tidak ada produk atau layanan yang cocok dengan kata kunci atau filter saat ini.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProducts.map((prod) => {
            const rawImg = prod.images?.[0]?.src || "https://app.maschandigital.id/wp-content/uploads/woocommerce-placeholder.webp";
            const categoryName = (prod.categories?.[0]?.name || "Umum").replace(/&amp;/g, "&");

            return (
              <article
                key={prod.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-3.5 sm:p-4 shadow-sm flex items-center gap-3.5 transition-all"
              >
                {/* Thumbnail Gambar */}
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-100 dark:border-slate-800">
                  <Image
                    src={rawImg}
                    alt={prod.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                  {prod.business_type === "service" ? (
                    <span className="absolute top-1 right-1 px-1 py-0.2 bg-blue-600/90 text-white text-[8px] font-bold rounded">
                      JASA
                    </span>
                  ) : Boolean(prod.is_variable || (prod.variations && prod.variations.length > 0)) ? (
                    <span className="absolute top-1 right-1 px-1 py-0.2 bg-emerald-600/90 text-white text-[8px] font-bold rounded">
                      VARIAN
                    </span>
                  ) : null}
                </div>

                {/* Deskripsi & Toko */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mb-0.5 truncate">
                    <Tag className="w-2.5 h-2.5 shrink-0" />
                    <span className="truncate">{categoryName}</span>
                  </div>

                  <Link
                    href={`/products/${prod.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-slab font-bold text-xs sm:text-sm text-slate-900 dark:text-white hover:text-brand-800 dark:hover:text-blue-400 line-clamp-1 inline-flex items-center gap-1"
                  >
                    <span>{prod.name}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                  </Link>

                  <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    <Store className="w-3 h-3 text-brand-800 shrink-0" />
                    <span className="truncate">{prod.vendor?.store_name || "Toko Mitra"}</span>
                  </div>

                  {/* Harga / Tarif */}
                  <div className="mt-1">
                    {prod.business_type === "service" ? (
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                        {Number(prod.price) > 0 ? `Mulai ${formatRupiah(Number(prod.price))}` : "Konsultasi Tarif"}
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {formatRupiah(Number(prod.price) || 0)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Tombol Takedown / Hapus */}
                <div className="shrink-0">
                  <button
                    type="button"
                    onClick={() => setProductToDelete(prod)}
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                    title="Takedown / Hapus Produk"
                    aria-label={`Hapus produk ${prod.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Modal Konfirmasi Takedown */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-slab font-bold text-base text-slate-900 dark:text-white">
                Takedown / Hapus Produk?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Anda akan menghapus &ldquo;<strong className="text-slate-700 dark:text-slate-300">{productToDelete.name}</strong>&rdquo; dari katalog toko &ldquo;{productToDelete.vendor?.store_name}&rdquo;. Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span>Ya, Hapus</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
