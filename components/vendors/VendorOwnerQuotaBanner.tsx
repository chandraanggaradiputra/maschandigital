"use client";

import React, { useSyncExternalStore, useCallback } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, Sparkles } from "lucide-react";
import { getVendorSession } from "@/lib/api/auth";
import { cn } from "@/lib/utils";

interface VendorOwnerQuotaBannerProps {
  vendorId: number;
  publicCount: number;
  archivedCount: number;
}

export function VendorOwnerQuotaBanner({
  vendorId,
  publicCount,
  archivedCount,
}: VendorOwnerQuotaBannerProps) {
  const subscribe = useCallback((onStoreChange: () => void) => {
    window.addEventListener("maschan:auth-change", onStoreChange);
    window.addEventListener("storage", onStoreChange);
    return () => {
      window.removeEventListener("maschan:auth-change", onStoreChange);
      window.removeEventListener("storage", onStoreChange);
    };
  }, []);

  const getSnapshot = useCallback(() => {
    const session = getVendorSession();
    return Boolean(
      session && session.user && Number(session.user.id) === Number(vendorId)
    );
  }, [vendorId]);

  const getServerSnapshot = useCallback(() => false, []);

  const isOwner = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!isOwner || archivedCount <= 0) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label="Status Kuota Toko Anda"
      className={cn(
        "relative overflow-hidden rounded-2xl border border-amber-300/80 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 p-5 shadow-subtle dark:border-amber-700/60 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-amber-950/40"
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3.5">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-700 dark:bg-amber-500/30 dark:text-amber-300">
            <AlertCircle className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-200/80 px-2 py-0.5 text-[11px] font-bold text-amber-900 dark:bg-amber-900/60 dark:text-amber-200">
                <Sparkles className="h-3 w-3" aria-hidden="true" />
                Khusus Pemilik Toko
              </span>
              <h3 className="font-slab text-sm font-bold text-slate-900 dark:text-white">
                Status Kuota Toko Anda (Paket Starter)
              </h3>
            </div>
            <p className="max-w-xl text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              Katalog publik Anda saat ini menampilkan <strong>{publicCount} produk unggulan</strong>.{" "}
              <strong className="text-amber-700 dark:text-amber-400">{archivedCount} produk lainnya terarsip</strong> dan tidak dapat dilihat pembeli. Tingkatkan paket langganan toko Anda untuk menampilkan seluruh katalog tanpa batasan.
            </p>
          </div>
        </div>

        <div className="shrink-0 self-start sm:self-center">
          <Link
            href="/dashboard/billing"
            className={cn(
              "inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white shadow-card-hover transition-all hover:bg-brand-700 hover:shadow-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
            )}
          >
            <span>Tingkatkan Paket Toko Sekarang</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
