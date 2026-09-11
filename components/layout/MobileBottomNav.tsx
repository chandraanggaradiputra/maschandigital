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
  ShoppingBag,
  Wrench,
  BookOpen,
  LogOut,
  Plus,
  PlusCircle,
  Menu,
  X,
  ExternalLink,
  UserPlus,
  Info,
  Phone,
  Search,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Newspaper,
  CreditCard,
  Settings,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getVendorSession, logoutVendor, AuthSession } from "@/lib/api/auth";

export function MobileBottomNav() {
  const pathname = usePathname();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>("catalog");

  const toggleAccordion = (name: string) => {
    setOpenAccordion((prev) => (prev === name ? null : name));
  };

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
  const isAdmin = Boolean(
    session?.user &&
      (session.user.role === "admin" || session.user.role === "administrator"),
  );

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsDrawerOpen(false);
  }

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

  const isProductDetail = pathname.startsWith("/products/") && pathname !== "/products";

  if (isProductDetail) return null;

  return (
    <>
      {/* 5-TAB BOTTOM NAVIGATION BAR */}
      <nav
        aria-label="Navigasi Bawah Mobile"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe"
      >
        <div className="flex items-center justify-around px-2 h-16">
          {/* Tab 1: Beranda */}
          <Link
            href="/"
            className="flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 focus-visible:outline-none focus-visible:text-brand-600 group"
            aria-current={pathname === "/" ? "page" : undefined}
          >
            <div
              className={cn(
                "p-1 rounded-full transition-all duration-200",
                pathname === "/"
                  ? "bg-blue-50 text-[#093c96] dark:bg-blue-950/60 dark:text-blue-400 scale-110"
                  : "group-hover:scale-110"
              )}
            >
              <Home className="w-5 h-5" aria-hidden="true" />
            </div>
            <span
              className={cn(
                "text-[10px] mt-0.5 font-medium transition-colors",
                pathname === "/"
                  ? "text-[#093c96] dark:text-blue-400 font-bold"
                  : ""
              )}
            >
              Beranda
            </span>
          </Link>

          {/* Tab 2: Produk */}
          <Link
            href="/products"
            className="flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 focus-visible:outline-none focus-visible:text-brand-600 group"
            aria-current={pathname.startsWith("/products") ? "page" : undefined}
          >
            <div
              className={cn(
                "p-1 rounded-full transition-all duration-200",
                pathname.startsWith("/products")
                  ? "bg-blue-50 text-[#093c96] dark:bg-blue-950/60 dark:text-blue-400 scale-110"
                  : "group-hover:scale-110"
              )}
            >
              <ShoppingBag className="w-5 h-5" aria-hidden="true" />
            </div>
            <span
              className={cn(
                "text-[10px] mt-0.5 font-medium transition-colors",
                pathname.startsWith("/products")
                  ? "text-[#093c96] dark:text-blue-400 font-bold"
                  : ""
              )}
            >
              Produk
            </span>
          </Link>

          {/* Tab 3: Center (Role Adaptive) */}
          <div className="flex flex-col items-center justify-center w-full h-full relative -top-3">
            {isAdmin ? (
              <Link
                href="/admin/moderasi"
                className="flex flex-col items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded-full group"
                aria-label="Pusat Kendali Admin"
              >
                <div className="w-12 h-12 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-900/30 group-hover:bg-rose-700 transition-all group-hover:scale-105 active:scale-95">
                  <ShieldCheck className="w-6 h-6" aria-hidden="true" />
                </div>
                <span className="text-[10px] mt-1 font-bold text-rose-600 dark:text-rose-400">
                  Kendali
                </span>
              </Link>
            ) : isVendor ? (
              <Link
                href="/dashboard/products/new"
                className="flex flex-col items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-full group"
                aria-label="Tambah Produk Baru"
              >
                <div className="w-12 h-12 rounded-full bg-[#093c96] text-white flex items-center justify-center shadow-lg shadow-blue-900/30 group-hover:bg-blue-800 transition-all group-hover:scale-105 active:scale-95">
                  <Plus className="w-6 h-6" aria-hidden="true" />
                </div>
                <span className="text-[10px] mt-1 font-bold text-[#093c96] dark:text-blue-400">
                  Jual
                </span>
              </Link>
            ) : (
              <Link
                href="/vendors"
                className="flex flex-col items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-full group"
                aria-label="Direktori Toko"
              >
                <div className="w-12 h-12 rounded-full bg-[#093c96] text-white flex items-center justify-center shadow-lg shadow-blue-900/30 group-hover:bg-blue-800 transition-all group-hover:scale-105 active:scale-95">
                  <Store className="w-6 h-6" aria-hidden="true" />
                </div>
                <span className="text-[10px] mt-1 font-bold text-[#093c96] dark:text-blue-400">
                  Toko
                </span>
              </Link>
            )}
          </div>

          {/* Tab 4: Kategori (or Katalog for vendor) */}
          {isVendor && !isAdmin ? (
            <Link
              href="/dashboard/products"
              className="flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 focus-visible:outline-none focus-visible:text-brand-600 group"
              aria-current={pathname === "/dashboard/products" ? "page" : undefined}
            >
              <div
                className={cn(
                  "p-1 rounded-full transition-all duration-200",
                  pathname === "/dashboard/products"
                    ? "bg-blue-50 text-[#093c96] dark:bg-blue-950/60 dark:text-blue-400 scale-110"
                    : "group-hover:scale-110"
                )}
              >
                <Package className="w-5 h-5" aria-hidden="true" />
              </div>
              <span
                className={cn(
                  "text-[10px] mt-0.5 font-medium transition-colors",
                  pathname === "/dashboard/products"
                    ? "text-[#093c96] dark:text-blue-400 font-bold"
                    : ""
                )}
              >
                Katalog
              </span>
            </Link>
          ) : (
            <Link
              href="/categories"
              className="flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 focus-visible:outline-none focus-visible:text-brand-600 group"
              aria-current={pathname.startsWith("/categories") ? "page" : undefined}
            >
              <div
                className={cn(
                  "p-1 rounded-full transition-all duration-200",
                  pathname.startsWith("/categories")
                    ? "bg-blue-50 text-[#093c96] dark:bg-blue-950/60 dark:text-blue-400 scale-110"
                    : "group-hover:scale-110"
                )}
              >
                <Tag className="w-5 h-5" aria-hidden="true" />
              </div>
              <span
                className={cn(
                  "text-[10px] mt-0.5 font-medium transition-colors",
                  pathname.startsWith("/categories")
                    ? "text-[#093c96] dark:text-blue-400 font-bold"
                    : ""
                )}
              >
                Kategori
              </span>
            </Link>
          )}

          {/* Tab 5: Menu */}
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 focus-visible:outline-none focus-visible:text-brand-600 group"
            aria-label="Buka Menu Lainnya"
            aria-expanded={isDrawerOpen}
          >
            <div
              className={cn(
                "p-1 rounded-full transition-all duration-200",
                isDrawerOpen
                  ? "bg-blue-50 text-[#093c96] dark:bg-blue-950/60 dark:text-blue-400 scale-110"
                  : "group-hover:scale-110"
              )}
            >
              <Menu className="w-5 h-5" aria-hidden="true" />
            </div>
            <span
              className={cn(
                "text-[10px] mt-0.5 font-medium transition-colors",
                isDrawerOpen
                  ? "text-[#093c96] dark:text-blue-400 font-bold"
                  : ""
              )}
            >
              Menu
            </span>
          </button>
        </div>
      </nav>

      {/* BOTTOM SHEET DRAWER */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-slate-900/60 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsDrawerOpen(false);
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Menu Eksplorasi"
        >
          <div className="w-full max-h-[88vh] flex flex-col rounded-t-3xl border-t border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 transition-all animate-in slide-in-from-bottom duration-300">
            {/* 1. HEADER DRAWER (TETAP DI ATAS / TIDAK IKUT TER-SCROLL) */}
            <div className="shrink-0 flex items-center justify-between px-6 pt-5 pb-3.5 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-slab">
                  Menu Eksplorasi
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Mas Chan Digital • Kota Serang
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label="Tutup Menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 2. AREA KONTEN YANG BISA DI-SCROLL DENGAN MULUS */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5 overscroll-contain">
              {/* BANNER RINGKAS & MINIMALIS: BANTEN MENGAJI */}
              <div className="shrink-0 my-1">
                <a
                  href="https://kajian-sunnah-serang.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-white shadow-md shadow-emerald-900/20 active:scale-[0.98] hover:opacity-95 transition-all"
                  title="Buka Portal Banten Mengaji"
                  aria-label="Buka Portal Banten Mengaji"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">🕌</span>
                    <span className="text-sm font-bold tracking-tight">
                      Banten Mengaji
                    </span>
                  </div>
                  <ExternalLink className="h-4 w-4 opacity-80" />
                </a>
              </div>

              {/* PENCARIAN INSTAN */}
              <div className="shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsDrawerOpen(false);
                    if (typeof window !== "undefined") {
                      window.dispatchEvent(new CustomEvent("maschan:open-search"));
                    }
                  }}
                  className="flex w-full items-center justify-between rounded-xl p-3 text-left bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium text-xs sm:text-sm">
                    <Search className="h-4 w-4 text-[#093c96] dark:text-blue-400" />
                    <span>Pencarian Cepat Instan</span>
                  </div>
                  <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-mono text-slate-400 dark:border-slate-700 dark:bg-slate-900">
                    Ctrl+K
                  </kbd>
                </button>
              </div>

              {/* ACCORDION 1: KATALOG & PENAWARAN */}
              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 overflow-hidden transition-all">
                <button
                  type="button"
                  onClick={() => toggleAccordion("catalog")}
                  className="flex w-full items-center justify-between p-3.5 text-left font-bold text-xs sm:text-sm text-slate-900 dark:text-white"
                  aria-expanded={openAccordion === "catalog"}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <ShoppingBag className="h-4 w-4" />
                    </div>
                    <span>Katalog & Penawaran</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                      4 Menu
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-slate-400 transition-transform duration-200",
                        openAccordion === "catalog" && "rotate-180"
                      )}
                    />
                  </div>
                </button>

                {openAccordion === "catalog" && (
                  <div className="px-2.5 pb-2.5 space-y-1 border-t border-slate-200/60 dark:border-slate-800/80 pt-1.5 animate-in fade-in duration-150">
                    <Link
                      href="/products?type=product"
                      onClick={() => setIsDrawerOpen(false)}
                      className="flex items-start gap-3 p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                        <ShoppingBag className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          🛍️ Produk Fisik & Kuliner
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Oleh-oleh, madu, kuliner, dan produk UMKM
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="/products?type=service"
                      onClick={() => setIsDrawerOpen(false)}
                      className="flex items-start gap-3 p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-[#093c96] dark:text-blue-300 flex items-center justify-center shrink-0 mt-0.5">
                        <Wrench className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          🛠️ Layanan Jasa Lokal
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Servis AC, kanopi, legalitas, dan jasa teknik
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="/categories"
                      onClick={() => setIsDrawerOpen(false)}
                      className="flex items-start gap-3 p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0 mt-0.5">
                        <Tag className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          🏷️ Kategori Usaha
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Jelajahi berdasarkan kelompok bisnis
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="/vendors"
                      onClick={() => setIsDrawerOpen(false)}
                      className="flex items-start gap-3 p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0 mt-0.5">
                        <Store className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          🏪 Direktori Toko & Vendor
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Temukan UMKM terpercaya di Kota Serang
                        </p>
                      </div>
                    </Link>
                  </div>
                )}
              </div>

              {/* TAUTAN LANGSUNG: BLOG & EDUKASI UMKM */}
              <Link
                href="/blog"
                onClick={() => setIsDrawerOpen(false)}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300 flex items-center justify-center shrink-0">
                    <Newspaper className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      📰 Blog & Edukasi UMKM
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Panduan bisnis, tips digital, & artikel lokal
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </Link>

              {/* ACCORDION 2: PUSAT BANTUAN */}
              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 overflow-hidden transition-all">
                <button
                  type="button"
                  onClick={() => toggleAccordion("help")}
                  className="flex w-full items-center justify-between p-3.5 text-left font-bold text-xs sm:text-sm text-slate-900 dark:text-white"
                  aria-expanded={openAccordion === "help"}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <span>Pusat Bantuan & Edukasi</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-slate-400 transition-transform duration-200",
                      openAccordion === "help" && "rotate-180"
                    )}
                  />
                </button>

                {openAccordion === "help" && (
                  <div className="px-2.5 pb-2.5 space-y-1 border-t border-slate-200/60 dark:border-slate-800/80 pt-1.5 animate-in fade-in duration-150">
                    <Link
                      href="/panduan"
                      onClick={() => setIsDrawerOpen(false)}
                      className="flex items-start gap-3 p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0 mt-0.5">
                        <BookOpen className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          📖 Panduan Toko & Pembeli
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Cara belanja, daftar toko, dan transaksi aman
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="/tentang-kami"
                      onClick={() => setIsDrawerOpen(false)}
                      className="flex items-start gap-3 p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                        <Info className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          ℹ️ Tentang Mas Chan Digital
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Misi, visi, dan legalitas platform
                        </p>
                      </div>
                    </Link>
                  </div>
                )}
              </div>

              {/* ACCORDION 3: AKUN & DASBOR TOKO */}
              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 overflow-hidden transition-all">
                <button
                  type="button"
                  onClick={() => toggleAccordion("account")}
                  className="flex w-full items-center justify-between p-3.5 text-left font-bold text-xs sm:text-sm text-slate-900 dark:text-white"
                  aria-expanded={openAccordion === "account"}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center",
                      isAdmin
                        ? "bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
                        : "bg-blue-100 text-[#093c96] dark:bg-blue-950/60 dark:text-blue-400"
                    )}>
                      {isAdmin ? <ShieldCheck className="h-4 w-4" /> : <Store className="h-4 w-4" />}
                    </div>
                    <span>{isAdmin ? "Akun Super Admin" : "Akun Mitra Toko"}</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-slate-400 transition-transform duration-200",
                      openAccordion === "account" && "rotate-180"
                    )}
                  />
                </button>

                {openAccordion === "account" && (
                  <div className="px-2.5 pb-2.5 space-y-1.5 border-t border-slate-200/60 dark:border-slate-800/80 pt-2 animate-in fade-in duration-150">
                    {isVendor && session?.user ? (
                      <>
                        {/* Header Mini Profil Toko */}
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700/60 mb-1">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate font-slab">
                            {isAdmin ? "Super Admin Mas Chan" : session.user.store_name || session.user.name || "Mitra Toko"}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                            <span className="inline-flex items-center gap-0.5 text-blue-600 dark:text-blue-400 font-medium">
                              <MapPin className="h-2.5 w-2.5" />
                              {session.user.district || session.user.subdistrict || session.user.location_subdistrict || "Kota Serang"}
                            </span>
                            <span>•</span>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                              {isAdmin ? "Admin Akses" : "Paket Starter"}
                            </span>
                          </div>
                        </div>

                        {isAdmin ? (
                          <Link
                            href="/admin/moderasi"
                            onClick={() => setIsDrawerOpen(false)}
                            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors"
                          >
                            <div className="flex items-center gap-2.5 text-rose-700 dark:text-rose-300 font-medium text-xs">
                              <ShieldCheck className="h-4 w-4" />
                              <span>🛡️ Pusat Kendali Admin</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-400" />
                          </Link>
                        ) : (
                          <>
                            <Link
                              href="/dashboard"
                              onClick={() => setIsDrawerOpen(false)}
                              className="flex items-center justify-between p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors"
                            >
                              <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300 font-medium text-xs">
                                <LayoutDashboard className="h-4 w-4 text-blue-600" />
                                <span>📊 Ringkasan Dasbor</span>
                              </div>
                              <ChevronRight className="h-4 w-4 text-slate-400" />
                            </Link>

                            <Link
                              href="/dashboard/products/new"
                              onClick={() => setIsDrawerOpen(false)}
                              className="flex items-center justify-between p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors"
                            >
                              <div className="flex items-center gap-2.5 text-emerald-700 dark:text-emerald-400 font-medium text-xs">
                                <PlusCircle className="h-4 w-4" />
                                <span>➕ Tambah Produk / Jasa</span>
                              </div>
                              <ChevronRight className="h-4 w-4 text-slate-400" />
                            </Link>

                            <Link
                              href="/dashboard/products"
                              onClick={() => setIsDrawerOpen(false)}
                              className="flex items-center justify-between p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors"
                            >
                              <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300 font-medium text-xs">
                                <Package className="h-4 w-4 text-amber-500" />
                                <span>📦 Katalog Produk Saya</span>
                              </div>
                              <ChevronRight className="h-4 w-4 text-slate-400" />
                            </Link>

                            <Link
                              href="/dashboard/billing"
                              onClick={() => setIsDrawerOpen(false)}
                              className="flex items-center justify-between p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors"
                            >
                              <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300 font-medium text-xs">
                                <CreditCard className="h-4 w-4 text-indigo-500" />
                                <span>💳 Paket & Tagihan</span>
                              </div>
                              <ChevronRight className="h-4 w-4 text-slate-400" />
                            </Link>

                            <Link
                              href="/dashboard/profile"
                              onClick={() => setIsDrawerOpen(false)}
                              className="flex items-center justify-between p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors"
                            >
                              <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300 font-medium text-xs">
                                <Settings className="h-4 w-4 text-slate-500" />
                                <span>⚙️ Pengaturan Profil Toko</span>
                              </div>
                              <ChevronRight className="h-4 w-4 text-slate-400" />
                            </Link>
                          </>
                        )}

                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center justify-between p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition-colors mt-1"
                        >
                          <div className="flex items-center gap-2.5">
                            <LogOut className="h-4 w-4" />
                            <span>🚪 Keluar Akun</span>
                          </div>
                          <ChevronRight className="h-4 w-4 opacity-50" />
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/vendor/register"
                          onClick={() => setIsDrawerOpen(false)}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 transition-colors font-bold text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <UserPlus className="h-4 w-4" />
                            <span>Daftar Jadi Mitra Toko (Gratis)</span>
                          </div>
                          <ChevronRight className="h-4 w-4" />
                        </Link>

                        <Link
                          href="/vendor/login"
                          onClick={() => setIsDrawerOpen(false)}
                          className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300 font-semibold text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <LogIn className="h-4 w-4 text-[#093c96] dark:text-blue-400" />
                            <span>Masuk Akun Toko</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* GRUP 3: BANTUAN & LEGALITAS */}
              <div className="shrink-0 space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800 pb-6">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Bantuan & Legalitas
                </p>
                <div className="space-y-2.5">
                  <a
                    href="https://wa.me/6282298148474?text=Halo%20Mas%20Chan%20Digital,%20saya%20butuh%20bantuan"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-xl p-3 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-medium"
                  >
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-emerald-600" />
                      <span>CS WhatsApp: 0822-9814-8474</span>
                    </div>
                    <ExternalLink className="h-4 w-4 opacity-70" />
                  </a>

                  <div className="flex items-center justify-center gap-3 pt-1 text-xs text-slate-400">
                    <Link
                      href="/syarat-ketentuan"
                      onClick={() => setIsDrawerOpen(false)}
                      className="hover:underline"
                    >
                      Syarat & Ketentuan
                    </Link>
                    <span>•</span>
                    <Link
                      href="/kebijakan-privasi"
                      onClick={() => setIsDrawerOpen(false)}
                      className="hover:underline"
                    >
                      Kebijakan Privasi
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
