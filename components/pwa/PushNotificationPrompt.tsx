"use client";

import React, { useState, useEffect } from "react";
import { Bell, Sparkles, X, CheckCircle, Loader2 } from "lucide-react";
import { subscribeUserToPush } from "@/lib/actions/push";
import { PushSubscriptionInput } from "@/types";

const FALLBACK_PUBLIC_KEY =
  "BF6Jq0LCrMgRtzRDKw-2iBEULE3x_vLrpwm080O9xCPR4RQyhexu-YHjz0ieCiMBgER5e951IKo5X733sHZ_PlI";

/**
 * Konversi kunci VAPID base64url menjadi Uint8Array untuk browser PushManager
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

interface PushNotificationPromptProps {
  className?: string;
}

export function PushNotificationPrompt({
  className = "",
}: PushNotificationPromptProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Verifikasi dukungan Web Push di peramban pengguna
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      !("Notification" in window)
    ) {
      return;
    }

    // Sembunyikan jika izin sudah diberikan atau pernah ditolak/ditutup di sesi ini
    const isDismissed = sessionStorage.getItem("mcd_promo_push_dismissed");
    if (Notification.permission === "default" && !isDismissed) {
      // Tampilkan secara halus setelah halaman dimuat (asinkron aman React 19)
      const timer = setTimeout(() => {
        setIsSupported(true);
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      // 1. Minta izin notifikasi dari browser
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setIsVisible(false);
        sessionStorage.setItem("mcd_promo_push_dismissed", "true");
        return;
      }

      // 2. Daftarkan endpoint ke Service Worker Push Manager
      const registration = await navigator.serviceWorker.ready;
      const vapidKey =
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || FALLBACK_PUBLIC_KEY;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey).buffer as ArrayBuffer,
      });

      const rawJson = subscription.toJSON();
      if (!rawJson.endpoint || !rawJson.keys?.p256dh || !rawJson.keys?.auth) {
        throw new Error("Data langganan push tidak lengkap dari browser.");
      }

      const subscriptionJson: PushSubscriptionInput = {
        endpoint: rawJson.endpoint,
        expirationTime: rawJson.expirationTime,
        keys: {
          p256dh: rawJson.keys.p256dh,
          auth: rawJson.keys.auth,
        },
      };

      // 3. Simpan data subscription melalui Server Action
      const result = await subscribeUserToPush(subscriptionJson);
      if (result.success) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsVisible(false);
        }, 3500);
      } else {
        setIsVisible(false);
      }
    } catch (err: unknown) {
      console.warn("[WebPush MCD] Gagal mengaktifkan notifikasi promo:", err);
      setIsVisible(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("mcd_promo_push_dismissed", "true");
    }
  };

  if (!isSupported || !isVisible) {
    return null;
  }

  // Notifikasi Sukses
  if (isSuccess) {
    return (
      <aside
        aria-label="Pemberitahuan Langganan Promo"
        className={`bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 text-emerald-800 dark:text-emerald-200 shadow-sm flex items-center gap-3 animate-in fade-in zoom-in-95 duration-200 ${className}`}
      >
        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0">
          <CheckCircle className="w-5 h-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-bold">
            Notifikasi Promo Berhasil Diaktifkan!
          </p>
          <p className="text-[11px] sm:text-xs text-emerald-700/80 dark:text-emerald-300/80">
            Anda akan menerima pembaruan diskon dan produk pilihan UMKM Serang langsung di layar perangkat.
          </p>
        </div>
      </aside>
    );
  }

  // Desain Varian Card / Banner
  return (
    <aside
      aria-label="Ajakan Notifikasi Promo UMKM"
      className={`relative overflow-hidden bg-gradient-to-r from-amber-500/10 via-brand-500/10 to-amber-500/10 dark:from-amber-950/30 dark:via-brand-950/30 dark:to-amber-950/30 border border-amber-300/70 dark:border-amber-700/60 rounded-2xl p-4 sm:p-5 shadow-sm transition-all animate-in fade-in slide-in-from-bottom-2 duration-300 ${className}`}
    >
      {/* Tombol Tutup / Dismiss */}
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Tutup ajakan notifikasi"
        className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-6 sm:pr-8">
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
            <Bell className="w-5 h-5 animate-bounce" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                <Sparkles className="w-3 h-3" /> Update Promo
              </span>
            </div>
            <h3 className="font-slab font-bold text-sm sm:text-base text-slate-900 dark:text-white mt-1 leading-snug">
              Ingin dapat info diskon & produk baru UMKM Kota Serang langsung di HP?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
              Dapatkan informasi promo kilat, produk unggulan, dan voucher spesial UMKM lokal langsung tanpa spam.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0">
          <button
            type="button"
            onClick={handleDismiss}
            className="px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors"
          >
            Nanti Saja
          </button>
          <button
            type="button"
            onClick={handleSubscribe}
            disabled={isLoading}
            className="px-4 py-2.5 bg-brand-800 hover:bg-brand-900 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menghubungkan...</span>
              </>
            ) : (
              <>
                <Bell className="w-4 h-4" />
                <span>Aktifkan Notifikasi Promo</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
