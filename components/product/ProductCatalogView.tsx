"use client";

import React, { useState, useMemo } from "react";
import { Search, MapPin, Package, X, ArrowUpDown } from "lucide-react";
import { Product, ProductCategory } from "@/types";
import { ProductCard } from "@/components/cards/ProductCard";

interface ProductCatalogViewProps {
  initialProducts: Product[];
  categories: ProductCategory[];
}

const DISTRICTS = [
  "Semua Kecamatan",
  "Serang",
  "Cipocok Jaya",
  "Kasemen",
  "Taktakan",
  "Curug",
  "Walantaka",
];

export function ProductCatalogView({
  initialProducts,
  categories,
}: ProductCatalogViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("semua");
  const [selectedDistrict, setSelectedDistrict] =
    useState<string>("Semua Kecamatan");
  const [sortBy, setSortBy] = useState<"newest" | "price-asc" | "price-desc">(
    "newest",
  );

  // Filter & Sort Logic di Sisi Klien
  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    // 1. Filter Pencarian Teks
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.vendor.store_name.toLowerCase().includes(q),
      );
    }

    // 2. Filter Kategori
    if (selectedCategory !== "semua") {
      result = result.filter((p) =>
        p.categories.some(
          (c) =>
            c.slug === selectedCategory ||
            c.name.toLowerCase() === selectedCategory.toLowerCase(),
        ),
      );
    }

    // 3. Filter Kecamatan Kota Serang
    if (selectedDistrict !== "Semua Kecamatan") {
      result = result.filter((p) => {
        const dist = (p.vendor?.city || "").toLowerCase();
        return dist.includes(selectedDistrict.toLowerCase());
      });
    }

    // 4. Pengurutan (Sorting)
    if (sortBy === "price-asc") {
      result.sort(
        (a, b) => parseFloat(a.price || "0") - parseFloat(b.price || "0"),
      );
    } else if (sortBy === "price-desc") {
      result.sort(
        (a, b) => parseFloat(b.price || "0") - parseFloat(a.price || "0"),
      );
    }

    return result;
  }, [
    initialProducts,
    searchQuery,
    selectedCategory,
    selectedDistrict,
    sortBy,
  ]);

  const handleReset = () => {
    setSearchQuery("");
    setSelectedCategory("semua");
    setSelectedDistrict("Semua Kecamatan");
    setSortBy("newest");
  };

  const hasActiveFilter =
    searchQuery !== "" ||
    selectedCategory !== "semua" ||
    selectedDistrict !== "Semua Kecamatan" ||
    sortBy !== "newest";

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Search & Filter Control Bar */}
      <div className="space-y-4 bg-white dark:bg-surface-darkCard shadow-subtle p-4 sm:p-6 border border-slate-200/80 dark:border-slate-800 rounded-3xl">
        {/* Search Bar Input */}
        <div className="relative">
          <Search
            className="top-1/2 left-4 absolute w-5 h-5 text-slate-400 -translate-y-1/2"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari sate bandeng, madu akasia, batik banten, jasa..."
            className="bg-slate-50 dark:bg-slate-900 py-3 sm:py-3.5 pr-4 pl-11 border border-slate-200 focus:border-brand-500 dark:border-slate-800 rounded-2xl outline-none focus:ring-1 focus:ring-brand-500 w-full font-sans text-slate-900 dark:text-white text-sm transition-all"
            aria-label="Cari produk di Kota Serang"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="top-1/2 right-3.5 absolute p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white -translate-y-1/2"
              aria-label="Hapus kata kunci pencarian"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dropdown Filters (Kecamatan & Urutan) */}
        <div className="gap-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {/* Dropdown Kecamatan */}
          <div className="relative">
            <MapPin
              className="top-1/2 left-3.5 absolute w-4 h-4 text-brand-600 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 py-2.5 pr-8 pl-10 border border-slate-200 focus:border-brand-500 dark:border-slate-800 rounded-xl outline-none w-full font-medium text-slate-800 dark:text-slate-200 text-xs sm:text-sm appearance-none cursor-pointer"
              aria-label="Filter berdasarkan kecamatan"
            >
              {DISTRICTS.map((d) => (
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
                setSortBy(
                  e.target.value as "newest" | "price-asc" | "price-desc",
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

          {/* Reset Filter Button */}
          {hasActiveFilter && (
            <button
              type="button"
              onClick={handleReset}
              className="flex justify-center items-center gap-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 px-4 py-2.5 border border-rose-200 dark:border-rose-800 rounded-xl font-bold text-rose-600 dark:text-rose-400 text-xs transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>

        {/* Quick Category Filter Pills */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2 pt-2 pb-1 border-slate-100 dark:border-slate-800 border-t overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedCategory("semua")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                selectedCategory === "semua"
                  ? "bg-brand-800 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              Semua Kategori
            </button>

            {categories.map((c) => (
              <button
                type="button"
                key={c.slug}
                onClick={() => setSelectedCategory(c.slug)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                  selectedCategory === c.slug
                    ? "bg-brand-800 text-white shadow-xs"
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
            className="bg-brand-800 hover:bg-brand-900 shadow-subtle px-4 py-2 rounded-xl font-bold text-white text-xs transition-colors"
          >
            Lihat Semua Produk
          </button>
        </div>
      )}
    </div>
  );
}
