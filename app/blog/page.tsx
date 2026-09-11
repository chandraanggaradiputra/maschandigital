import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, Newspaper, Search, ArrowLeft } from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { getBlogPosts } from "@/lib/api/wordpress";
import { BlogCard } from "@/components/blog/BlogCard";
import { BlogSearchBox } from "@/components/blog/BlogSearchBox";

export const revalidate = 3600; // ISR revalidasi berkala setiap 1 jam

export const metadata: Metadata = {
  title: "Blog & Edukasi UMKM Kota Serang - Mas Chan Digital",
  description:
    "Wawasan bisnis lokal, tips digital marketing, kurasi produk unggulan, dan panduan praktis bagi pelaku UMKM di Kota Serang, Banten.",
  openGraph: {
    title: "Blog & Edukasi UMKM Kota Serang - Mas Chan Digital",
    description:
      "Wawasan bisnis lokal, strategi digital, dan kurasi produk UMKM Kota Serang.",
    url: "https://maschandigital.id/blog",
    siteName: "Mas Chan Digital",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/mas-chan-digital.webp",
        width: 1200,
        height: 630,
        alt: "Blog & Edukasi UMKM Mas Chan Digital",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog & Edukasi UMKM Kota Serang - Mas Chan Digital",
    description:
      "Wawasan bisnis lokal dan kurasi produk UMKM di Kota Serang.",
    images: ["/mas-chan-digital.webp"],
  },
};

interface BlogIndexPageProps {
  searchParams?: Promise<{
    search?: string;
    page?: string;
    category?: string;
  }>;
}

export default async function BlogIndexPage({ searchParams }: BlogIndexPageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const searchQuery = resolvedSearchParams?.search || "";
  const pageQuery = resolvedSearchParams?.page ? parseInt(resolvedSearchParams.page, 10) : 1;
  const currentPage = !isNaN(pageQuery) && pageQuery > 0 ? pageQuery : 1;

  // Tarik data artikel langsung dari REST API resmi WordPress
  const { posts, total, totalPages } = await getBlogPosts({
    search: searchQuery,
    page: currentPage,
    per_page: 9,
  });

  return (
    <main className="min-h-screen py-8 sm:py-12 pb-24 md:pb-16 bg-surface-light dark:bg-surface-dark transition-colors">
      <SectionContainer>
        {/* Header Bersih & Edukasi UMKM */}
        <header className="max-w-3xl mx-auto text-center space-y-4 mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800/80 text-brand-800 dark:text-brand-300 text-xs sm:text-sm font-semibold shadow-subtle">
            <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400" aria-hidden="true" />
            <span>Pusat Literasi & Edukasi Digital UMKM</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-slab text-slate-900 dark:text-white tracking-tight leading-tight">
            Blog & Wawasan Bisnis Lokal Kota Serang
          </h1>

          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed">
            Kumpulan panduan praktis, strategi penjualan langsung ke WhatsApp,
            analisis pasar lokal Kota Serang, dan kurasi produk unggulan UMKM binaan Mas Chan Digital.
          </p>

          {/* Kotak Pencarian Artikel Responsif */}
          <div className="pt-2">
            <BlogSearchBox initialSearch={searchQuery} />
          </div>
        </header>

        {/* Info Hasil Pencarian jika ada */}
        {searchQuery && (
          <div className="mb-8 flex items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Search className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span>
                Menampilkan hasil untuk: <strong>&quot;{searchQuery}&quot;</strong> ({total} artikel ditemukan)
              </span>
            </div>
            <Link
              href="/blog"
              className="text-xs font-semibold text-brand-700 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Lihat Semua Artikel</span>
            </Link>
          </div>
        )}

        {/* Daftar Artikel Grid */}
        {posts && posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {posts.map((post, idx) => (
              <BlogCard
                key={post.id}
                post={post}
                priority={idx < 3}
              />
            ))}
          </div>
        ) : (
          /* Empty State Ramah & Informatif (Zero Dummy Data) */
          <div className="max-w-md mx-auto my-12 p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-subtle space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-50 dark:bg-brand-950/60 flex items-center justify-center text-brand-700 dark:text-brand-300">
              <Newspaper className="w-7 h-7" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-bold font-slab text-slate-900 dark:text-white">
              {searchQuery
                ? "Artikel Tidak Ditemukan"
                : "Belum Ada Artikel yang Diterbitkan"}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {searchQuery
                ? `Tidak ditemukan artikel dengan kata kunci "${searchQuery}". Coba kata kunci lain atau telusuri topik seputar UMKM.`
                : "Artikel edukasi dan wawasan UMKM Kota Serang sedang disiapkan. Silakan kunjungi kembali dalam waktu dekat."}
            </p>
            {searchQuery && (
              <div className="pt-2">
                <Link
                  href="/blog"
                  className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Reset Pencarian
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Navigasi Paginasi jika halaman > 1 */}
        {totalPages > 1 && (
          <nav
            aria-label="Paginasi Artikel"
            className="mt-12 flex items-center justify-center gap-2"
          >
            {currentPage > 1 && (
              <Link
                href={`/blog?page=${currentPage - 1}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""}`}
                className="px-4 py-2 text-sm font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Halaman Sebelumnya
              </Link>
            )}

            <span className="px-4 py-2 text-sm text-slate-500 dark:text-slate-400">
              Halaman {currentPage} dari {totalPages}
            </span>

            {currentPage < totalPages && (
              <Link
                href={`/blog?page=${currentPage + 1}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""}`}
                className="px-4 py-2 text-sm font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Halaman Selanjutnya
              </Link>
            )}
          </nav>
        )}
      </SectionContainer>
    </main>
  );
}
