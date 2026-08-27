"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Tag, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ProductImage, ProductCategory } from "@/types";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
  categories?: ProductCategory[];
  hasSale?: boolean;
  discountPercent?: number;
}

export function ProductGallery({
  images,
  productName,
  categories = [],
  hasSale = false,
  discountPercent = 0,
}: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Pastikan array gambar valid dan punya minimal 1 fallback
  const validImages =
    images && images.length > 0
      ? images
      : [
          {
            id: 1,
            src: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
            alt: productName,
          },
        ];

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : validImages.length - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev < validImages.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Foto Utama Aktif (Pre-rendered Stack untuk Pergantian Instan 0ms Tanpa Delay) */}
      <figure className="group relative bg-white dark:bg-surface-darkCard shadow-card-hover m-0 border border-slate-200/80 dark:border-slate-800 rounded-3xl aspect-square overflow-hidden">
        {validImages.map((img, idx) => {
          const isCurrent = selectedIndex === idx;
          return (
            <div
              key={img.id ? `main-img-${img.id}-${idx}` : `main-idx-${idx}`}
              className={`absolute inset-0 transition-opacity duration-300 ease-out ${
                isCurrent
                  ? "opacity-100 z-10"
                  : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              <Image
                src={img.src}
                alt={img.alt || `Foto produk ${productName} ke-${idx + 1}`}
                fill
                priority={idx === 0}
                loading="eager"
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          );
        })}

        {/* Badge Kategori */}
        {categories.length > 0 && (
          <figcaption className="top-4 left-4 z-20 absolute flex flex-wrap gap-2 pointer-events-none">
            {categories.map((cat) => (
              <Badge
                key={cat.id || cat.slug}
                variant="primary"
                className="bg-white/95 dark:bg-slate-900/95 shadow-sm backdrop-blur-sm px-3 py-1 text-xs"
              >
                <Tag className="mr-1 w-3 h-3" aria-hidden="true" />
                <span>{cat.name}</span>
              </Badge>
            ))}
          </figcaption>
        )}

        {/* Badge Diskon / Promo */}
        {hasSale && discountPercent > 0 && (
          <div className="top-4 right-4 z-20 absolute pointer-events-none">
            <Badge
              variant="danger"
              className="shadow-md px-3 py-1 font-bold text-xs"
            >
              <span className="sr-only">Status Diskon: </span>HEMAT{" "}
              {discountPercent}%
            </Badge>
          </div>
        )}

        {/* Tombol Navigasi Panah Kiri / Kanan jika gambar > 1 */}
        {validImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="top-1/2 left-3 z-20 absolute flex justify-center items-center bg-white/90 hover:bg-white dark:bg-slate-900/90 dark:hover:bg-slate-900 opacity-0 focus:opacity-100 group-hover:opacity-100 shadow-md rounded-full w-9 h-9 text-slate-700 dark:text-slate-200 transition-all -translate-y-1/2"
              aria-label="Foto sebelumnya"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="top-1/2 right-3 z-20 absolute flex justify-center items-center bg-white/90 hover:bg-white dark:bg-slate-900/90 dark:hover:bg-slate-900 opacity-0 focus:opacity-100 group-hover:opacity-100 shadow-md rounded-full w-9 h-9 text-slate-700 dark:text-slate-200 transition-all -translate-y-1/2"
              aria-label="Foto selanjutnya"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </figure>

      {/* Galeri Thumbnail Foto Produk (Tampil jika gambar lebih dari 1) */}
      {validImages.length > 1 && (
        <div
          role="region"
          aria-label="Daftar thumbnail galeri produk"
          className="flex items-center gap-2.5 sm:gap-3 pb-1 overflow-x-auto no-scrollbar"
        >
          {validImages.map((img, idx) => {
            const isSelected = selectedIndex === idx;
            return (
              <button
                key={img.id ? `thumb-${img.id}-${idx}` : `thumb-idx-${idx}`}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                  isSelected
                    ? "border-brand-600 dark:border-brand-400 ring-2 ring-brand-600/30 scale-95 shadow-sm"
                    : "border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
                aria-label={`Pilih foto produk ke-${idx + 1}`}
                aria-current={isSelected ? "true" : "false"}
              >
                <Image
                  src={img.src}
                  alt={img.alt || `Thumbnail foto ${productName} ke-${idx + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
