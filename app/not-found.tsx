import React from "react";
import Link from "next/link";
import { Store, Search, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex justify-center items-center px-4 py-16 min-h-[70vh]">
      <div className="space-y-6 w-full max-w-md text-center">
        <div className="flex justify-center items-center bg-brand-50 dark:bg-brand-950/80 shadow-subtle mx-auto rounded-3xl w-20 h-20 text-brand-700 dark:text-brand-400">
          <Store className="w-10 h-10" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <span className="font-bold text-brand-700 dark:text-brand-400 text-xs uppercase tracking-widest">
            Error 404
          </span>
          <h1 className="font-slab font-black text-slate-900 dark:text-white text-2xl sm:text-3xl">
            Halaman Tidak Ditemukan
          </h1>
          <p className="mx-auto max-w-sm text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
            Halaman produk atau toko yang Anda cari mungkin telah dipindahkan
            atau tautan yang dimasukkan kurang tepat.
          </p>
        </div>

        <div className="flex sm:flex-row flex-col justify-center items-center gap-3 pt-2">
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="primary" size="md" fullWidth>
              <Home className="mr-2 w-4 h-4" aria-hidden="true" />
              <span>Ke Halaman Utama</span>
            </Button>
          </Link>
          <Link href="/vendors" className="w-full sm:w-auto">
            <Button variant="outline" size="md" fullWidth>
              <Search className="mr-2 w-4 h-4" aria-hidden="true" />
              <span>Cari Toko Lain</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
