"use client";

import React, { useState, useId } from "react";
import { Star, MessageSquareQuote, X, CheckCircle2, Loader2, Sparkles, ZoomIn } from "lucide-react";
import { ProductReviewsData, ProductReview } from "@/types";
import { submitProductReview } from "@/lib/api/wordpress";
import { cn, formatIndonesianDate } from "@/lib/utils";
import { ReviewVideoEmbed } from "@/components/ui/ReviewVideoEmbed";

interface ProductReviewsSectionProps {
  productId: number;
  productName: string;
  initialReviewsData?: ProductReviewsData;
}

export function ProductReviewsSection({
  productId,
  productName,
  initialReviewsData,
}: ProductReviewsSectionProps) {
  const modalTitleId = useId();
  const [reviewsData, setReviewsData] = useState<ProductReviewsData>(
    initialReviewsData || {
      average_rating: 0,
      total_reviews: 0,
      reviews: [],
    },
  );

  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleOpenModal = () => {
    setAuthorName("");
    setRating(5);
    setHoverRating(null);
    setContent("");
    setErrorMessage(null);
    setSubmitSuccess(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (!isSubmitting) {
      setIsModalOpen(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim()) {
      setErrorMessage("Nama pengulas wajib diisi.");
      return;
    }
    if (!content.trim()) {
      setErrorMessage("Tuliskan sedikit testimoni atau pengalaman Anda.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await submitProductReview(productId, {
        author_name: authorName.trim(),
        rating,
        content: content.trim(),
      });

      if (res.success) {
        setSubmitSuccess(true);

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

        // Tambahkan ulasan secara optimistik ke antarmuka lokal
        const newReview: ProductReview = {
          id: Date.now(),
          author_name: authorName.trim(),
          rating,
          content: content.trim(),
          date: new Date().toISOString(),
        };

        const updatedReviews = [newReview, ...reviewsData.reviews];
        const updatedTotal = reviewsData.total_reviews + 1;
        const sumRatings = reviewsData.reviews.reduce(
          (acc, r) => acc + (r.rating || 5),
          0,
        ) + rating;
        const updatedAvg = Math.round((sumRatings / updatedTotal) * 10) / 10;

        setReviewsData({
          average_rating: updatedAvg,
          total_reviews: updatedTotal,
          reviews: updatedReviews,
        });

        // Tutup modal setelah delay notifikasi sukses
        setTimeout(() => {
          setIsModalOpen(false);
          setSubmitSuccess(false);
        }, 1500);
      } else {
        setErrorMessage(res.message || "Gagal mengirim testimoni. Silakan coba lagi.");
      }
    } catch {
      setErrorMessage("Terjadi kesalahan jaringan. Silakan periksa koneksi Anda.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const ratingDescriptions: Record<number, string> = {
    1: "Sangat Kecewa",
    2: "Kurang Puas",
    3: "Cukup Baik",
    4: "Puas & Rekomendasi",
    5: "Sangat Puas & Luar Biasa",
  };

  const activeRating = hoverRating || rating;

  return (
    <section
      aria-labelledby="reviews-heading"
      className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-6"
    >
      {/* Header Skor & Tombol Tulis Testimoni */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <h2
              id="reviews-heading"
              className="font-slab font-bold text-slate-900 dark:text-white text-lg sm:text-xl"
            >
              Testimoni & Ulasan Produk
            </h2>
            <Sparkles className="w-4 h-4 text-amber-500" aria-hidden="true" />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-baseline gap-1">
              <span className="font-slab font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
                {reviewsData.average_rating > 0
                  ? reviewsData.average_rating.toFixed(1)
                  : "0.0"}
              </span>
              <span className="text-slate-400 dark:text-slate-500 text-xs sm:text-sm font-medium">
                / 5.0
              </span>
            </div>

            <div className="flex items-center gap-0.5" aria-label={`Rating ${reviewsData.average_rating} dari 5 bintang`}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 sm:w-5 sm:h-5 ${
                    star <= Math.round(reviewsData.average_rating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-300 dark:text-slate-700"
                  }`}
                  aria-hidden="true"
                />
              ))}
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {reviewsData.total_reviews > 0
              ? `Berdasarkan ${reviewsData.total_reviews} ulasan asli pembeli`
              : "Belum ada rating dari pembeli"}
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={handleOpenModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-800 hover:bg-brand-900 active:scale-95 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm hover:shadow transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-800"
          >
            <MessageSquareQuote className="w-4 h-4" aria-hidden="true" />
            <span>Tulis Testimoni</span>
          </button>
        </div>
      </div>

      {/* Daftar Ulasan Pelanggan */}
      <div className="space-y-4">
        {reviewsData.reviews.length === 0 ? (
          <div className="text-center py-10 px-4 bg-white dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center">
              <Star className="w-6 h-6 fill-amber-400 text-amber-400" aria-hidden="true" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm max-w-md mx-auto">
              Belum ada ulasan untuk produk ini. Jadilah yang pertama memberikan testimoni!
            </p>
            <button
              type="button"
              onClick={handleOpenModal}
              className="text-xs sm:text-sm font-bold text-brand-800 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
            >
              Bagikan pengalaman Anda sekarang &rarr;
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviewsData.reviews.map((review) => (
              <article
                key={review.id}
                className="p-4 sm:p-5 bg-white dark:bg-slate-900/70 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-3 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-brand-800/10 dark:bg-brand-800/20 text-brand-800 dark:text-blue-400 flex items-center justify-center font-slab font-bold text-xs shrink-0">
                        {review.author_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                          {review.author_name}
                        </h3>
                        <time className="text-[11px] text-slate-400 dark:text-slate-500 block">
                          {formatIndonesianDate(review.date)}
                        </time>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 shrink-0" aria-label={`Nilai ${review.rating} dari 5 bintang`}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= review.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-300 dark:text-slate-700"
                          }`}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed break-words">
                    {review.content}
                  </p>

                  {/* Foto-Foto Bukti Ulasan */}
                  {review.images && review.images.length > 0 && (
                    <div className="pt-2">
                      <p className={cn('text-[11px]', 'font-semibold', 'text-slate-500', 'dark:text-slate-400', 'mb-1.5')}>
                        Bukti Foto Pembeli ({review.images.length}):
                      </p>
                      <div className={cn('flex', 'flex-wrap', 'gap-2')}>
                        {review.images.map((imgUrl, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setZoomedImage(imgUrl)}
                            className={cn('relative', 'w-16', 'h-16', 'sm:w-20', 'sm:h-20', 'rounded-xl', 'overflow-hidden', 'border', 'border-slate-200', 'dark:border-slate-800', 'hover:border-[#093c96]', 'group', 'cursor-zoom-in', 'transition-all', 'shadow-2xs')}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={imgUrl} alt={`Bukti ulasan ${i + 1}`} className={cn('w-full', 'h-full', 'object-cover', 'group-hover:scale-105', 'transition-transform')} />
                            <div className={cn('absolute', 'inset-0', 'bg-black/20', 'opacity-0', 'group-hover:opacity-100', 'flex', 'items-center', 'justify-center', 'transition-opacity', 'text-white')}>
                              <ZoomIn className={cn('w-4', 'h-4')} />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pemutar Video Embed */}
                  {review.video_url && (
                    <ReviewVideoEmbed url={review.video_url} authorName={review.author_name} />
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Modal Dialog Form "Tulis Testimoni" */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={modalTitleId}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50">
              <div>
                <h3
                  id={modalTitleId}
                  className="font-slab font-bold text-base sm:text-lg text-slate-900 dark:text-white"
                >
                  Tulis Testimoni Produk
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs sm:max-w-sm mt-0.5">
                  {productName}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isSubmitting}
                aria-label="Tutup form testimoni"
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-800"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
              {submitSuccess && (
                <div
                  role="alert"
                  className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Alhamdulillah, testimoni Anda berhasil dikirim dan ditampilkan!</span>
                </div>
              )}

              {errorMessage && (
                <div
                  role="alert"
                  className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl text-rose-800 dark:text-rose-300 text-xs sm:text-sm"
                >
                  {errorMessage}
                </div>
              )}

              {/* Pemilihan Bintang */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Rating Kepuasan <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        aria-label={`Pilih ${star} bintang`}
                        className="p-1 rounded hover:scale-110 active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= activeRating
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-300 dark:text-slate-700"
                          }`}
                          aria-hidden="true"
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    ({ratingDescriptions[activeRating] || `${activeRating} Bintang`})
                  </span>
                </div>
              </div>

              {/* Input Nama Pengulas */}
              <div className="space-y-1.5">
                <label
                  htmlFor="review-author-name"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Nama Anda <span className="text-rose-500">*</span>
                </label>
                <input
                  id="review-author-name"
                  type="text"
                  required
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Contoh: Fajar Pratama"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-800 dark:focus:ring-blue-400 transition-all"
                />
              </div>

              {/* Textarea Testimoni */}
              <div className="space-y-1.5">
                <label
                  htmlFor="review-content"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Testimoni / Ulasan Anda <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="review-content"
                  rows={4}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Ceritakan pengalaman Anda mengenai kualitas produk, rasa, kemasan, atau pelayanan penjual..."
                  className="w-full p-3.5 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-800 dark:focus:ring-blue-400 transition-all resize-none"
                />
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-800 hover:bg-brand-900 active:scale-95 disabled:opacity-60 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-800"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      <span>Mengirim...</span>
                    </>
                  ) : (
                    <span>Kirim Testimoni</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Zoom Foto Ulasan (Lightbox) */}
      {zoomedImage && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setZoomedImage(null)}
          className={cn('fixed', 'inset-0', 'z-50', 'flex', 'items-center', 'justify-center', 'p-4', 'bg-black/80', 'backdrop-blur-sm', 'animate-in', 'fade-in', 'duration-200')}
        >
          <div className={cn('relative', 'max-w-2xl', 'max-h-[85vh]', 'w-full', 'flex', 'items-center', 'justify-center')} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setZoomedImage(null)}
              aria-label="Tutup pratinjau foto"
              className={cn('absolute', '-top-10', 'right-0', 'p-2', 'text-white/80', 'hover:text-white', 'rounded-full', 'transition-colors')}
            >
              <X className={cn('w-6', 'h-6')} />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={zoomedImage}
              alt="Foto bukti ulasan resolusi penuh"
              className={cn('max-w-full', 'max-h-[80vh]', 'object-contain', 'rounded-2xl', 'shadow-2xl', 'border', 'border-slate-700')}
            />
          </div>
        </div>
      )}
    </section>
  );
}
