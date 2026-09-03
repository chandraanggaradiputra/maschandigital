"use client";

import React from "react";
import Link from "next/link";
import { WifiOff, RotateCw, Phone, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function OfflinePage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center space-y-6 bg-white dark:bg-surface-darkCard p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card">
        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950/60 rounded-2xl flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400">
          <WifiOff className="w-8 h-8" aria-hidden="true" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold font-slab text-slate-900 dark:text-white">
            Koneksi Internet Terputus
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Perangkat Anda sedang tidak terhubung ke internet. Tetap tenang, Anda masih dapat memuat ulang atau menyimpan kontak darurat Mas Chan Digital.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => window.location.reload()}
            className="font-bold flex items-center justify-center gap-2"
          >
            <RotateCw className="w-4 h-4" />
            <span>Coba Muat Ulang</span>
          </Button>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Link href="/" className="w-full">
              <Button variant="outline" size="md" fullWidth className="text-xs font-semibold flex items-center justify-center gap-1.5">
                <Home className="w-4 h-4" />
                <span>Ke Beranda</span>
              </Button>
            </Link>
            <a href="tel:082298148474" className="w-full">
              <Button variant="outline" size="md" fullWidth className="text-xs font-semibold flex items-center justify-center gap-1.5">
                <Phone className="w-4 h-4" />
                <span>Telepon CS</span>
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}