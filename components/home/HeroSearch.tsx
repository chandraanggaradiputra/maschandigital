"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Store, Package, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { KECAMATAN_LIST } from "@/lib/constants/serangDistricts";
import { cn } from "@/lib/utils";

export function HeroSearch() {
  const router = useRouter();
  const [searchMode, setSearchMode] = useState<"products" | "vendors">("products");
  const [keyword, setKeyword] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKeyword = keyword.trim();
    const params = new URLSearchParams();

    if (searchMode === "products") {
      if (cleanKeyword) params.set("q", cleanKeyword);
      if (selectedDistrict && selectedDistrict !== "Semua Kecamatan") {
        params.set("kecamatan", selectedDistrict);
      }
      const qs = params.toString();
      router.push(qs ? `/products?${qs}` : "/products");
    } else {
      if (cleanKeyword) params.set("q", cleanKeyword);
      if (selectedDistrict && selectedDistrict !== "Semua Kecamatan") {
        params.set("district", selectedDistrict);
      }
      const qs = params.toString();
      router.push(qs ? `/vendors?${qs}` : "/vendors");
    }
  };

  return (
    <div className="mx-auto pt-2 max-w-2xl w-full">
      {/* Mode Selector Tabs */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <button
          type="button"
          onClick={() => setSearchMode("products")}
          className={cn(
            "inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all backdrop-blur-md shadow-xs",
            searchMode === "products"
              ? "bg-white text-[#093c96] shadow-md scale-105"
              : "bg-white/15 text-white hover:bg-white/25"
          )}
        >
          <Package className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Cari Produk UMKM</span>
        </button>

        <button
          type="button"
          onClick={() => setSearchMode("vendors")}
          className={cn(
            "inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all backdrop-blur-md shadow-xs",
            searchMode === "vendors"
              ? "bg-white text-emerald-700 shadow-md scale-105"
              : "bg-white/15 text-white hover:bg-white/25"
          )}
        >
          <Store className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Cari Toko / Vendor</span>
        </button>
      </div>

      {/* Main Search Bar Form */}
      <form
        onSubmit={handleSubmit}
        className="flex sm:flex-row flex-col gap-2 bg-white/95 dark:bg-slate-900/95 shadow-2xl backdrop-blur-lg p-2 border border-white/40 dark:border-slate-800 rounded-2xl sm:rounded-full transition-all"
        role="search"
        aria-label="Form Pencarian Beranda"
      >
        {/* Input Kata Kunci */}
        <div className="flex flex-1 items-center px-4 py-2">
          <label htmlFor="hero-search-input" className="sr-only">
            Kata kunci pencarian {searchMode === "products" ? "produk" : "toko"}
          </label>
          <Search
            className={cn(
              "mr-3 w-5 h-5 shrink-0 transition-colors",
              searchMode === "products" ? "text-blue-600" : "text-emerald-600"
            )}
            aria-hidden="true"
          />
          <input
            id="hero-search-input"
            type="search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder={
              searchMode === "products"
                ? "Cari sate bandeng, madu akasia, batik banten, kue..."
                : "Cari nama toko, warung, konveksi, jasa di Serang..."
            }
            className="bg-transparent outline-none w-full text-slate-800 dark:text-slate-100 text-sm placeholder-slate-400 font-medium"
          />
        </div>

        {/* Dropdown Kecamatan */}
        <div className="flex items-center px-4 py-2 border-slate-200 dark:border-slate-800 sm:border-l">
          <label htmlFor="hero-district-select" className="sr-only">
            Pilih Kecamatan di Kota Serang
          </label>
          <MapPin
            className="mr-2 w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0"
            aria-hidden="true"
          />
          <select
            id="hero-district-select"
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="bg-transparent outline-none font-medium text-slate-700 dark:text-slate-200 text-xs sm:text-sm cursor-pointer"
            aria-label="Pilih Kecamatan"
          >
            <option value="" className="text-slate-900 bg-white dark:bg-slate-900 dark:text-white">
              Semua Kecamatan
            </option>
            {KECAMATAN_LIST.map((kec) => (
              <option
                key={kec}
                value={kec}
                className="text-slate-900 bg-white dark:bg-slate-900 dark:text-white"
              >
                Kec. {kec}
              </option>
            ))}
          </select>
        </div>

        {/* Tombol Submit */}
        <Button
          type="submit"
          variant="primary"
          size="md"
          className={cn(
            "sm:rounded-full px-6 font-bold shadow-md transition-all",
            searchMode === "products"
              ? "bg-[#093c96] hover:bg-blue-800 text-white"
              : "bg-emerald-600 hover:bg-emerald-700 text-white"
          )}
        >
          Temukan
        </Button>
      </form>

      {/* Quick Search Shortcut Suggestion */}
      <div className="flex items-center justify-center gap-2 mt-2 text-[11px] text-slate-200/90 font-medium">
        <span>Tips: Gunakan shortcut</span>
        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("maschan:open-search"));
            }
          }}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/20 hover:bg-white/30 text-white font-mono transition-colors"
        >
          <kbd className="text-[10px]">Ctrl+K</kbd>
          <Sparkles className="w-3 h-3 text-amber-300" />
        </button>
        <span>untuk pencarian instan</span>
      </div>
    </div>
  );
}
