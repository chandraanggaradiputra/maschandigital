"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  X,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getVendorSession } from "@/lib/api/auth";

interface MediaUploaderProps {
  initialImage?: string;
  onImageChange: (imageUrl: string, attachmentId?: number) => void;
  label?: string;
  helpText?: string;
}

export function MediaUploader({
  initialImage = "",
  onImageChange,
  label = "Foto Produk (WordPress Media)",
  helpText = "Format: JPG, PNG, atau WebP. Maksimal 5MB. Gambar akan diunggah langsung ke Media Library WordPress.",
}: MediaUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string>(initialImage);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const WP_API_URL =
    process.env.NEXT_PUBLIC_WORDPRESS_URL || "https://app.maschandigital.id";

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsUploading(true);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const session = getVendorSession();
      const headers: Record<string, string> = {};
      if (session?.token) headers["Authorization"] = `Bearer ${session.token}`;

      const res = await fetch(`${WP_API_URL}/wp-json/maschan/v1/media/upload`, {
        method: "POST",
        headers,
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success && data.url) {
        setPreviewUrl(data.url);
        onImageChange(data.url, data.id);
      } else {
        throw new Error(
          data.message || "Gagal mengunggah gambar ke server WordPress.",
        );
      }
    } catch (err) {
      console.error("Error Media Upload:", err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengunggah gambar.",
      );
      // TIDAK memanggil onImageChange() dengan blob URL lokal di sini.
      // Blob URL cuma valid di sesi browser ini — kalau tersimpan ke database
      // (mis. form produk disubmit), akan jadi link rusak permanen begitu
      // halaman ditutup/dibuka orang lain. Lebih aman biarkan preview kosong
      // dan pesan error terlihat jelas, daripada terlihat "berhasil" padahal tidak.
      setPreviewUrl(initialImage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl("");
    onImageChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <fieldset className="space-y-2 m-0 p-0 border-0">
      <legend className="font-slab font-bold text-slate-800 dark:text-slate-200 text-sm">
        {label}
      </legend>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="sr-only"
        id={`wp-media-input-${label.replace(/[^a-zA-Z0-9]/g, "-")}`}
      />

      {errorMessage && (
        <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/80 p-2.5 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      )}

      {previewUrl ? (
        <div className="group relative bg-slate-100 dark:bg-slate-900 shadow-sm border-2 border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xs aspect-square overflow-hidden">
          <img
            src={previewUrl}
            alt="Preview Foto"
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 flex justify-center items-center gap-2 bg-slate-950/60 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 p-4 transition-opacity">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleTriggerUpload}
              disabled={isUploading}
              aria-label="Ganti foto"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isUploading ? "animate-spin" : ""}`}
                aria-hidden="true"
              />
              <span>{isUploading ? "Mengunggah..." : "Ganti"}</span>
            </Button>

            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleRemoveImage}
              disabled={isUploading}
              aria-label="Hapus foto"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Hapus</span>
            </Button>
          </div>

          <div className="bottom-2 left-2 z-10 absolute">
            <span className="inline-flex items-center gap-1 bg-emerald-500/90 backdrop-blur-sm px-2 py-0.5 rounded-full font-bold text-[10px] text-white">
              <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
              Tersimpan di Media
            </span>
          </div>
        </div>
      ) : (
        <div
          onClick={handleTriggerUpload}
          onKeyDown={(e) => e.key === "Enter" && handleTriggerUpload()}
          role="button"
          tabIndex={0}
          aria-label="Unggah foto baru ke Media WordPress"
          className="bg-slate-50/50 hover:bg-brand-50/20 dark:bg-slate-900/30 p-6 sm:p-8 border-2 border-slate-300 hover:border-brand-500 dark:border-slate-700 dark:hover:border-brand-400 border-dashed rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 w-full max-w-md text-center transition-all cursor-pointer"
        >
          <div className="flex justify-center items-center bg-brand-100 dark:bg-brand-950/80 mx-auto mb-3 rounded-2xl w-12 h-12 text-brand-700 dark:text-brand-400">
            {isUploading ? (
              <Loader2
                className="w-6 h-6 text-brand-600 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <UploadCloud className="w-6 h-6" aria-hidden="true" />
            )}
          </div>
          <p className="font-slab font-bold text-slate-800 dark:text-slate-200 text-sm">
            {isUploading
              ? "Sedang Mengunggah Gambar ke WordPress..."
              : "Klik untuk Upload Foto"}
          </p>
          <p className="mt-1 text-slate-500 dark:text-slate-400 text-xs">
            Terintegrasi langsung dengan WordPress Media Library
          </p>
        </div>
      )}

      {helpText && (
        <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
          {helpText}
        </p>
      )}
    </fieldset>
  );
}
