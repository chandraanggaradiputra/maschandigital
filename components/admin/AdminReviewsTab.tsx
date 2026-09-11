"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Star,
  CheckCircle2,
  Clock,
  Loader2,
  ExternalLink,
  Store,
  Check,
  X,
  Trash2,
  ZoomIn,
  MessageSquareQuote,
} from "lucide-react";
import { AdminReviewItem } from "@/types";
import { formatIndonesianDate } from "@/lib/utils";
import { ReviewVideoEmbed } from "@/components/ui/ReviewVideoEmbed";

interface AdminReviewsTabProps {
  reviews: AdminReviewItem[];
  pendingCount: number;
  isLoading: boolean;
  activeSubTab: "pending" | "approved";
  onSubTabChange: (tab: "pending" | "approved") => void;
  onApprove: (review: AdminReviewItem) => void;
  onOpenRejectModal: (review: AdminReviewItem) => void;
  onOpenDeleteModal: (review: AdminReviewItem) => void;
  actionLoadingId: number | null;
  onZoomImage: (url: string) => void;
  onRefresh: () => void;
}

export function AdminReviewsTab({
  reviews,
  pendingCount,
  isLoading,
  activeSubTab,
  onSubTabChange,
  onApprove,
  onOpenRejectModal,
  onOpenDeleteModal,
  actionLoadingId,
  onZoomImage,
}: AdminReviewsTabProps) {
  return (
    <div className="space-y-4">
      {/* Sub-Filter Tab */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onSubTabChange("pending")}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === "pending"
              ? "bg-brand-800 text-white shadow-sm"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70"
          }`}
        >
          <Clock className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Menunggu Verifikasi</span>
          {pendingCount > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeSubTab === "pending"
                  ? "bg-white text-brand-800"
                  : "bg-rose-500 text-white"
              }`}
            >
              {pendingCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => onSubTabChange("approved")}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === "approved"
              ? "bg-brand-800 text-white shadow-sm"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Riwayat Disetujui</span>
        </button>
      </div>

      {/* Konten Daftar Ulasan */}
      {isLoading ? (
        <div className="py-16 text-center space-y-3">
          <Loader2
            className="w-8 h-8 mx-auto animate-spin text-brand-800 dark:text-blue-400"
            aria-hidden="true"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Memuat data ulasan pembeli...
          </p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
            <MessageSquareQuote className="w-6 h-6" aria-hidden="true" />
          </div>
          <h2 className="font-slab font-bold text-base text-slate-800 dark:text-slate-200">
            {activeSubTab === "pending"
              ? "Tidak Ada Ulasan Pending"
              : "Belum Ada Riwayat Ulasan"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            {activeSubTab === "pending"
              ? "Alhamdulillah, seluruh ulasan produk dari pembeli telah diverifikasi dan disetujui."
              : "Belum ada ulasan yang disetujui dalam catatan sistem."}
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {reviews.map((review) => {
            const isActionLoading = actionLoadingId === review.id;

            return (
              <article
                key={review.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-3.5 transition-all"
              >
                {/* Header Kartu: Info Produk & Toko */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800/70 pb-3">
                  <div className="min-w-0">
                    <Link
                      href={`/products/${review.product_slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-slab font-bold text-xs sm:text-sm text-slate-900 dark:text-white hover:text-brand-800 dark:hover:text-blue-400 inline-flex items-center gap-1 group"
                    >
                      <span className="truncate">{review.product_name}</span>
                      <ExternalLink
                        className="w-3 h-3 text-slate-400 group-hover:text-brand-800 shrink-0"
                        aria-hidden="true"
                      />
                    </Link>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <Store className="w-3 h-3 text-brand-800 shrink-0" />
                      <span className="truncate">{review.vendor_name}</span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      review.status === "approved"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                        : review.status === "rejected"
                        ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                    }`}
                  >
                    {review.status === "approved"
                      ? "Disetujui"
                      : review.status === "rejected"
                      ? "Ditolak"
                      : "Menunggu Persetujuan"}
                  </span>
                </div>

                {/* Info Penulis & Rating */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300">
                      {review.author_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-200 leading-tight">
                        {review.author_name}
                      </p>
                      <p className="text-[10px] text-slate-400 leading-tight">
                        {formatIndonesianDate(review.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Rating Bintang */}
                  <div className="flex items-center gap-0.5 text-amber-500 shrink-0">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= review.rating
                            ? "fill-current text-amber-500"
                            : "text-slate-300 dark:text-slate-700"
                        }`}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                </div>

                {/* Konten Ulasan */}
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
                  &ldquo;{review.content}&rdquo;
                </p>

                {/* Foto Bukti Ulasan */}
                {review.images && review.images.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      Foto Bukti ({review.images.length}):
                    </p>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                      {review.images.map((imgUrl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => onZoomImage(imgUrl)}
                          className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 group hover:opacity-90 transition-opacity"
                        >
                          <Image
                            src={imgUrl}
                            alt={`Foto bukti ulasan ${idx + 1}`}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <ZoomIn className="w-4 h-4" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Video Review Embed */}
                {review.video_url && (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      Video Ulasan Pembeli:
                    </p>
                    <ReviewVideoEmbed url={review.video_url} authorName={review.author_name} />
                  </div>
                )}

                {/* Tombol Aksi Moderasi */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/70">
                  {review.status === "pending" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => onApprove(review)}
                        disabled={isActionLoading}
                        className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {isActionLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        <span>✓ Setujui</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenRejectModal(review)}
                        disabled={isActionLoading}
                        className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-xl border border-rose-200 dark:border-rose-800/50 transition-all flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>✕ Tolak</span>
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onOpenDeleteModal(review)}
                      className="py-2 px-3 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus Permanen</span>
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
