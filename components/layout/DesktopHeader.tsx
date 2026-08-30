"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Search,
  ChevronDown,
  Store,
  Package,
  Tag,
  BookOpen,
  Info,
  ExternalLink,
  UserPlus,
  LogIn,
  LayoutDashboard,
  PlusCircle,
  LogOut,
  UserCircle
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { cn } from "@/lib/utils";
import { getVendorSession, logoutVendor, AuthSession } from "@/lib/api/auth";

export function DesktopHeader() {
  const pathname = usePathname();
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
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

  const handleLogout = () => {
    logoutVendor("/");
  };

  const isVendor = Boolean(session && session.user);

  return (
    <header className="hidden md:block sticky top-0 z-50 w-full border-b bg-white/95 dark:bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg group">
          <div className="relative w-12 h-12 overflow-hidden rounded-xl bg-brand-50 flex items-center justify-center">
            {/* If logo fails to load or no image, fallback to icon */}
            <Store className="w-6 h-6 text-brand-600 dark:text-brand-400 group-hover:scale-110 transition-transform" aria-hidden="true" />
            <Image src="/maschandigital.webp" alt="Logo Mas Chan Digital" fill className="object-cover opacity-0 transition-opacity duration-300" onLoad={(e) => (e.currentTarget.style.opacity = '1')} unoptimized priority />
          </div>
          <div className="flex flex-col">
            <span className="font-slab font-bold text-lg text-slate-900 dark:text-white leading-tight tracking-tight">Mas Chan Digital</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">Marketplace UMKM Kota Serang</span>
          </div>
        </Link>

        {/* Center Navigation */}
        <nav aria-label="Navigasi Utama Desktop" className="flex items-center gap-2 lg:gap-6 flex-1 justify-center whitespace-nowrap">
          <Link href="/" className={cn("px-3 py-2 text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500", pathname === "/" ? "text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/50" : "text-slate-600 dark:text-slate-300 hover:text-brand-700 hover:bg-slate-50 dark:hover:bg-slate-800")}>
            Beranda
          </Link>

          {/* Belanja & UMKM Dropdown Group */}
          <div className="relative group">
            <button type="button" aria-expanded="false" className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
              Belanja & UMKM
              <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" aria-hidden="true" />
            </button>
            <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <div className="w-64 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 p-2 flex flex-col gap-1">
                <Link href="/products" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors focus-visible:outline-none focus-visible:bg-slate-50">
                  <Package className="w-5 h-5 text-brand-600 dark:text-brand-400" aria-hidden="true" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">Katalog Produk UMKM</span>
                    <span className="text-xs text-slate-500">Kuliner, fashion & kerajinan</span>
                  </div>
                </Link>
                <Link href="/vendors" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors focus-visible:outline-none focus-visible:bg-slate-50">
                  <Store className="w-5 h-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">Direktori Toko & Mitra</span>
                    <span className="text-xs text-slate-500">Daftar UMKM terverifikasi</span>
                  </div>
                </Link>
                <Link href="/categories" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors focus-visible:outline-none focus-visible:bg-slate-50">
                  <Tag className="w-5 h-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">Kategori Pilihan</span>
                    <span className="text-xs text-slate-500">Telusuri berdasarkan kategori</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Pusat Informasi Dropdown Group */}
          <div className="relative group">
            <button type="button" aria-expanded="false" className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
              Pusat Informasi
              <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" aria-hidden="true" />
            </button>
            <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <div className="w-64 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 p-2 flex flex-col gap-1">
                <Link href="/panduan" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors focus-visible:outline-none focus-visible:bg-slate-50">
                  <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">Panduan Belanja & Mitra</span>
                    <span className="text-xs text-slate-500">Cara beli & buka toko</span>
                  </div>
                </Link>
                <Link href="/tentang-kami" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors focus-visible:outline-none focus-visible:bg-slate-50">
                  <Info className="w-5 h-5 text-slate-600 dark:text-slate-400" aria-hidden="true" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">Tentang Kami</span>
                    <span className="text-xs text-slate-500">Visi digitalisasi UMKM</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          <a
            href="https://kajian-sunnah-serang.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:scale-105 hover:shadow-emerald-600/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            title="Kunjungi Portal Jadwal Kajian & Sholat Kota Serang"
            aria-label="Kunjungi Portal Syiar Salaf Serang"
          >
            <span>🕌 Syiar Salaf Serang</span>
            <ExternalLink className="h-3 w-3 opacity-90" aria-hidden="true" />
          </a>
        </nav>

        {/* Right Area */}
        <div className="flex items-center gap-3 shrink-0">
          <form action="/products" className="relative group/search hidden lg:block">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/search:text-brand-500 transition-colors" aria-hidden="true" />
            <input type="search" name="search" placeholder="Cari produk / toko..." aria-label="Kolom pencarian cepat" className="w-48 xl:w-64 pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all" />
          </form>
          
          {/* Fallback search button for smaller desktop/tablet */}
          <Link href="/products" className="lg:hidden p-2 text-slate-500 hover:text-brand-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500" aria-label="Pencarian Cepat">
            <Search className="w-5 h-5" aria-hidden="true" />
          </Link>

          <ThemeToggle />

          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" aria-hidden="true" />

          {isVendor && session?.user ? (
            <div className="relative group">
              <button type="button" aria-expanded="false" aria-label="Menu Profil Toko" className="flex items-center gap-2 pl-2 pr-3 py-1.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center text-brand-700 dark:text-brand-400 font-bold text-sm">
                  {session.user.store_name?.charAt(0).toUpperCase() || 'M'}
                </div>
                <div className="flex flex-col items-start max-w-[100px] xl:max-w-[120px]">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white truncate w-full">{session.user.store_name}</span>
                  <span className="text-[10px] font-medium text-brand-600 dark:text-brand-400 px-1.5 bg-brand-50 dark:bg-brand-950/50 rounded-sm">Mitra Toko</span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-500 transition-transform group-hover:rotate-180" aria-hidden="true" />
              </button>
              
              <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[200px]">
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 p-1.5 flex flex-col">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{session.user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{session.user.email}</p>
                  </div>
                  <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors focus-visible:outline-none focus-visible:bg-slate-50">
                    <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
                    <span>Dasbor Toko</span>
                  </Link>
                  <Link href="/dashboard/products/new" className="flex items-center gap-2 px-3 py-2 text-sm text-brand-700 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors focus-visible:outline-none focus-visible:bg-brand-50">
                    <PlusCircle className="w-4 h-4" aria-hidden="true" />
                    <span>Tambah Produk</span>
                  </Link>
                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" aria-hidden="true" />
                  <button type="button" onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors text-left focus-visible:outline-none focus-visible:bg-rose-50" aria-label="Keluar dari akun">
                    <LogOut className="w-4 h-4" aria-hidden="true" />
                    <span>Keluar</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/vendor/register" aria-label="Buka Toko atau Daftar Mitra" className="hidden lg:flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg">
                <Button variant="outline" size="sm" className="gap-1.5 h-9">
                  <UserPlus className="w-4 h-4" aria-hidden="true" />
                  <span>Daftar Mitra</span>
                </Button>
              </Link>
              <Link href="/vendor/login" aria-label="Masuk ke Akun Toko" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg">
                <Button size="sm" className="gap-1.5 h-9 bg-brand-600 hover:bg-brand-700 text-white">
                  <LogIn className="w-4 h-4" aria-hidden="true" />
                  <span>Masuk</span>
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
