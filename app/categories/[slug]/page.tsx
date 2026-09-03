import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  Package,
  Sparkles,
  Utensils,
  Shirt,
  HeartPulse,
  Laptop,
  Smartphone,
  Sprout,
  ShoppingBag,
  ArrowLeft,
} from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { ProductCard } from "@/components/cards/ProductCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { getCategories, getProducts } from "@/lib/api/wordpress";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

function getCategoryIcon(slug: string, className: string = "w-6 h-6") {
  const s = slug.toLowerCase();
  if (
    s.includes("kuliner") ||
    s.includes("makan") ||
    s.includes("food") ||
    s.includes("snack") ||
    s.includes("bandeng")
  ) {
    return (
      <Utensils className={`${className} text-amber-500`} aria-hidden="true" />
    );
  }
  if (
    s.includes("herbal") ||
    s.includes("madu") ||
    s.includes("kesehatan") ||
    s.includes("obat")
  ) {
    return (
      <HeartPulse
        className={`${className} text-emerald-500`}
        aria-hidden="true"
      />
    );
  }
  if (
    s.includes("fashion") ||
    s.includes("batik") ||
    s.includes("baju") ||
    s.includes("pakaian")
  ) {
    return (
      <Shirt className={`${className} text-rose-500`} aria-hidden="true" />
    );
  }
  if (
    s.includes("digital") ||
    s.includes("jasa") ||
    s.includes("it") ||
    s.includes("web") ||
    s.includes("app")
  ) {
    return (
      <Laptop className={`${className} text-brand-500`} aria-hidden="true" />
    );
  }
  if (s.includes("elektronik") || s.includes("gadget") || s.includes("hp")) {
    return (
      <Smartphone
        className={`${className} text-indigo-500`}
        aria-hidden="true"
      />
    );
  }
  if (
    s.includes("tani") ||
    s.includes("kebun") ||
    s.includes("bibit") ||
    s.includes("tanaman")
  ) {
    return (
      <Sprout className={`${className} text-lime-600`} aria-hidden="true" />
    );
  }
  return (
    <ShoppingBag className={`${className} text-brand-600`} aria-hidden="true" />
  );
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const allCategories = await getCategories();
  const category =
    allCategories.find((c) => c.slug.toLowerCase() === slug.toLowerCase()) ||
    null;

  const titleName =
    category?.name ||
    slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  return {
    title: `Kategori ${titleName} - Mas Chan Digital Kota Serang`,
    description: `Temukan daftar produk dan jasa ${titleName} terbaik dari UMKM lokal Kota Serang. Hubungi langsung vendor via WhatsApp tanpa potongan biaya.`,
  };
}

