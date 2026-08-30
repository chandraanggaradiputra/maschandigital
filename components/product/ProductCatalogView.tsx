"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Search, MapPin, Package, X, ArrowUpDown, RefreshCw } from "lucide-react";
import { Product, ProductCategory } from "@/types";
import { ProductCard } from "@/components/cards/ProductCard";
import { checkStoreStatus } from "@/lib/storeStatus";
import { KECAMATAN_LIST } from "@/lib/constants/serangDistricts";

interface ProductCatalogViewProps {
  initialProducts: Product[];
  categories: ProductCategory[];
}

const DISTRICT_OPTIONS = ["Semua Kecamatan", ...KECAMATAN_LIST];

export function ProductCatalogView({
  initialProducts,
  categories,
}: ProductCatalogViewProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Inisialisasi state dari searchParams URL
  const initialQ = searchParams.get("q") || searchParams.get("search") || "";
  const rawDistrict =
    searchParams.get("kecamatan") || searchParams.get("district") || "";
  const initialDistrict =
    rawDistrict && KECAMATAN_LIST.includes(rawDistrict)
      ? rawDistrict
      : "Semua Kecamatan";
  const initialCategory =
    searchParams.get("category") || searchParams.get("kategori") || "semua";
  const initialSort = (searchParams.get("sort") as "newest" | "price-asc" | "price-desc") || "newest";

  const [searchQuery, setSearchQuery] = useState(initialQ);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedDistrict, setSelectedDistrict] = useState<string>(initialDistrict);
  const [sortBy, setSortBy] = useState<"newest" | "price-asc" | "price-desc">(initialSort);
  const [onlyOpenStores, setOnlyOpenStores] = useState<boolean>(false);

  // Sinkronkan state lokal saat URL searchParams berubah (navigasi eksternal/back-forward)
  useEffect(() => {
    const qParam = searchParams.get("q") || searchParams.get("search") || "";
    const distParam =
      searchParams.get("kecamatan") || searchParams.get("district") || "";
    const catParam =
      searchParams.get("category") || searchParams.get("kategori") || "semua";
    const sortParam =
      (searchParams.get("sort") as "newest" | "price-asc" | "price-desc") || "newest";

    setSearchQuery(qParam);
    setSelectedDistrict(
      distParam && KECAMATAN_LIST.includes(distParam)
        ? distParam
        : "Semua Kecamatan"
    );
    setSelectedCategory(catParam);
    setSortBy(sortParam);
  }, [searchParams]);

  // Update URL searchParams tanpa me-refresh halaman
  const updateUrlParams = useCallback(
    (newQ: string, newDist: string, newCat: string, newSort: string) => {
      const params = new URLSearchParams();
      if (newQ.trim()) params.set("q", newQ.trim());
      if (newDist && newDist !== "Semua Kecamatan" && newDist !== "Semua") {
        params.set("kecamatan", newDist);
      }
      if (newCat && newCat !== "semua") {
        params.set("category", newCat);
      }
      if (newSort && newSort !== "newest") {
        params.set("sort", newSort);
      }

      const queryString = params.toString();
      const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(targetUrl, { scroll: false });
    },
    [pathname, router]
  );

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    updateUrlParams(val, selectedDistrict, selectedCategory, sortBy);
  };

  const handleDistrictChange = (dist: string) => {
    setSelectedDistrict(dist);
    updateUrlParams(searchQuery, dist, selectedCategory, sortBy);
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    updateUrlParams(searchQuery, selectedDistrict, cat, sortBy);
  };

  const handleSortChange = (sort: "newest" | "price-asc" | "price-desc") => {
    setSortBy(sort);
    updateUrlParams(searchQuery, selectedDistrict, selectedCategory, sort);
  };

  // Filter & Sort Logic di Sisi Klien
  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    // 1. Filter Pencarian Teks (Multi-field: Nama, Deskripsi, Toko, Kategori, Kota)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p) => {
        const nameMatch = p.name?.toLowerCase().includes(q);
        const descMatch =
          p.description?.toLowerCase().includes(q) ||
          p.short_description?.toLowerCase().includes(q);
        const storeMatch = p.vendor?.store_name?.toLowerCase().includes(q);
        const cityMatch =
          p.vendor?.city?.toLowerCase().includes(q) ||
          p.vendor?.location_district?.toLowerCase().includes(q);
        const categoryMatch = p.categories?.some(
          (c) =>
            c.name?.toLowerCase().includes(q) ||
            c.slug?.toLowerCase().includes(q)
        );

        return Boolean(
          nameMatch || descMatch || storeMatch || cityMatch || categoryMatch
        );
      });
    }

    // 2. Filter Kategori
    if (selectedCategory !== "semua") {
      result = result.filter((p) =>
        p.categories?.some(
          (c) =>
            c.slug?.toLowerCase() === selectedCategory.toLowerCase() ||
            c.name?.toLowerCase() === selectedCategory.toLowerCase()
        )
      );
    }

    // 3. Filter Kecamatan Kota Serang
    if (
      selectedDistrict !== "Semua Kecamatan" &&
      selectedDistrict !== "Semua"
    ) {
      const targetDist = selectedDistrict.toLowerCase();
      result = result.filter((p) => {
        const dist1 = (p.vendor?.city || "").toLowerCase();
        const dist2 = (p.vendor?.location_district || "").toLowerCase();
        return dist1.includes(targetDist) || dist2.includes(targetDist);
      });
    }

    // 4. Filter Hanya Toko yang Sedang Buka (Real-time Status)
    if (onlyOpenStores) {
      result = result.filter((p) => {
        const status = checkStoreStatus(
          p.vendor?.store_hours,
          p.vendor?.vacation_mode
        );
        return Boolean(status.isOpen && !status.isVacation);
      });
    }

    // 5. Pengurutan (Sorting)
    if (sortBy === "price-asc") {
      result.sort(
        (a, b) =>
          parseFloat(a.sale_price || a.price || "0") -
          parseFloat(b.sale_price || b.price || "0")
      );
    } else if (sortBy === "price-desc") {
      result.sort(
        (a, b) =>
          parseFloat(b.sale_price || b.price || "0") -
          parseFloat(a.sale_price || a.price || "0")
      );
    } else {
      // Default newest
      result.sort((a, b) => Number(b.id) - Number(a.id));
    }

    return result;
  }, [
    initialProducts,
    searchQuery,
    selectedCategory,
    selectedDistrict,
    sortBy,
    onlyOpenStores,
  ]);

  const handleReset = () => {
    setSearchQuery("");
    setSelectedCategory("semua");
    setSelectedDistrict("Semua Kecamatan");
    setSortBy("newest");
    setOnlyOpenStores(false);
    router.replace(pathname, { scroll: false });
  };

  const hasActiveFilter =
    searchQuery !== "" ||
    selectedCategory !== "semua" ||
    selectedDistrict !== "Semua Kecamatan" ||
    sortBy !== "newest" ||
    onlyOpenStores;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Search & Filter Control Bar */}
      <div className="space-y-4 bg-white dark:bg-surface-darkCard shadow-subtle p-4 sm:p-6 border border-slate-200/80 dark:border-slate-800 rounded-3xl">
        {/* Search Bar Input */}
        <div className="relative">
          <Search
            className="top-1/2 left-4 absolute w-5 h-5 text-slate-400 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Cari produk kuliner, madu akasia, batik banten, nama toko..."
            className="bg-slate-50 dark:bg-slate-900 py-3 sm:py-3.5 pr-10 pl-11 border border-slate-200 focus:border-brand-500 dark:border-slate-800 rounded-2xl outline-none focus:ring-1 focus:ring-brand-500 w-full font-sans text-slate-900 dark:text-white text-sm transition-all"
            aria-label="Cari produk di Kota Serang"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => handleSearchChange("")}
              className="top-1/2 right-3.5 absolute p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white -translate-y-1/2 rounded-full"
              aria-label="Hapus kata kunci pencarian"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Filter: Status Toko Real-Time */}
        <div className="flex items-center gap-2 pt-2 pb-1 border-slate-100 dark:border-slate-800 border-t overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setOnlyOpenStores(!onlyOpenStores)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 border ${
              onlyOpenStores
                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80 hover:bg-emerald-100"
            }`}
            aria-pressed={onlyOpenStores}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                onlyOpenStores ? "bg-white" : "bg-emerald-500 animate-pulse"
              }`}
            />
            <span>🟢 Hanya Toko Buka Sekarang</span>
          </button>

          {hasActiveFilter && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition-colors shrink-0"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Semua Filter</span>
            </button>
          )}
        </div>

        {/* Dropdown Filters (Kecamatan & Urutan) */}
        <div className="gap-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {/* Dropdown Kecamatan */}
          <div className="relative">
            <MapPin
              className="top-1/2 left-3.5 absolute w-4 h-4 text-brand-600 dark:text-brand-400 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <select
              value={selectedDistrict}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 py-2.5 pr-8 pl-10 border border-slate-200 focus:border-brand-500 dark:border-slate-800 rounded-xl outline-none w-full font-medium text-slate-800 dark:text-slate-200 text-xs sm:text-sm appearance-none cursor-pointer"
              aria-label="Filter berdasarkan kecamatan"
            >
              {DISTRICT_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d === "Semua Kecamatan"
                    ? "📍 Semua Kecamatan di Serang"
                    : `📍 Kec. ${d}`}
                </option>
              ))}
            </select>
          </div>

          {/* Dropdown Urutan Harga */}
          <div className="relative">
            <ArrowUpDown
              className="top-1/2 left-3.5 absolute w-4 h-4 text-slate-400 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <select
              value={sortBy}
              onChange={(e) =>
                handleSortChange(
                  e.target.value as "newest" | "price-asc" | "price-desc"
                )
              }
              className="bg-slate-50 dark:bg-slate-900 py-2.5 pr-8 pl-10 border border-slate-200 focus:border-brand-500 dark:border-slate-800 rounded-xl outline-none w-full font-medium text-slate-800 dark:text-slate-200 text-xs sm:text-sm appearance-none cursor-pointer"
              aria-label="Urutkan produk"
            >
              <option value="newest">Terbaru / Rekomendasi</option>
              <option value="price-asc">Harga: Terendah ke Tertinggi</option>
              <option value="price-desc">Harga: Tertinggi ke Terendah</option>
            </select>
          </div>

          {/* Active Filter Indicators */}
          {hasActiveFilter && (
            <div className="hidden lg:flex items-center text-xs text-slate-500 font-medium px-2">
              <span>
                Filter aktif:{" "}
                <strong className="text-[#093c96] dark:text-blue-400">
                  {filteredProducts.length} produk cocok
                </strong>
              </span>
            </div>
          )}
        </div>

        {/* Quick Category Filter Pills */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2 pt-2 pb-1 border-slate-100 dark:border-slate-800 border-t overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => handleCategoryChange("semua")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                selectedCategory === "semua"
                  ? "bg-[#093c96] text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              Semua Kategori
            </button>

            {categories.map((c) => (
              <button
                type="button"
                key={c.slug}
                onClick={() => handleCategoryChange(c.slug)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                  selectedCategory.toLowerCase() === c.slug.toLowerCase() ||
                  selectedCategory.toLowerCase() === c.name.toLowerCase()
                    ? "bg-[#093c96] text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {c.name}{" "}
                {c.count !== undefined && c.count > 0 && `(${c.count})`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results Header Count */}
      <div className="flex justify-between items-center px-1">
        <p className="font-semibold text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
          Menampilkan{" "}
          <strong className="text-slate-900 dark:text-white">
            {filteredProducts.length}
          </strong>{" "}
          produk di Kota Serang
          {searchQuery && (
            <span>
              {" "}
              untuk kata kunci &ldquo;<strong>{searchQuery}</strong>&rdquo;
            </span>
          )}
          {selectedDistrict !== "Semua Kecamatan" && (
            <span> di Kec. <strong>{selectedDistrict}</strong></span>
          )}
        </p>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="gap-3 sm:gap-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map((product, idx) => (
            <ProductCard
              key={
                product.id
                  ? `catalog-prod-${product.id}-${product.slug}`
                  : `catalog-prod-idx-${idx}`
              }
              product={product}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4 bg-white dark:bg-surface-darkCard p-6 py-16 border border-slate-200 dark:border-slate-800 border-dashed rounded-3xl text-center">
          <div className="flex justify-center items-center bg-slate-100 dark:bg-slate-800 mx-auto rounded-2xl w-16 h-16 text-slate-400">
            <Package className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-slab font-bold text-slate-800 dark:text-slate-200 text-base">
              Tidak Ada Produk yang Sesuai
            </h3>
            <p className="mx-auto max-w-sm text-slate-400 text-xs">
              Coba gunakan kata kunci pencarian lain atau ubah filter kecamatan
              dan kategori Anda.
            </p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="bg-[#093c96] hover:bg-blue-800 shadow-subtle px-4 py-2 rounded-xl font-bold text-white text-xs transition-colors"
          >
            Lihat Semua Produk
          </button>
        </div>
      )}
    </div>
  );
}
