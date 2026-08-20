import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/components/forms/ProductForm";
import { getProductBySlug } from "@/lib/api/wordpress";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params;
  if (!id) {
    notFound();
  }

  const product = await getProductBySlug(id);
  if (!product) {
    notFound();
  }

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
            Edit Produk: {product.name}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs">
            Perbarui data produk, foto media, harga, atau kata kunci SEO Rank
            Math
          </p>
        </div>
      </header>

      <ProductForm initialData={product} isEditing={true} />
    </div>
  );
}
