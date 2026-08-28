"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Download, X, Share, PlusSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

// Deklarasi Type-Safe resmi tanpa menggunakan 'any'
declare global {
  interface Navigator {
    standalone?: boolean;
  }
  interface Window {
    MSStream?: unknown;
  }
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Cek apakah website sudah dijalankan dalam mode standalone (aplikasi terpasang)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    if (isStandalone) return;

    // 2. Cek apakah pengguna sudah pernah menutup banner dalam 7 hari terakhir
    const dismissedAt = localStorage.getItem("maschan_pwa_dismissed_at");
    if (dismissedAt) {
      const daysSinceDismissed =
        (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        return; // Jangan ganggu pengguna jika baru saja ditutup
      }
    }

    // 3. Deteksi perangkat iOS (Safari) secara type-safe
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !window.MSStream;

    // 4. Tangkap event beforeinstallprompt pada Chromium (Android/Chrome/Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsIOS(false);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 5. Jika perangkat iOS, tampilkan panduan Add to Home Screen via timer asinkron
    let iosTimer: NodeJS.Timeout | undefined;
    if (isIosDevice) {
      iosTimer = setTimeout(() => {
        setIsIOS(true);
        setShowBanner(true);
      }, 3000);
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      if (iosTimer) clearTimeout(iosTimer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;

    if (choiceResult.outcome === "accepted") {
      setShowBanner(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("maschan_pwa_dismissed_at", Date.now().toString());
  };

  if (!showBanner) {
    return null;
  }

  // ... sisa JSX ke bawah tetap sama persis ...

  return (
    <aside
      aria-label="Pasang Aplikasi Mas Chan Digital"
      className="right-4 md:right-6 bottom-20 slide-in-from-bottom-5 md:bottom-6 left-4 md:left-auto z-50 fixed md:max-w-md animate-in duration-300 fade-in"
    >
      <div className="relative bg-white dark:bg-surface-darkCard shadow-modal backdrop-blur-xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 rounded-3xl overflow-hidden">
        {/* Accent Background Glow */}
        <div className="top-0 right-0 absolute bg-brand-500/10 blur-2xl rounded-full w-32 h-32 pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="top-3.5 right-3.5 absolute hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
          aria-label="Tutup notifikasi pasang aplikasi"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5">
          {/* App Icon */}
          <div className="flex justify-center items-center bg-brand-900 shadow-subtle border border-white/20 rounded-2xl w-12 h-12 overflow-hidden shrink-0">
            <Image
              src="/mas-chan-digital.webp"
              alt="Logo Mas Chan Digital"
              width={48}
              height={48}
              className="object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <Sparkles className="absolute w-6 h-6 text-brand-300" />
          </div>

          <div className="flex-1 space-y-1 pr-4">
            <div className="flex items-center gap-1.5">
              <h3 className="font-slab font-bold text-slate-900 dark:text-white text-sm">
                Pasang Mas Chan Digital
              </h3>
              <span className="bg-brand-100 dark:bg-brand-950 px-1.5 py-0.5 rounded-md font-bold text-[10px] text-brand-800 dark:text-brand-300">
                PWA Gratis
              </span>
            </div>

            <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
              Akses cepat tanpa download file besar. Belanja & kelola toko UMKM
              langsung dari layar utama HP Anda.
            </p>

            {/* Panduan Khusus iOS (Safari) */}
            {isIOS ? (
              <div className="space-y-1 mt-2 pt-2 border-slate-100 dark:border-slate-800 border-t text-[11px] text-slate-500 dark:text-slate-400">
                <p className="flex items-center gap-1 font-medium">
                  <span>1. Ketuk tombol Bagikan</span>
                  <Share className="inline w-3.5 h-3.5 text-brand-600" />
                  <span>di bawah Safari</span>
                </p>
                <p className="flex items-center gap-1 font-medium">
                  <span>2. Pilih</span>
                  <strong className="text-slate-700 dark:text-slate-200">
                    &quot;Add to Home Screen&quot;
                  </strong>
                  <PlusSquare className="inline w-3.5 h-3.5 text-brand-600" />
                </p>
              </div>
            ) : (
              /* Tombol Pasang Khusus Android / Windows / Chrome */
              <div className="flex items-center gap-2 pt-2">
                <Button
                  onClick={handleInstallClick}
                  size="sm"
                  variant="primary"
                  className="flex items-center gap-1.5 shadow-xs rounded-xl font-bold text-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Pasang Sekarang</span>
                </Button>
                <Button
                  onClick={handleDismiss}
                  size="sm"
                  variant="ghost"
                  className="rounded-xl font-semibold text-slate-500 hover:text-slate-700 text-xs"
                >
                  Nanti Saja
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
