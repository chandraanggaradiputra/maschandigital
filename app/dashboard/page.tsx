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
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getMyVendorProducts, getVendorBySlug } from "@/lib/api/wordpress";
import { getVendorSession } from "@/lib/api/auth";
import { Product, Vendor } from "@/types";

export default function DashboardSummaryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [vendorData, setVendorData] = useState<Partial<Vendor> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      setIsLoading(true);
      try {
        const session = getVendorSession();
        if (session && session.user) {
          // Ambil produk HANYA milik vendor yang sedang login
          const myProducts = await getMyVendorProducts();
          setProducts(myProducts);

          // Ambil detail vendor terkini
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
        } else {
          setProducts([]);
        }
      } catch (err) {
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

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
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
            Kelola katalog produk Anda, terima pesanan pelanggan langsung ke
            WhatsApp, dan tingkatkan visibilitas di Google.
          </p>
          <div className="flex gap-2.5 pt-2">
            <Link href="/dashboard/products/new">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white hover:bg-slate-100 font-bold text-brand-900"
              >
                <PlusCircle className="mr-1.5 w-4 h-4" aria-hidden="true" />
                <span>Tambah Produk Baru</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <section
        aria-label="Statistik Toko"
        className="gap-4 grid grid-cols-1 sm:grid-cols-3"
      >
        <article className="flex justify-between items-center bg-white dark:bg-surface-darkCard shadow-subtle p-5 border border-slate-200/80 dark:border-slate-800 rounded-3xl">
          <div>
            <span className="font-medium text-slate-500 dark:text-slate-400 text-xs">
              Total Produk Anda
            </span>
            <p className="mt-1 font-slab font-black text-slate-900 dark:text-white text-2xl">
              {products.length}
            </p>
          </div>
          <div className="flex justify-center items-center bg-brand-50 dark:bg-brand-950/80 rounded-2xl w-10 h-10 text-brand-700 dark:text-brand-400">
            <Package className="w-5 h-5" aria-hidden="true" />
          </div>
        </article>

        <article className="flex justify-between items-center bg-white dark:bg-surface-darkCard shadow-subtle p-5 border border-slate-200/80 dark:border-slate-800 rounded-3xl">
          <div>
            <span className="font-medium text-slate-500 dark:text-slate-400 text-xs">
              WhatsApp Pesanan
            </span>
            <p className="mt-1 max-w-[150px] font-bold text-whatsapp-500 text-sm truncate">
              {whatsappNum !== "Belum diatur" ? `+${whatsappNum}` : whatsappNum}
            </p>
          </div>
          <div className="flex justify-center items-center bg-whatsapp-50 dark:bg-whatsapp-950/80 rounded-2xl w-10 h-10 text-whatsapp-500">
            <MessageCircle className="w-5 h-5" aria-hidden="true" />
          </div>
        </article>

        <article className="flex justify-between items-center bg-white dark:bg-surface-darkCard shadow-subtle p-5 border border-slate-200/80 dark:border-slate-800 rounded-3xl">
          <div>
            <span className="font-medium text-slate-500 dark:text-slate-400 text-xs">
              Status Toko Serang
            </span>
            <p className="flex items-center gap-1 mt-1 font-bold text-emerald-600 dark:text-emerald-400 text-sm">
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
              <span>Terverifikasi</span>
            </p>
          </div>
          <div className="flex justify-center items-center bg-emerald-50 dark:bg-emerald-950/80 rounded-2xl w-10 h-10 text-emerald-600">
            <Store className="w-5 h-5" aria-hidden="true" />
          </div>
        </article>
      </section>

      {/* Recent Products */}
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
            {products.slice(0, 5).map((p) => (
              <div
                key={p.id}
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
