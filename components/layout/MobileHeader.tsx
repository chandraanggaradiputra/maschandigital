'use client';

import React from 'react';
import Link from 'next/link';
import { Store, Search, ExternalLink } from 'lucide-react';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

export function MobileHeader() {
  const handleOpenSearch = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('maschan:open-search'));
    }
  };

  return (
    <header className="md:hidden sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="flex h-14 items-center justify-between px-3.5 sm:px-4">
        {/* Brand Logo & Name */}
        <Link
          href="/"
          className="flex items-center gap-2 shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl"
          aria-label="Kembali ke Beranda Mas Chan Digital"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#093c96] text-white shadow-sm group-hover:scale-105 transition-transform">
            <Store className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-extrabold tracking-tight text-[#093c96] dark:text-blue-400 leading-none font-slab">
              Mas Chan Digital
            </span>
            <span className="text-[9px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              Marketplace Lokal Serang
            </span>
          </div>
        </Link>

        {/* Right Actions: Banten Mengaji, Search, ThemeToggle */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Banten Mengaji Mini Badge */}
          <a
            href="https://kajian-sunnah-serang.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 shadow-xs active:scale-95 transition-all"
            title="Kunjungi Portal Banten Mengaji"
            aria-label="Kunjungi Portal Banten Mengaji"
          >
            <span>🕌</span>
            <span className="hidden xs:inline text-[10px]">Kajian</span>
            <ExternalLink className="h-2.5 w-2.5 opacity-70" aria-hidden="true" />
          </a>

          {/* Search Trigger Button */}
          <button
            type="button"
            onClick={handleOpenSearch}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Cari produk atau toko"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
          </button>

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
