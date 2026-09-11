"use client";

import React, { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";

interface BlogSearchBoxProps {
  initialSearch?: string;
}

export function BlogSearchBox({ initialSearch = "" }: BlogSearchBoxProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams ? searchParams.toString() : "");
    if (searchTerm.trim()) {
      params.set("search", searchTerm.trim());
      params.delete("page");
    } else {
      params.delete("search");
    }

    startTransition(() => {
      router.push(`/blog?${params.toString()}`);
    });
  };

  const handleClear = () => {
    setSearchTerm("");
    const params = new URLSearchParams(searchParams ? searchParams.toString() : "");
    params.delete("search");
    startTransition(() => {
      router.push(`/blog?${params.toString()}`);
    });
  };

  return (
    <form
      onSubmit={handleSearch}
      className="relative w-full max-w-xl mx-auto"
      role="search"
      aria-label="Cari artikel edukasi UMKM"
    >
      <div className="relative flex items-center">
        <div className="absolute left-4 pointer-events-none text-slate-400 dark:text-slate-500">
          {isPending ? (
            <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </div>

        <input
          type="search"
          name="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari tips jualan, panduan UMKM, atau kurasi produk Serang..."
          className="w-full pl-12 pr-24 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm sm:text-base shadow-subtle focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-400 focus:border-transparent transition-all"
        />

        <div className="absolute right-2.5 flex items-center gap-1.5">
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Hapus pencarian"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-brand-gradient text-white text-xs sm:text-sm font-semibold rounded-xl hover:brightness-110 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            Cari
          </button>
        </div>
      </div>
    </form>
  );
}
