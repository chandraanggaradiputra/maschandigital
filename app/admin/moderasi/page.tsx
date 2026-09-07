"use client";

import React, { useState, useEffect, useCallback, useId } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Star,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
  ExternalLink,
  Store,
  RefreshCw,
  X,
  Lock,
  MessageSquareQuote,
  Check,
} from "lucide-react";
import { getVendorSession } from "@/lib/api/auth";
import { getAdminReviews, performReviewAction } from "@/lib/api/wordpress";
import { AdminReviewItem } from "@/types";
import { formatIndonesianDate } from "@/lib/utils";

export default function AdminModerasiPage() {
  const router = useRouter();
  const rejectModalId = useId();

  const [token, setToken] = useState<string>("");
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<"pending" | "approved">("pending");
  const [reviews, setReviews] = useState<AdminReviewItem[]>([]);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // State Modal Penolakan
  const [rejectingReview, setRejectingReview] = useState<AdminReviewItem | null>(
    null,
  );
  const [rejectReason, setRejectReason] = useState<string>("");

  const showToast = (type: "success" | "error", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Muat Data Ulasan dari REST API
  const fetchReviews = useCallback(
    async (authToken: string, status: string) => {
      setIsLoading(true);
      try {
        const res = await getAdminReviews(authToken, status);
        setPendingCount(res.pending_count);
        setReviews(res.reviews);
      } catch {
        showToast("error", "Gagal memuat ulasan. Periksa koneksi server.");
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Cek Autentikasi Admin & Muat Data
  useEffect(() => {
    let isMounted = true;

    const initAuthAndFetch = async () => {
      await Promise.resolve();
      if (!isMounted) return;

      const session = getVendorSession();
      if (
        !session ||
        !session.token ||
        (session.user.role && session.user.role !== "admin")
      ) {
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }

      setToken(session.token);
      setIsAuthorized(true);
      fetchReviews(session.token, activeTab);
    };

    initAuthAndFetch();

    return () => {
      isMounted = false;
    };
  }, [activeTab, fetchReviews]);

  // Handle Tab Switch
  const handleTabChange = (tab: "pending" | "approved") => {
    setActiveTab(tab);
    if (token) {
      fetchReviews(token, tab);
    }
  };

  // Handle Setujui Ulasan (Instant 1-Tap)
  const handleApprove = async (review: AdminReviewItem) => {
    if (!token) return;
    setActionLoadingId(review.id);

    try {
      const res = await performReviewAction(token, review.id, "approve");
      if (res.success) {
        showToast("success", `Ulasan oleh ${review.author_name} telah disetujui!`);
        // Update optimistik
        setReviews((prev) => prev.filter((r) => r.id !== review.id));
        setPendingCount((prev) => Math.max(0, prev - 1));
      } else {
        showToast("error", res.message || "Gagal menyetujui ulasan.");
      }
    } catch {
      showToast("error", "Terjadi kesalahan jaringan.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Buka Modal Penolakan
  const handleOpenRejectModal = (review: AdminReviewItem) => {
    setRejectingReview(review);
    setRejectReason("");
  };

  // Konfirmasi Tolak Ulasan
  const handleConfirmReject = async () => {
    if (!token || !rejectingReview) return;
    setActionLoadingId(rejectingReview.id);

    try {
      const res = await performReviewAction(
        token,
        rejectingReview.id,
        "reject",
        rejectReason.trim(),
      );
      if (res.success) {
        showToast(
          "success",
          `Ulasan oleh ${rejectingReview.author_name} telah ditolak.`,
        );
        // Update optimistik
        setReviews((prev) => prev.filter((r) => r.id !== rejectingReview.id));
        if (rejectingReview.status === "pending") {
          setPendingCount((prev) => Math.max(0, prev - 1));
        }
        setRejectingReview(null);
      } else {
        showToast("error", res.message || "Gagal menolak ulasan.");
      }
    } catch {
      showToast("error", "Terjadi kesalahan jaringan.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Layar Akses Terbatas (Bukan Admin)
  if (isAuthorized === false) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center">
            <Lock className="w-7 h-7" aria-hidden="true" />
          </div>
          <h1 className="font-slab font-bold text-xl text-slate-900 dark:text-white">
            Akses Terbatas Super Admin
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Halaman pusat kendali moderasi ini hanya dapat diakses oleh akun Super
            Administrator Mas Chan Digital.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => router.push("/vendor/login")}
              className="w-full py-2.5 px-4 bg-brand-800 hover:bg-brand-900 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all"
            >
              Masuk dengan Akun Admin
            </button>
            <Link
              href="/"
              className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 py-1"
            >
              Kembali ke Beranda Publik
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950/50 pb-28 md:pb-14">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="alert"
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl shadow-lg text-xs sm:text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200 ${
            toastMessage.type === "success"
              ? "bg-emerald-800 text-white"
              : "bg-rose-800 text-white"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Khusus Smartphone */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-20 backdrop-blur-md bg-white/90 dark:bg-slate-900/90">
        <div className="max-w-2xl mx-auto px-4 py-3.5 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-brand-800/10 dark:bg-brand-800/20 text-brand-800 dark:text-blue-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h1 className="font-slab font-bold text-base sm:text-lg text-slate-900 dark:text-white truncate">
                  Pusat Kendali Moderasi
                </h1>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  Super Admin • Kota Serang
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Lencana Status Pending */}
              {pendingCount > 0 ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-500 text-white text-[11px] font-bold rounded-full shadow-sm animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  <span>{pendingCount} Perlu Tindakan</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[11px] font-medium rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Semua Bersih</span>
                </span>
              )}

              {/* Tombol Refresh */}
              <button
                type="button"
                onClick={() => token && fetchReviews(token, activeTab)}
                disabled={isLoading}
                aria-label="Segarkan data ulasan"
                className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>

          {/* Tab Filter */}
          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <button
              type="button"
              onClick={() => handleTabChange("pending")}
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "pending"
                  ? "bg-brand-800 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70"
              }`}
            >
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Menunggu Verifikasi</span>
              {pendingCount > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    activeTab === "pending"
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
              onClick={() => handleTabChange("approved")}
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "approved"
                  ? "bg-brand-800 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Riwayat Disetujui</span>
            </button>
          </div>
        </div>
      </header>

      {/* Konten Daftar Ulasan */}
      <section className="max-w-2xl mx-auto px-4 py-4 space-y-3.5">
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
              {activeTab === "pending"
                ? "Tidak Ada Ulasan Pending"
                : "Belum Ada Riwayat Ulasan"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              {activeTab === "pending"
                ? "Alhamdulillah, seluruh ulasan produk dari pembeli telah diverifikasi dan disetujui."
                : "Belum ada ulasan yang disetujui dalam catatan sistem."}
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {reviews.map((review) => (
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
                      : "Pending"}
                  </span>
                </div>

                {/* Info Pengulas & Skor Bintang */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-brand-800/10 dark:bg-brand-800/20 text-brand-800 dark:text-blue-400 flex items-center justify-center font-slab font-bold text-xs shrink-0">
                      {review.author_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 block truncate">
                        {review.author_name}
                      </span>
                      <time className="text-[10px] text-slate-400 dark:text-slate-500 block">
                        {formatIndonesianDate(review.created_at)}
                      </time>
                    </div>
                  </div>

                  {/* Bintang Rating */}
                  <div
                    className="flex items-center gap-0.5 shrink-0"
                    aria-label={`Rating ${review.rating} dari 5 bintang`}
                  >
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= review.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300 dark:text-slate-700"
                        }`}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                </div>

                {/* Teks Ulasan */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed break-words">
                  &ldquo;{review.content}&rdquo;
                </div>

                {/* Tombol Aksi Jempol Bawah Kartu (1-Tap Approval) */}
                {activeTab === "pending" && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {/* Tombol Tolak (Merah) */}
                    <button
                      type="button"
                      onClick={() => handleOpenRejectModal(review)}
                      disabled={actionLoadingId === review.id}
                      className="w-full py-2.5 px-3 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                    >
                      <X className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>✕ Tolak</span>
                    </button>

                    {/* Tombol Setujui (Hijau) */}
                    <button
                      type="button"
                      onClick={() => handleApprove(review)}
                      disabled={actionLoadingId === review.id}
                      className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-1.5 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    >
                      {actionLoadingId === review.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      )}
                      <span>✓ Setujui</span>
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Modal Pop-up Input Alasan Penolakan */}
      {rejectingReview && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={rejectModalId}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-600">
                <XCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
                <h3
                  id={rejectModalId}
                  className="font-slab font-bold text-sm sm:text-base text-slate-900 dark:text-white"
                >
                  Konfirmasi Penolakan
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRejectingReview(null)}
                aria-label="Tutup form penolakan"
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Tolak testimoni dari pengulas{" "}
              <strong className="text-slate-900 dark:text-white">
                {rejectingReview.author_name}
              </strong>{" "}
              untuk produk &ldquo;{rejectingReview.product_name}&rdquo;?
            </p>

            <div className="space-y-1.5">
              <label
                htmlFor="admin-reject-reason"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Alasan Penolakan (Opsional):
              </label>
              <textarea
                id="admin-reject-reason"
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Misal: Mengandung spam, kata tidak pantas, atau ulasan tidak relevan..."
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setRejectingReview(null)}
                disabled={actionLoadingId === rejectingReview.id}
                className="w-full py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={actionLoadingId === rejectingReview.id}
                className="w-full py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1 disabled:opacity-60"
              >
                {actionLoadingId === rejectingReview.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span>Konfirmasi Tolak</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
