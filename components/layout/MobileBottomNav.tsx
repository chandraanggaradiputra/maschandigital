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
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getVendorSession,
  clearVendorSession,
  AuthSession,
} from "@/lib/api/auth";

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

  const handleLogout = () => {
    clearVendorSession();
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  const isVendor = Boolean(session && session.user);

  // Menu untuk Guest / Pelanggan Umum
  const guestNavItems = [
    { label: "Beranda", href: "/", icon: Home, isAction: false },
    { label: "Produk", href: "/products", icon: Package, isAction: false },
    { label: "Kategori", href: "/categories", icon: Tag, isAction: false },
    { label: "Vendor", href: "/vendors", icon: Store, isAction: false },
    { label: "Akun", href: "/vendor/login", icon: LogIn, isAction: false },
  ];

  // Menu Khusus Akun Vendor (Beranda di Posisi Tengah)
  const vendorNavItems = [
    {
      label: "Produk",
      href: "/dashboard/products",
      icon: Package,
      isAction: false,
    },
    { label: "Panduan", href: "/panduan", icon: BookOpen, isAction: false },
    { label: "Beranda", href: "/", icon: Home, isAction: false },
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      isAction: false,
    },
    { label: "Logout", href: "#logout", icon: LogOut, isAction: true },
  ];

  const navItems = isVendor ? vendorNavItems : guestNavItems;

  return (
    <nav
      aria-label="Navigasi Bawah Mobile"
      className="md:hidden bottom-0 z-50 fixed inset-x-0 bg-white/95 dark:bg-surface-darkCard/95 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur-lg px-2 py-1 border-slate-200/90 dark:border-slate-800/90 border-t"
    >
      <ul className="flex justify-around items-center m-0 p-0 list-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            !item.isAction &&
            (pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href)));

          if (item.isAction) {
            return (
              <li key={item.label} className="flex-1 text-center">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex flex-col justify-center items-center px-1 py-1 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 w-full text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 dark:text-slate-400 transition-all duration-150"
                >
                  <div className="p-1 rounded-lg transition-colors">
                    <Icon
                      className="w-4 sm:w-5 h-4 sm:h-5"
                      aria-hidden="true"
                    />
                  </div>
                  <span className="mt-0.5 font-slab text-[9px] sm:text-[10px] truncate tracking-tight">
                    {item.label}
                  </span>
                </button>
              </li>
            );
          }

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
