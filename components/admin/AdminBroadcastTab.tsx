"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Radio,
  Send,
  RefreshCw,
  Sparkles,
  Smartphone,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BellRing,
} from "lucide-react";
import {
  getPushSubscriberStats,
  sendBroadcastNotification,
} from "@/lib/actions/push";
import { BroadcastNotificationResult } from "@/types";

interface PresetTemplate {
  label: string;
  title: string;
  body: string;
  url: string;
}

const PRESET_TEMPLATES: PresetTemplate[] = [
  {
    label: "🍯 Promo Madu Akasia",
    title: "Diskon Spesial Madu Akasia Serang!",
    body: "Dapatkan potongan harga 15% khusus hari ini untuk pembelian madu akasia murni UMKM Serang. Pesan sekarang sebelum kehabisan!",
    url: "/products",
  },
  {
    label: "🍢 Kuliner Akhir Pekan",
    title: "Promo Kuliner Khas Akhir Pekan!",
    body: "Nikmati aneka hidangan khas Serang langsung dari UMKM lokal dengan gratis ongkir via WhatsApp.",
    url: "/products?category=kuliner",
  },
  {
    label: "✨ Produk Baru UMKM",
    title: "Ada Produk Baru Masuk di Mas Chan Digital!",
    body: "Lihat koleksi terbaru UMKM Kota Serang. Belanja langsung tanpa perantara sekarang juga!",
    url: "/products?sort=newest",
  },
];

