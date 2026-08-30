"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Search,
  Tag,
  Package,
  X,
  ArrowUpDown,
  RefreshCw,
} from "lucide-react";
import { Product, ProductCategory } from "@/types";
import { ProductCard } from "@/components/cards/ProductCard";
import { checkStoreStatus } from "@/lib/storeStatus";
import { resolveVendorDistrict } from "@/lib/utils";
import { KECAMATAN_LIST } from "@/lib/constants/serangDistricts";

interface ProductCatalogViewProps {
  initialProducts: Product[];
  categories: ProductCategory[];
}

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
  const rawSort = searchParams.get("sort") || "recommended";
  const initialSort =
    rawSort === "price-asc"
      ? "price_asc"
      : rawSort === "price-desc"
        ? "price_desc"
        : rawSort;

  // Resolusi Kategori Utama (Parent Category)
  const parentCategories = useMemo(
    () => categories.filter((c) => !c.parent || Number(c.parent) === 0),
    [categories],
  );

  const initialParentId = useMemo(() => {
    if (!initialCategory || initialCategory === "semua") return 0;
    const cat = categories.find(
      (c) =>
        c.slug?.toLowerCase() === initialCategory.toLowerCase() ||
        c.name?.toLowerCase() === initialCategory.toLowerCase() ||
        String(c.id) === initialCategory,
    );
    if (!cat) return 0;
    return cat.parent && Number(cat.parent) > 0
      ? Number(cat.parent)
      : Number(cat.id);
  }, [initialCategory, categories]);

  const initialSubcategoryId = useMemo(() => {
    if (!initialCategory || initialCategory === "semua") return 0;
    const cat = categories.find(
      (c) =>
        c.slug?.toLowerCase() === initialCategory.toLowerCase() ||
        c.name?.toLowerCase() === initialCategory.toLowerCase() ||
        String(c.id) === initialCategory,
    );
    if (!cat) return 0;
    return cat.parent && Number(cat.parent) > 0 ? Number(cat.id) : 0;
  }, [initialCategory, categories]);

  const [searchQuery, setSearchQuery] = useState(initialQ);
  const [selectedParentId, setSelectedParentId] = useState<number>(initialParentId);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<number>(initialSubcategoryId);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedDistrict, setSelectedDistrict] = useState<string>(initialDistrict);
  const [sortBy, setSortBy] = useState<string>(initialSort);
  const [onlyOpenStores, setOnlyOpenStores] = useState<boolean>(false);

  // Sinkronkan state lokal saat URL searchParams berubah (navigasi eksternal/back-forward)
  useEffect(() => {
    const qParam = searchParams.get("q") || searchParams.get("search") || "";
    const distParam =
      searchParams.get("kecamatan") || searchParams.get("district") || "";
    const catParam =
      searchParams.get("category") || searchParams.get("kategori") || "semua";
    const sortParam = searchParams.get("sort") || "recommended";

    setSearchQuery(qParam);
    setSelectedDistrict(
      distParam && KECAMATAN_LIST.includes(distParam)
        ? distParam
        : "Semua Kecamatan",
    );
    setSelectedCategory(catParam);

    if (catParam === "semua" || !catParam) {
      setSelectedParentId(0);
      setSelectedSubcategoryId(0);
    } else {
      const cat = categories.find(
        (c) =>
          c.slug?.toLowerCase() === catParam.toLowerCase() ||
          c.name?.toLowerCase() === catParam.toLowerCase() ||
          String(c.id) === catParam,
      );
      if (cat) {
        if (cat.parent && Number(cat.parent) > 0) {
          setSelectedParentId(Number(cat.parent));
          setSelectedSubcategoryId(Number(cat.id));
        } else {
          setSelectedParentId(Number(cat.id));
          setSelectedSubcategoryId(0);
        }
      }
    }

    if (sortParam === "price_asc" || sortParam === "price-asc") {
      setSortBy("price_asc");
    } else if (sortParam === "price_desc" || sortParam === "price-desc") {
      setSortBy("price_desc");
    } else {
      setSortBy("recommended");
    }
  }, [searchParams, categories]);

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
      if (newSort && newSort !== "recommended" && newSort !== "newest") {
        params.set("sort", newSort);
      }

      const queryString = params.toString();
      const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(targetUrl, { scroll: false });
    },
    [pathname, router],
  );

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    updateUrlParams(val, selectedDistrict, selectedCategory, sortBy);
  };

  const handleParentChange = (pId: number) => {
    setSelectedParentId(pId);
    setSelectedSubcategoryId(0);
    if (pId === 0) {
      setSelectedCategory("semua");
      updateUrlParams(searchQuery, selectedDistrict, "semua", sortBy);
    } else {
      const parentCat = categories.find((c) => Number(c.id) === pId);
      const catSlug = parentCat ? parentCat.slug : String(pId);
      setSelectedCategory(catSlug);
      updateUrlParams(searchQuery, selectedDistrict, catSlug, sortBy);
    }
  };

  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug);
    if (slug === "semua") {
      setSelectedParentId(0);
      setSelectedSubcategoryId(0);
    } else {
      const cat = categories.find(
        (c) =>
          c.slug?.toLowerCase() === slug.toLowerCase() ||
          c.name?.toLowerCase() === slug.toLowerCase(),
      );
      if (cat) {
        if (cat.parent && Number(cat.parent) > 0) {
          setSelectedParentId(Number(cat.parent));
          setSelectedSubcategoryId(Number(cat.id));
        } else {
          setSelectedParentId(Number(cat.id));
          setSelectedSubcategoryId(0);
        }
      }
    }
    updateUrlParams(searchQuery, selectedDistrict, slug, sortBy);
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    updateUrlParams(searchQuery, selectedDistrict, selectedCategory, newSort);
  };

  // Cek apakah data kategori memiliki struktur hierarki parent-child murni WCFM/WooCommerce
  const hasHierarchy = useMemo(() => {
    return categories.some((c) => c.parent && Number(c.parent) > 0);
  }, [categories]);

  // Ambil kategori induk aktif untuk menampilkan subkategori dinamis
  const activeParentCategory = useMemo(() => {
    if (selectedParentId > 0) {
      return (
        categories.find((c) => Number(c.id) === selectedParentId) || null
      );
    }
    if (selectedCategory === "semua") return null;
    const cat = categories.find(
      (c) =>
        c.slug?.toLowerCase() === selectedCategory.toLowerCase() ||
        c.name?.toLowerCase() === selectedCategory.toLowerCase(),
    );
    if (!cat) return null;
    if (cat.parent && Number(cat.parent) > 0) {
      return (
        categories.find((c) => Number(c.id) === Number(cat.parent)) || cat
      );
    }
    return cat;
  }, [selectedParentId, selectedCategory, categories]);

  const activeSubcategories = useMemo(() => {
    if (!activeParentCategory) return [];
    return categories.filter(
      (c) => Number(c.parent) === Number(activeParentCategory.id),
    );
  }, [activeParentCategory, categories]);

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
            c.slug?.toLowerCase().includes(q),
        );

        return Boolean(
          nameMatch || descMatch || storeMatch || cityMatch || categoryMatch,
        );
      });
    }

    // 2. Filter Kategori (Mendukung Parent & Subkategori murni dari taksonomi WooCommerce / WCFM)
    if (selectedSubcategoryId > 0) {
      const subCat = categories.find(
        (c) => Number(c.id) === selectedSubcategoryId,
      );
      if (subCat) {
        const subSlug = subCat.slug.toLowerCase();
        const subName = subCat.name.toLowerCase();
        result = result.filter((p) =>
          p.categories?.some((c) => {
            const cSlug = (c.slug || "").toLowerCase();
            const cName = (c.name || "").toLowerCase();
            return (
              Number(c.id) === subCat.id ||
              cSlug === subSlug ||
              cName === subName
            );
          }),
        );
      }
    } else if (selectedParentId > 0) {
      const parentCat = categories.find(
        (c) => Number(c.id) === selectedParentId,
      );
      if (parentCat) {
        const matchingIds = new Set<number>([parentCat.id]);
        const matchingSlugs = new Set<string>([
          parentCat.slug.toLowerCase(),
          parentCat.name.toLowerCase(),
        ]);

        categories
          .filter((c) => Number(c.parent) === parentCat.id)
          .forEach((sub) => {
            matchingIds.add(sub.id);
            if (sub.slug) matchingSlugs.add(sub.slug.toLowerCase());
            if (sub.name) matchingSlugs.add(sub.name.toLowerCase());
          });

        result = result.filter((p) =>
          p.categories?.some((c) => {
            const cSlug = (c.slug || "").toLowerCase();
            const cName = (c.name || "").toLowerCase();
            return (
              matchingIds.has(Number(c.id)) ||
              matchingSlugs.has(cSlug) ||
              matchingSlugs.has(cName)
            );
          }),
        );
      }
    } else if (selectedCategory !== "semua") {
      const selectedSlug = selectedCategory.toLowerCase();
      const matchingCategorySlugs = new Set<string>([selectedSlug]);

      const currentCat = categories.find(
        (c) =>
          c.slug?.toLowerCase() === selectedSlug ||
          c.name?.toLowerCase() === selectedSlug,
      );

      if (currentCat) {
        if (currentCat.slug)
          matchingCategorySlugs.add(currentCat.slug.toLowerCase());
        if (currentCat.name)
          matchingCategorySlugs.add(currentCat.name.toLowerCase());

        categories
          .filter((c) => Number(c.parent) === Number(currentCat.id))
          .forEach((child) => {
            if (child.slug)
              matchingCategorySlugs.add(child.slug.toLowerCase());
            if (child.name)
              matchingCategorySlugs.add(child.name.toLowerCase());
          });
      }

      result = result.filter((p) =>
        p.categories?.some((c) => {
          const cSlug = (c.slug || "").toLowerCase();
          const cName = (c.name || "").toLowerCase();
          return (
            matchingCategorySlugs.has(cSlug) ||
            matchingCategorySlugs.has(cName)
          );
        }),
      );
    }

    // 3. Filter Kecamatan Kota Serang (Akurat tanpa bias kata "Kota Serang")
    if (
      selectedDistrict !== "Semua Kecamatan" &&
      selectedDistrict !== "Semua"
    ) {
      const targetDist = selectedDistrict
        .toLowerCase()
        .replace(/^kec(\.|\s+)?/i, "")
        .trim();
      result = result.filter((p) => {
        const vendorDist = resolveVendorDistrict(p.vendor).toLowerCase();
        return (
          vendorDist.includes(targetDist) || targetDist.includes(vendorDist)
        );
      });
    }

    // 4. Filter Hanya Toko yang Sedang Buka (Real-time Status)
    if (onlyOpenStores) {
      result = result.filter((p) => {
        const status = checkStoreStatus(
          p.vendor?.store_hours,
          p.vendor?.vacation_mode,
        );
        return Boolean(status.isOpen && !status.isVacation);
      });
    }

    // 5. Pengurutan (Sorting)
    if (sortBy === "price_asc" || sortBy === "price-asc") {
      result.sort(
        (a, b) =>
          parseFloat(a.sale_price || a.price || "0") -
          parseFloat(b.sale_price || b.price || "0"),
      );
    } else if (sortBy === "price_desc" || sortBy === "price-desc") {
      result.sort(
        (a, b) =>
          parseFloat(b.sale_price || b.price || "0") -
          parseFloat(a.sale_price || a.price || "0"),
      );
    } else {
      // Default newest / recommended
      result.sort((a, b) => Number(b.id) - Number(a.id));
    }

    return result;
  }, [
    initialProducts,
    searchQuery,
    selectedCategory,
    selectedParentId,
    selectedSubcategoryId,
    selectedDistrict,
    categories,
    sortBy,
    onlyOpenStores,
  ]);

  const handleReset = () => {
    setSearchQuery("");
    setSelectedCategory("semua");
    setSelectedParentId(0);
    setSelectedSubcategoryId(0);
    setSelectedDistrict("Semua Kecamatan");
    setSortBy("recommended");
    setOnlyOpenStores(false);
    router.replace(pathname, { scroll: false });
  };

  const hasActiveFilter =
    searchQuery !== "" ||
    selectedCategory !== "semua" ||
    selectedParentId !== 0 ||
    selectedSubcategoryId !== 0 ||
    (selectedDistrict !== "Semua Kecamatan" &&
      selectedDistrict !== "Semua") ||
    (sortBy !== "recommended" && sortBy !== "newest") ||
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
            className="bg-slate-50 dark:bg-slate-900 py-3 sm:py-3.5 pr-10 pl-11 border border-slate-200 focus:border-[#093c96] dark:border-slate-800 rounded-2xl outline-none focus:ring-1 focus:ring-[#093c96] w-full font-sans text-slate-900 dark:text-white text-sm transition-all"
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

        {/* Grid 2 Dropdown Utama: Kategori Utama & Urutan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Dropdown Kategori Utama (Parent Category) */}
          <div className="relative">
            <Tag
              className="w-4 h-4 text-[#093c96] dark:text-blue-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <select
              value={selectedParentId}
              onChange={(e) => {
                const pId = Number(e.target.value);
                handleParentChange(pId);
              }}
              className="w-full pl-10 pr-8 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-[#093c96] cursor-pointer appearance-none font-medium transition-colors"
              aria-label="Filter berdasarkan Kategori Utama"
            >
              <option value="0">
                🏷️ Semua Kategori Utama (
                {categories
                  .filter((c) => !c.parent || Number(c.parent) === 0)
                  .reduce((acc, curr) => acc + (curr.count || 0), 0) ||
                  initialProducts.length}
                )
              </option>
              {parentCategories.map((parent) => (
                <option key={parent.id} value={parent.id}>
                  {parent.name} ({parent.count || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Dropdown Urutan */}
          <div className="relative">
            <ArrowUpDown
              className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-[#093c96] cursor-pointer appearance-none font-medium transition-colors"
              aria-label="Urutkan Produk"
            >
              <option value="recommended">⇅ Terbaru / Rekomendasi</option>
              <option value="price_asc">💰 Harga: Termurah ke Termahal</option>
              <option value="price_desc">💎 Harga: Termahal ke Termurah</option>
            </select>
          </div>
        </div>

        {/* Baris Subkategori Dinamis (Hanya muncul jika kategori induk aktif memiliki anak) */}
        {activeSubcategories.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pl-2 py-1.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-400 shrink-0 px-1">
              Subkategori:
            </span>
            <button
              type="button"
              onClick={() =>
                activeParentCategory &&
                handleCategoryChange(activeParentCategory.slug)
              }
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 ${
                selectedSubcategoryId === 0
                  ? "bg-blue-100 dark:bg-blue-950 text-[#093c96] dark:text-blue-300 font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
              }`}
            >
              Semua di {activeParentCategory?.name}
            </button>
            {activeSubcategories.map((sub) => {
              const isSubSelected =
                selectedSubcategoryId === sub.id ||
                selectedCategory.toLowerCase() === sub.slug.toLowerCase() ||
                selectedCategory.toLowerCase() === sub.name.toLowerCase();

              return (
                <button
                  type="button"
                  key={`sub-${sub.slug}`}
                  onClick={() => handleCategoryChange(sub.slug)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 ${
                    isSubSelected
                      ? "bg-blue-600 text-white font-bold shadow-xs"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {sub.name}{" "}
                  {sub.count !== undefined &&
                    sub.count > 0 &&
                    `(${sub.count})`}
                </button>
              );
            })}
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
            <span>
              {" "}
              di Kec. <strong>{selectedDistrict}</strong>
            </span>
          )}
        </p>
      </div>

      {/* Product Grid View */}
      {filteredProducts.length > 0 ? (
        <div className="gap-4 sm:gap-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map((product, index) => (
            <ProductCard
              key={
                product.id
                  ? `prod-${product.id}-${product.slug}-${index}`
                  : `prod-idx-${index}`
              }
              product={product}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-slate-50 dark:bg-slate-900/50 p-8 sm:p-12 border border-slate-200/80 dark:border-slate-800 border-dashed rounded-3xl text-center">
          <div className="flex justify-center items-center bg-blue-50 dark:bg-blue-950/50 mx-auto mb-4 rounded-full w-14 h-14 text-[#093c96] dark:text-blue-400">
            <Package className="w-7 h-7" aria-hidden="true" />
          </div>
          <h2 className="mb-2 font-bold font-slab text-slate-900 dark:text-white text-lg">
            Tidak Ada Produk Ditemukan
          </h2>
          <p className="mx-auto mb-6 max-w-md text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
            {searchQuery
              ? `Tidak ada produk yang sesuai dengan pencarian "${searchQuery}". Silakan coba kata kunci lain atau reset filter pencarian.`
              : "Belum ada produk yang sesuai dengan filter yang Anda pilih."}
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 bg-[#093c96] hover:bg-blue-800 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Semua Filter</span>
          </button>
        </div>
      )}
    </div>
  );
}
