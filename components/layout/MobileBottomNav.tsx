"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Store,
  LayoutDashboard,
  Tag,
  LogIn,
  Package,
  BookOpen,
  LogOut,
  Plus,
  Menu,
  X,
  ExternalLink,
  UserPlus,
  Info,
  Phone,
  FileText,
  ShieldCheck,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getVendorSession, logoutVendor, AuthSession } from "@/lib/api/auth";

export function MobileBottomNav() {
  const pathname = usePathname();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
    setIsDrawerOpen(false);
    logoutVendor("/");
  };

  const isVendor = Boolean(session && session.user);

  // Close drawer on path change
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isDrawerOpen]);

  return (
    <>
      <nav aria-label="Navigasi Bawah Mobile" className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe">
        <div className="flex items-center justify-around px-2 h-16">
          {/* Tab 1: Beranda */}
          <Link href="/" className="flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 focus-visible:outline-none focus-visible:text-brand-600 group" aria-current={pathname === "/" ? "page" : undefined}>
            <div className={cn("p-1 rounded-full transition-all duration-200", pathname === "/" ? "bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 scale-110" : "group-hover:scale-110")}>
              <Home className="w-5 h-5" aria-hidden="true" />
            </div>
            <span className={cn("text-[10px] mt-0.5 font-medium transition-colors", pathname === "/" ? "text-brand-600 dark:text-brand-400 font-bold" : "")}>Beranda</span>
          </Link>

          {/* Tab 2: Produk */}
          <Link href="/products" className="flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 focus-visible:outline-none focus-visible:text-brand-600 group" aria-current={pathname.startsWith("/products") ? "page" : undefined}>
            <div className={cn("p-1 rounded-full transition-all duration-200", pathname.startsWith("/products") ? "bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 scale-110" : "group-hover:scale-110")}>
              <Package className="w-5 h-5" aria-hidden="true" />
            </div>
            <span className={cn("text-[10px] mt-0.5 font-medium transition-colors", pathname.startsWith("/products") ? "text-brand-600 dark:text-brand-400 font-bold" : "")}>Produk</span>
          </Link>

          {/* Tab 3: Center (Role Adaptive) */}
          <div className="flex flex-col items-center justify-center w-full h-full relative -top-3">
            {isVendor ? (
              <Link href="/dashboard/products/new" className="flex flex-col items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-full group" aria-label="Tambah Produk Baru">
                <div className="w-12 h-12 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-lg shadow-brand-500/30 group-hover:bg-brand-700 transition-all group-hover:scale-105 active:scale-95">
                  <Plus className="w-6 h-6" aria-hidden="true" />
                </div>
                <span className="text-[10px] mt-1 font-bold text-brand-700 dark:text-brand-400">Jual</span>
              </Link>
            ) : (
              <Link href="/vendors" className="flex flex-col items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-full group" aria-label="Direktori Toko">
                <div className="w-12 h-12 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-lg shadow-brand-500/30 group-hover:bg-brand-700 transition-all group-hover:scale-105 active:scale-95">
                  <Store className="w-6 h-6" aria-hidden="true" />
                </div>
                <span className="text-[10px] mt-1 font-bold text-brand-700 dark:text-brand-400">Toko</span>
              </Link>
            )}
          </div>

          {/* Tab 4: Kategori (or Pesanan for vendor) */}
          {isVendor ? (
            <Link href="/dashboard/orders" className="flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 focus-visible:outline-none focus-visible:text-brand-600 group" aria-current={pathname.startsWith("/dashboard/orders") ? "page" : undefined}>
              <div className={cn("p-1 rounded-full transition-all duration-200", pathname.startsWith("/dashboard/orders") ? "bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 scale-110" : "group-hover:scale-110")}>
                <LayoutDashboard className="w-5 h-5" aria-hidden="true" />
              </div>
              <span className={cn("text-[10px] mt-0.5 font-medium transition-colors", pathname.startsWith("/dashboard/orders") ? "text-brand-600 dark:text-brand-400 font-bold" : "")}>Pesanan</span>
            </Link>
          ) : (
            <Link href="/categories" className="flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 focus-visible:outline-none focus-visible:text-brand-600 group" aria-current={pathname.startsWith("/categories") ? "page" : undefined}>
              <div className={cn("p-1 rounded-full transition-all duration-200", pathname.startsWith("/categories") ? "bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 scale-110" : "group-hover:scale-110")}>
                <Tag className="w-5 h-5" aria-hidden="true" />
              </div>
              <span className={cn("text-[10px] mt-0.5 font-medium transition-colors", pathname.startsWith("/categories") ? "text-brand-600 dark:text-brand-400 font-bold" : "")}>Kategori</span>
            </Link>
          )}

          {/* Tab 5: Menu */}
          <button type="button" onClick={() => setIsDrawerOpen(true)} className="flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 focus-visible:outline-none focus-visible:text-brand-600 group" aria-label="Buka Menu Lainnya" aria-expanded={isDrawerOpen}>
            <div className={cn("p-1 rounded-full transition-all duration-200", isDrawerOpen ? "bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 scale-110" : "group-hover:scale-110")}>
              <Menu className="w-5 h-5" aria-hidden="true" />
            </div>
            <span className={cn("text-[10px] mt-0.5 font-medium transition-colors", isDrawerOpen ? "text-brand-600 dark:text-brand-400 font-bold" : "")}>Menu</span>
          </button>
        </div>
      </nav>

      {/* Backdrop */}
      {isDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity" aria-hidden="true" onClick={() => setIsDrawerOpen(false)} />
      )}

      {/* Bottom Sheet Drawer */}
      <div className={cn("md:hidden fixed inset-x-0 bottom-0 z-[70] bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out flex flex-col max-h-[85vh]", isDrawerOpen ? "translate-y-0" : "translate-y-full")} aria-modal="true" role="dialog" aria-label="Menu Ekstra">
        
        {/* Drawer Handle */}
        <div className="flex justify-center pt-3 pb-2 w-full touch-none" onClick={() => setIsDrawerOpen(false)}>
          <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full" />
        </div>

        <div className="px-4 pb-6 overflow-y-auto overscroll-contain flex flex-col gap-6">
          
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-slab text-slate-900 dark:text-white">Menu Eksplorasi</h2>
            <button type="button" onClick={() => setIsDrawerOpen(false)} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500" aria-label="Tutup Menu">
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          {/* Highlight Card Prominen */}
          <a href="https://kajian-sunnah-serang.vercel.app" target="_blank" rel="noopener noreferrer" className="block relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-4 shadow-lg shadow-emerald-900/20 active:scale-[0.98] transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500" aria-label="Kunjungi Portal Syiar Salaf Serang">
            <div className="relative z-10 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-md">
                  <span>🕌 Syiar Salaf Kota Serang</span>
                </span>
                <ExternalLink className="w-4 h-4 text-white/80" aria-hidden="true" />
              </div>
              <p className="text-emerald-50 text-sm font-medium leading-snug">Jadwal Kajian Sunnah, Sholat Kemenag RI & Info Masjid sekitar Serang</p>
            </div>
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
            <div className="absolute bottom-0 left-0 -ml-4 -mb-4 w-20 h-20 rounded-full bg-black/10 blur-xl" aria-hidden="true" />
          </a>

          {/* Kelompok Belanja & Informasi */}
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">Belanja & Informasi</h3>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-1 flex flex-col gap-1">
              <button
                type="button"
                onClick={() => {
                  setIsDrawerOpen(false);
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent("maschan:open-search"));
                  }
                }}
                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700 transition-colors text-slate-700 dark:text-slate-200 font-medium text-left w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                <div className="flex items-center justify-between flex-1">
                  <span>Pencarian Cepat Instan</span>
                  <span className="text-[10px] bg-blue-100 dark:bg-blue-900/60 text-[#093c96] dark:text-blue-300 font-mono px-1.5 py-0.5 rounded font-bold">
                    Ctrl+K
                  </span>
                </div>
              </button>
              <Link href="/products" className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700 transition-colors text-slate-700 dark:text-slate-200 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                <Package className="w-5 h-5 text-amber-500" aria-hidden="true" />
                <span>Katalog Produk UMKM</span>
              </Link>
              <Link href="/vendors" className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700 transition-colors text-slate-700 dark:text-slate-200 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                <Store className="w-5 h-5 text-indigo-500" aria-hidden="true" />
                <span>Direktori Toko UMKM</span>
              </Link>
              <Link href="/panduan" className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700 transition-colors text-slate-700 dark:text-slate-200 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                <BookOpen className="w-5 h-5 text-blue-500" aria-hidden="true" />
                <span>Panduan Belanja & Mitra</span>
              </Link>
              <Link href="/tentang-kami" className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700 transition-colors text-slate-700 dark:text-slate-200 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                <Info className="w-5 h-5 text-slate-500" aria-hidden="true" />
                <span>Tentang Mas Chan Digital</span>
              </Link>
            </div>
          </div>

          {/* Kelompok Akun Mitra Toko */}
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">Akun Mitra Toko</h3>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-1 flex flex-col gap-1">
              {isVendor && session?.user ? (
                <>
                  <Link href="/dashboard" className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700 transition-colors text-slate-700 dark:text-slate-200 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                    <LayoutDashboard className="w-5 h-5 text-brand-600" aria-hidden="true" />
                    <span>Dasbor Toko Saya</span>
                  </Link>
                  <button type="button" onClick={handleLogout} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 active:bg-rose-100 dark:active:bg-rose-900/40 transition-colors text-rose-600 dark:text-rose-400 font-medium w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500">
                    <LogOut className="w-5 h-5" aria-hidden="true" />
                    <span>Keluar Akun</span>
                  </button>
                </>
              ) : (
                <>
                  <Link href="/vendor/register" className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700 transition-colors text-slate-700 dark:text-slate-200 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
                    <UserPlus className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                    <span>Daftar Jadi Mitra Toko</span>
                  </Link>
                  <Link href="/vendor/login" className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700 transition-colors text-slate-700 dark:text-slate-200 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                    <LogIn className="w-5 h-5 text-brand-500" aria-hidden="true" />
                    <span>Masuk Akun Toko</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Bantuan & Legalitas */}
          <div className="flex flex-col gap-2 pb-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">Bantuan & Legalitas</h3>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-1 flex flex-col gap-1">
              <a href="https://wa.me/6282298148474" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700 transition-colors text-slate-700 dark:text-slate-200 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500">
                <Phone className="w-5 h-5 text-green-500" aria-hidden="true" />
                <div className="flex flex-col">
                  <span>CS WhatsApp Resmi</span>
                  <span className="text-xs text-slate-500">0822-9814-8474</span>
                </div>
              </a>
              <Link href="/syarat-ketentuan" className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700 transition-colors text-slate-700 dark:text-slate-200 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                <FileText className="w-5 h-5 text-slate-400" aria-hidden="true" />
                <span>Syarat & Ketentuan</span>
              </Link>
              <Link href="/kebijakan-privasi" className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700 transition-colors text-slate-700 dark:text-slate-200 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                <ShieldCheck className="w-5 h-5 text-slate-400" aria-hidden="true" />
                <span>Kebijakan Privasi</span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
