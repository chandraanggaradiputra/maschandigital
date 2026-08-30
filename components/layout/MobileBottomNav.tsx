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
  BookOpen,
  LogOut,
  Plus,
  Menu,
  X,
  ExternalLink,
  UserPlus,
  Info,
  Phone,
  Search,
  ChevronRight,
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
            {isVendor ? (
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

          {/* Tab 4: Kategori (or Pesanan for vendor) */}
          {isVendor ? (
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
              {/* HIGHLIGHT BANNER: SYIAR SALAF SERANG (SHRINK-0, PROPORSIONAL, BEBAS TERPOTONG) */}
              <div className="shrink-0">
                <a
                  href="https://kajian-sunnah-serang.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center justify-between rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-4 text-white shadow-md shadow-emerald-900/20 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur text-xl">
                      <span>🕌</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-extrabold tracking-tight">
                          Syiar Salaf Kota Serang
                        </span>
                        <span className="rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-semibold">
                          Portal Dakwah
                        </span>
                      </div>
                      <p className="text-xs text-emerald-100 mt-0.5 leading-snug">
                        Jadwal Kajian Sunnah, Sholat Kemenag RI & Masjid
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 shrink-0 opacity-80 group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>

              {/* GRUP 1: BELANJA & INFORMASI */}
              <div className="shrink-0 space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Belanja & Informasi
                </p>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDrawerOpen(false);
                      if (typeof window !== "undefined") {
                        window.dispatchEvent(new CustomEvent("maschan:open-search"));
                      }
                    }}
                    className="flex w-full items-center justify-between rounded-xl p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                      <Search className="h-5 w-5 text-[#093c96] dark:text-blue-400" />
                      <span>Pencarian Cepat Instan</span>
                    </div>
                    <kbd className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 dark:border-slate-700 dark:bg-slate-800">
                      Ctrl+K
                    </kbd>
                  </button>

                  <Link
                    href="/products"
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex items-center justify-between rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                      <ShoppingBag className="h-5 w-5 text-amber-500" />
                      <span>Katalog Produk UMKM</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </Link>

                  <Link
                    href="/vendors"
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex items-center justify-between rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                      <Store className="h-5 w-5 text-indigo-500" />
                      <span>Direktori Toko UMKM</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </Link>

                  <Link
                    href="/panduan"
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex items-center justify-between rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                      <BookOpen className="h-5 w-5 text-blue-500" />
                      <span>Panduan Belanja & Mitra</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </Link>

                  <Link
                    href="/tentang-kami"
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex items-center justify-between rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                      <Info className="h-5 w-5 text-slate-500" />
                      <span>Tentang Mas Chan Digital</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </Link>
                </div>
              </div>

              {/* GRUP 2: AKUN MITRA TOKO */}
              <div className="shrink-0 space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Akun Mitra Toko
                </p>
                <div className="space-y-1">
                  {isVendor && session?.user ? (
                    <>
                      <Link
                        href="/dashboard"
                        onClick={() => setIsDrawerOpen(false)}
                        className="flex items-center justify-between rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                      >
                        <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                          <LayoutDashboard className="h-5 w-5 text-[#093c96] dark:text-blue-400" />
                          <span>
                            {session.user.store_name || session.user.name || "Dasbor Toko Saya"}
                          </span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </Link>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center justify-between rounded-xl p-3 text-left hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-medium transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <LogOut className="h-5 w-5" />
                          <span>Keluar Akun</span>
                        </div>
                        <ChevronRight className="h-4 w-4 opacity-50" />
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/vendor/register"
                        onClick={() => setIsDrawerOpen(false)}
                        className="flex items-center justify-between rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                      >
                        <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                          <UserPlus className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                          <span>Daftar Jadi Mitra Toko</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </Link>

                      <Link
                        href="/vendor/login"
                        onClick={() => setIsDrawerOpen(false)}
                        className="flex items-center justify-between rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                      >
                        <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                          <LogIn className="h-5 w-5 text-[#093c96] dark:text-blue-400" />
                          <span>Masuk Akun Toko</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </Link>
                    </>
                  )}
                </div>
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