export default async function CategoryProductPage({
  params,
}: CategoryPageProps) {
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  const allCategories = await getCategories();
  const category =
    allCategories.find((c) => c.slug.toLowerCase() === slug.toLowerCase()) ||
    null;
  const products = await getProducts(slug);

  const titleName =
    category?.name ||
    slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <article
      aria-labelledby="category-title"
      className="space-y-8 sm:space-y-12 pb-16"
    >
      <BreadcrumbJsonLd
        items={[
          { name: "Beranda", url: "/" },
          { name: "Kategori", url: "/categories" },
          { name: titleName, url: `/categories/${slug}` },
        ]}
      />
      {/* 1. HERO HEADER KATEGORI */}
      <header className="relative bg-brand-gradient py-10 sm:py-14 overflow-hidden text-white">
        <div
          className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] opacity-10 pointer-events-none [background-size:16px_16px]"
          aria-hidden="true"
        />

        <SectionContainer className="z-10 relative space-y-4 py-0">
          {/* Breadcrumbs */}
          <nav
            aria-label="Breadcrumb Kategori"
            className="text-slate-200 text-xs"
          >
            <ol className="flex items-center gap-2 m-0 p-0 list-none">
              <li>
                <Link href="/" className="hover:underline">
                  Beranda
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/categories" className="hover:underline">
                  Kategori
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li
                aria-current="page"
                className="font-bold text-amber-300 truncate"
              >
                {titleName}
              </li>
            </ol>
          </nav>

          <div className="flex sm:flex-row flex-col justify-between sm:items-center gap-6 pt-2">
            <div className="flex items-start sm:items-center gap-4">
              <div className="flex justify-center items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl w-14 sm:w-16 h-14 sm:h-16 shrink-0">
                {getCategoryIcon(slug, "w-8 h-8")}
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 bg-white/10 px-2.5 py-0.5 rounded-full font-semibold text-amber-300 text-xs">
                  <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Kategori Produk Lokal Serang</span>
                </div>
                <h1
                  id="category-title"
                  className="font-slab font-black text-2xl sm:text-3xl lg:text-4xl"
                >
                  {titleName}
                </h1>
                <p className="text-slate-200 text-xs sm:text-sm">
                  Menampilkan {products.length} produk dari pelaku usaha dan
                  vendor terpercaya di Kota Serang
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Link href="/categories">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white hover:bg-slate-100 font-bold text-brand-900"
                >
                  <ArrowLeft className="mr-1.5 w-4 h-4" />
                  <span>Kategori Lainnya</span>
                </Button>
              </Link>
            </div>
          </div>
        </SectionContainer>
      </header>

      {/* 2. DAFTAR KATEGORI LAIN (QUICK FILTER PILLS) */}
      <SectionContainer className="py-0">
        <nav
          aria-label="Filter Cepat Kategori"
          className="flex items-center gap-2 pb-2 overflow-x-auto no-scrollbar"
        >
          <Link href="/categories">
            <Badge
              variant="neutral"
              className="hover:bg-slate-200 dark:hover:bg-slate-700 px-3.5 py-1.5 font-bold text-xs shrink-0"
            >
              Semua Kategori
            </Badge>
          </Link>
          {allCategories.map((c) => (
            <Link key={c.id} href={`/categories/${c.slug}`}>
              <Badge
                variant={c.slug === slug ? "primary" : "neutral"}
                className={`px-3.5 py-1.5 text-xs font-bold shrink-0 transition-all ${
                  c.slug === slug
                    ? "bg-brand-800 text-white dark:bg-brand-600 shadow-sm"
                    : "hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {c.name} ({c.count || 0})
              </Badge>
            </Link>
          ))}
        </nav>
      </SectionContainer>

      {/* 3. GRID PRODUK KATEGORI */}
      <SectionContainer
        aria-label={`Daftar Produk Kategori ${titleName}`}
        className="py-0"
      >
        {products.length > 0 ? (
          <div className="gap-4 sm:gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product, idx) => (
              <ProductCard
                key={
                  product.id
                    ? `cat-prod-${product.id}-${product.slug}-${idx}`
                    : `cat-prod-idx-${idx}`
                }
                product={product}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4 bg-white dark:bg-surface-darkCard shadow-subtle mx-auto p-12 border border-slate-200/80 dark:border-slate-800 rounded-3xl max-w-md text-center">
            <Package className="mx-auto w-12 h-12 text-slate-300 dark:text-slate-600" />
            <div className="space-y-1">
              <h3 className="font-slab font-bold text-slate-800 dark:text-white text-base">
                Belum Ada Produk di Kategori Ini
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                Jadilah penjual pertama yang mendaftarkan produk di kategori{" "}
                {titleName} Kota Serang.
              </p>
            </div>
            <div className="flex sm:flex-row flex-col justify-center gap-2.5 pt-2">
              <Link href="/vendor/register">
                <Button
                  variant="primary"
                  size="sm"
                  className="font-bold text-xs"
                >
                  <span>Buka Toko & Unggah Produk</span>
                </Button>
              </Link>
              <Link href="/categories">
                <Button variant="outline" size="sm" className="text-xs">
                  <span>Jelajahi Kategori Lain</span>
                </Button>
              </Link>
            </div>
          </div>
        )}
      </SectionContainer>
    </article>
  );
}
