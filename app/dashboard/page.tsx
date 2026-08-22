"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  PlusCircle,
  Store,
  MessageCircle,
  CheckCircle2,
  Sparkles,
  Loader2,
  AlertTriangle,
  Clock,
  XCircle,
  CreditCard,
  ArrowRight,
  AlertOctagon,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getMyVendorProducts, getVendorBySlug } from "@/lib/api/wordpress";
import { getBillingInfo } from "@/lib/api/billing";
import { getVendorSession } from "@/lib/api/auth";
import { Product, Vendor, VendorSubscription } from "@/types";

export default function DashboardSummaryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [vendorData, setVendorData] = useState<Partial<Vendor> | null>(null);
  const [subscription, setSubscription] = useState<VendorSubscription | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      setIsLoading(true);
      try {
        const session = getVendorSession();
        if (session && session.user) {
          // 1. Ambil data produk khusus vendor yang sedang login
          const myProducts = await getMyVendorProducts();
          setProducts(myProducts);

          // 2. Ambil detail profil vendor
          const currentV = await getVendorBySlug(
            session.user.slug || String(session.user.id),
          );
          if (currentV) {
            setVendorData(currentV);
          } else {
            setVendorData({
              store_name: session.user.store_name,
              whatsapp_number: session.user.phone,
              location_district: session.user.district,
            });
          }

          // 3. Ambil data langganan & masa aktif vendor
          const billingData = await getBillingInfo();
          if (billingData && billingData.subscription) {
            setSubscription(billingData.subscription);
          }
        } else {
          setProducts([]);
        }
      } catch (err: unknown) {
        console.error("Gagal memuat ringkasan toko:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center gap-2 p-12 text-slate-500 text-center">
        <Loader2 className="w-6 h-6 text-brand-700 dark:text-brand-400 animate-spin" />
        <span className="font-semibold text-xs">
          Memuat ringkasan toko Anda...
        </span>
      </div>
    );
  }

  const storeName = vendorData?.store_name || "Toko Anda";
  const whatsappNum = vendorData?.whatsapp_number || "Belum diatur";

  // Perhitungan Sisa Hari Masa Aktif
  let daysLeft = 0;
  let formattedEndDate = "";
  if (subscription?.end_date) {
    const endTs = new Date(subscription.end_date).getTime();
    const nowTs = new Date().getTime();
    daysLeft = Math.max(0, Math.ceil((endTs - nowTs) / (1000 * 60 * 60 * 24)));
    formattedEndDate = new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(subscription.end_date));
  }

  return (
    <div className="space-y-6">
      {/* 1. DYNAMIC SUBSCRIPTION STATUS REMINDER BANNERS */}
      {subscription && subscription.plan_id !== "exempt" && (
        <>
          {/* A. Status: Pembayaran Ditolak Admin */}
          {subscription.status === "payment_rejected" && (
            <aside
              aria-label="Peringatan Pembayaran Ditolak"
              className="flex sm:flex-row flex-col justify-between items-start sm:items-center gap-4 bg-rose-50 dark:bg-rose-950/40 shadow-subtle p-5 border border-rose-200 dark:border-rose-800 rounded-3xl text-rose-900 dark:text-rose-200"
            >
              <div className="flex items-start gap-3.5">
                <div className="flex justify-center items-center bg-rose-100 dark:bg-rose-900/60 rounded-2xl w-10 h-10 text-rose-600 dark:text-rose-300 shrink-0">
                  <XCircle className="w-5 h-5" aria-hidden="true" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="font-slab font-bold text-rose-800 dark:text-rose-300 text-sm">
                    Konfirmasi Pembayaran Tagihan Ditolak
                  </h3>
                  <p className="text-rose-700/90 dark:text-rose-400 text-xs">
                    Bukti transfer yang diunggah tidak valid, ditolak oleh
                    Admin, atau dana belum masuk. Silakan periksa kembali.
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/billing"
                className="w-full sm:w-auto shrink-0"
              >
                <Button
                  variant="danger"
                  size="sm"
                  className="w-full sm:w-auto font-bold text-xs"
                >
                  <span>Unggah Ulang Bukti Bayar</span>
                  <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
                </Button>
              </Link>
            </aside>
          )}

          {/* B. Status: Menunggu Verifikasi Admin (Grace Protection Window Aktif) */}
          {subscription.status === "pending_approval" && (
            <aside
              aria-label="Status Verifikasi Pembayaran"
              className="flex sm:flex-row flex-col justify-between items-start sm:items-center gap-4 bg-cyan-50 dark:bg-cyan-950/40 shadow-subtle p-5 border border-cyan-200 dark:border-cyan-800 rounded-3xl text-cyan-900 dark:text-cyan-200"
            >
              <div className="flex items-start gap-3.5">
                <div className="flex justify-center items-center bg-cyan-100 dark:bg-cyan-900/60 rounded-2xl w-10 h-10 text-cyan-600 dark:text-cyan-300 shrink-0">
                  <Clock className="w-5 h-5" aria-hidden="true" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="font-slab font-bold text-cyan-800 dark:text-cyan-300 text-sm">
                    Konfirmasi Pembayaran Sedang Diverifikasi Admin
                  </h3>
                  <p className="text-cyan-700/90 dark:text-cyan-400 text-xs">
                    Bukti transfer Anda telah diterima.{" "}
                    <strong>Toko Anda tetap aktif di halaman publik</strong>{" "}
                    selama masa verifikasi.
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/billing"
                className="w-full sm:w-auto shrink-0"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:bg-cyan-100 dark:hover:bg-cyan-900/40 border-cyan-300 dark:border-cyan-700 w-full sm:w-auto font-bold text-cyan-800 dark:text-cyan-200 text-xs"
                >
                  <span>Lihat Status Tagihan</span>
                </Button>
              </Link>
            </aside>
          )}

          {/* C. Status: Renewal Due (Masa Aktif Tersisa <= 7 Hari).
              Sumber utama: subscription.status === 'renewal_due' dari backend (cron harian).
              Kondisi daysLeft cuma jaring pengaman untuk celah maks. 24 jam sebelum cron
              berikutnya jalan — sengaja dibatasi HANYA untuk status 'active' (bukan
              exclude-list seperti sebelumnya) supaya tidak tumpang tindih dengan status
              lain yang punya banner sendiri (grace_period, pending_approval, dst). */}
          {(subscription.status === "renewal_due" ||
            (subscription.status === "active" &&
              daysLeft > 0 &&
              daysLeft <= 7)) && (
            <aside
              aria-label="Pengingat Masa Aktif Segera Berakhir"
              className="flex sm:flex-row flex-col justify-between items-start sm:items-center gap-4 bg-amber-50 dark:bg-amber-950/40 shadow-subtle p-5 border border-amber-200 dark:border-amber-800 rounded-3xl text-amber-900 dark:text-amber-200"
            >
              <div className="flex items-start gap-3.5">
                <div className="flex justify-center items-center bg-amber-100 dark:bg-amber-900/60 rounded-2xl w-10 h-10 text-amber-600 dark:text-amber-300 shrink-0">
                  <AlertTriangle className="w-5 h-5" aria-hidden="true" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="font-slab font-bold text-amber-800 dark:text-amber-300 text-sm">
                    Masa Aktif Toko Tersisa {daysLeft} Hari Lagi
                  </h3>
                  <p className="text-amber-700/90 dark:text-amber-400 text-xs">
                    Paket <strong>{subscription.plan_name}</strong> Anda akan
                    berakhir pada <strong>{formattedEndDate}</strong>. Lakukan
                    perpanjangan agar kuota produk tidak turun ke Paket Starter
                    UMKM (maks. 3 produk).
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/billing"
                className="w-full sm:w-auto shrink-0"
              >
                <Button
                  variant="primary"
                  size="sm"
                  className="bg-amber-600 hover:bg-amber-700 w-full sm:w-auto font-bold text-white text-xs"
                >
                  <span>Perpanjang Paket</span>
                  <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
                </Button>
              </Link>
            </aside>
          )}

          {/* D. Status: Grace Period (Lewat Jatuh Tempo - Masa Tenggang 3 Hari) */}
          {subscription.status === "grace_period" && (
            <aside
              aria-label="Peringatan Masa Tenggang"
              className="flex sm:flex-row flex-col justify-between items-start sm:items-center gap-4 bg-rose-50 dark:bg-rose-950/40 shadow-subtle p-5 border border-rose-300 dark:border-rose-800 rounded-3xl text-rose-900 dark:text-rose-200"
            >
              <div className="flex items-start gap-3.5">
                <div className="flex justify-center items-center bg-rose-100 dark:bg-rose-900/60 rounded-2xl w-10 h-10 text-rose-600 dark:text-rose-300 shrink-0">
                  <AlertOctagon className="w-5 h-5" aria-hidden="true" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="font-slab font-bold text-rose-800 dark:text-rose-300 text-sm">
                    Masa Aktif Habis (Masa Tenggang Toleransi)
                  </h3>
                  <p className="text-rose-700/90 dark:text-rose-400 text-xs">
                    Masa aktif toko telah lewat jatuh tempo. Toko masih dapat
                    diakses publik sementara waktu, namun penambahan produk baru
                    diblokir.
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/billing"
                className="w-full sm:w-auto shrink-0"
              >
                <Button
                  variant="danger"
                  size="sm"
                  className="w-full sm:w-auto font-bold text-xs"
                >
                  <span>Bayar Sekarang</span>
                  <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
                </Button>
              </Link>
            </aside>
          )}

          {/* E. Status: Expired (Toko Dinonaktifkan) */}
          {subscription.status === "expired" && (
            <aside
              aria-label="Peringatan Toko Dinonaktifkan"
              className="flex sm:flex-row flex-col justify-between items-start sm:items-center gap-4 bg-slate-900 shadow-subtle p-5 border border-slate-800 rounded-3xl text-white"
            >
              <div className="flex items-start gap-3.5">
                <div className="flex justify-center items-center bg-rose-500/20 rounded-2xl w-10 h-10 text-rose-400 shrink-0">
                  <Lock className="w-5 h-5" aria-hidden="true" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="font-slab font-bold text-white text-sm">
                    Toko Sedang Dinonaktifkan (Langganan Berakhir)
                  </h3>
                  <p className="text-slate-300 text-xs">
                    Masa aktif dan masa tenggang toko telah habis. Tombol
                    WhatsApp pada seluruh produk Anda saat ini dinonaktifkan di
                    halaman publik.
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/billing"
                className="w-full sm:w-auto shrink-0"
              >
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full sm:w-auto font-bold text-xs"
                >
                  <span>Aktifkan Toko Kembali</span>
                  <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
                </Button>
              </Link>
            </aside>
          )}
        </>
      )}

      {/* 2. WELCOME BANNER */}
      <header className="relative bg-brand-gradient shadow-subtle p-6 sm:p-8 rounded-3xl overflow-hidden text-white">
        <div className="z-10 relative space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 bg-white/10 px-2.5 py-0.5 rounded-full font-semibold text-amber-300 text-xs">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Dashboard Vendor Kota Serang</span>
          </div>
          <h2 className="font-slab font-black text-xl sm:text-2xl">
            {storeName}
          </h2>
          <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
            Kelola katalog produk Anda, pantau masa aktif langganan toko, dan
            terima pesanan pelanggan langsung ke WhatsApp.
          </p>
          <div className="flex flex-wrap gap-2.5 pt-2">
            <Link href="/dashboard/products/new">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white hover:bg-slate-100 font-bold text-brand-900"
              >
                <PlusCircle className="mr-1.5 w-4 h-4" aria-hidden="true" />
                <span>Tambah Produk</span>
              </Button>
            </Link>
            <Link href="/dashboard/billing">
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-white/10 border-white/30 text-white text-xs"
              >
                <CreditCard className="mr-1.5 w-4 h-4" aria-hidden="true" />
                <span>Status Langganan</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 3. STATS CARDS */}
      <section
        aria-label="Statistik Toko"
        className="gap-4 grid grid-cols-1 sm:grid-cols-3"
      >
        {/* Card 1: Total Produk & Kuota Paket */}
        <article className="flex justify-between items-center bg-white dark:bg-surface-darkCard shadow-subtle p-5 border border-slate-200/80 dark:border-slate-800 rounded-3xl">
          <div>
            <span className="font-medium text-slate-500 dark:text-slate-400 text-xs">
              Total Produk Anda
            </span>
            <p className="mt-1 font-slab font-black text-slate-900 dark:text-white text-2xl">
              {products.length}
              {subscription && !subscription.is_unlimited && (
                <span className="ml-1.5 font-normal text-slate-400 text-xs">
                  / {subscription.max_products} kuota
                </span>
              )}
            </p>
          </div>
          <div className="flex justify-center items-center bg-brand-50 dark:bg-brand-950/80 rounded-2xl w-10 h-10 text-brand-700 dark:text-brand-400">
            <Package className="w-5 h-5" aria-hidden="true" />
          </div>
        </article>

        {/* Card 2: Paket Langganan Aktif */}
        <article className="flex justify-between items-center bg-white dark:bg-surface-darkCard shadow-subtle p-5 border border-slate-200/80 dark:border-slate-800 rounded-3xl">
          <div>
            <span className="font-medium text-slate-500 dark:text-slate-400 text-xs">
              Paket Langganan
            </span>
            <p className="mt-1 max-w-[170px] font-slab font-bold text-brand-800 dark:text-brand-400 text-sm truncate">
              {subscription?.plan_name || "Memuat..."}
            </p>
            <span className="text-[11px] text-slate-400">
              {subscription?.is_unlimited
                ? "Kuota Unlimited"
                : `${daysLeft > 0 ? `${daysLeft} hari lagi` : "Masa aktif habis"}`}
            </span>
          </div>
          <div className="flex justify-center items-center bg-brand-50 dark:bg-brand-950/80 rounded-2xl w-10 h-10 text-brand-700 dark:text-brand-400">
            <CreditCard className="w-5 h-5" aria-hidden="true" />
          </div>
        </article>

        {/* Card 3: Status Toko & WhatsApp */}
        <article className="flex justify-between items-center bg-white dark:bg-surface-darkCard shadow-subtle p-5 border border-slate-200/80 dark:border-slate-800 rounded-3xl">
          <div>
            <span className="font-medium text-slate-500 dark:text-slate-400 text-xs">
              Status Toko Serang
            </span>
            <p className="flex items-center gap-1 mt-1 font-bold text-emerald-600 dark:text-emerald-400 text-sm">
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
              <span>Terverifikasi</span>
            </p>
            <span className="block mt-0.5 max-w-[150px] text-[11px] text-whatsapp-600 dark:text-whatsapp-400 truncate">
              +{whatsappNum}
            </span>
          </div>
          <div className="flex justify-center items-center bg-emerald-50 dark:bg-emerald-950/80 rounded-2xl w-10 h-10 text-emerald-600">
            <Store className="w-5 h-5" aria-hidden="true" />
          </div>
        </article>
      </section>

      {/* 4. RECENT PRODUCTS */}
      <section
        aria-labelledby="recent-products-heading"
        className="space-y-4 bg-white dark:bg-surface-darkCard shadow-subtle p-6 border border-slate-200/80 dark:border-slate-800 rounded-3xl"
      >
        <header className="flex justify-between items-center">
          <h3
            id="recent-products-heading"
            className="font-slab font-bold text-slate-900 dark:text-white text-base"
          >
            Produk di Toko Anda ({products.length})
          </h3>
          {products.length > 0 && (
            <Link
              href="/dashboard/products"
              className="font-bold text-brand-800 dark:text-brand-400 text-xs hover:underline"
            >
              Lihat Semua
            </Link>
          )}
        </header>

        {products.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {products.slice(0, 5).map((p, idx) => (
              <div
                key={
                  p.id ? `recent-prod-${p.id}-${idx}` : `recent-prod-idx-${idx}`
                }
                className="flex justify-between items-center gap-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={
                      p.images[0]?.src ||
                      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&auto=format&fit=crop&q=80"
                    }
                    alt={p.name}
                    className="border border-slate-200 dark:border-slate-800 rounded-xl w-12 h-12 object-cover shrink-0"
                  />
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm line-clamp-1">
                      {p.name}
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      {p.type === "affiliate"
                        ? "Tautan Afiliasi"
                        : "Direct WhatsApp"}{" "}
                      • {p.categories[0]?.name || "Umum"}
                    </span>
                  </div>
                </div>

                <Link href={`/dashboard/products/${p.id}`}>
                  <Button variant="outline" size="sm" className="text-xs">
                    Edit
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3 bg-slate-50/50 dark:bg-slate-900/30 py-12 border border-slate-200 dark:border-slate-800 border-dashed rounded-2xl text-center">
            <Package className="mx-auto w-10 h-10 text-slate-300 dark:text-slate-600" />
            <div>
              <p className="font-slab font-bold text-slate-700 dark:text-slate-300 text-sm">
                Toko Anda Masih Kosong
              </p>
              <p className="mx-auto mt-0.5 max-w-sm text-slate-400 text-xs">
                Mulai tambahkan produk pertama Anda agar pembeli di Kota Serang
                dapat menemukan dan memesan via WhatsApp.
              </p>
            </div>
            <Link href="/dashboard/products/new">
              <Button
                variant="primary"
                size="sm"
                className="mt-2 font-bold text-xs"
              >
                <PlusCircle className="mr-1.5 w-3.5 h-3.5" />
                <span>Tambah Produk Pertama</span>
              </Button>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
