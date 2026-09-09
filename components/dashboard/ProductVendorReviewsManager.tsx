"use client";

import React, { useState, useEffect, useId } from "react";
import {
  Star,
  MessageSquareQuote,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  X,
  Sparkles,
  Camera,
  Video,
  Play,
} from "lucide-react";
import { ProductReviewsData, ProductReview } from "@/types";
import { getProductReviews, submitProductReview } from "@/lib/api/wordpress";
import { getVendorSession } from "@/lib/api/auth";
import { cn, formatIndonesianDate } from "@/lib/utils";

interface ProductVendorReviewsManagerProps {
  productId: number;
  productName: string;
}

export function ProductVendorReviewsManager({
  productId,
  productName,
}: ProductVendorReviewsManagerProps) {
  const modalTitleId = useId();
  const [reviewsData, setReviewsData] = useState<ProductReviewsData>({
    average_rating: 0,
    total_reviews: 0,
    reviews: [],
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Form State
  const [authorName, setAuthorName] = useState<string>("");
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [content, setContent] = useState<string>("");
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // Muat data ulasan produk
  useEffect(() => {
    let isMounted = true;
    const fetchReviews = async () => {
      if (!productId) return;
      try {
        const data = await getProductReviews(productId);
        if (isMounted) {
          setReviewsData(data);
        }
      } catch {
        // Fallback hening jika jaringan offline
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchReviews();
    return () => {
      isMounted = false;
    };
  }, [productId]);

  const handleOpenModal = () => {
    setAuthorName("");
    setRating(5);
    setHoverRating(null);
    setContent("");
    setReviewImages([]);
    setVideoUrl("");
    setUploadError("");
    setIsModalOpen(true);
  };

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remaining = 5 - reviewImages.length;
    if (remaining <= 0) {
      setUploadError("Maksimal 5 foto bukti ulasan yang diizinkan.");
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remaining);
    setIsUploadingPhoto(true);
    setUploadError("");

    try {
      const session = getVendorSession();
      const newUrls: string[] = [];

      for (const file of filesToUpload) {
        if (file.size > 5 * 1024 * 1024) continue; // Maks 5MB

        const formData = new FormData();
        formData.append("file", file);

        const WP_API = process.env.NEXT_PUBLIC_WORDPRESS_URL || "https://app.maschandigital.id";
        const res = await fetch(`${WP_API}/wp-json/maschan/v1/media/upload`, {
          method: "POST",
          headers: session?.token ? { Authorization: `Bearer ${session.token}` } : {},
          body: formData,
        });
        const json = await res.json();
        if (res.ok && json.success && json.url) {
          newUrls.push(json.url);
        }
      }

      if (newUrls.length > 0) {
        setReviewImages((prev) => [...prev, ...newUrls].slice(0, 5));
      }
    } catch {
      setUploadError("Gagal mengunggah beberapa foto.");
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = "";
    }
  };

  const handleRemovePhoto = (index: number) => {
    setReviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !content.trim()) {
      showToast("error", "Nama pelanggan dan isi testimoni wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitProductReview(productId, {
        author_name: authorName.trim(),
        rating,
        content: content.trim(),
        images: reviewImages,
        video_url: videoUrl.trim(),
      });

      if (res.success) {
        showToast(
          "success",
          "Testimoni berhasil diajukan! Menunggu verifikasi Super Admin sebelum tayang di website."
        );

        fetch("/api/web-push/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetRole: "admin",
            title: "🔔 Testimoni Baru Masuk!",
            body: `${authorName.trim()} mengirimkan testimoni untuk produk "${productName}". Ketuk untuk meninjau.`,
            url: "/admin/moderasi",
          }),
        }).catch(() => {});

        // Tambahkan ulasan secara optimistik dengan tanda pending
        const optimisticReview: ProductReview = {
          id: Date.now(),
          author_name: authorName.trim(),
          rating,
          content: content.trim(),
          date: new Date().toISOString(),
          images: reviewImages,
          video_url: videoUrl.trim(),
        };

        setReviewsData((prev) => ({
          ...prev,
          reviews: [optimisticReview, ...prev.reviews],
        }));

        setReviewImages([]);
        setVideoUrl("");
        setIsModalOpen(false);
      } else {
        showToast("error", res.message || "Gagal mengajukan testimoni.");
      }
    } catch {
      showToast("error", "Terjadi kesalahan jaringan saat mengirim testimoni.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
      {/* Toast Alert */}
      {toast && (
        <div
          role="alert"
          className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200 ${
            toast.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
              : "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <XCircle className="w-4 h-4 shrink-0 text-rose-600" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Bagian Testimoni */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <MessageSquareQuote className="w-4 h-4 text-[#093c96] dark:text-blue-400" />
            <h3 className="font-slab font-bold text-sm sm:text-base text-slate-900 dark:text-white">
              Testimoni Pelanggan Setia (Opsional)
            </h3>
            <span className="text-[10px] bg-blue-50 dark:bg-blue-950/50 text-[#093c96] dark:text-blue-300 font-bold px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
              Verifikasi Super Admin
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
            Punya pelanggan setia di WhatsApp atau toko fisik? Masukkan testimoni asli mereka untuk
            meningkatkan kepercayaan pembeli baru. Testimoni akan ditinjau oleh Admin sebelum tayang di web.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenModal}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#093c96] hover:bg-blue-800 text-white text-xs font-semibold rounded-xl transition-all shadow-sm shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Testimoni</span>
        </button>
      </div>

      {/* Daftar Testimoni Produk */}
      {isLoading ? (
        <div className="py-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-[#093c96]" />
          <span>Memuat data ulasan...</span>
        </div>
      ) : reviewsData.reviews.length === 0 ? (
        <div className="text-center py-6 px-4 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-500 space-y-1">
          <p className="font-medium text-slate-700 dark:text-slate-300">
            Belum ada testimoni pelanggan untuk produk ini.
          </p>
          <p className="text-[11px] text-slate-400">
            Klik tombol &ldquo;+ Tambah Testimoni&rdquo; di atas untuk memasukkan ulasan pelanggan setia Anda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {reviewsData.reviews.map((r) => (
            <div
              key={r.id}
              className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-2xs"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                  {r.author_name}
                </span>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3 h-3 ${
                        s <= r.rating ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-700"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                &ldquo;{r.content}&rdquo;
              </p>

              {r.images && r.images.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {r.images.map((img, i) => (
                    <a
                      key={i}
                      href={img}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-12 h-12 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 hover:opacity-90 transition-opacity"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={`Bukti ${i + 1}`} className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              )}

              {r.video_url && (
                <div className="pt-1">
                  <a
                    href={r.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
                  >
                    <Play className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                    <span>Video Testimoni</span>
                  </a>
                </div>
              )}

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                <time className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{formatIndonesianDate(r.date)}</span>
                </time>
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Aktif di Website</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form Tambah Testimoni */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={modalTitleId}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h4 id={modalTitleId} className="font-slab font-bold text-base text-slate-900 dark:text-white">
                  Ajukan Testimoni Pelanggan
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs mt-0.5">
                  Produk: {productName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Rating Bintang */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Rating Kepuasan Pelanggan <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="p-1 rounded hover:scale-110 active:scale-95 transition-transform focus-visible:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= (hoverRating || rating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300 dark:text-slate-700"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-medium text-slate-500 ml-1">
                    ({hoverRating || rating} Bintang)
                  </span>
                </div>
              </div>

              {/* Nama Pelanggan */}
              <div className="space-y-1">
                <label
                  htmlFor="vendor-review-author"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Nama Pelanggan & Asal Daerah <span className="text-rose-500">*</span>
                </label>
                <input
                  id="vendor-review-author"
                  type="text"
                  required
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Contoh: Ibu Hj. Maryam (Kasemen, Serang)"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#093c96]"
                />
              </div>

              {/* Isi Testimoni */}
              <div className="space-y-1">
                <label
                  htmlFor="vendor-review-content"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Isi Kutipan Testimoni <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="vendor-review-content"
                  rows={3}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Ceritakan ulasan asli dari chat WhatsApp atau pembelian offline pelanggan Anda..."
                  className="w-full p-3 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#093c96] resize-none"
                />
              </div>

              {/* Unggah Foto Bukti Testimoni */}
              <div className="space-y-1.5">
                <div className={cn('flex', 'items-center', 'justify-between')}>
                  <label className={cn('text-xs', 'font-semibold', 'text-slate-700', 'dark:text-slate-300', 'flex', 'items-center', 'gap-1.5')}>
                    <Camera className={cn('w-4', 'h-4', 'text-[#093c96]', 'dark:text-blue-400')} />
                    <span>Foto Bukti Chat WhatsApp / Produk ({reviewImages.length}/5)</span>
                  </label>
                  <span className={cn('text-[10px]', 'text-slate-400')}>Opsional • Maks. 5 foto</span>
                </div>

                <div className={cn('flex', 'flex-wrap', 'gap-2', 'pt-1')}>
                  {reviewImages.map((imgUrl, idx) => (
                    <div key={idx} className={cn('relative', 'w-16', 'h-16', 'rounded-xl', 'overflow-hidden', 'border', 'border-slate-200', 'dark:border-slate-700', 'group')}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imgUrl} alt={`Bukti ${idx + 1}`} className={cn('w-full', 'h-full', 'object-cover')} />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className={cn('absolute', 'top-1', 'right-1', 'p-1', 'bg-rose-600', 'hover:bg-rose-700', 'text-white', 'rounded-full', 'transition-colors')}
                      >
                        <X className={cn('w-3', 'h-3')} />
                      </button>
                    </div>
                  ))}

                  {reviewImages.length < 5 && (
                    <label className={cn('w-16', 'h-16', 'rounded-xl', 'border-2', 'border-dashed', 'border-slate-300', 'dark:border-slate-700', 'hover:border-[#093c96]', 'dark:hover:border-blue-400', 'flex', 'flex-col', 'items-center', 'justify-center', 'text-slate-400', 'hover:text-[#093c96]', 'cursor-pointer', 'transition-colors')}>
                      {isUploadingPhoto ? (
                        <Loader2 className={cn('w-4', 'h-4', 'animate-spin', 'text-[#093c96]')} />
                      ) : (
                        <Camera className={cn('w-4', 'h-4')} />
                      )}
                      <span className={cn('text-[9px]', 'mt-0.5', 'font-medium')}>{isUploadingPhoto ? "..." : "+ Foto"}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/jpg"
                        multiple
                        disabled={isUploadingPhoto}
                        onChange={handleUploadPhoto}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                {uploadError && <p className={cn('text-[11px]', 'text-rose-500')}>{uploadError}</p>}
              </div>

              {/* Input Video Embed Sosial Media */}
              <div className="space-y-1">
                <label className={cn('text-xs', 'font-semibold', 'text-slate-700', 'dark:text-slate-300', 'flex', 'items-center', 'gap-1.5')}>
                  <Video className={cn('w-4', 'h-4', 'text-emerald-600', 'dark:text-emerald-400')} />
                  <span>Tautan Video Testimoni (Sosial Media)</span>
                </label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Tempel tautan YouTube Shorts, TikTok, atau Instagram Reels..."
                  className={cn('w-full', 'px-3', 'py-2', 'text-xs', 'bg-white', 'dark:bg-slate-800', 'border', 'border-slate-200', 'dark:border-slate-700', 'rounded-xl', 'text-slate-900', 'dark:text-white', 'placeholder:text-slate-400', 'focus:outline-none', 'focus:ring-2', 'focus:ring-[#093c96]')}
                />
                <p className={cn('text-[10px]', 'text-slate-400')}>
                  Mendukung format video pendek dari YouTube Shorts, TikTok, dan Instagram (0 MB penyimpanan server).
                </p>
              </div>

              <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
                <Sparkles className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <span>
                  Testimoni yang diajukan akan berstatus <strong>Pending</strong> dan langsung muncul di Pusat Kendali Super Admin untuk diverifikasi sebelum terbit ke publik.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#093c96] hover:bg-blue-800 text-white text-xs font-semibold rounded-xl shadow-sm disabled:opacity-50 active:scale-95 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Mengirim...</span>
                    </>
                  ) : (
                    <span>Ajukan Testimoni</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
