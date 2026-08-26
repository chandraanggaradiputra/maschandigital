import React from "react";
import { SectionContainer } from "@/components/layout/SectionContainer";

export default function VendorDetailLoading() {
  return (
    <div
      className="space-y-8 py-6 sm:py-10 animate-pulse"
      aria-busy="true"
      aria-label="Memuat profil toko vendor..."
    >
      <SectionContainer className="space-y-6 py-0">
        {/* Banner Skeleton */}
        <div className="bg-slate-200 dark:bg-slate-800 rounded-3xl w-full h-44 sm:h-60" />

        {/* Vendor Header Card */}
        <div className="relative flex sm:flex-row flex-col justify-between items-start sm:items-center gap-6 bg-white dark:bg-surface-darkCard shadow-subtle -mt-16 sm:-mt-20 p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 rounded-3xl">
          <div className="flex items-center gap-4">
            <div className="bg-slate-200 dark:bg-slate-800 border-4 border-white dark:border-slate-900 rounded-2xl w-20 sm:w-24 h-20 sm:h-24 shrink-0" />
            <div className="space-y-2">
              <div className="bg-slate-200 dark:bg-slate-800 rounded-lg w-48 h-6" />
              <div className="bg-slate-200 dark:bg-slate-800 rounded-md w-32 h-4" />
              <div className="bg-slate-200 dark:bg-slate-800 rounded-md w-24 h-4" />
            </div>
          </div>
          <div className="bg-slate-200 dark:bg-slate-800 rounded-xl w-36 h-10" />
        </div>

        {/* Products Grid Skeleton */}
        <div className="space-y-4 pt-4">
          <div className="bg-slate-200 dark:bg-slate-800 rounded-md w-40 h-6" />
          <div className="gap-4 sm:gap-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="space-y-3 bg-white dark:bg-surface-darkCard p-3 sm:p-4 border border-slate-200/80 dark:border-slate-800 rounded-3xl"
              >
                <div className="bg-slate-200 dark:bg-slate-800 rounded-2xl w-full aspect-square" />
                <div className="space-y-2">
                  <div className="bg-slate-200 dark:bg-slate-800 rounded-md w-16 h-3" />
                  <div className="bg-slate-200 dark:bg-slate-800 rounded-md w-full h-4" />
                  <div className="bg-slate-200 dark:bg-slate-800 rounded-md w-24 h-5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionContainer>
    </div>
  );
}
