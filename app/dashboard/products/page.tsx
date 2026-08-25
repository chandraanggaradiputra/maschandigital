"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  PlusCircle,
  Edit3,
  Trash2,
  Eye,
  Search,
  AlertCircle,
  Loader2,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getMyVendorProducts, deleteProduct } from "@/lib/api/wordpress";
import { formatRupiah } from "@/lib/utils";
import { Product } from "@/types";

export default function DashboardProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deleteNotice, setDeleteNotice] = useState("");

  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      try {
        const liveProducts = await getMyVendorProducts();
        setProducts(liveProducts);
      } catch (err: unknown) {
        console.error("Gagal memuat produk vendor:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProducts();
  }, []);

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus produk "${name}"?`)) {
      const ok = await deleteProduct(id);
      if (ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        setDeleteNotice(`Produk "${name}" berhasil dihapus dari toko Anda.`);
        setTimeout(() => setDeleteNotice(""), 3500);
      } else {
        alert("Gagal menghapus produk. Silakan coba beberapa saat lagi.");
      }
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.categories?.[0]?.name &&
        p.categories[0].name.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  return (
    <div className="space-y-6 w-full min-w-0 overflow-hidden">
      {/* Header & Add Button */}
      <header className="flex sm:flex-row flex-col justify-between sm:items-center gap-4">
        <div>
          <h2 className="font-slab font-bold text-slate-900 dark:text-white text-xl">
            Katalog Produk Toko Anda
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs">
            Daftar produk yang Anda daftarkan di marketplace lokal Mas Chan
            Digital
          </p>
        </div>

        <Link href="/dashboard/products/new" className="shrink-0">
          <Button
            variant="primary"
            size="sm"
            className="w-full sm:w-auto font-bold"
          >
            <PlusCircle className="mr-1.5 w-4 h-4" aria-hidden="true" />
            <span>Tambah Produk</span>
          </Button>
        </Link>
      </header>

      {/* Delete Feedback Alert */}
      {deleteNotice && (
        <aside
          aria-live="polite"
          className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/80 p-3.5 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-200 text-xs"
        >
          <AlertCircle
            className="w-4 h-4 text-emerald-500 shrink-0"
            aria-hidden="true"
          />
          <span>{deleteNotice}</span>
        </aside>
      )}

      {/* Search Input */}
      {products.length > 0 && (
        <div className="relative w-full">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama produk atau kategori toko Anda..."
            className="bg-white dark:bg-surface-darkCard shadow-subtle py-2.5 pr-4 pl-10 border border-slate-200/80 focus:border-brand-500 dark:border-slate-800 rounded-2xl outline-none w-full text-slate-800 dark:text-slate-100 text-sm placeholder-slate-400"
          />
          <Search
            className="top-1/2 left-3.5 absolute w-4 h-4 text-slate-400 -translate-y-1/2"
            aria-hidden="true"
          />
        </div>
      )}

      {/* Container Utama Produk */}
      <div className="bg-white dark:bg-surface-darkCard shadow-subtle border border-slate-200/80 dark:border-slate-800 rounded-3xl w-full min-w-0 overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col justify-center items-center gap-2 p-12 text-slate-500 text-center">
            <Loader2 className="w-6 h-6 text-brand-700 dark:text-brand-400 animate-spin" />
            <span className="font-semibold text-xs">
              Memuat produk toko Anda...
            </span>
          </div>
        ) : filteredProducts.length > 0 ? (
          <>
            {/* 1. TAMPILAN MOBILE: KARTU PRODUK (Khusus Layar HP / sm:hidden) */}
            <div className="sm:hidden block divide-y divide-slate-100 dark:divide-slate-800 w-full">
              {filteredProducts.map((product) => (
                <article
                  key={`mobile-prod-${product.id}`}
                  className="space-y-3 p-4"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={
                        product.images?.[0]?.src ||
                        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&auto=format&fit=crop&q=80"
                      }
                      alt={product.name}
                      className="bg-slate-50 border border-slate-200 dark:border-slate-800 rounded-2xl w-14 h-14 object-cover shrink-0"
                    />
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge
                          variant="neutral"
                          className="px-2 py-0 text-[10px]"
                        >
                          {product.categories?.[0]?.name || "Umum"}
                        </Badge>
                        {product.type === "affiliate" ? (
                          <Badge
                            variant="primary"
                            className="px-2 py-0 text-[10px]"
                          >
                            Affiliate
                          </Badge>
                        ) : (
                          <Badge
                            variant="success"
                            className="px-2 py-0 text-[10px]"
                          >
                            WhatsApp
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2 leading-snug">
                        {product.name}
                      </h3>
                      <p className="font-slab font-black text-brand-900 dark:text-brand-400 text-sm">
                        {formatRupiah(product.regular_price || product.price)}
                      </p>
                    </div>
                  </div>

                  {/* Tombol Aksi Mobile */}
                  <div className="flex justify-end items-center gap-2 pt-2 border-slate-100 dark:border-slate-800 border-t">
                    <Link
                      href={`/products/${product.slug}`}
                      target="_blank"
                      className="flex-1"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="py-2 w-full font-semibold text-xs"
                      >
                        <Eye className="mr-1 w-3.5 h-3.5" />
                        <span>Lihat</span>
                      </Button>
                    </Link>

                    <Link
                      href={`/dashboard/products/${product.id}`}
                      className="flex-1"
                    >
                      <Button
                        variant="primary"
                        size="sm"
                        className="py-2 w-full font-semibold text-xs"
                      >
                        <Edit3 className="mr-1 w-3.5 h-3.5" />
                        <span>Edit</span>
                      </Button>
                    </Link>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(product.id, product.name)}
                      className="hover:bg-rose-50 dark:hover:bg-rose-950/50 p-2 w-9 h-9 text-rose-600 shrink-0"
                      title="Hapus Produk"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="sr-only">Hapus</span>
                    </Button>
                  </div>
                </article>
              ))}
            </div>

            {/* 2. TAMPILAN TABLE: DESKTOP & TABLET (Khusus Layar Lebar / hidden sm:block) */}
            <div className="hidden sm:block w-full overflow-x-auto">
              <table className="w-full min-w-[650px] text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800 border-b font-bold text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="px-4 sm:px-6 py-3.5">Produk</th>
                    <th className="px-4 py-3.5">Kategori</th>
                    <th className="px-4 py-3.5">Harga Normal</th>
                    <th className="px-4 py-3.5">Tipe Transaksi</th>
                    <th className="px-4 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
                  {filteredProducts.map((product) => (
                    <tr
                      key={`desktop-prod-${product.id}`}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-4 sm:px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              product.images?.[0]?.src ||
                              "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&auto=format&fit=crop&q=80"
                            }
                            alt={product.name}
                            className="bg-slate-50 border border-slate-200 dark:border-slate-800 rounded-xl w-10 h-10 object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 dark:text-white line-clamp-1">
                              {product.name}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              SEO Focus: {product.seo?.focus_keyword || "-"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <Badge variant="neutral" className="text-xs">
                          {product.categories?.[0]?.name || "Umum"}
                        </Badge>
                      </td>

                      <td className="px-4 py-3.5 font-bold text-slate-800 dark:text-slate-200">
                        {formatRupiah(product.regular_price || product.price)}
                      </td>

                      <td className="px-4 py-3.5">
                        {product.type === "affiliate" ? (
                          <Badge variant="primary" className="text-[11px]">
                            Affiliate Link
                          </Badge>
                        ) : (
                          <Badge variant="success" className="text-[11px]">
                            WhatsApp
                          </Badge>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex justify-end items-center gap-1.5">
                          <Link
                            href={`/products/${product.slug}`}
                            target="_blank"
                            title="Lihat Halaman Publik"
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-2 w-8 h-8"
                            >
                              <Eye
                                className="w-4 h-4 text-slate-500"
                                aria-hidden="true"
                              />
                              <span className="sr-only">Lihat Produk</span>
                            </Button>
                          </Link>

                          <Link
                            href={`/dashboard/products/${product.id}`}
                            title="Edit Produk"
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-2 w-8 h-8 text-brand-700 dark:text-brand-400"
                            >
                              <Edit3 className="w-4 h-4" aria-hidden="true" />
                              <span className="sr-only">Edit Produk</span>
                            </Button>
                          </Link>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDelete(product.id, product.name)
                            }
                            className="hover:bg-rose-50 dark:hover:bg-rose-950/50 p-2 w-8 h-8 text-rose-600"
                            title="Hapus Produk"
                          >
                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                            <span className="sr-only">Hapus Produk</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          /* Tampilan Toko Kosong */
          <div className="space-y-3 px-4 py-14 text-slate-400 text-center">
            <Package className="mx-auto w-10 h-10 text-slate-300 dark:text-slate-600" />
            <p className="font-slab font-bold text-slate-700 dark:text-slate-300 text-sm">
              Belum Ada Produk di Toko Anda
            </p>
            <p className="mx-auto max-w-sm text-slate-400 text-xs">
              Mulai tambahkan produk pertama Anda agar pembeli di Kota Serang
              dapat melihat dan memesan via WhatsApp.
            </p>
            <div className="pt-2">
              <Link href="/dashboard/products/new">
                <Button
                  variant="primary"
                  size="sm"
                  className="font-bold text-xs"
                >
                  <PlusCircle className="mr-1.5 w-3.5 h-3.5" />
                  <span>Tambah Produk Sekarang</span>
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
