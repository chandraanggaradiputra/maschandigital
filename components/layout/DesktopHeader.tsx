"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Store, Info, UserPlus, LogIn } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/Button";

export function DesktopHeader() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/vendors?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header
      role="banner"
      className="hidden md:block top-0 z-40 sticky bg-white/90 dark:bg-surface-darkCard/90 backdrop-blur-md border-slate-200/80 dark:border-slate-800 border-b w-full transition-colors"
    >
      <aside
        aria-label="Pengumuman Marketplace"
        className="bg-brand-gradient px-4 py-1.5 font-medium text-white text-xs text-center tracking-wide"
      >
        📍 Marketplace Lokal Kota Serang • Transaksi Cepat Langsung ke WhatsApp
        Vendor
      </aside>

      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex justify-between items-center gap-6 h-20">
          {/* Logo Brand */}
          <Link
            href="/"
            className="group flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 shrink-0"
            aria-label="Mas Chan Digital - Beranda"
          >
            <div className="flex justify-center items-center bg-brand-gradient shadow-subtle p-2.5 rounded-2xl w-11 h-11 text-white group-hover:scale-105 transition-transform">
              <Store className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <span className="bg-brand-gradient bg-clip-text font-slab font-bold text-transparent text-xl tracking-tight">
                Mas Chan Digital
              </span>
              <span className="block font-semibold text-slate-500 dark:text-slate-400 text-xs">
                Marketplace Lokal Serang
              </span>
            </div>
          </Link>

          {/* Semantic Search Box */}
          <search role="search" className="flex-1 max-w-lg">
            <form onSubmit={handleSearch} className="relative">
              <label htmlFor="desktop-search-input" className="sr-only">
                Cari produk, oleh-oleh Serang, atau nama vendor
              </label>
              <input
                id="desktop-search-input"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari produk, oleh-oleh Serang, atau nama vendor..."
                className="bg-slate-100 focus:bg-white dark:bg-slate-800 dark:focus:bg-slate-900 py-2.5 pr-4 pl-11 border border-transparent focus:border-brand-500 rounded-full outline-none w-full text-slate-800 dark:text-slate-100 text-sm transition-all placeholder-slate-400"
              />
              <Search
                className="top-1/2 left-4 absolute w-4 h-4 text-slate-400 -translate-y-1/2"
                aria-hidden="true"
              />
            </form>
          </search>

          {/* Navigation */}
          <nav
            aria-label="Navigasi Utama Desktop"
            className="flex items-center gap-5"
          >
            <ul className="flex items-center gap-5 m-0 p-0 list-none">
              <li>
                <Link
                  href="/"
                  className="focus-visible:outline-none font-medium text-slate-600 hover:text-brand-800 dark:hover:text-brand-400 dark:text-slate-300 text-sm focus-visible:underline transition-colors"
                >
                  Beranda
                </Link>
              </li>
              <li>
                <Link
                  href="/vendors"
                  className="flex items-center gap-1.5 focus-visible:outline-none font-medium text-slate-600 hover:text-brand-800 dark:hover:text-brand-400 dark:text-slate-300 text-sm focus-visible:underline transition-colors"
                >
                  <Store className="w-4 h-4" aria-hidden="true" />
                  <span>Daftar Vendor</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/tentang-kami"
                  className="flex items-center gap-1.5 focus-visible:outline-none font-medium text-slate-600 hover:text-brand-800 dark:hover:text-brand-400 dark:text-slate-300 text-sm focus-visible:underline transition-colors"
                >
                  <Info className="w-4 h-4" aria-hidden="true" />
                  <span>Tentang Kami</span>
                </Link>
              </li>
            </ul>

            <div
              className="bg-slate-200 dark:bg-slate-800 w-px h-6"
              aria-hidden="true"
            />
            <ThemeToggle />

            {/* Auth Buttons */}
            <div className="flex items-center gap-2.5">
              <Link href="/vendor/login">
                <Button variant="outline" size="sm">
                  <LogIn className="w-4 h-4" aria-hidden="true" />
                  <span>Masuk Vendor</span>
                </Button>
              </Link>
              <Link href="/vendor/register">
                <Button variant="primary" size="sm">
                  <UserPlus className="w-4 h-4" aria-hidden="true" />
                  <span>Daftar Toko</span>
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
