"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Store, Search, LayoutDashboard, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Beranda", href: "/", icon: Home },
    { label: "Vendor", href: "/vendors", icon: Store },
    { label: "Cari", href: "/vendors", icon: Search },
    { label: "Tentang", href: "/tentang-kami", icon: Info },
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
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
                  "flex flex-col justify-center items-center px-2 py-1.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 w-full transition-all duration-150",
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
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <span className="mt-0.5 font-slab text-[10px] tracking-tight">
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
