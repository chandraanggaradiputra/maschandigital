import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  Tag,
  Store,
  ChevronRight,
  ShoppingBag,
} from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import {
  getBlogPostBySlug,
  getPostFeaturedImage,
  getPostAuthor,
  getPostCategories,
  getCleanExcerpt,
  estimateReadingTime,
  getProducts,
  getProductBySlug,
} from "@/lib/api/wordpress";
import { formatIndonesianDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { BlogContentRenderer } from "@/components/blog/BlogContentRenderer";
import { BlogJsonLd } from "@/components/seo/BlogJsonLd";
import { ProductCard } from "@/components/cards/ProductCard";
import { Product } from "@/types";

export const revalidate = 3600; // ISR revalidasi setiap 1 jam

interface BlogDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams?.slug;

  if (!slug) {
    return { title: "Artikel Tidak Ditemukan - Mas Chan Digital" };
  }

  const post = await getBlogPostBySlug(slug);
  if (!post) {
    return { title: "Artikel Tidak Ditemukan - Mas Chan Digital" };
  }

  const cleanExcerpt = getCleanExcerpt(
    post.excerpt?.rendered || post.content?.rendered || "",
    160,
  );
  const featuredMedia = getPostFeaturedImage(post);
  const mainImg =
    featuredMedia?.url || "https://maschandigital.id/mas-chan-digital.webp";

  const seoTitle = `${post.title.rendered} - Blog Mas Chan Digital`;

  return {
    title: seoTitle,
    description: cleanExcerpt,
    openGraph: {
      title: seoTitle,
      description: cleanExcerpt,
      url: `https://maschandigital.id/blog/${post.slug}`,
      siteName: "Mas Chan Digital",
      locale: "id_ID",
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.modified || post.date,
      images: [
        {
          url: mainImg,
          width: 1200,
          height: 630,
          alt: featuredMedia?.alt || post.title.rendered,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: cleanExcerpt,
      images: [mainImg],
    },
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams?.slug;

  if (!slug) {
    notFound();
  }

  const post = await getBlogPostBySlug(slug);
  if (!post) {
    notFound();
  }

  const featuredMedia = getPostFeaturedImage(post);
  const author = getPostAuthor(post);
  const categories = getPostCategories(post);
  const readingTime = estimateReadingTime(post.content?.rendered || "");
  const primaryCategory = categories[0]?.name || "Edukasi UMKM";

  // Deteksi sematan produk dalam isi konten artikel
  const contentHtml = post.content?.rendered || "";
  const embedRegex =
    /\[(?:maschan_)?product(?:\s+slug=["']([^"']+)["']|:([a-z0-9-_]+))\]|<div\s+[^>]*data-product-slug=["']([^"']+)["'][^>]*>(?:<\/div>)?/gi;

  const detectedSlugs: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = embedRegex.exec(contentHtml)) !== null) {
    const matchedSlug = match[1] || match[2] || match[3];
    if (matchedSlug && !detectedSlugs.includes(matchedSlug.toLowerCase())) {
      detectedSlugs.push(matchedSlug.toLowerCase().trim());
    }
  }

  // Pre-fetch produk yang disematkan secara paralel
  const embeddedProducts: Record<string, Product> = {};
  if (detectedSlugs.length > 0) {
    const fetchedProducts = await Promise.all(
      detectedSlugs.map((s) => getProductBySlug(s)),
    );
    fetchedProducts.forEach((p, idx) => {
      if (p && p.slug) {
        embeddedProducts[detectedSlugs[idx]] = p;
        embeddedProducts[p.slug.toLowerCase()] = p;
      }
    });
  }

  // Ambil beberapa produk kurasi UMKM untuk bagian rekomendasi di bawah artikel
  let relatedProducts: Product[] = [];
  try {
    const allProducts = await getProducts();
    if (Array.isArray(allProducts)) {
      relatedProducts = allProducts.slice(0, 4);
    }
  } catch {
    // Biarkan kosong jika tidak ada produk
  }

  return (
    <>
      {/* Skema JSON-LD Schema.org untuk GEO & AI Search */}
      <BlogJsonLd post={post} />

      <main className="min-h-screen py-6 sm:py-10 pb-24 md:pb-16 bg-surface-light dark:bg-surface-dark transition-colors">
        <SectionContainer>
          {/* Breadcrumb Navigasi */}
          <nav aria-label="Navigasi Breadcrumb" className="mb-6 sm:mb-8">
            <ol className="flex items-center gap-2 m-0 p-0 text-slate-500 dark:text-slate-400 text-xs sm:text-sm list-none flex-wrap">
              <li>
                <Link
                  href="/"
                  className="hover:text-brand-700 dark:hover:text-brand-400 transition-colors focus-visible:outline-none focus-visible:underline"
                >
                  Beranda
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </li>
              <li>
                <Link
                  href="/blog"
                  className="hover:text-brand-700 dark:hover:text-brand-400 transition-colors focus-visible:outline-none focus-visible:underline"
                >
                  Blog & Edukasi
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </li>
              <li
                className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px] sm:max-w-md"
                aria-current="page"
              >
                {post.title.rendered}
              </li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Kolom Konten Utama Artikel (8 Kolom) */}
            <article className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-10 shadow-subtle">
              {/* Header Artikel */}
              <header className="space-y-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="primary" className="text-xs font-semibold">
                    <Tag className="w-3 h-3 mr-1" aria-hidden="true" />
                    <span>{primaryCategory}</span>
                  </Badge>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-slab text-slate-900 dark:text-white leading-tight tracking-tight">
                  {post.title.rendered}
                </h1>

                {/* Metadata Penulis & Waktu */}
                <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400 pt-2">
                  <div className="flex items-center gap-2">
                    {author.avatar ? (
                      <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                        <Image
                          src={author.avatar}
                          alt={author.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-brand-50 dark:bg-brand-950 flex items-center justify-center text-brand-700 dark:text-brand-300 shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {author.name}
                    </span>
                  </div>

                  <span>•</span>

                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-400" aria-hidden="true" />
                    <time dateTime={post.date}>
                      {formatIndonesianDate(post.date)}
                    </time>
                  </div>

                  <span>•</span>

                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" aria-hidden="true" />
                    <span>{readingTime} menit baca</span>
                  </div>
                </div>
              </header>

              {/* Gambar Unggulan Utama jika ada */}
              {featuredMedia?.url && (
                <figure className="my-8 relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 m-0 shadow-sm">
                  <Image
                    src={featuredMedia.url}
                    alt={featuredMedia.alt || post.title.rendered}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 800px"
                    className="object-cover"
                  />
                </figure>
              )}

              {/* Badan Konten Artikel dengan Komponen Sematan Produk */}
              <div className="mt-8">
                <BlogContentRenderer
                  contentHtml={contentHtml}
                  embeddedProducts={embeddedProducts}
                />
              </div>

              {/* Footer Artikel & Navigasi Kembali */}
              <footer className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Kembali ke Indeks Blog</span>
                </Link>

                <div className="text-xs text-slate-500 dark:text-slate-400">
                  <span>Diterbitkan oleh Mas Chan Digital • Kota Serang</span>
                </div>
              </footer>
            </article>

            {/* Kolom Sidebar (4 Kolom): Profil Mas Chan Digital & Promo UMKM */}
            <aside className="lg:col-span-4 space-y-6">
              {/* Kartu Profil Marketplace Mas Chan Digital */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-subtle space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand-gradient flex items-center justify-center text-white shadow-subtle">
                    <Store className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="font-bold font-slab text-base text-slate-900 dark:text-white">
                      Mas Chan Digital
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Marketplace Lokal Kota Serang
                    </p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Menghubungkan pembeli dengan pelaku UMKM, produsen makanan khas,
                  dan jasa kreatif di Kota Serang secara langsung tanpa potongan biaya transaksi.
                </p>

                <div className="pt-2 flex flex-col gap-2">
                  <Link
                    href="/products"
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs sm:text-sm font-semibold rounded-xl bg-brand-gradient text-white hover:brightness-110 transition-all shadow-subtle"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Jelajahi Produk Lokal</span>
                  </Link>
                  <Link
                    href="/vendor/register"
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs sm:text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    <span>Daftar Jadi Mitra Vendor</span>
                  </Link>
                </div>
              </div>

              {/* Kurasi Produk Terkait di Sidebar */}
              {relatedProducts.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-subtle space-y-4">
                  <h4 className="font-bold font-slab text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                    <span>Produk UMKM Pilihan</span>
                  </h4>

                  <div className="space-y-3">
                    {relatedProducts.slice(0, 3).map((prod) => (
                      <Link
                        key={prod.id}
                        href={`/products/${prod.slug}`}
                        className="group flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                      >
                        <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                          <Image
                            src={
                              prod.images[0]?.src ||
                              "https://maschandigital.id/mas-chan-digital.webp"
                            }
                            alt={prod.name}
                            fill
                            sizes="56px"
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-brand-600 transition-colors">
                            {prod.name}
                          </h5>
                          <p className="text-xs text-brand-700 dark:text-brand-400 font-bold mt-0.5">
                            {prod.on_sale && prod.sale_price
                              ? prod.sale_price
                              : prod.price}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {prod.vendor?.store_name}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>

          {/* Bagian Rekomendasi Produk UMKM Kota Serang di Bawah Artikel */}
          {relatedProducts.length > 0 && (
            <section className="mt-16 pt-12 border-t border-slate-200 dark:border-slate-800">
              <div className="max-w-2xl mb-8">
                <h3 className="text-xl sm:text-2xl font-bold font-slab text-slate-900 dark:text-white">
                  Rekomendasi Produk UMKM Kota Serang
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Beli langsung dari produsen dan UMKM lokal Serang tanpa perantara.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}
        </SectionContainer>
      </main>
    </>
  );
}
