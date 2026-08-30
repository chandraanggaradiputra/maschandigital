"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Search,
  X,
  Store,
  Package,
  Tag,
  MapPin,
  ArrowRight,
  Sparkles,
  Loader2,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { Product, Vendor, ProductCategory } from "@/types";
import { cn } from "@/lib/utils";

interface SearchResults {
  products: Product[];
  vendors: Vendor[];
  categories: ProductCategory[];
}

const QUICK_SUGGESTIONS = [
  "Sate Bandeng",
  "Madu Akasia",
  "Batik Banten",
  "Kec. Serang",
  "Kec. Cipocok Jaya",
  "Kuliner Khas",
  "Herbal Alami",
];

export function GlobalSearchModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"semua" | "products" | "vendors" | "categories">("semua");
  const [results, setResults] = useState<SearchResults>({
    products: [],
    vendors: [],
    categories: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // 1. Keyboard Shortcut Listener (Ctrl+K / Cmd+K & Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    const handleCustomOpen = () => {
      setIsOpen(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("maschan:open-search", handleCustomOpen);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("maschan:open-search", handleCustomOpen);
    };
  }, [isOpen]);

  // 2. Focus input saat modal dibuka & Kunci scroll body
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      // Fetch initial recommendations
      fetchSearchResults("");
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // 3. Debounce Pencarian API
  const fetchSearchResults = async (searchQuery: string) => {
    setIsLoading(true);
    try {
      const url = searchQuery.trim()
        ? `/api/search?q=${encodeURIComponent(searchQuery.trim())}`
        : `/api/search`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setResults({
            products: data.products || [],
            vendors: data.vendors || [],
            categories: data.categories || [],
          });
        }
      }
    } catch (err) {
      console.error("Gagal melakukan pencarian:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      fetchSearchResults(query);
    }, 200);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  // Navigasi ke URL hasil
  const handleNavigate = (url: string) => {
    setIsOpen(false);
    startTransition(() => {
      router.push(url);
    });
  };

  const formatRupiah = (val: string | number) => {
    const num = typeof val === "number" ? val : parseFloat(val) || 0;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  if (!isOpen) return null;

  const totalResults =
    results.products.length + results.vendors.length + results.categories.length;

  const showProducts =
    (activeTab === "semua" || activeTab === "products") &&
    results.products.length > 0;
  const showVendors =
    (activeTab === "semua" || activeTab === "vendors") &&
    results.vendors.length > 0;
  const showCategories =
    (activeTab === "semua" || activeTab === "categories") &&
    results.categories.length > 0;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-12 sm:pt-20 px-3 sm:px-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="global-search-title"
    >
      <div
        ref={modalRef}
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
      >
        {/* Header: Input Pencarian */}
        <div className="relative flex items-center px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" aria-hidden="true" />
          <input
            ref={inputRef}
            id="global-search-title"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ketik nama produk, toko UMKM, atau kategori..."
            className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 text-sm sm:text-base outline-none font-medium"
            aria-label="Pencarian cepat"
          />

          <div className="flex items-center gap-2">
            {isLoading && (
              <Loader2 className="w-4 h-4 text-[#093c96] animate-spin" aria-hidden="true" />
            )}

            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Hapus teks"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors"
              aria-label="Tutup pencarian"
            >
              <span className="hidden sm:inline">ESC</span>
              <X className="w-3.5 h-3.5 sm:hidden" />
            </button>
          </div>
        </div>

        {/* Tab Filter Kategori Hasil */}
        <div className="flex items-center gap-1.5 px-4 sm:px-6 py-2 bg-slate-50/80 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab("semua")}
            className={cn(
              "px-3 py-1.5 rounded-full transition-colors shrink-0",
              activeTab === "semua"
                ? "bg-[#093c96] text-white font-bold shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
            )}
          >
            Semua Hasil ({totalResults})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("products")}
            className={cn(
              "px-3 py-1.5 rounded-full transition-colors shrink-0 flex items-center gap-1",
              activeTab === "products"
                ? "bg-[#093c96] text-white font-bold shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
            )}
          >
            <span>🛍️ Produk</span>
            <span className="opacity-80">({results.products.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("vendors")}
            className={cn(
              "px-3 py-1.5 rounded-full transition-colors shrink-0 flex items-center gap-1",
              activeTab === "vendors"
                ? "bg-emerald-600 text-white font-bold shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
            )}
          >
            <span>🏪 Toko / Mitra</span>
            <span className="opacity-80">({results.vendors.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("categories")}
            className={cn(
              "px-3 py-1.5 rounded-full transition-colors shrink-0 flex items-center gap-1",
              activeTab === "categories"
                ? "bg-amber-600 text-white font-bold shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
            )}
          >
            <span>🏷️ Kategori</span>
            <span className="opacity-80">({results.categories.length})</span>
          </button>
        </div>

        {/* Konten Hasil Pencarian */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 overscroll-contain">
          {/* Quick Suggestions Saat Query Kosong */}
          {!query.trim() && (
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Pencarian Populer di Kota Serang</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {QUICK_SUGGESTIONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setQuery(item);
                      fetchSearchResults(item);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-[#093c96] dark:hover:text-blue-300 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors border border-slate-200/60 dark:border-slate-700/60"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 1. KELOMPOK PRODUK UMKM (BADGE BIRU #093c96) */}
          {showProducts && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#093c96] text-white">
                    🛍️ Produk UMKM
                  </span>
                  <span className="text-xs text-slate-400">
                    ({results.products.length} ditemukan)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleNavigate(
                      `/products?q=${encodeURIComponent(query.trim())}`
                    )
                  }
                  className="text-xs font-medium text-[#093c96] dark:text-blue-400 hover:underline flex items-center gap-0.5"
                >
                  <span>Lihat di Katalog</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {results.products.map((p) => {
                  const imageUrl =
                    p.images?.[0]?.src ||
                    "https://app.maschandigital.id/wp-content/uploads/woocommerce-placeholder.webp";

                  return (
                    <button
                      key={`search-prod-${p.id}-${p.slug}`}
                      type="button"
                      onClick={() => handleNavigate(`/products/${p.slug}`)}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors text-left border border-slate-100 dark:border-slate-800/60 group w-full"
                    >
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                        <Image
                          src={imageUrl}
                          alt={p.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                          unoptimized
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-[#093c96] dark:group-hover:text-blue-400">
                          {p.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-extrabold text-[#093c96] dark:text-blue-400">
                            {formatRupiah(p.sale_price || p.price)}
                          </span>
                          {p.vendor?.store_name && (
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                              • {p.vendor.store_name}
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#093c96] group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. KELOMPOK TOKO / VENDOR (BADGE HIJAU EMERALD) */}
          {showVendors && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-600 text-white">
                    🏪 Toko & Mitra
                  </span>
                  <span className="text-xs text-slate-400">
                    ({results.vendors.length} ditemukan)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleNavigate(
                      `/vendors?q=${encodeURIComponent(query.trim())}`
                    )
                  }
                  className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
                >
                  <span>Direktori Toko</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {results.vendors.map((v) => (
                  <button
                    key={`search-ven-${v.id}-${v.slug}`}
                    type="button"
                    onClick={() => handleNavigate(`/vendors/${v.slug}`)}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors text-left border border-slate-100 dark:border-slate-800/60 group w-full"
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-sm shrink-0">
                      {v.store_name?.charAt(0).toUpperCase() || "T"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                        {v.store_name}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span className="truncate">
                          {v.location_district || "Kota Serang"}
                        </span>
                        {v.products_count !== undefined && v.products_count > 0 && (
                          <span>• {v.products_count} Produk</span>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. KELOMPOK KATEGORI (BADGE ORANYE / AMBER) */}
          {showCategories && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-600 text-white">
                    🏷️ Kategori Pilihan
                  </span>
                  <span className="text-xs text-slate-400">
                    ({results.categories.length} ditemukan)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleNavigate(`/categories`)}
                  className="text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-0.5"
                >
                  <span>Semua Kategori</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {results.categories.map((c) => (
                  <button
                    key={`search-cat-${c.id}-${c.slug}`}
                    type="button"
                    onClick={() => handleNavigate(`/categories/${c.slug}`)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-200/60 dark:border-amber-800/60 hover:bg-amber-100 text-xs font-bold transition-all group"
                  >
                    <Tag className="w-3.5 h-3.5 text-amber-600" />
                    <span>{c.name}</span>
                    {c.count !== undefined && c.count > 0 && (
                      <span className="text-[10px] font-normal opacity-75">
                        ({c.count})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty State jika Tidak Ditemukan */}
          {query.trim() && totalResults === 0 && !isLoading && (
            <div className="text-center py-10 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Tidak Ditemukan Hasil untuk &ldquo;{query}&rdquo;
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Coba periksa ejaan kata kunci Anda atau telusuri langsung melalui katalog seluruh produk kami.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleNavigate(
                    `/products?q=${encodeURIComponent(query.trim())}`
                  )
                }
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#093c96] text-white text-xs font-bold shadow-md hover:bg-blue-800 transition-colors"
              >
                <span>Buka Pencarian di Katalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Footer Shortcut Navigation Info */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline">
              Tekan <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-mono text-[10px]">ESC</kbd> untuk menutup
            </span>
            <span>
              Pencarian real-time di 6 Kecamatan Kota Serang
            </span>
          </div>
          {query.trim() && (
            <button
              type="button"
              onClick={() =>
                handleNavigate(
                  `/products?q=${encodeURIComponent(query.trim())}`
                )
              }
              className="text-[#093c96] dark:text-blue-400 font-semibold hover:underline"
            >
              Lihat di Halaman Penuh →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
