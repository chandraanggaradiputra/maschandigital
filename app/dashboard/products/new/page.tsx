import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/components/forms/ProductForm";

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <Link
          href="/dashboard/products"
          className="hover:bg-slate-100 dark:hover:bg-slate-800 p-2 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300 transition-colors"
          aria-label="Kembali ke daftar produk"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        </Link>
        <div>
          <h2 className="font-slab font-bold text-slate-900 dark:text-white text-xl">
            Tambah Produk Baru
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs">
            Lengkapi detail produk, galeri foto, dan pengaturan optimasi
            pencarian Google (SEO)
          </p>
        </div>
      </header>

      <ProductForm isEditing={false} />
    </div>
  );
}
