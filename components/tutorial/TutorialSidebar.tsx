"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Store,
  Package,
  MessageCircle,
  QrCode,
  CreditCard,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { TUTORIAL_MODULES } from "@/lib/tutorialData";
import { cn } from "@/lib/utils";

export function TutorialSidebar() {
  const pathname = usePathname();

  const getModuleIcon = (iconName: string) => {
    switch (iconName) {
      case "Store":
        return <Store className="w-4 h-4" />;
      case "Package":
        return <Package className="w-4 h-4" />;
      case "MessageCircle":
        return <MessageCircle className="w-4 h-4" />;
      case "QrCode":
        return <QrCode className="w-4 h-4" />;
      case "CreditCard":
        return <CreditCard className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  return (
    <aside
      aria-label="Kurikulum Panduan Vendor"
      className="space-y-6 w-full lg:w-80 shrink-0"
    >
      {/* Academy Header Card */}
      <div className="space-y-2 bg-brand-gradient shadow-subtle p-5 rounded-3xl text-white">
        <div className="inline-flex items-center gap-1.5 bg-white/15 px-2.5 py-0.5 border border-white/20 rounded-full font-semibold text-[11px] text-amber-300">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Akademi Vendor Serang</span>
        </div>
        <h3 className="font-slab font-bold text-base">Pusat Panduan UMKM</h3>
        <p className="text-slate-200 text-xs leading-relaxed">
          Pelajari cara praktis mengelola toko, menjangkau pembeli, dan
          meningkatkan penjualan online di Kota Serang.
        </p>
      </div>

      {/* Modules Curriculum List */}
      <nav aria-label="Daftar Modul Pembelajaran" className="space-y-4">
        {TUTORIAL_MODULES.map((mod) => (
          <div
            key={mod.id}
            className="space-y-3 bg-white dark:bg-surface-darkCard shadow-subtle p-4 border border-slate-200/80 dark:border-slate-800 rounded-2xl"
          >
            {/* Module Title */}
            <div className="flex items-center gap-2.5 pb-2 border-slate-100 dark:border-slate-800/80 border-b">
              <div className="flex justify-center items-center bg-brand-50 dark:bg-brand-950/80 border border-brand-100 dark:border-brand-900 rounded-xl w-7 h-7 text-brand-700 dark:text-brand-300 shrink-0">
                {getModuleIcon(mod.iconName)}
              </div>
              <div>
                <span className="block font-mono font-bold text-[10px] text-brand-800 dark:text-brand-400 uppercase tracking-wider">
                  Modul {mod.moduleNumber}
                </span>
                <h4 className="font-slab font-bold text-slate-900 dark:text-white text-xs">
                  {mod.title}
                </h4>
              </div>
            </div>

            {/* Chapters / Lessons */}
            <ul className="space-y-1 m-0 p-0 list-none">
              {mod.chapters.map((ch) => {
                const href = `/panduan/${ch.slug}`;
                const isActive = pathname === href;

                return (
                  <li key={ch.slug}>
                    <Link
                      href={href}
                      className={cn(
                        "group flex justify-between items-center p-2 rounded-xl text-xs transition-all",
                        isActive
                          ? "bg-brand-50 dark:bg-brand-950/90 text-brand-900 dark:text-brand-200 font-bold border border-brand-200 dark:border-brand-800"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white font-medium",
                      )}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <ChevronRight
                          className={cn(
                            "w-3.5 h-3.5 transition-transform shrink-0",
                            isActive
                              ? "text-brand-700 rotate-90"
                              : "text-slate-400 group-hover:translate-x-0.5",
                          )}
                        />
                        <span className="truncate">{ch.title}</span>
                      </div>
                      <span className="ml-1 text-[10px] text-slate-400 shrink-0">
                        {ch.estimatedMinutes}m
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