export function AdminBroadcastTab() {
  // State Metrik
  const [totalSubscribers, setTotalSubscribers] = useState<number>(0);
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(true);

  // State Formulir
  const [title, setTitle] = useState<string>("Diskon Spesial Madu Akasia Serang!");
  const [body, setBody] = useState<string>(
    "Dapatkan potongan harga 15% khusus hari ini untuk pembelian produk UMKM lokal Serang. Pesan sekarang sebelum kehabisan!"
  );
  const [targetUrl, setTargetUrl] = useState<string>("https://maschandigital.id/products");

  // State Pratinjau OS
  const [previewOS, setPreviewOS] = useState<"android" | "ios">("android");

  // State Pengiriman
  const [isSending, setIsSending] = useState<boolean>(false);
  const [broadcastResult, setBroadcastResult] = useState<BroadcastNotificationResult | null>(null);

  // Fetch asinkron saat komponen dimuat (anti cascading render)
  useEffect(() => {
    let isMounted = true;
    getPushSubscriberStats()
      .then((stats) => {
        if (isMounted) {
          setTotalSubscribers(stats.total);
          setIsLoadingStats(false);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          console.error("[Broadcast Tab] Gagal mengambil metrik:", err);
          setIsLoadingStats(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Ambil ulang statistik pelanggan saat tombol refresh manual ditekan
  const fetchSubscriberStats = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      const stats = await getPushSubscriberStats();
      setTotalSubscribers(stats.total);
    } catch (err: unknown) {
      console.error("[Broadcast Tab] Gagal mengambil metrik:", err);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  // Handle Preset Template
  const applyPreset = (preset: PresetTemplate) => {
    setTitle(preset.title);
    setBody(preset.body);
    setTargetUrl(preset.url);
    setBroadcastResult(null);
  };

  // Handle Kirim Broadcast
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    const confirmSend = window.confirm(
      `Yakin ingin menyiarkan pesan promo ini ke ${totalSubscribers} perangkat pelanggan terdaftar?`
    );
    if (!confirmSend) return;

    setIsSending(true);
    setBroadcastResult(null);

    try {
      const result = await sendBroadcastNotification({
        title: title.trim(),
        body: body.trim(),
        url: targetUrl.trim() || "/",
      });

      setBroadcastResult(result);
      // Perbarui metrik karena mungkin ada endpoint kadaluwarsa yang diprune
      fetchSubscriberStats();
    } catch {
      setBroadcastResult({
        success: false,
        message: "Terjadi gangguan saat memproses siaran notifikasi.",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section aria-labelledby="broadcast-heading" className="space-y-6">
      {/* Kartu Ringkasan Metrik Pelanggan */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-brand-800/10 dark:bg-brand-800/20 text-brand-800 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Radio className="w-6 h-6 animate-pulse" aria-hidden="true" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Basis Pelanggan Aktif
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="font-slab font-black text-2xl sm:text-3xl text-slate-900 dark:text-white">
                  {isLoadingStats ? "..." : totalSubscribers}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
                  Perangkat Terdaftar
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchSubscriberStats}
            disabled={isLoadingStats}
            className="self-start sm:self-center inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isLoadingStats ? "animate-spin" : ""}`}
            />
            <span>Segarkan Data</span>
          </button>
        </div>
      </div>

      {/* Banner Notifikasi Feedback Hasil Kirim */}
      {broadcastResult && (
        <div
          role="alert"
          className={`p-4 rounded-2xl border flex items-start gap-3 animate-in fade-in duration-200 ${
            broadcastResult.success
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
              : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200"
          }`}
        >
          {broadcastResult.success ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="text-xs sm:text-sm">
            <p className="font-bold">
              {broadcastResult.success
                ? "Siaran Berhasil Dikirim!"
                : "Pengiriman Gagal"}
            </p>
            <p className="mt-0.5 opacity-90">{broadcastResult.message}</p>
          </div>
        </div>
      )}

      {/* Konten Utama: 2 Kolom (Formulir & Pratinjau Smartphone) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kolom Kiri: Formulir Siaran Promo (7 Kolom) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <BellRing className="w-4 h-4 text-brand-800 dark:text-blue-400" />
              <h2
                id="broadcast-heading"
                className="font-slab font-bold text-base text-slate-900 dark:text-white"
              >
                Susun Pesan Broadcast Promo
              </h2>
            </div>
          </div>

          {/* Tombol Preset Cepat */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Gunakan Template Cepat:
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESET_TEMPLATES.map((preset, idx) => (
                <button
                  key={`preset-${idx}`}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-colors text-left"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSendBroadcast} className="space-y-4">
            {/* Input 1: Judul Notifikasi */}
            <div className="space-y-1.5">
              <label
                htmlFor="broadcast-title"
                className="block text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Judul Notifikasi Promo <span className="text-rose-500">*</span>
              </label>
              <input
                id="broadcast-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Diskon Spesial Madu Akasia Serang!"
                required
                maxLength={65}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-800"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Muncul tebal di baris pertama notifikasi HP</span>
                <span>{title.length}/65</span>
              </div>
            </div>

            {/* Input 2: Pesan / Body Promo */}
            <div className="space-y-1.5">
              <label
                htmlFor="broadcast-body"
                className="block text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Isi Pesan Promo <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="broadcast-body"
                rows={4}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Tuliskan deskripsi penawaran, potongan diskon, atau ajakan belanja..."
                required
                maxLength={180}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-800"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Rekomendasi 1-2 kalimat padat dan menarik</span>
                <span>{body.length}/180</span>
              </div>
            </div>

            {/* Input 3: URL Tujuan Saat Diklik */}
            <div className="space-y-1.5">
              <label
                htmlFor="broadcast-url"
                className="block text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Tautan Halaman Tujuan (Target URL)
              </label>
              <div className="relative">
                <input
                  id="broadcast-url"
                  type="text"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://maschandigital.id/products atau /katalog"
                  className="w-full pl-3.5 pr-8 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-800"
                />
                <ExternalLink className="w-4 h-4 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
              </div>
              <p className="text-[11px] text-slate-400">
                Otomatis terbuka saat pelanggan mengetuk notifikasi di HP.
              </p>
            </div>

            {/* Tombol Aksi Siarkan */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={
                  isSending ||
                  totalSubscribers === 0 ||
                  !title.trim() ||
                  !body.trim()
                }
                className="w-full py-3 px-5 bg-[#093c96] hover:bg-blue-800 active:scale-98 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyiarkan ke Seluruh Pelanggan...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>
                      Kirim Broadcast Promo ke Semua Pelanggan ({totalSubscribers})
                    </span>
                  </>
                )}
              </button>
              {totalSubscribers === 0 && (
                <p className="text-center text-[11px] text-amber-600 dark:text-amber-400 mt-2">
                  Belum ada pelanggan yang mengaktifkan izin notifikasi. Ajak pembeli mengklik lonceng notifikasi di katalog produk.
                </p>
              )}
            </div>
          </form>
        </div>

        {/* Kolom Kanan: Live Mobile Preview / Mockup Smartphone (5 Kolom) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-slate-500" />
                <h3 className="font-slab font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  Live Mobile Preview
                </h3>
              </div>

              {/* Toggle Gaya OS */}
              <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setPreviewOS("android")}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    previewOS === "android"
                      ? "bg-white dark:bg-slate-700 text-brand-800 dark:text-blue-400 shadow-xs"
                      : "text-slate-500"
                  }`}
                >
                  Android
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewOS("ios")}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    previewOS === "ios"
                      ? "bg-white dark:bg-slate-700 text-brand-800 dark:text-blue-400 shadow-xs"
                      : "text-slate-500"
                  }`}
                >
                  iOS (PWA)
                </button>
              </div>
            </div>

            {/* Rangka Smartphone Layar Preview */}
            <div className="relative mx-auto max-w-[310px] bg-slate-950 rounded-3xl p-3 border-4 border-slate-800 shadow-2xl">
              {/* Status Bar Smartphone */}
              <div className="flex justify-between items-center text-[10px] text-slate-400 px-2 pb-3 font-mono">
                <span>09:41</span>
                <div className="flex items-center gap-1.5">
                  <span>5G</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Wallpaper Background Dummy */}
              <div className="relative rounded-2xl bg-gradient-to-b from-blue-900/40 via-indigo-950/80 to-slate-950 p-2.5 min-h-[260px] flex flex-col justify-start">
                <div className="text-center text-[10px] text-slate-400/80 pb-2">
                  Layar Kunci Perangkat
                </div>

                {/* KARTU NOTIFIKASI PUSH NATIVE */}
                {previewOS === "android" ? (
                  // Mockup Gaya Material Android
                  <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 text-white rounded-2xl p-3.5 shadow-xl animate-in fade-in duration-200">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-5 h-5 rounded-md bg-white p-0.5 shrink-0 flex items-center justify-center">
                          <Image
                            src="/logo.png"
                            alt="Logo Mas Chan Digital"
                            width={16}
                            height={16}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-300 truncate">
                          Mas Chan Digital
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        sekarang
                      </span>
                    </div>

                    <p className="text-xs font-bold text-white leading-tight">
                      {title.trim() || "Judul Notifikasi Promo"}
                    </p>
                    <p className="text-[11px] text-slate-300 mt-1 leading-snug line-clamp-3">
                      {body.trim() || "Isi pesan notifikasi akan tampil di sini..."}
                    </p>

                    {targetUrl && (
                      <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center gap-1 text-[10px] text-blue-400 font-medium truncate">
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        <span className="truncate">{targetUrl}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  // Mockup Gaya iOS Notification Center
                  <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/20 dark:border-slate-700/80 text-slate-900 dark:text-white rounded-2xl p-3.5 shadow-xl animate-in fade-in duration-200">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-5 h-5 rounded-md bg-white p-0.5 shrink-0 shadow-xs flex items-center justify-center">
                          <Image
                            src="/logo.png"
                            alt="Logo Mas Chan Digital"
                            width={16}
                            height={16}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <span className="text-[11px] font-bold tracking-tight text-slate-800 dark:text-slate-200 uppercase">
                          Mas Chan Digital
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        BARU SAJA
                      </span>
                    </div>

                    <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      {title.trim() || "Judul Notifikasi Promo"}
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-snug line-clamp-3">
                      {body.trim() || "Isi pesan notifikasi akan tampil di sini..."}
                    </p>

                    {targetUrl && (
                      <div className="mt-2 text-[10px] text-brand-800 dark:text-blue-400 font-semibold truncate flex items-center gap-1">
                        <span>Buka tautan</span> &rarr;
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-auto pt-3 text-center">
                  <div className="inline-block w-24 h-1 rounded-full bg-slate-700/70" />
                </div>
              </div>
            </div>

            <p className="text-center text-[11px] text-slate-400 mt-3">
              Pratinjau tampilan notifikasi saat diterima di smartphone pelanggan.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
