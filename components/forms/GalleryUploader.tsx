"use client";

import React, { useRef, useState } from "react";
import { UploadCloud, X, AlertCircle, Loader2, ImagePlus } from "lucide-react";
import { getVendorSession } from "@/lib/api/auth";

export interface GalleryImageItem {
  id?: number;
  src: string;
}

interface GalleryUploaderProps {
  images: GalleryImageItem[];
  onImagesChange: (images: GalleryImageItem[]) => void;
  maxImages?: number;
  label?: string;
  helpText?: string;
}

export function GalleryUploader({
  images,
  onImagesChange,
  maxImages = 5,
  label = "Galeri Foto Tambahan",
  helpText = "Foto pendukung selain foto utama. Format JPG/PNG/WebP, maksimal 5MB per foto.",
}: GalleryUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const WP_API_URL =
    process.env.NEXT_PUBLIC_WORDPRESS_URL || "https://app.maschandigital.id";

  const remainingSlots = maxImages - images.length;
  const isFull = remainingSlots <= 0;

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Batasi jumlah file yang diproses sesuai slot tersisa — jangan diam-diam
    // buang sisanya tanpa penjelasan.
    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      setErrorMessage(
        `Hanya ${remainingSlots} foto yang diproses (maksimal ${maxImages} foto galeri). Sisanya tidak diunggah.`,
      );
    } else {
      setErrorMessage("");
    }

    setIsUploading(true);
    const session = getVendorSession();
    const headers: Record<string, string> = {};
    if (session?.token) headers["Authorization"] = `Bearer ${session.token}`;

    const uploaded: GalleryImageItem[] = [];
    const failedNames: string[] = [];

    for (const file of filesToUpload) {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(
          `${WP_API_URL}/wp-json/maschan/v1/media/upload`,
          { method: "POST", headers, body: formData },
        );
        const data = await res.json();

        if (res.ok && data.success && data.url) {
          uploaded.push({ id: data.id, src: data.url });
        } else {
          failedNames.push(file.name);
        }
      } catch {
        failedNames.push(file.name);
      }
    }

    if (uploaded.length > 0) {
      onImagesChange([...images, ...uploaded]);
    }
    if (failedNames.length > 0) {
      // TIDAK ada fallback blob URL di sini juga — foto yang gagal upload
      // memang tidak ditambahkan ke galeri sama sekali, bukan ditambahkan
      // dengan link rusak yang terlihat berhasil.
      setErrorMessage(
        `Gagal mengunggah: ${failedNames.join(", ")}. Foto ini tidak ditambahkan ke galeri.`,
      );
    }

    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleRemove(index: number) {
    onImagesChange(images.filter((_, i) => i !== index));
  }

  return (
    <fieldset className="space-y-2 m-0 p-0 border-0">
      <legend className="font-slab font-bold text-slate-800 dark:text-slate-200 text-sm">
        {label}{" "}
        <span className="font-normal text-slate-400 text-xs">
          ({images.length}/{maxImages})
        </span>
      </legend>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleFileSelect}
        className="sr-only"
        id="gallery-media-input"
      />

      {errorMessage && (
        <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/80 p-2.5 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="gap-3 grid grid-cols-3 sm:grid-cols-5">
        {images.map((img, index) => (
          <div
            key={`${img.src}-${index}`}
            className="group relative bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl aspect-square overflow-hidden"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.src}
              alt={`Foto galeri ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              aria-label={`Hapus foto galeri ${index + 1}`}
              className="top-1 right-1 absolute flex justify-center items-center bg-rose-600 hover:bg-rose-700 opacity-0 focus-visible:opacity-100 group-focus-within:opacity-100 group-hover:opacity-100 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 w-6 h-6 text-white transition-opacity"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        ))}

        {!isFull && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            aria-label="Tambah foto galeri"
            className="flex flex-col justify-center items-center gap-1 bg-slate-50/50 hover:bg-brand-50/20 dark:bg-slate-900/30 disabled:opacity-50 border-2 border-slate-300 hover:border-brand-500 dark:border-slate-700 dark:hover:border-brand-400 border-dashed rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 aspect-square text-slate-500 dark:text-slate-400 transition-colors"
          >
            {isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
            ) : (
              <ImagePlus className="w-5 h-5" aria-hidden="true" />
            )}
            <span className="font-medium text-[10px]">
              {isUploading ? "Mengunggah..." : "Tambah"}
            </span>
          </button>
        )}
      </div>

      {images.length === 0 && !isUploading && (
        <p className="flex items-center gap-1.5 text-slate-400 text-xs">
          <UploadCloud className="w-3.5 h-3.5" aria-hidden="true" />
          Belum ada foto galeri — opsional, bisa ditambahkan kapan saja.
        </p>
      )}

      {helpText && (
        <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
          {helpText}
        </p>
      )}
    </fieldset>
  );
}
