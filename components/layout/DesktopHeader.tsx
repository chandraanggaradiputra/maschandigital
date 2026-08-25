"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Store,
  Info,
  UserPlus,
  LogIn,
  LayoutDashboard,
  LogOut,
  Tag,
  Package,
  BookOpen,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/Button";
import {
  getVendorSession,
  clearVendorSession,
  AuthSession,
} from "@/lib/api/auth";

export function DesktopHeader() {
  const [searchQuery, setSearchQuery] = useState("");
  const [session, setSession] = useState<AuthSession | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Definisikan handler di dalam useEffect agar mematuhi aturan React Hooks exhaustive-deps
    const syncAuth = () => {
      setSession(getVendorSession());
    };

    syncAuth();
    window.addEventListener("maschan:auth-change", syncAuth);
    window.addEventListener("storage", syncAuth);

    return () => {
      window.removeEventListener("maschan:auth-change", syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    clearVendorSession();
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  const isVendor = Boolean(session && session.user);

  return (
    <header
      role="banner"
      className="hidden md:block top-0 z-40 sticky bg-white/90 dark:bg-surface-darkCard/90 backdrop-blur-md border-slate-200/80 dark:border-slate-800 border-b w-full transition-colors"
    >
      {/* Top Tagline Announcement */}
      <aside
        aria-label="Pengumuman Marketplace"
        className="bg-brand-gradient px-4 py-1.5 font-medium text-white text-xs text-center tracking-wide"
      >
        📍 Marketplace Lokal Kota Serang • Transaksi Cepat Langsung ke WhatsApp
        Vendor
      </aside>

      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex justify-between items-center gap-6 h-20">
          {/* Brand Logo */}
          <Link
            href="/"
            className="group flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 shrink-0"
            aria-label="Mas Chan Digital - Kembali ke Beranda"
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

          {/* Accessible Search Bar */}
          <search role="search" className="flex-1 max-w-lg">
            <form onSubmit={handleSearch} className="relative">
              <label htmlFor="desktop-search-input" className="sr-only">
                Cari produk, oleh-oleh Serang, atau nama toko vendor
              </label>
              <input
                id="desktop-search-input"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari produk, madu akasia, sate bandeng..."
                className="bg-slate-100 focus:bg-white dark:bg-slate-800 dark:focus:bg-slate-900 py-2.5 pr-4 pl-11 border border-transparent focus:border-brand-500 rounded-full outline-none w-full text-slate-800 dark:text-slate-100 text-sm transition-all placeholder-slate-400"
              />
              <Search
                className="top-1/2 left-4 absolute w-4 h-4 text-slate-400 -translate-y-1/2"
                aria-hidden="true"
              />
            </form>
          </search>

          {/* Navigation Links */}
          <nav
            aria-label="Navigasi Utama Desktop"
            className="flex items-center gap-5"
          >
            {isVendor ? (
              /* MENU KHUSUS VENDOR */
              <ul className="flex items-center gap-5 m-0 p-0 list-none">
                {/* 1. Produk */}
                <li>
                  <Link
                    href="/dashboard/products"
                    className="flex items-center gap-1.5 focus-visible:outline-none font-medium text-slate-600 hover:text-brand-800 dark:hover:text-brand-400 dark:text-slate-300 text-sm focus-visible:underline transition-colors"
                  >
                    <Package className="w-4 h-4" aria-hidden="true" />
                    <span>Produk</span>
                  </Link>
                </li>
                {/* 2. Panduan (Kiri dekat Beranda) */}
                <li>
                  <Link
                    href="/panduan"
                    className="flex items-center gap-1.5 focus-visible:outline-none font-medium text-slate-600 hover:text-brand-800 dark:hover:text-brand-400 dark:text-slate-300 text-sm focus-visible:underline transition-colors"
                  >
                    <BookOpen className="w-4 h-4" aria-hidden="true" />
                    <span>Panduan</span>
                  </Link>
                </li>
                {/* 3. Beranda (POSISI TENGAH) */}
                <li>
                  <Link
                    href="/"
                    className="focus-visible:outline-none font-semibold text-brand-800 dark:text-brand-400 text-sm focus-visible:underline transition-colors"
                  >
                    Beranda
                  </Link>
                </li>
                {/* 4. Dashboard (Kanan dekat Beranda) */}
                <li>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-1.5 focus-visible:outline-none font-medium text-slate-600 hover:text-brand-800 dark:hover:text-brand-400 dark:text-slate-300 text-sm focus-visible:underline transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
                    <span>Dashboard</span>
                  </Link>
                </li>
                {/* 5. Logout */}
                <li>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 p-2 rounded-xl font-medium text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 text-sm transition-colors"
                    title="Keluar dari akun vendor"
                  >
                    <LogOut className="w-4 h-4" aria-hidden="true" />
                    <span>Logout</span>
                  </button>
                </li>
              </ul>
            ) : (
              /* MENU GUEST / CUSTOMER ASLI */
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
                    href="/products"
                    className="flex items-center gap-1.5 focus-visible:outline-none font-medium text-slate-600 hover:text-brand-800 dark:hover:text-brand-400 dark:text-slate-300 text-sm focus-visible:underline transition-colors"
                  >
                    <Package className="w-4 h-4" aria-hidden="true" />
                    <span>Produk</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/categories"
                    className="flex items-center gap-1.5 focus-visible:outline-none font-medium text-slate-600 hover:text-brand-800 dark:hover:text-brand-400 dark:text-slate-300 text-sm focus-visible:underline transition-colors"
                  >
                    <Tag className="w-4 h-4" aria-hidden="true" />
                    <span>Kategori</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/vendors"
                    className="flex items-center gap-1.5 focus-visible:outline-none font-medium text-slate-600 hover:text-brand-800 dark:hover:text-brand-400 dark:text-slate-300 text-sm focus-visible:underline transition-colors"
                  >
                    <Store className="w-4 h-4" aria-hidden="true" />
                    <span>Vendor</span>
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
            )}

            <div
              className="bg-slate-200 dark:bg-slate-800 w-px h-6"
              aria-hidden="true"
            />
            <ThemeToggle />

            {/* Auth Buttons Khusus Guest */}
            {!isVendor && (
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
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
