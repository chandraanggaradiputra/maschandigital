import React from "react";
import { BlogPost } from "@/types";
import {
  getPostFeaturedImage,
  getPostAuthor,
  getCleanExcerpt,
} from "@/lib/api/wordpress";

interface BlogJsonLdProps {
  post: BlogPost;
  canonicalUrl?: string;
}

export function BlogJsonLd({ post, canonicalUrl }: BlogJsonLdProps) {
  const currentUrl =
    canonicalUrl || `https://maschandigital.id/blog/${post.slug}`;
  const featuredMedia = getPostFeaturedImage(post);
  const author = getPostAuthor(post);
  const cleanExcerpt = getCleanExcerpt(
    post.excerpt?.rendered || post.content?.rendered || "",
  );

  const images = featuredMedia?.url
    ? [featuredMedia.url]
    : ["https://maschandigital.id/mas-chan-digital.webp"];

  const articleSchema = {
    "@type": "BlogPosting",
    headline: post.title?.rendered || "Artikel Mas Chan Digital",
    description:
      cleanExcerpt ||
      "Artikel edukasi UMKM dan panduan bisnis lokal Kota Serang oleh Mas Chan Digital.",
    image: images,
    datePublished: post.date,
    dateModified: post.modified || post.date,
    inLanguage: "id-ID",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": currentUrl,
    },
    author: {
      "@type": "Person",
      name: author.name || "Mas Chan Digital",
      url: "https://maschandigital.id",
    },
    publisher: {
      "@type": "Organization",
      name: "Mas Chan Digital",
      url: "https://maschandigital.id",
      logo: {
        "@type": "ImageObject",
        url: "https://maschandigital.id/mas-chan-digital.webp",
      },
    },
  };

  const breadcrumbSchema = {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Beranda",
        item: "https://maschandigital.id",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog & Edukasi UMKM",
        item: "https://maschandigital.id/blog",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title?.rendered || "Detail Artikel",
        item: currentUrl,
      },
    ],
  };

  const graphSchema = {
    "@context": "https://schema.org",
    "@graph": [articleSchema, breadcrumbSchema],
  };

  return (
    <script
      id="blog-post-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(graphSchema).replace(/</g, "\\u003c"),
      }}
    />
  );
}
