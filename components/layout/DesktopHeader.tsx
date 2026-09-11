'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Store, 
  Search, 
  ShoppingBag, 
  Wrench,
  Tag, 
  BookOpen, 
  Info, 
  ExternalLink, 
  UserPlus, 
  LogIn, 
  LogOut, 
  ShieldCheck, 
  Phone,
  Home,
  Newspaper,
  ChevronDown,
  LayoutDashboard,
  PlusCircle,
  Package,
  CreditCard,
  Settings,
  Sparkles,
  MapPin
} from 'lucide-react';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { cn } from '@/lib/utils';
import { getVendorSession, logoutVendor, AuthSession } from '@/lib/api/auth';
import { trackVendorRegisterClick } from '@/lib/analytics';
import { useState, useEffect, useRef } from 'react';

type DropdownType = 'catalog' | 'help' | 'account' | null;

export function DesktopHeader() {
  const pathname = usePathname();
  const [session, setSession] = useState<AuthSession | null>(null);

  const [activeDropdown, setActiveDropdown] = useState<DropdownType>(null);
  const [pinnedDropdown, setPinnedDropdown] = useState<DropdownType>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);

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

  // Bersihkan timer saat unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  // Tutup dropdown saat rute berpindah (render-phase adjustment anti-cascading)
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setActiveDropdown(null);
    setPinnedDropdown(null);
  }

  // Tutup saat menekan tombol Escape atau mengklik di luar area header
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveDropdown(null);
        setPinnedDropdown(null);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
        setPinnedDropdown(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMouseEnter = (name: DropdownType) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setActiveDropdown(name);
  };

  const handleMouseLeave = (name: DropdownType) => {
    if (pinnedDropdown === name) return; // Tetap terbuka jika dikunci via klik
    closeTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
      setPinnedDropdown(null);
    }, 150);
  };

  const handleClick = (name: DropdownType) => {
    if (activeDropdown === name && pinnedDropdown === name) {
      setActiveDropdown(null);
      setPinnedDropdown(null);
    } else {
      setActiveDropdown(name);
      setPinnedDropdown(name);
    }
  };

  const isVendor = Boolean(session && session.user);
  const isAdmin = Boolean(
    session?.user &&
      (session.user.role === "admin" || session.user.role === "administrator"),
  );

  const isCatalogActive =
    pathname.startsWith('/products') ||
    pathname.startsWith('/categories') ||
    pathname.startsWith('/vendors');

  const isHelpActive =
    pathname.startsWith('/panduan') ||
    pathname.startsWith('/tentang-kami');

  const isBlogActive = pathname.startsWith('/blog');
  const isHomeActive = pathname === '/';

  return (
    <header ref={headerRef} className="hidden md:block sticky top-0 z-50 w-full shadow-sm transition-colors">
      {/* 1. TOP ANNOUNCEMENT BAR (IDENTITAS RESMI MAS CHAN DIGITAL) */}
      <div className="bg-[#093c96] text-white text-xs font-semibold py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-1.5 mx-auto sm:mx-0">
            <span>📍</span>
            <span>Marketplace Lokal Kota Serang • Transaksi Cepat Langsung ke WhatsApp Vendor</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-blue-100 text-[11px]">
            <a 
              href="https://wa.me/6282298148474" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white rounded-sm"
            >
              <Phone className="h-3 w-3" aria-hidden="true" />
              <span>Bantuan CS: 0822-9814-8474</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. LAPISAN UTAMA (LOGO, SEARCH, CTA BANTEN MENGAJI, & AUTH ACTIONS) */}
      <div className="bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
          {/* Logo Mas Chan Digital */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-2xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#093c96] text-white shadow-md shadow-blue-900/20 group-hover:scale-105 transition-transform">
              <Store className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold tracking-tight text-[#093c96] dark:text-blue-400">
                Mas Chan Digital
              </span>
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 -mt-1">
                Marketplace Lokal Serang
              </span>
            </div>
          </Link>

          {/* Search Trigger Ringkas (Ctrl+K) */}
          <div className="flex-1 max-w-xs lg:max-w-md">
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("maschan:open-search"));
                }
              }}
              className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2 text-xs text-slate-500 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-white transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Cari produk atau toko"
            >
              <div className="flex items-center gap-2">
                <Search className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                <span>Cari produk, toko UMKM Serang...</span>
              </div>
              <kbd className="hidden lg:inline-flex h-4 items-center rounded border border-slate-200 bg-white px-1.5 text-[10px] font-medium text-slate-400 dark:border-slate-700 dark:bg-slate-900">
                Ctrl+K
              </kbd>
            </button>
          </div>

          {/* Right Actions: Jembatan Banten Mengaji, ThemeToggle, & Tombol Masuk/Daftar */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Jembatan Banten Mengaji Serang */}
            <a
              href="https://kajian-sunnah-serang.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:scale-105 hover:shadow-emerald-600/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              title="Kunjungi Portal Banten Mengaji"
              aria-label="Kunjungi Portal Banten Mengaji"
            >
              <span>🕌 Banten Mengaji</span>
              <ExternalLink className="h-3 w-3 opacity-90" aria-hidden="true" />
            </a>

            {/* Dark Mode Toggle */}
            <ThemeToggle />

            {/* Bagian Akun / Dasbor (Dinamis Sesuai Status Login) */}
            {isVendor && session?.user ? (
              <div 
                className="relative pl-1 border-l border-slate-200 dark:border-slate-800"
                onMouseEnter={() => handleMouseEnter('account')}
                onMouseLeave={() => handleMouseLeave('account')}
              >
                {/* Trigger Dropdown Profil Vendor / Admin */}
                <button
                  type="button"
                  onClick={() => handleClick('account')}
                  aria-expanded={activeDropdown === 'account'}
                  aria-haspopup="true"
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2",
                    isAdmin
                      ? "bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 focus-visible:ring-rose-500"
                      : "bg-blue-50 text-[#093c96] hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 focus-visible:ring-blue-500",
                    activeDropdown === 'account' && "ring-2 ring-[#093c96]/30 dark:ring-blue-400/30"
                  )}
                >
                  {isAdmin ? (
                    <ShieldCheck className="h-4 w-4 text-rose-600 dark:text-rose-400" aria-hidden="true" />
                  ) : (
                    <div className="w-5 h-5 rounded-lg bg-[#093c96] text-white flex items-center justify-center font-bold text-[10px]">
                      <Store className="h-3 w-3" aria-hidden="true" />
                    </div>
                  )}
                  <span className="truncate max-w-[120px]">
                    {isAdmin
                      ? "Pusat Moderasi"
                      : session.user.store_name || session.user.name || "Dasbor Toko"}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 transition-transform duration-200",
                      activeDropdown === 'account' && "rotate-180"
                    )}
                    aria-hidden="true"
                  />
                </button>

                {/* Dropdown Panel Profil & Dasbor Toko */}
                {activeDropdown === 'account' && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full mt-1.5 w-72 rounded-2xl border border-slate-200/90 bg-white/95 p-2 shadow-2xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 transition-all duration-200 ease-out z-50 animate-in fade-in slide-in-from-top-2"
                  >
                    {/* Header Kartu Mini Toko */}
                    <div className="p-3 bg-gradient-to-br from-slate-50 to-blue-50/40 dark:from-slate-800/80 dark:to-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-700/60 mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <div className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs",
                          isAdmin ? "bg-rose-600" : "bg-[#093c96]"
                        )}>
                          {isAdmin ? <ShieldCheck className="h-5 w-5" /> : <Store className="h-5 w-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
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
                      </div>
                    </div>

                    {/* Menu Items Dasbor */}
                    <div className="space-y-0.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                      {isAdmin ? (
                        <>
                          <Link
                            href="/admin/moderasi"
                            role="menuitem"
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700 dark:hover:text-rose-300 transition-colors"
                          >
                            <ShieldCheck className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
                            <span>🛡️ Pusat Kendali Moderasi</span>
                          </Link>
                          <Link
                            href="/vendors"
                            role="menuitem"
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Store className="h-4 w-4 text-slate-500 shrink-0" />
                            <span>🏪 Direktori Seluruh Vendor</span>
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            href="/dashboard"
                            role="menuitem"
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-[#093c96] dark:hover:text-blue-400 transition-colors"
                          >
                            <LayoutDashboard className="h-4 w-4 text-blue-600 shrink-0" />
                            <span>📊 Ringkasan Dasbor</span>
                          </Link>
                          <Link
                            href="/dashboard/products/new"
                            role="menuitem"
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
                          >
                            <PlusCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                            <span>➕ Tambah Produk / Jasa</span>
                          </Link>
                          <Link
                            href="/dashboard/products"
                            role="menuitem"
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Package className="h-4 w-4 text-amber-500 shrink-0" />
                            <span>📦 Katalog Produk Saya</span>
                          </Link>
                          <Link
                            href="/dashboard/billing"
                            role="menuitem"
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <CreditCard className="h-4 w-4 text-indigo-500 shrink-0" />
                            <span>💳 Paket & Tagihan</span>
                          </Link>
                          <Link
                            href="/dashboard/profile"
                            role="menuitem"
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Settings className="h-4 w-4 text-slate-500 shrink-0" />
                            <span>⚙️ Pengaturan Profil Toko</span>
                          </Link>
                        </>
                      )}

                      <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => logoutVendor("/")}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 transition-colors text-left"
                      >
                        <LogOut className="h-4 w-4 shrink-0" />
                        <span>🚪 Keluar (Logout)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-1 border-l border-slate-200 dark:border-slate-800">
                <Link
                  href="/vendor/login"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Masuk Vendor</span>
                </Link>
                <Link
                  href="/vendor/register"
                  onClick={() => trackVendorRegisterClick('header')}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#093c96] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 transition-colors shadow-md shadow-blue-900/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  <UserPlus className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Daftar Toko</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. LAPISAN NAVIGASI MENU (SUB-NAVBAR DENGAN DROPDOWN MODERN 2026) */}
      <div className="bg-slate-50/95 dark:bg-slate-900/95 border-b border-slate-200/80 dark:border-slate-800/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-1.5">
          <nav aria-label="Navigasi Menu Belanja" className="flex items-center gap-1.5">
            {/* 1. Menu Beranda */}
            <Link
              href="/"
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                isHomeActive
                  ? "bg-[#093c96] text-white font-semibold shadow-xs"
                  : "text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              )}
            >
              <Home className={cn("h-3.5 w-3.5", isHomeActive ? "text-white" : "text-slate-400")} aria-hidden="true" />
              <span>Beranda</span>
            </Link>

            {/* 2. Dropdown Katalog & Penawaran */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('catalog')}
              onMouseLeave={() => handleMouseLeave('catalog')}
            >
              <button
                type="button"
                onClick={() => handleClick('catalog')}
                aria-expanded={activeDropdown === 'catalog'}
                aria-haspopup="true"
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                  isCatalogActive
                    ? "bg-[#093c96] text-white font-semibold shadow-xs"
                    : activeDropdown === 'catalog'
                      ? "bg-slate-200/80 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                      : "text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                )}
              >
                <ShoppingBag className={cn("h-3.5 w-3.5", isCatalogActive ? "text-white" : "text-amber-500")} aria-hidden="true" />
                <span>Katalog & Penawaran</span>
                <ChevronDown
                  className={cn(
                    "h-3 w-3 transition-transform duration-200 opacity-75",
                    activeDropdown === 'catalog' && "rotate-180"
                  )}
                  aria-hidden="true"
                />
              </button>

              {/* Panel Dropdown Katalog */}
              {activeDropdown === 'catalog' && (
                <div
                  role="menu"
                  className="absolute left-0 top-full mt-1.5 w-80 rounded-2xl border border-slate-200/90 bg-white/95 p-2 shadow-2xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 transition-all duration-200 ease-out z-50 animate-in fade-in slide-in-from-top-2"
                >
                  <div className="space-y-1">
                    {/* Produk Fisik & Kuliner */}
                    <Link
                      href="/products?type=product"
                      role="menuitem"
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-emerald-50/70 dark:hover:bg-emerald-950/30 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <ShoppingBag className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                          🛍️ Produk Fisik & Kuliner
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                          Oleh-oleh, madu, kuliner, dan produk UMKM
                        </p>
                      </div>
                    </Link>

                    {/* Layanan Jasa Lokal */}
                    <Link
                      href="/products?type=service"
                      role="menuitem"
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-blue-50/70 dark:hover:bg-blue-950/30 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-[#093c96] dark:text-blue-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Wrench className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#093c96] dark:group-hover:text-blue-300 transition-colors">
                          🛠️ Layanan Jasa Lokal
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                          Servis AC, kanopi, legalitas, dan jasa teknik
                        </p>
                      </div>
                    </Link>

                    <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                    {/* Kategori Usaha */}
                    <Link
                      href="/categories"
                      role="menuitem"
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-purple-50/70 dark:hover:bg-purple-950/30 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Tag className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                          🏷️ Kategori Usaha
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                          Jelajahi berdasarkan kelompok bisnis
                        </p>
                      </div>
                    </Link>

                    {/* Direktori Toko & Vendor */}
                    <Link
                      href="/vendors"
                      role="menuitem"
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-indigo-50/70 dark:hover:bg-indigo-950/30 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Store className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
                          🏪 Direktori Toko & Vendor
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                          Temukan UMKM terpercaya di Kota Serang
                        </p>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Menu Blog & Edukasi */}
            <Link
              href="/blog"
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                isBlogActive
                  ? "bg-[#093c96] text-white font-semibold shadow-xs"
                  : "text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              )}
            >
              <Newspaper className={cn("h-3.5 w-3.5", isBlogActive ? "text-white" : "text-sky-500")} aria-hidden="true" />
              <span>Blog & Edukasi</span>
            </Link>

            {/* 4. Dropdown Pusat Bantuan */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('help')}
              onMouseLeave={() => handleMouseLeave('help')}
            >
              <button
                type="button"
                onClick={() => handleClick('help')}
                aria-expanded={activeDropdown === 'help'}
                aria-haspopup="true"
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                  isHelpActive
                    ? "bg-[#093c96] text-white font-semibold shadow-xs"
                    : activeDropdown === 'help'
                      ? "bg-slate-200/80 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                      : "text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                )}
              >
                <BookOpen className={cn("h-3.5 w-3.5", isHelpActive ? "text-white" : "text-teal-500")} aria-hidden="true" />
                <span>Pusat Bantuan</span>
                <ChevronDown
                  className={cn(
                    "h-3 w-3 transition-transform duration-200 opacity-75",
                    activeDropdown === 'help' && "rotate-180"
                  )}
                  aria-hidden="true"
                />
              </button>

              {/* Panel Dropdown Pusat Bantuan */}
              {activeDropdown === 'help' && (
                <div
                  role="menu"
                  className="absolute left-0 top-full mt-1.5 w-72 rounded-2xl border border-slate-200/90 bg-white/95 p-2 shadow-2xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 transition-all duration-200 ease-out z-50 animate-in fade-in slide-in-from-top-2"
                >
                  <div className="space-y-1">
                    {/* Panduan Toko & Pembeli */}
                    <Link
                      href="/panduan"
                      role="menuitem"
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-teal-50/70 dark:hover:bg-teal-950/30 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
                          📖 Panduan Toko & Pembeli
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                          Cara belanja, daftar toko, dan transaksi aman
                        </p>
                      </div>
                    </Link>

                    {/* Tentang Mas Chan Digital */}
                    <Link
                      href="/tentang-kami"
                      role="menuitem"
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Info className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                          ℹ️ Tentang Mas Chan Digital
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                          Misi, visi, dan legalitas platform
                        </p>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Tagline Ringkas Kanan */}
          <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Transaksi 100% Bebas Biaya Admin • Langsung WhatsApp</span>
          </div>
        </div>
      </div>
    </header>
  );
}
