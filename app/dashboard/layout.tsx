"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Store,
  CreditCard,
  ExternalLink,
  LogOut,
  ShieldCheck,
  Lock,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { Button } from "@/components/ui/Button";
import { getVendorSession, clearVendorSession } from "@/lib/api/auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [vendorSlug, setVendorSlug] = useState("");
  const [vendorStoreName, setVendorStoreName] = useState("");
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    const session = getVendorSession();
    // Baca sesi dari localStorage saat mount untuk memutuskan proteksi akses
    // dashboard — sumber data di luar React, bukan kasus "effect tak perlu".
    if (session && session.user && session.token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAuth(true);
      setVendorSlug(session.user.slug || "chanstore");
      setVendorStoreName(
        session.user.store_name || session.user.name || "Toko Vendor",
      );
    } else {
      setIsAuth(false);
      // Pengunjung yang belum login otomatis diarahkan ke halaman login vendor
      router.replace("/vendor/login");
    }
  }, [router]);

  const handleLogout = () => {
    clearVendorSession();
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  const sidebarLinks = [
    { label: "Ringkasan Toko", href: "/dashboard", icon: LayoutDashboard },
    { label: "Katalog Produk", href: "/dashboard/products", icon: Package },
    {
      label: "Tambah Produk",
      href: "/dashboard/products/new",
      icon: PlusCircle,
    },
    {
      label: "Pengaturan Profil Toko",
      href: "/dashboard/profile",
      icon: Store,
    },
    {
      label: "Langganan & Tagihan",
      href: "/dashboard/billing",
      icon: CreditCard,
    },
  ];

  // 1. Loading State saat memeriksa sesi
  if (isAuth === null) {
    return (
      <div className="flex flex-col justify-center items-center gap-3 px-4 py-16 w-full min-h-[60vh] text-center">
        <Loader2 className="w-8 h-8 text-brand-700 dark:text-brand-400 animate-spin" />
        <p className="font-slab font-medium text-slate-500 text-xs sm:text-sm">
          Memeriksa sesi vendor...
        </p>
      </div>
    );
  }

  // 2. Unauthenticated State (Tampilan Centered Rapi jika belum teralihkan)
  if (!isAuth) {
    return (
      <div className="flex justify-center items-center bg-slate-50/60 dark:bg-slate-950/40 px-4 py-16 w-full min-h-[calc(100vh-140px)]">
        <div className="space-y-6 bg-white dark:bg-surface-darkCard shadow-card p-8 sm:p-10 border border-slate-200/80 dark:border-slate-800 rounded-3xl w-full max-w-md text-center">
          <div className="flex justify-center items-center bg-brand-50 dark:bg-brand-950/80 mx-auto border border-brand-200 dark:border-brand-800 rounded-3xl w-16 h-16 text-brand-800 dark:text-brand-300">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="font-slab font-black text-slate-900 dark:text-white text-xl sm:text-2xl">
              Akses Khusus Vendor
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
              Halaman ini khusus untuk pemilik toko terdaftar. Mengalihkan Anda
              ke halaman login vendor...
            </p>
          </div>

          <div className="flex sm:flex-row flex-col justify-center gap-3 pt-2">
            <Link href="/vendor/login" className="w-full">
              <Button
                variant="primary"
                size="md"
                className="w-full font-bold text-xs"
              >
                <span>Masuk Akun Vendor</span>
                <ArrowRight className="ml-1.5 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/" className="w-full">
              <Button variant="outline" size="md" className="w-full text-xs">
                <span>Kembali ke Beranda</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authenticated Dashboard Layout
  return (
    <div className="bg-slate-50/60 dark:bg-slate-950/40 py-6 sm:py-10 w-full min-h-[calc(100vh-140px)]">
      <SectionContainer className="py-0">
        {/* Header Bar */}
        <header className="flex sm:flex-row flex-col justify-between sm:items-center gap-4 mb-6 pb-4 border-slate-200 dark:border-slate-800 border-b">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-slab font-black text-slate-900 dark:text-white text-xl sm:text-2xl">
                Dashboard {vendorStoreName}
              </h1>
              <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-full font-bold text-[11px] text-emerald-700 dark:text-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Vendor Terverifikasi</span>
              </span>
            </div>
            <p className="mt-0.5 text-slate-500 dark:text-slate-400 text-xs">
              Kelola produk toko, upload media WordPress, dan pantau katalog
              Anda di Kota Serang
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {vendorSlug && (
              <Link
                href={`/vendors/${vendorSlug}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-surface-darkCard shadow-sm px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-700 dark:text-slate-300 text-xs transition-colors"
              >
                <ExternalLink
                  className="w-3.5 h-3.5 text-brand-600"
                  aria-hidden="true"
                />
                <span>Lihat Toko Publik</span>
              </Link>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 shadow-xs px-3.5 py-2 border border-rose-200 dark:border-rose-800/80 rounded-xl font-bold text-rose-600 dark:text-rose-400 text-xs transition-colors"
              title="Keluar dari akun vendor"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Keluar</span>
            </button>
          </div>
        </header>

        {/* Layout Grid */}
        <div className="items-start gap-6 grid grid-cols-1 lg:grid-cols-12">
          {/* Sidebar */}
          <aside
            aria-label="Navigasi Menu Dashboard"
            className="space-y-2 lg:col-span-3"
          >
            <nav className="bg-white dark:bg-surface-darkCard shadow-subtle p-3 border border-slate-200/80 dark:border-slate-800 rounded-3xl">
              <ul className="space-y-1 m-0 p-0 list-none">
                {sidebarLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;

                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-3 px-3.5 py-2.5 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 font-semibold text-xs sm:text-sm transition-all",
                          isActive
                            ? "bg-brand-gradient text-white shadow-subtle"
                            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60",
                        )}
                      >
                        <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>{link.label}</span>
                      </Link>
                    </li>
                  );
                })}

                <li className="pt-2 border-slate-100 dark:border-slate-800/80 border-t">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-3 hover:bg-rose-50 dark:hover:bg-rose-950/40 px-3.5 py-2.5 rounded-2xl w-full font-semibold text-rose-600 dark:text-rose-400 text-xs sm:text-sm text-left transition-colors"
                  >
                    <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>Keluar (Logout)</span>
                  </button>
                </li>
              </ul>
            </nav>
          </aside>

          {/* Main Area */}
          <section className="space-y-6 lg:col-span-9">{children}</section>
        </div>
      </SectionContainer>
    </div>
  );
}