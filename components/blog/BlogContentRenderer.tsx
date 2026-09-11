"use client";

import React, { useMemo } from "react";
import { Product } from "@/types";
import { ProductEmbed } from "@/components/blog/ProductEmbed";

interface BlogContentRendererProps {
  contentHtml: string;
  embeddedProducts?: Record<string, Product>;
}

type ContentSegment =
  | { type: "html"; content: string }
  | { type: "product"; slug: string };

export function BlogContentRenderer({
  contentHtml,
  embeddedProducts = {},
}: BlogContentRendererProps) {
  const segments = useMemo<ContentSegment[]>(() => {
    if (!contentHtml) return [];

    // Regex untuk mendeteksi shortcode [product slug="..."], [product:slug],
    // [maschan_product slug="..."], atau tag <div data-product-slug="...">
    const embedRegex =
      /\[(?:maschan_)?product(?:\s+slug=["']([^"']+)["']|:([a-z0-9-_]+))\]|<div\s+[^>]*data-product-slug=["']([^"']+)["'][^>]*>(?:<\/div>)?/gi;

    const result: ContentSegment[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = embedRegex.exec(contentHtml)) !== null) {
      const matchIndex = match.index;
      if (matchIndex > lastIndex) {
        const textBefore = contentHtml.substring(lastIndex, matchIndex);
        if (textBefore.trim()) {
          result.push({ type: "html", content: textBefore });
        }
      }

      const slug = match[1] || match[2] || match[3];
      if (slug) {
        result.push({ type: "product", slug: slug.trim().toLowerCase() });
      }

      lastIndex = embedRegex.lastIndex;
    }

    if (lastIndex < contentHtml.length) {
      const remaining = contentHtml.substring(lastIndex);
      if (remaining.trim()) {
        result.push({ type: "html", content: remaining });
      }
    }

    if (result.length === 0 && contentHtml.trim()) {
      result.push({ type: "html", content: contentHtml });
    }

    return result;
  }, [contentHtml]);

  return (
    <div className="blog-article-content space-y-6">
      {segments.map((segment, index) => {
        if (segment.type === "product") {
          const product = embeddedProducts[segment.slug];
          if (product) {
            return (
              <ProductEmbed
                key={`embed-${segment.slug}-${index}`}
                product={product}
              />
            );
          }
          // Jika data produk tidak ditemukan di katalog, jangan render fallback dummy!
          return null;
        }

        return (
          <div
            key={`html-${index}`}
            className="prose prose-slate max-w-none dark:prose-invert 
              prose-headings:font-slab prose-headings:font-bold prose-headings:tracking-tight 
              prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:text-slate-900 dark:prose-h2:text-white
              prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-h3:text-slate-800 dark:prose-h3:text-slate-100
              prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:leading-relaxed prose-p:text-base sm:prose-p:text-lg
              prose-a:text-brand-700 dark:prose-a:text-brand-400 prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
              prose-strong:text-slate-900 dark:prose-strong:text-white
              prose-ul:my-4 prose-ol:my-4 prose-li:my-1 prose-li:text-slate-700 dark:prose-li:text-slate-300
              prose-img:rounded-2xl prose-img:shadow-md prose-img:my-6 prose-img:w-full prose-img:object-cover
              prose-blockquote:border-l-4 prose-blockquote:border-brand-600 prose-blockquote:bg-brand-50/50 dark:prose-blockquote:bg-brand-950/20 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-xl"
            dangerouslySetInnerHTML={{ __html: segment.content }}
          />
        );
      })}
    </div>
  );
}
