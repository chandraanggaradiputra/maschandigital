"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Store,
  ExternalLink,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { getVendors } from "@/lib/api/wordpress";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [vendorSlug, setVendorSlug] = useState("vendor-serang");

  useEffect(() => {
    async function loadVendor() {
      const vendors = await getVendors();
      if (vendors && vendors.length > 0) {
        setVendorSlug(vendors[0].slug);
      }
    }
    loadVendor();
  }, []);

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
  ];

  return (
    <div className="bg-slate-50/60 dark:bg-slate-950/40 py-6 sm:py-10 min-h-[calc(100vh-140px)]">
      <SectionContainer className="py-0">
        <header className="flex sm:flex-row flex-col justify-between sm:items-center gap-4 mb-6 pb-4 border-slate-200 dark:border-slate-800 border-b">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-slab font-black text-slate-900 dark:text-white text-xl sm:text-2xl">
                Dashboard Vendor WCFM
              </h1>
              <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full font-bold text-[11px] text-emerald-700 dark:text-emerald-300">
                <ShieldCheck className="w-3 h-3" aria-hidden="true" />
                <span>Terhubung API</span>
              </span>
            </div>
            <p className="mt-0.5 text-slate-500 dark:text-slate-400 text-xs">
              Kelola produk, upload media WordPress, dan atur kata kunci SEO
              Rank Math
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/vendors/${vendorSlug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-surface-darkCard px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold text-slate-700 dark:text-slate-300 text-xs transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Lihat Toko Publik</span>
            </Link>
          </div>
        </header>

        <div className="items-start gap-6 grid grid-cols-1 lg:grid-cols-12">
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
                  <Link
                    href="/vendor/login"
                    className="flex items-center gap-3 hover:bg-rose-50 dark:hover:bg-rose-950/40 px-3.5 py-2.5 rounded-2xl font-semibold text-rose-600 dark:text-rose-400 text-xs sm:text-sm transition-colors"
                  >
                    <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>Keluar (Logout)</span>
                  </Link>
                </li>
              </ul>
            </nav>
          </aside>

          <section className="space-y-6 lg:col-span-9">{children}</section>
        </div>
      </SectionContainer>
    </div>
  );
}
