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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getVendorSession, AuthSession } from "@/lib/api/auth";

export function MobileBottomNav() {
  const pathname = usePathname();
  const [session, setSession] = useState<AuthSession | null>(null);

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

  const navItems = [
    { label: "Beranda", href: "/", icon: Home },
    { label: "Produk", href: "/products", icon: Package },
    { label: "Kategori", href: "/categories", icon: Tag },
    { label: "Vendor", href: "/vendors", icon: Store },
    {
      label: session ? "Dashboard" : "Akun",
      href: session ? "/dashboard" : "/vendor/login",
      icon: session ? LayoutDashboard : LogIn,
    },
  ];

  return (
    <nav
      aria-label="Navigasi Bawah Mobile"
      className="md:hidden bottom-0 z-50 fixed inset-x-0 bg-white/95 dark:bg-surface-darkCard/95 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur-lg px-2 py-1 border-slate-200/90 dark:border-slate-800/90 border-t"
    >
      <ul className="flex justify-around items-center m-0 p-0 list-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <li key={item.label} className="flex-1 text-center">
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex flex-col justify-center items-center px-1 py-1 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 w-full transition-all duration-150",
                  isActive
                    ? "text-brand-800 dark:text-brand-400 font-bold scale-105"
                    : "text-slate-500 dark:text-slate-400 font-medium hover:text-slate-800 dark:hover:text-slate-200",
                )}
              >
                <div
                  className={cn(
                    "p-1 rounded-lg transition-colors",
                    isActive &&
                      "bg-brand-50 dark:bg-brand-950/80 text-brand-800 dark:text-brand-400",
                  )}
                >
                  <Icon className="w-4 sm:w-5 h-4 sm:h-5" aria-hidden="true" />
                </div>
                <span className="mt-0.5 font-slab text-[9px] sm:text-[10px] truncate tracking-tight">
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
