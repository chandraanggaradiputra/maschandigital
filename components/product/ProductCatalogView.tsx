"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Search,
  Tag,
  Package,
  X,
  ArrowUpDown,
  RefreshCw,
  MapPin,
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
  const rawType =
    searchParams.get("type") || searchParams.get("business_type") || "all";
  const initialBusinessType: "all" | "product" | "service" =
    rawType === "service" || rawType === "product" ? rawType : "all";

  // Resolusi Kategori Utama (Parent Category)
  const parentCategories = useMemo(
    () => categories.filter((c) => !c.parent || Number(c.parent) === 0),
    [categories],
  );

  const serviceParentCategory = useMemo(() => {
    return (
      categories.find(
        (c) =>
          c.slug === "layanan-jasa" ||
          c.slug === "jasa" ||
          c.name.toLowerCase() === "layanan jasa",
      ) || null
    );
  }, [categories]);

  const isServiceCategory = useCallback(
    (cat: ProductCategory) => {
      if (serviceParentCategory && Number(cat.id) === Number(serviceParentCategory.id)) {
        return true;
      }
      if (serviceParentCategory && Number(cat.parent) === Number(serviceParentCategory.id)) {
        return true;
      }
      const slug = (cat.slug || "").toLowerCase();
      const name = (cat.name || "").toLowerCase();
      return (
        slug === "layanan-jasa" ||
        slug === "jasa" ||
        name.includes("layanan jasa") ||
        slug === "elektronik-komputer" ||
        slug === "konstruksi-baja-ringan" ||
        slug === "legalitas-bisnis"
      );
    },
    [serviceParentCategory],
  );

  const serviceCategorySlugs = useMemo(() => {
    const set = new Set<string>();
    categories.forEach((c) => {
      if (isServiceCategory(c)) {
        if (c.slug) set.add(c.slug.toLowerCase());
        if (c.name) set.add(c.name.toLowerCase());
      }
    });
    set.add("layanan-jasa");
    set.add("jasa");
    set.add("elektronik-komputer");
    set.add("konstruksi-baja-ringan");
    set.add("legalitas-bisnis");
    return set;
  }, [categories, isServiceCategory]);

  const serviceSubcategories = useMemo(() => {
    return categories.filter((c) => {
      if (serviceParentCategory && Number(c.id) === Number(serviceParentCategory.id)) {
        return false;
      }
      return isServiceCategory(c);
    });
  }, [categories, serviceParentCategory, isServiceCategory]);

  const productParentCategories = useMemo(() => {
    return categories.filter((c) => {
      if (isServiceCategory(c)) return false;
      return !c.parent || Number(c.parent) === 0;
    });
  }, [categories, isServiceCategory]);

  const isCategoryValidForType = useCallback(
    (catSlug: string, type: "all" | "product" | "service"): boolean => {
      if (!catSlug || catSlug === "semua") return true;
      const isService = serviceCategorySlugs.has(catSlug.toLowerCase());
      if (type === "service") return isService;
      if (type === "product") return !isService;
      return true;
    },
    [serviceCategorySlugs],
  );

  const formatCatName = (name: string) => {
    return name.replace(/&amp;/g, "&");
  };

  const getCategoryCount = useCallback(
    (cat: ProductCategory, type: "all" | "product" | "service") => {
      const catSlug = (cat.slug || "").toLowerCase();
      const catId = Number(cat.id);
      const childSlugs = new Set<string>([catSlug]);
      const childIds = new Set<number>([catId]);
      categories
        .filter((c) => Number(c.parent) === catId)
        .forEach((child) => {
          if (child.slug) childSlugs.add(child.slug.toLowerCase());
          childIds.add(Number(child.id));
        });

      return initialProducts.filter((p) => {
        if (type === "service" && p.business_type !== "service") return false;
        if (type === "product" && p.business_type === "service") return false;
        return p.categories?.some((c) => {
          const s = (c.slug || "").toLowerCase();
          const id = Number(c.id);
          return childIds.has(id) || childSlugs.has(s);
        });
      }).length;
    },
    [categories, initialProducts],
  );

  const effectiveInitialCategory = isCategoryValidForType(initialCategory, initialBusinessType)
    ? initialCategory
    : "semua";

  const initialParentId = useMemo(() => {
    if (!effectiveInitialCategory || effectiveInitialCategory === "semua") return 0;
    const cat = categories.find(
      (c) =>
        c.slug?.toLowerCase() === effectiveInitialCategory.toLowerCase() ||
        c.name?.toLowerCase() === effectiveInitialCategory.toLowerCase() ||
        String(c.id) === effectiveInitialCategory,
    );
    if (!cat) return 0;
    return cat.parent && Number(cat.parent) > 0
      ? Number(cat.parent)
      : Number(cat.id);
  }, [effectiveInitialCategory, categories]);

  const initialSubcategoryId = useMemo(() => {
    if (!effectiveInitialCategory || effectiveInitialCategory === "semua") return 0;
    const cat = categories.find(
      (c) =>
        c.slug?.toLowerCase() === effectiveInitialCategory.toLowerCase() ||
        c.name?.toLowerCase() === effectiveInitialCategory.toLowerCase() ||
        String(c.id) === effectiveInitialCategory,
    );
    if (!cat) return 0;
    return cat.parent && Number(cat.parent) > 0 ? Number(cat.id) : 0;
  }, [effectiveInitialCategory, categories]);

  const [searchQuery, setSearchQuery] = useState(initialQ);
  const [selectedParentId, setSelectedParentId] = useState<number>(initialParentId);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<number>(initialSubcategoryId);
  const [selectedCategory, setSelectedCategory] = useState<string>(effectiveInitialCategory);
  const [selectedDistrict, setSelectedDistrict] = useState<string>(initialDistrict);
  const [sortBy, setSortBy] = useState<string>(initialSort);
  const [onlyOpenStores, setOnlyOpenStores] = useState<boolean>(false);
  const [selectedBusinessType, setSelectedBusinessType] =
    useState<"all" | "product" | "service">(initialBusinessType);

  // Hitung jumlah produk fisik dan layanan jasa
  const productCount = useMemo(
    () => initialProducts.filter((p) => p.business_type !== "service").length,
    [initialProducts],
  );
  const serviceCount = useMemo(
    () => initialProducts.filter((p) => p.business_type === "service").length,
    [initialProducts],
  );

  // Sinkronkan state lokal saat URL searchParams berubah (navigasi eksternal/back-forward)
  const currentParamsString = searchParams.toString();
  const [prevParamsString, setPrevParamsString] = useState(currentParamsString);

  if (prevParamsString !== currentParamsString) {
    setPrevParamsString(currentParamsString);
    const qParam = searchParams.get("q") || searchParams.get("search") || "";
    const distParam =
      searchParams.get("kecamatan") || searchParams.get("district") || "";
    let catParam =
      searchParams.get("category") || searchParams.get("kategori") || "semua";
    const sortParam = searchParams.get("sort") || "recommended";
    const typeParam =
      searchParams.get("type") || searchParams.get("business_type") || "all";
    const resolvedType: "all" | "product" | "service" =
      typeParam === "service" || typeParam === "product" ? typeParam : "all";

    if (!isCategoryValidForType(catParam, resolvedType)) {
      catParam = "semua";
    }

    setSearchQuery(qParam);
    setSelectedDistrict(
      distParam && KECAMATAN_LIST.includes(distParam)
        ? distParam
        : "Semua Kecamatan",
    );
    setSelectedCategory(catParam);
    setSelectedBusinessType(resolvedType);

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
  }

  // Update URL searchParams tanpa me-refresh halaman
  const updateUrlParams = useCallback(
    (
      newQ: string,
      newDist: string,
      newCat: string,
      newSort: string,
      newType: "all" | "product" | "service" = selectedBusinessType,
    ) => {
      const params = new URLSearchParams();
      if (newType && newType !== "all") params.set("type", newType);
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
    [pathname, router, selectedBusinessType],
  );

  const handleBusinessTypeChange = (
    newType: "all" | "product" | "service",
  ) => {
    let nextCategory = selectedCategory;
    if (!isCategoryValidForType(selectedCategory, newType)) {
      nextCategory = "semua";
      setSelectedCategory("semua");
      setSelectedParentId(0);
      setSelectedSubcategoryId(0);
    }
    setSelectedBusinessType(newType);
    updateUrlParams(
      searchQuery,
      selectedDistrict,
      nextCategory,
      sortBy,
      newType,
    );
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    updateUrlParams(
      val,
      selectedDistrict,
      selectedCategory,
      sortBy,
      selectedBusinessType,
    );
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

    // 0. Filter Tipe Bisnis (Produk Fisik vs Layanan Jasa)
    if (selectedBusinessType === "product") {
      result = result.filter((p) => p.business_type !== "service");
    } else if (selectedBusinessType === "service") {
      result = result.filter((p) => p.business_type === "service");
    }

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
    selectedBusinessType,
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
    setSelectedBusinessType("all");
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
    selectedBusinessType !== "all" ||
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
        {/* Business Type Segmented Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => handleBusinessTypeChange("all")}
            className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              selectedBusinessType === "all"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200/80 dark:border-slate-700"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
            aria-pressed={selectedBusinessType === "all"}
          >
            <span>Semua Penawaran</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                selectedBusinessType === "all"
                  ? "bg-blue-100 dark:bg-blue-900/50 text-[#093c96] dark:text-blue-300"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}
            >
              {initialProducts.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => handleBusinessTypeChange("product")}
            className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              selectedBusinessType === "product"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200/80 dark:border-slate-700"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
            aria-pressed={selectedBusinessType === "product"}
          >
            <span>🛍️ Produk Fisik</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                selectedBusinessType === "product"
                  ? "bg-blue-100 dark:bg-blue-900/50 text-[#093c96] dark:text-blue-300"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}
            >
              {productCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => handleBusinessTypeChange("service")}
            className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              selectedBusinessType === "service"
                ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs border border-blue-200 dark:border-blue-900/80"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
            aria-pressed={selectedBusinessType === "service"}
          >
            <span>🛠️ Layanan Jasa</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                selectedBusinessType === "service"
                  ? "bg-blue-100 dark:bg-blue-900/50 text-[#093c96] dark:text-blue-300"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}
            >
              {serviceCount}
            </span>
          </button>
        </div>

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
            placeholder={
              selectedBusinessType === "service"
                ? "Cari jasa servis AC, bengkel, kanopi, renovasi, hukum/legalitas..."
                : selectedBusinessType === "product"
                  ? "Cari produk kuliner, madu akasia, keripik, batik banten..."
                  : "Cari produk kuliner, madu akasia, atau layanan jasa di Kota Serang..."
            }
            className="bg-slate-50 dark:bg-slate-900 py-3 sm:py-3.5 pr-10 pl-11 border border-slate-200 focus:border-[#093c96] dark:border-slate-800 rounded-2xl outline-none focus:ring-1 focus:ring-[#093c96] w-full font-sans text-slate-900 dark:text-white text-sm transition-all"
            aria-label="Cari produk atau layanan di Kota Serang"
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

        {/* Grid 2 Dropdown Utama: Kategori Adaptif & Urutan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Dropdown Kategori Adaptif */}
          <div className="relative">
            <Tag
              className="w-4 h-4 text-[#093c96] dark:text-blue-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <select
              value={selectedCategory}
              onChange={(e) => {
                const slug = e.target.value;
                handleCategoryChange(slug);
              }}
              className="w-full pl-10 pr-8 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-[#093c96] cursor-pointer appearance-none font-medium transition-colors"
              aria-label="Filter berdasarkan Kategori"
            >
              {selectedBusinessType === "service" ? (
                <>
                  <option value="semua">
                    🏷️ Semua Kategori Jasa ({serviceCount})
                  </option>
                  {serviceSubcategories.map((sub) => {
                    const count = getCategoryCount(sub, "service");
                    return (
                      <option key={sub.id} value={sub.slug}>
                        {formatCatName(sub.name)} ({count})
                      </option>
                    );
                  })}
                </>
              ) : selectedBusinessType === "product" ? (
                <>
                  <option value="semua">
                    🏷️ Semua Kategori Produk ({productCount})
                  </option>
                  {productParentCategories.map((parent) => {
                    const children = categories.filter(
                      (c) => Number(c.parent) === Number(parent.id) && !isServiceCategory(c),
                    );
                    const parentCount = getCategoryCount(parent, "product");
                    if (children.length > 0) {
                      return (
                        <optgroup key={parent.id} label={formatCatName(parent.name)}>
                          <option value={parent.slug}>
                            Semua {formatCatName(parent.name)} ({parentCount})
                          </option>
                          {children.map((child) => {
                            const childCount = getCategoryCount(child, "product");
                            return (
                              <option key={child.id} value={child.slug}>
                                {formatCatName(child.name)} ({childCount})
                              </option>
                            );
                          })}
                        </optgroup>
                      );
                    }
                    return (
                      <option key={parent.id} value={parent.slug}>
                        {formatCatName(parent.name)} ({parentCount})
                      </option>
                    );
                  })}
                </>
              ) : (
                <>
                  <option value="semua">
                    🏷️ Semua Kategori Penawaran ({initialProducts.length})
                  </option>
                  {parentCategories.map((parent) => {
                    const children = categories.filter(
                      (c) => Number(c.parent) === Number(parent.id),
                    );
                    const parentCount = getCategoryCount(parent, "all");
                    if (children.length > 0) {
                      return (
                        <optgroup key={parent.id} label={formatCatName(parent.name)}>
                          <option value={parent.slug}>
                            Semua {formatCatName(parent.name)} ({parentCount})
                          </option>
                          {children.map((child) => {
                            const childCount = getCategoryCount(child, "all");
                            return (
                              <option key={child.id} value={child.slug}>
                                {formatCatName(child.name)} ({childCount})
                              </option>
                            );
                          })}
                        </optgroup>
                      );
                    }
                    return (
                      <option key={parent.id} value={parent.slug}>
                        {formatCatName(parent.name)} ({parentCount})
                      </option>
                    );
                  })}
                </>
              )}
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

        {/* Baris Subkategori Dinamis (Hanya muncul jika kategori induk aktif memiliki anak dan BUKAN dalam mode service) */}
        {selectedBusinessType !== "service" && activeSubcategories.length > 0 && (
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
              Semua di {formatCatName(activeParentCategory?.name || "")}
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
                  {formatCatName(sub.name)}{" "}
                  {sub.count !== undefined &&
                    sub.count > 0 &&
                    `(${sub.count})`}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilter && (
        <div className="flex flex-wrap items-center gap-2 px-1">
          {selectedBusinessType !== "all" && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300">
              <span>
                {selectedBusinessType === "service"
                  ? "🛠️ Layanan Jasa"
                  : "🛍️ Produk Fisik"}
              </span>
              <button
                type="button"
                onClick={() => handleBusinessTypeChange("all")}
                className="hover:text-blue-900 dark:hover:text-blue-100 ml-0.5"
                aria-label="Hapus filter tipe bisnis"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          {searchQuery && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300">
              <Search className="w-3.5 h-3.5" />
              <span>&quot;{searchQuery}&quot;</span>
              <button
                type="button"
                onClick={() => handleSearchChange("")}
                className="hover:text-blue-900 dark:hover:text-blue-100 ml-0.5"
                aria-label="Hapus filter pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          {selectedDistrict !== "Semua Kecamatan" && selectedDistrict !== "Semua" && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300">
              <MapPin className="w-3.5 h-3.5" />
              <span>Kec. {selectedDistrict}</span>
              <button
                type="button"
                onClick={() => {
                  setSelectedDistrict("Semua Kecamatan");
                  updateUrlParams(searchQuery, "Semua Kecamatan", selectedCategory, sortBy, selectedBusinessType);
                }}
                className="hover:text-purple-900 dark:hover:text-purple-100 ml-0.5"
                aria-label="Hapus filter kecamatan"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          {selectedCategory !== "semua" && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300">
              <Tag className="w-3.5 h-3.5" />
              <span>
                {formatCatName(
                  categories.find(
                    (c) =>
                      c.slug?.toLowerCase() === selectedCategory.toLowerCase() ||
                      c.name?.toLowerCase() === selectedCategory.toLowerCase(),
                  )?.name || selectedCategory
                )}
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("semua");
                  setSelectedParentId(0);
                  setSelectedSubcategoryId(0);
                  updateUrlParams(searchQuery, selectedDistrict, "semua", sortBy, selectedBusinessType);
                }}
                className="hover:text-orange-900 dark:hover:text-orange-100 ml-0.5"
                aria-label="Hapus filter kategori"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          {onlyOpenStores && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Hanya Toko Buka</span>
              <button
                type="button"
                onClick={() => setOnlyOpenStores(false)}
                className="hover:text-emerald-900 dark:hover:text-emerald-100 ml-0.5"
                aria-label="Hapus filter toko buka"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 transition-colors"
          >
            Hapus Semua Filter
          </button>
        </div>
      )}

      {/* Results Header Count */}
      <div className="flex justify-between items-center px-1">
        <p className="font-semibold text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
          Menampilkan{" "}
          <strong className="text-slate-900 dark:text-white">
            {filteredProducts.length}
          </strong>{" "}
          {selectedBusinessType === "service"
            ? "layanan jasa"
            : selectedBusinessType === "product"
              ? "produk fisik"
              : "produk & layanan"}{" "}
          di Kota Serang
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
        <div className="gap-4 sm:gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
            {selectedBusinessType === "service"
              ? "Tidak Ada Layanan Jasa Ditemukan"
              : "Tidak Ada Produk Ditemukan"}
          </h2>
          <p className="mx-auto mb-6 max-w-md text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
            {searchQuery
              ? `Tidak ada ${
                  selectedBusinessType === "service"
                    ? "layanan jasa"
                    : "produk"
                } yang sesuai dengan pencarian "${searchQuery}". Silakan coba kata kunci lain atau reset filter pencarian.`
              : "Belum ada produk atau layanan yang sesuai dengan filter yang Anda pilih."}
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
