"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Store,
  Search,
  ExternalLink,
  MessageCircle,
  Loader2,
  Calendar,
  Package,
  ShieldCheck,
  Clock,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { AdminVendorItem } from "@/types";

interface AdminVendorsTabProps {
  vendors: AdminVendorItem[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function AdminVendorsTab({
  vendors,
  isLoading,
}: AdminVendorsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "warning" | "grace">("all");

  const filteredVendors = useMemo(() => {
    return vendors.filter((v) => {
      // Filter status masa aktif
      const days = v.remaining_days;
      if (statusFilter === "warning") {
        if (typeof days !== "number" || days > 7 || days <= 0) return false;
      } else if (statusFilter === "grace") {
        if (typeof days !== "number" || days > 0) return false;
      } else if (statusFilter === "active") {
        if (typeof days === "number" && days <= 0) return false;
      }

      // Filter pencarian
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchName = (v.store_name || "").toLowerCase().includes(q);
      const matchOwner = (v.owner_name || "").toLowerCase().includes(q);
      const matchDistrict = (v.location_district || "").toLowerCase().includes(q);
      return matchName || matchOwner || matchDistrict;
    });
  }, [vendors, searchQuery, statusFilter]);

  return (
    <div className="space-y-4">
      {/* Search & Filter Header */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama toko, pemilik, atau kecamatan..."
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-800"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Hapus
            </button>
          )}
        </div>

        {/* Filter Masa Aktif */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`py-1.5 px-3 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
              statusFilter === "all"
                ? "bg-brand-800 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70"
            }`}
          >
            Semua Vendor ({vendors.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("active")}
            className={`py-1.5 px-3 text-xs font-semibold rounded-xl whitespace-nowrap transition-all flex items-center gap-1 ${
              statusFilter === "active"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70"
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Aktif</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("warning")}
            className={`py-1.5 px-3 text-xs font-semibold rounded-xl whitespace-nowrap transition-all flex items-center gap-1 ${
              statusFilter === "warning"
                ? "bg-amber-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Perlu Perpanjangan (&le; 7 hr)</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("grace")}
            className={`py-1.5 px-3 text-xs font-semibold rounded-xl whitespace-nowrap transition-all flex items-center gap-1 ${
              statusFilter === "grace"
                ? "bg-rose-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Masa Tenggang</span>
          </button>
        </div>
      </div>

      {/* Konten Daftar Vendor */}
      {isLoading ? (
        <div className="py-16 text-center space-y-3">
          <Loader2
            className="w-8 h-8 mx-auto animate-spin text-brand-800 dark:text-blue-400"
            aria-hidden="true"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Memuat direktori mitra UMKM Kota Serang...
          </p>
        </div>
      ) : filteredVendors.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
            <Store className="w-6 h-6" aria-hidden="true" />
          </div>
          <h2 className="font-slab font-bold text-base text-slate-800 dark:text-slate-200">
            Vendor Tidak Ditemukan
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            Tidak ada vendor yang cocok dengan filter atau pencarian saat ini.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredVendors.map((vendor) => {
            const waClean = (vendor.whatsapp_number || "").replace(/[^0-9]/g, "");
            const planName = vendor.subscription?.plan_name || (vendor.is_exempt ? "Internal / Demo" : "Starter UMKM");
            const avatarUrl = vendor.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200";

            return (
              <article
                key={vendor.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-3 transition-all"
              >
                {/* Header Toko */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800/70 pb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-11 h-11 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700">
                      <Image
                        src={avatarUrl}
                        alt={vendor.store_name}
                        fill
                        className="object-cover"
                        sizes="44px"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Link
                          href={`/vendors/${vendor.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-slab font-bold text-xs sm:text-sm text-slate-900 dark:text-white hover:text-brand-800 dark:hover:text-blue-400 inline-flex items-center gap-1 group"
                        >
                          <span className="truncate">{vendor.store_name}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-brand-800 shrink-0" />
                        </Link>
                        {vendor.is_verified && (
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {vendor.owner_name ? `Pemilik: ${vendor.owner_name} • ` : ""}
                        Kec. {vendor.location_district || "Serang"}
                      </p>
                    </div>
                  </div>

                  {waClean && (
                    <a
                      href={`https://wa.me/${waClean}?text=${encodeURIComponent(
                        `Halo ${vendor.store_name}, kami dari Tim Mas Chan Digital ingin menginformasikan terkait status operasional & paket toko Anda:`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-xl transition-colors shrink-0 flex items-center gap-1 text-xs font-semibold"
                      title="Hubungi via WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </a>
                  )}
                </div>

                {/* Status Paket & Masa Aktif */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase tracking-wider font-semibold">
                      Paket Toko
                    </span>
                    <span className="font-bold text-brand-800 dark:text-blue-400 flex items-center gap-1 mt-0.5">
                      <Package className="w-3 h-3" />
                      <span>{planName}</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase tracking-wider font-semibold">
                      Status Masa Aktif
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 font-bold mt-0.5 ${
                        typeof vendor.remaining_days === "number" && vendor.remaining_days <= 0
                          ? "text-rose-600 dark:text-rose-400"
                          : typeof vendor.remaining_days === "number" && vendor.remaining_days <= 7
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {typeof vendor.remaining_days === "number" ? (
                        <>
                          <Calendar className="w-3 h-3" />
                          <span>
                            {vendor.remaining_days > 0
                              ? `${vendor.remaining_days} Hari Lagi`
                              : "Masa Tenggang (Habis)"}
                          </span>
                        </>
                      ) : (
                        <span>{vendor.status_label || "Permanen"}</span>
                      )}
                    </span>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase tracking-wider font-semibold">
                      Katalog Aktif
                    </span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5 block">
                      {vendor.products_count || 0} Produk / Layanan
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
