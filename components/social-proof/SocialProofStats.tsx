import React from 'react';
import { Package, Store, MapPin, Zap } from 'lucide-react';

export interface SocialProofStatsProps {
  totalProducts: number;
  totalVendors: number;
}

export function SocialProofStats({ totalProducts, totalVendors }: SocialProofStatsProps) {
  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
      <div className="gap-4 grid grid-cols-2 md:grid-cols-4 bg-white dark:bg-surface-darkCard p-6 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-subtle">
        
        {/* Metrik 1 */}
        <div className="flex flex-col items-center text-center">
          <div className="flex justify-center items-center bg-brand-100 dark:bg-brand-900/40 mb-3 rounded-2xl w-12 h-12 text-brand-600 dark:text-brand-400">
            <Package className="w-6 h-6" aria-hidden="true" />
          </div>
          <p className="font-bold font-slab text-2xl text-slate-900 dark:text-slate-100">{totalProducts}+</p>
          <p className="text-slate-500 dark:text-slate-400 text-xs">Produk Lokal Aktif</p>
        </div>

        {/* Metrik 2 */}
        <div className="flex flex-col items-center text-center">
          <div className="flex justify-center items-center bg-amber-100 dark:bg-amber-900/40 mb-3 rounded-2xl w-12 h-12 text-amber-600 dark:text-amber-400">
            <Store className="w-6 h-6" aria-hidden="true" />
          </div>
          <p className="font-bold font-slab text-2xl text-slate-900 dark:text-slate-100">{totalVendors}+</p>
          <p className="text-slate-500 dark:text-slate-400 text-xs">Toko Terverifikasi</p>
        </div>

        {/* Metrik 3 */}
        <div className="flex flex-col items-center text-center">
          <div className="flex justify-center items-center bg-emerald-100 dark:bg-emerald-900/40 mb-3 rounded-2xl w-12 h-12 text-emerald-600 dark:text-emerald-400">
            <MapPin className="w-6 h-6" aria-hidden="true" />
          </div>
          <p className="font-bold font-slab text-2xl text-slate-900 dark:text-slate-100">6</p>
          <p className="text-slate-500 dark:text-slate-400 text-xs">Kecamatan Serang</p>
        </div>

        {/* Metrik 4 */}
        <div className="flex flex-col items-center text-center">
          <div className="flex justify-center items-center bg-purple-100 dark:bg-purple-900/40 mb-3 rounded-2xl w-12 h-12 text-purple-600 dark:text-purple-400">
            <Zap className="w-6 h-6" aria-hidden="true" />
          </div>
          <p className="font-bold font-slab text-2xl text-slate-900 dark:text-slate-100">100%</p>
          <p className="text-slate-500 dark:text-slate-400 text-xs">Bebas Biaya Gateway</p>
        </div>

      </div>
    </div>
  );
}
