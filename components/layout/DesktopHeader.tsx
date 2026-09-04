'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Store, 
  Search, 
  ShoppingBag, 
  Tag, 
  BookOpen, 
  Info, 
  ExternalLink, 
  UserPlus, 
  LogIn, 
  LogOut, 
  ShieldCheck, 
  PlusCircle, 
  Phone,
  Home
} from 'lucide-react';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { getVendorSession, logoutVendor, AuthSession } from '@/lib/api/auth';
import { trackVendorRegisterClick } from '@/lib/analytics';
import { useState, useEffect } from 'react';

const MAIN_NAV_ITEMS = [
  { label: 'Beranda', href: '/', icon: Home },
  { label: 'Produk', href: '/products', icon: ShoppingBag },
  { label: 'Kategori', href: '/categories', icon: Tag },
  { label: 'Vendor', href: '/vendors', icon: Store },
  { label: 'Panduan', href: '/panduan', icon: BookOpen },
  { label: 'Tentang Kami', href: '/tentang-kami', icon: Info },
];

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

  const isVendor = Boolean(session && session.user);

  return (
    <header className="hidden md:block sticky top-0 z-50 w-full shadow-sm transition-colors">
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

            {/* Tombol Vendor / Profil */}
            {isVendor && session?.user ? (
              <div className="flex items-center gap-2 pl-1 border-l border-slate-200 dark:border-slate-800">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-3.5 py-2 text-xs font-semibold text-[#093c96] hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <Store className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="truncate max-w-[100px]">{session.user.store_name || session.user.name || 'Dasbor Toko'}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logoutVendor("/");
                  }}
                  className="rounded-xl p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  title="Keluar"
                  aria-label="Keluar dari akun"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                </button>
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

      {/* 3. LAPISAN NAVIGASI MENU (SUB-NAVBAR BAWAH) */}
      <div className="bg-slate-50/90 dark:bg-slate-900/90 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-1.5">
          <nav aria-label="Navigasi Menu Belanja" className="flex items-center gap-1">
            {MAIN_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                    isActive
                      ? "bg-[#093c96] text-white font-semibold shadow-sm"
                      : "text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                  )}
                >
                  <Icon className={cn("h-3.5 w-3.5", isActive ? "text-white" : "text-slate-400")} aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Tagline Ringkas Kanan */}
          <div className="hidden lg:flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            <span>✨ Transaksi 100% Bebas Biaya Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
