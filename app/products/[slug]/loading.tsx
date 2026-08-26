import React from "react";
import { SectionContainer } from "@/components/layout/SectionContainer";

export default function ProductDetailLoading() {
  return (
    <div
      className="space-y-8 sm:space-y-12 py-6 sm:py-10 animate-pulse"
      aria-busy="true"
      aria-label="Memuat data produk..."
    >
      {/* Breadcrumb Skeleton */}
      <SectionContainer className="py-0">
        <div className="flex items-center gap-2">
          <div className="bg-slate-200 dark:bg-slate-800 rounded-md w-16 h-4" />
          <div className="bg-slate-200 dark:bg-slate-800 rounded-md w-3 h-4" />
          <div className="bg-slate-200 dark:bg-slate-800 rounded-md w-20 h-4" />
          <div className="bg-slate-200 dark:bg-slate-800 rounded-md w-3 h-4" />
          <div className="bg-slate-200 dark:bg-slate-800 rounded-md w-32 h-4" />
        </div>
      </SectionContainer>

      {/* Main Grid Skeleton */}
      <SectionContainer className="py-0">
        <div className="items-start gap-8 lg:gap-12 grid grid-cols-1 lg:grid-cols-12">
          {/* Left: Gallery Skeleton */}
          <div className="space-y-4 lg:col-span-6">
            <div className="bg-slate-200 dark:bg-slate-800 rounded-3xl w-full aspect-square" />
            <div className="flex gap-3">
              <div className="bg-slate-200 dark:bg-slate-800 rounded-2xl w-16 h-16 shrink-0" />
              <div className="bg-slate-200 dark:bg-slate-800 rounded-2xl w-16 h-16 shrink-0" />
              <div className="bg-slate-200 dark:bg-slate-800 rounded-2xl w-16 h-16 shrink-0" />
            </div>
          </div>

          {/* Right: Product Info Skeleton */}
          <div className="space-y-6 lg:col-span-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="bg-slate-200 dark:bg-slate-800 rounded-full w-24 h-6" />
                <div className="bg-slate-200 dark:bg-slate-800 rounded-full w-20 h-6" />
              </div>
              <div className="bg-slate-200 dark:bg-slate-800 rounded-xl w-3/4 h-8" />
              <div className="bg-slate-200 dark:bg-slate-800 rounded-xl w-1/2 h-6" />
            </div>

            {/* Price Box */}
            <div className="space-y-2 bg-slate-100 dark:bg-slate-900 p-5 rounded-3xl">
              <div className="bg-slate-200 dark:bg-slate-800 rounded-md w-20 h-4" />
              <div className="bg-slate-200 dark:bg-slate-800 rounded-xl w-40 h-9" />
            </div>

            {/* Vendor Card Placeholder */}
            <div className="flex justify-between items-center p-5 border border-slate-200/80 dark:border-slate-800 rounded-3xl">
              <div className="flex items-center gap-3">
                <div className="bg-slate-200 dark:bg-slate-800 rounded-2xl w-12 h-12 shrink-0" />
                <div className="space-y-1.5">
                  <div className="bg-slate-200 dark:bg-slate-800 rounded-md w-28 h-4" />
                  <div className="bg-slate-200 dark:bg-slate-800 rounded-md w-20 h-3" />
                </div>
              </div>
              <div className="bg-slate-200 dark:bg-slate-800 rounded-xl w-24 h-9" />
            </div>

            {/* Order Button Box */}
            <div className="space-y-3 pt-2">
              <div className="bg-slate-200 dark:bg-slate-800 rounded-2xl w-full h-12" />
              <div className="bg-slate-200 dark:bg-slate-800 mx-auto rounded-md w-48 h-4" />
            </div>
          </div>
        </div>
      </SectionContainer>
    </div>
  );
}
