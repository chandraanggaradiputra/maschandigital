"use client";

import React, { useState, useEffect, useCallback, useId } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Star,
  CreditCard,
  Package,
  Store,
  Settings,
  RefreshCw,
  Lock,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { getVendorSession } from "@/lib/api/auth";
import {
  getAdminReviews,
  performReviewAction,
  getProducts,
  deleteProduct,
  getAdminVendors,
  getSiteSettings,
} from "@/lib/api/wordpress";
import {
  getAdminInvoices,
  approveAdminInvoice,
  rejectAdminInvoice,
} from "@/lib/api/billing";
import {
  AdminReviewItem,
  AdminBillingInvoice,
  Product,
  AdminVendorItem,
  SiteSettings,
} from "@/types";

import { AdminReviewsTab } from "@/components/admin/AdminReviewsTab";
import { AdminBillingTab } from "@/components/admin/AdminBillingTab";
import { AdminProductsTab } from "@/components/admin/AdminProductsTab";
import { AdminVendorsTab } from "@/components/admin/AdminVendorsTab";
import { AdminSettingsTab } from "@/components/admin/AdminSettingsTab";

type MainTab = "reviews" | "billing" | "products" | "vendors" | "settings";

export default function AdminModerasiPage() {
  const router = useRouter();
  const rejectReviewModalId = useId();
  const rejectInvoiceModalId = useId();

  const [token, setToken] = useState<string>("");
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [activeMainTab, setActiveMainTab] = useState<MainTab>("reviews");

  // Tab 1: Reviews State
  const [reviewSubTab, setReviewSubTab] = useState<"pending" | "approved">("pending");
  const [reviews, setReviews] = useState<AdminReviewItem[]>([]);
  const [pendingReviewsCount, setPendingReviewsCount] = useState<number>(0);
  const [reviewsLoading, setReviewsLoading] = useState<boolean>(true);
  const [rejectingReview, setRejectingReview] = useState<AdminReviewItem | null>(null);
  const [rejectReviewReason, setRejectReviewReason] = useState<string>("");
  const [deletingReview, setDeletingReview] = useState<AdminReviewItem | null>(null);
  const [isDeletingReview, setIsDeletingReview] = useState<boolean>(false);

  // Tab 2: Billing Invoices State
  const [billingSubTab, setBillingSubTab] = useState<"waiting_approval" | "all" | "approved">("waiting_approval");
  const [invoices, setInvoices] = useState<AdminBillingInvoice[]>([]);
  const [pendingBillingCount, setPendingBillingCount] = useState<number>(0);
  const [billingLoading, setBillingLoading] = useState<boolean>(false);
  const [rejectingInvoice, setRejectingInvoice] = useState<AdminBillingInvoice | null>(null);
  const [rejectInvoiceReason, setRejectInvoiceReason] = useState<string>("");

  // Tab 3: Products State
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState<boolean>(false);

  // Tab 4: Vendors State
  const [vendors, setVendors] = useState<AdminVendorItem[]>([]);
  const [vendorsLoading, setVendorsLoading] = useState<boolean>(false);

  // Tab 5: Settings State
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState<boolean>(false);

  // Action loading & Universal Modals
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const showToast = (type: "success" | "error", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // 1. Fetch Reviews
  const fetchReviewsData = useCallback(async (authToken: string, status: string) => {
    setReviewsLoading(true);
    try {
      const res = await getAdminReviews(authToken, status);
      setPendingReviewsCount(res.pending_count);
      setReviews(res.reviews);
    } catch {
      showToast("error", "Gagal memuat ulasan. Periksa koneksi server.");
    } finally {
      setReviewsLoading(false);
    }
  }, []);

  // 2. Fetch Invoices
  const fetchInvoicesData = useCallback(async (authToken: string, status: string) => {
    setBillingLoading(true);
    try {
      const res = await getAdminInvoices(authToken, status);
      setPendingBillingCount(res.pending_count);
      setInvoices(res.invoices);
    } catch {
      showToast("error", "Gagal memuat data tagihan.");
    } finally {
      setBillingLoading(false);
    }
  }, []);

  // 3. Fetch Products
  const fetchProductsData = useCallback(async () => {
    setProductsLoading(true);
    try {
      const prods = await getProducts();
      setProducts(prods);
    } catch {
      showToast("error", "Gagal memuat katalog produk.");
    } finally {
      setProductsLoading(false);
    }
  }, []);

  // 4. Fetch Vendors
  const fetchVendorsData = useCallback(async (authToken: string) => {
    setVendorsLoading(true);
    try {
      const vends = await getAdminVendors(authToken);
      setVendors(vends);
    } catch {
      showToast("error", "Gagal memuat direktori vendor.");
    } finally {
      setVendorsLoading(false);
    }
  }, []);

  // 5. Fetch Settings
  const fetchSettingsData = useCallback(async () => {
    setSettingsLoading(true);
    try {
      const sett = await getSiteSettings();
      setSettings(sett);
    } catch {
      showToast("error", "Gagal memuat pengaturan bisnis.");
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  // Inisialisasi Autentikasi Admin & Fetch Data Awal
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
        setReviewsLoading(false);
        return;
      }

      setToken(session.token);
      setIsAuthorized(true);

      // Fetch tab ulasan default dan invoice count untuk header badge
      fetchReviewsData(session.token, reviewSubTab);
      getAdminInvoices(session.token, "waiting_approval").then((res) => {
        if (isMounted) setPendingBillingCount(res.pending_count);
      }).catch(() => {});
    };

    initAuthAndFetch();

    return () => {
      isMounted = false;
    };
  }, [fetchReviewsData, reviewSubTab]);

  // Handle Perubahan Main Tab (Lazy Data Fetching)
  const handleMainTabSwitch = (tab: MainTab) => {
    setActiveMainTab(tab);
    if (!token) return;

    if (tab === "reviews" && reviews.length === 0) {
      fetchReviewsData(token, reviewSubTab);
    } else if (tab === "billing") {
      fetchInvoicesData(token, billingSubTab);
    } else if (tab === "products" && products.length === 0) {
      fetchProductsData();
    } else if (tab === "vendors" && vendors.length === 0) {
      fetchVendorsData(token);
    } else if (tab === "settings" && !settings) {
      fetchSettingsData();
    }
  };

  // Tombol Refresh Global
  const handleGlobalRefresh = () => {
    if (!token) return;
    if (activeMainTab === "reviews") fetchReviewsData(token, reviewSubTab);
    else if (activeMainTab === "billing") fetchInvoicesData(token, billingSubTab);
    else if (activeMainTab === "products") fetchProductsData();
    else if (activeMainTab === "vendors") fetchVendorsData(token);
    else if (activeMainTab === "settings") fetchSettingsData();
  };

  // === HANDLERS TAB 1: ULASAN ===
  const handleApproveReview = async (review: AdminReviewItem) => {
    if (!token) return;
    setActionLoadingId(review.id);
    try {
      const res = await performReviewAction(token, review.id, "approve");
      if (res.success) {
        showToast("success", `Ulasan oleh ${review.author_name} telah disetujui!`);
        fetch("/api/web-push/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetRole: "vendor",
            title: "✅ Testimoni Telah Disetujui!",
            body: `Testimoni untuk produk "${review.product_name}" telah diverifikasi dan resmi tayang di website.`,
            url: `/products/${review.product_slug}`,
          }),
        }).catch(() => {});
        setReviews((prev) => prev.filter((r) => r.id !== review.id));
        setPendingReviewsCount((prev) => Math.max(0, prev - 1));
      } else {
        showToast("error", res.message || "Gagal menyetujui ulasan.");
      }
    } catch {
      showToast("error", "Terjadi kesalahan jaringan.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmRejectReview = async () => {
    if (!token || !rejectingReview) return;
    setActionLoadingId(rejectingReview.id);
    try {
      const res = await performReviewAction(
        token,
        rejectingReview.id,
        "reject",
        rejectReviewReason.trim()
      );
      if (res.success) {
        showToast("success", `Ulasan oleh ${rejectingReview.author_name} telah ditolak.`);
        setReviews((prev) => prev.filter((r) => r.id !== rejectingReview.id));
        if (rejectingReview.status === "pending") {
          setPendingReviewsCount((prev) => Math.max(0, prev - 1));
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

  const handleConfirmDeleteReview = async () => {
    if (!deletingReview || !token) return;
    setIsDeletingReview(true);
    try {
      const res = await performReviewAction(token, deletingReview.id, "delete");
      if (res.success) {
        showToast("success", `Testimoni berhasil dihapus permanen.`);
        setReviews((prev) => prev.filter((r) => r.id !== deletingReview.id));
        if (deletingReview.status === "pending") {
          setPendingReviewsCount((prev) => Math.max(0, prev - 1));
        }
        setDeletingReview(null);
      } else {
        showToast("error", res.message || "Gagal menghapus testimoni.");
      }
    } catch {
      showToast("error", "Terjadi kesalahan jaringan.");
    } finally {
      setIsDeletingReview(false);
    }
  };

  // === HANDLERS TAB 2: BILLING INVOICES ===
  const handleApproveBilling = async (inv: AdminBillingInvoice) => {
    if (!token) return;
    setActionLoadingId(inv.id);
    try {
      const res = await approveAdminInvoice(token, inv.id);
      if (res.success) {
        showToast("success", `Pembayaran paket ${inv.store_name} (${inv.invoice_number}) disetujui!`);
        fetch("/api/web-push/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetRole: "vendor",
            title: "🎉 Pembayaran Paket Telah Diverifikasi!",
            body: `Pembayaran ${inv.plan_name || "paket"} toko Anda telah disetujui Admin. Masa aktif telah diperpanjang!`,
            url: `/dashboard/billing`,
          }),
        }).catch(() => {});
        setInvoices((prev) => prev.filter((i) => i.id !== inv.id));
        setPendingBillingCount((prev) => Math.max(0, prev - 1));
      } else {
        showToast("error", res.message || "Gagal menyetujui pembayaran tagihan.");
      }
    } catch {
      showToast("error", "Terjadi kesalahan jaringan.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmRejectBilling = async () => {
    if (!token || !rejectingInvoice) return;
    setActionLoadingId(rejectingInvoice.id);
    try {
      const res = await rejectAdminInvoice(
        token,
        rejectingInvoice.id,
        rejectInvoiceReason.trim()
      );
      if (res.success) {
        showToast("success", `Tagihan ${rejectingInvoice.invoice_number} berhasil ditolak.`);
        setInvoices((prev) => prev.filter((i) => i.id !== rejectingInvoice.id));
        setPendingBillingCount((prev) => Math.max(0, prev - 1));
        setRejectingInvoice(null);
      } else {
        showToast("error", res.message || "Gagal menolak tagihan.");
      }
    } catch {
      showToast("error", "Terjadi kesalahan jaringan.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // === HANDLERS TAB 3: PRODUCTS ===
  const handleDeleteProduct = async (productId: number, productName: string): Promise<boolean> => {
    try {
      const ok = await deleteProduct(productId);
      if (ok) {
        showToast("success", `Produk "${productName}" berhasil di-takedown dari platform.`);
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        return true;
      }
      showToast("error", "Gagal menghapus produk dari server.");
      return false;
    } catch {
      showToast("error", "Terjadi kesalahan saat menghapus produk.");
      return false;
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
            Halaman pusat kendali ini hanya dapat diakses oleh akun Super Administrator Mas Chan Digital.
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

  const isAnyLoading = reviewsLoading || billingLoading || productsLoading || vendorsLoading || settingsLoading;

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

      {/* Header Sticky Mobile Command Center */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-20 backdrop-blur-md bg-white/90 dark:bg-slate-900/90">
        <div className="max-w-3xl mx-auto px-4 py-3.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-brand-800/10 dark:bg-brand-800/20 text-brand-800 dark:text-blue-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h1 className="font-slab font-bold text-base sm:text-lg text-slate-900 dark:text-white truncate">
                  Pusat Kendali Admin
                </h1>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  Super Admin Mobile Command Center • Kota Serang
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Tombol Segarkan */}
              <button
                type="button"
                onClick={handleGlobalRefresh}
                disabled={isAnyLoading}
                aria-label="Segarkan data saat ini"
                className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isAnyLoading ? "animate-spin" : ""}`}
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>

          {/* Navigasi Tab Segmented Horizontal (Ramah Jempol) */}
          <nav aria-label="Menu Pusat Kendali" className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => handleMainTabSwitch("reviews")}
              className={`py-2 px-3 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                activeMainTab === "reviews"
                  ? "bg-brand-800 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 hover:bg-slate-200/60"
              }`}
            >
              <Star className="w-3.5 h-3.5" />
              <span>Ulasan</span>
              {pendingReviewsCount > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                    activeMainTab === "reviews"
                      ? "bg-white text-brand-800"
                      : "bg-rose-500 text-white animate-pulse"
                  }`}
                >
                  {pendingReviewsCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleMainTabSwitch("billing")}
              className={`py-2 px-3 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                activeMainTab === "billing"
                  ? "bg-brand-800 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 hover:bg-slate-200/60"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Pembayaran Paket</span>
              {pendingBillingCount > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                    activeMainTab === "billing"
                      ? "bg-white text-brand-800"
                      : "bg-rose-500 text-white animate-pulse"
                  }`}
                >
                  {pendingBillingCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleMainTabSwitch("products")}
              className={`py-2 px-3 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                activeMainTab === "products"
                  ? "bg-brand-800 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 hover:bg-slate-200/60"
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Seluruh Produk</span>
            </button>

            <button
              type="button"
              onClick={() => handleMainTabSwitch("vendors")}
              className={`py-2 px-3 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                activeMainTab === "vendors"
                  ? "bg-brand-800 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 hover:bg-slate-200/60"
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Direktori Vendor</span>
            </button>

            <button
              type="button"
              onClick={() => handleMainTabSwitch("settings")}
              className={`py-2 px-3 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                activeMainTab === "settings"
                  ? "bg-brand-800 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 hover:bg-slate-200/60"
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Pengaturan</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Konten Tab Aktif */}
      <div className="max-w-3xl mx-auto px-4 py-4">
        {activeMainTab === "reviews" && (
          <AdminReviewsTab
            reviews={reviews}
            pendingCount={pendingReviewsCount}
            isLoading={reviewsLoading}
            activeSubTab={reviewSubTab}
            onSubTabChange={(sub) => {
              setReviewSubTab(sub);
              if (token) fetchReviewsData(token, sub);
            }}
            onApprove={handleApproveReview}
            onOpenRejectModal={(r) => {
              setRejectingReview(r);
              setRejectReviewReason("");
            }}
            onOpenDeleteModal={(r) => setDeletingReview(r)}
            actionLoadingId={actionLoadingId}
            onZoomImage={(url) => setZoomedImage(url)}
            onRefresh={() => token && fetchReviewsData(token, reviewSubTab)}
          />
        )}

        {activeMainTab === "billing" && (
          <AdminBillingTab
            invoices={invoices}
            pendingCount={pendingBillingCount}
            isLoading={billingLoading}
            activeSubTab={billingSubTab}
            onSubTabChange={(sub) => {
              setBillingSubTab(sub);
              if (token) fetchInvoicesData(token, sub);
            }}
            onApprove={handleApproveBilling}
            onOpenRejectModal={(inv) => {
              setRejectingInvoice(inv);
              setRejectInvoiceReason("");
            }}
            actionLoadingId={actionLoadingId}
            onZoomImage={(url) => setZoomedImage(url)}
            onRefresh={() => token && fetchInvoicesData(token, billingSubTab)}
          />
        )}

        {activeMainTab === "products" && (
          <AdminProductsTab
            products={products}
            isLoading={productsLoading}
            onDeleteProduct={handleDeleteProduct}
            onRefresh={fetchProductsData}
          />
        )}

        {activeMainTab === "vendors" && (
          <AdminVendorsTab
            vendors={vendors}
            isLoading={vendorsLoading}
            onRefresh={() => token && fetchVendorsData(token)}
          />
        )}

        {activeMainTab === "settings" && (
          <AdminSettingsTab
            settings={settings}
            isLoading={settingsLoading}
            onRefresh={fetchSettingsData}
          />
        )}
      </div>

      {/* Modal Universal: Lightbox Zoom Foto (Ulasan & Struk Transfer) */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setZoomedImage(null)}
        >
          <div
            className="relative max-w-2xl w-full max-h-[85vh] flex flex-col items-center justify-center p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setZoomedImage(null)}
              className="absolute -top-10 right-0 p-2 text-white/80 hover:text-white rounded-full transition-colors"
              aria-label="Tutup foto"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="relative w-full h-[70vh] rounded-2xl overflow-hidden shadow-2xl bg-black">
              <Image
                src={zoomedImage}
                alt="Foto bukti"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 800px"
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal Penolakan Ulasan */}
      {rejectingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-slab font-bold text-base text-slate-900 dark:text-white">
                Tolak Testimoni Pembeli
              </h3>
              <button
                type="button"
                onClick={() => setRejectingReview(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Tuliskan alasan penolakan testimoni dari &ldquo;{rejectingReview.author_name}&rdquo;.
            </p>

            <div className="space-y-1">
              <label htmlFor={rejectReviewModalId} className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">
                Alasan Penolakan:
              </label>
              <textarea
                id={rejectReviewModalId}
                value={rejectReviewReason}
                onChange={(e) => setRejectReviewReason(e.target.value)}
                placeholder="Contoh: Mengandung kata tidak pantas, foto tidak relevan..."
                rows={3}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-800"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingReview(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmRejectReview}
                disabled={actionLoadingId === rejectingReview.id}
                className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {actionLoadingId === rejectingReview.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <X className="w-4 h-4" />
                )}
                <span>Konfirmasi Tolak</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Penolakan Pembayaran Tagihan Paket */}
      {rejectingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-slab font-bold text-base text-slate-900 dark:text-white">
                Tolak Bukti Pembayaran
              </h3>
              <button
                type="button"
                onClick={() => setRejectingInvoice(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Tolak tagihan <strong className="text-slate-800 dark:text-slate-200">{rejectingInvoice.invoice_number}</strong> ({rejectingInvoice.store_name}). Vendor akan menerima notifikasi untuk mengunggah ulang bukti bayar yang benar.
            </p>

            <div className="space-y-1">
              <label htmlFor={rejectInvoiceModalId} className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">
                Alasan Penolakan:
              </label>
              <textarea
                id={rejectInvoiceModalId}
                value={rejectInvoiceReason}
                onChange={(e) => setRejectInvoiceReason(e.target.value)}
                placeholder="Contoh: Nominal transfer tidak sesuai kode unik, foto struk buram/tidak terbaca..."
                rows={3}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-800"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingInvoice(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmRejectBilling}
                disabled={actionLoadingId === rejectingInvoice.id}
                className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {actionLoadingId === rejectingInvoice.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <X className="w-4 h-4" />
                )}
                <span>Konfirmasi Tolak</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Hapus Permanen Ulasan */}
      {deletingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-slab font-bold text-base text-slate-900 dark:text-white">
                Hapus Testimoni Permanen?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Ulasan dari &ldquo;<strong className="text-slate-700 dark:text-slate-300">{deletingReview.author_name}</strong>&rdquo; akan dihapus permanen dari database.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingReview(null)}
                disabled={isDeletingReview}
                className="flex-1 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteReview}
                disabled={isDeletingReview}
                className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isDeletingReview ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                <span>Ya, Hapus</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
