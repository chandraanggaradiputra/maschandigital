import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, ArrowRight, User, Tag } from "lucide-react";
import { BlogPost } from "@/types";
import {
  getPostFeaturedImage,
  getPostAuthor,
  getPostCategories,
  getCleanExcerpt,
  estimateReadingTime,
} from "@/lib/api/wordpress";
import { formatIndonesianDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

interface BlogCardProps {
  post: BlogPost;
  priority?: boolean;
}

export function BlogCard({ post, priority = false }: BlogCardProps) {
  const featuredMedia = getPostFeaturedImage(post);
  const author = getPostAuthor(post);
  const categories = getPostCategories(post);
  const cleanExcerpt = getCleanExcerpt(
    post.excerpt?.rendered || post.content?.rendered || "",
    130,
  );
  const readingTime = estimateReadingTime(post.content?.rendered || "");
  const primaryCategory = categories[0]?.name || "Edukasi UMKM";

  const imageUrl =
    featuredMedia?.url ||
    "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&auto=format&fit=crop&q=80";

  return (
    <article
      aria-labelledby={`blog-title-${post.id}`}
      className="group flex flex-col bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-subtle hover:shadow-card-hover transition-all duration-300 overflow-hidden"
    >
      {/* Thumbnail Gambar Artikel */}
      <figure className="relative w-full aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800 m-0">
        <Link
          href={`/blog/${post.slug}`}
          className="block w-full h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          tabIndex={0}
          aria-label={`Baca artikel: ${post.title.rendered}`}
        >
          <Image
            src={imageUrl}
            alt={featuredMedia?.alt || post.title.rendered}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* Badge Kategori */}
        <figcaption className="absolute top-3 left-3 z-10">
          <Badge
            variant="primary"
            className="bg-white/95 dark:bg-slate-900/95 shadow-sm backdrop-blur-md text-[11px] font-semibold"
          >
            <Tag className="w-3 h-3 mr-1" aria-hidden="true" />
            <span>{primaryCategory}</span>
          </Badge>
        </figcaption>
      </figure>

      {/* Konten Kartu */}
      <div className="flex flex-col flex-1 p-5 sm:p-6">
        {/* Meta Info: Tanggal & Waktu Baca */}
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-2.5">
          <span className="inline-flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
            <time dateTime={post.date}>{formatIndonesianDate(post.date)}</time>
          </span>
          <span>•</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{readingTime} menit baca</span>
          </span>
        </div>

        {/* Judul Artikel */}
        <h3
          id={`blog-title-${post.id}`}
          className="text-lg sm:text-xl font-bold font-slab text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-brand-700 dark:group-hover:text-brand-400 transition-colors"
        >
          <Link
            href={`/blog/${post.slug}`}
            className="focus-visible:outline-none focus-visible:underline"
          >
            {post.title.rendered}
          </Link>
        </h3>

        {/* Cuplikan Ringkas Bersih */}
        <p className="mt-2.5 text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed flex-1">
          {cleanExcerpt}
        </p>

        {/* Footer Kartu: Penulis & CTA */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <User className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" aria-hidden="true" />
            <span className="truncate max-w-[120px] font-medium">
              {author.name}
            </span>
          </div>

          <Link
            href={`/blog/${post.slug}`}
            className="inline-flex items-center gap-1 font-semibold text-brand-700 dark:text-brand-400 hover:gap-1.5 transition-all focus-visible:outline-none focus-visible:underline"
            aria-label={`Baca selengkapnya artikel ${post.title.rendered}`}
          >
            <span>Baca Selengkapnya</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
