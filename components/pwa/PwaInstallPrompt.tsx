"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Download, X, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 1. Handler event 'beforeinstallprompt' dari browser (Asinkron & Bebas Cascading Render)
    const handleBeforeInstallPrompt = (e: Event) => {
      // Cek apakah aplikasi sudah berjalan dalam mode PWA Standalone (sudah terpasang)
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone ===
          true;

      if (isStandalone) return;

      // Cek apakah user pernah menutup banner ini dalam 7 hari terakhir
      const dismissedUntil = localStorage.getItem(
        "maschan_pwa_dismissed_until",
      );
      if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
        return;
      }

      // Tahan prompt default browser dan simpan event untuk tombol kustom kita
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    // 2. Handler ketika PWA sukses dipasang
    const handleAppInstalled = () => {
      setIsVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback untuk browser yang belum trigger event (misal iOS Safari)
      alert(
        'Untuk memasang di HP Anda:\n1. Tekan tombol menu titik tiga (⋮) atau tombol Share (iOS Safari).\n2. Pilih menu "Tambahkan ke Layar Utama" atau "Pasang Aplikasi".',
      );
      return;
    }

    // Tampilkan dialog resmi bawaan Android / Chrome
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === "accepted") {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Sembunyikan selama 7 hari agar tidak mengganggu pengunjung
    localStorage.setItem(
      "maschan_pwa_dismissed_until",
      String(Date.now() + 7 * 24 * 60 * 60 * 1000),
    );
  };

  if (!isVisible) {
    return null;
  }

  return (
    <aside
      aria-label="Pemberitahuan Pasang Aplikasi"
      className="right-4 md:right-6 bottom-20 slide-in-from-bottom-5 md:bottom-6 left-4 md:left-auto z-50 fixed md:max-w-md animate-in duration-300 fade-in"
    >
      <div className="flex items-start gap-3.5 bg-white dark:bg-surface-darkCard shadow-2xl backdrop-blur-xl p-4 border border-slate-200/80 dark:border-slate-800 rounded-3xl">
        <div className="relative flex justify-center items-center bg-brand-900 shadow-xs border border-brand-700 rounded-2xl w-12 h-12 overflow-hidden shrink-0">
          <Image
            src="/icon-192.png"
            alt="Logo Mas Chan Digital"
            width={48}
            height={48}
            className="object-cover"
          />
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex justify-between items-center gap-2">
            <h3 className="flex items-center gap-1.5 font-slab font-bold text-slate-900 dark:text-white text-sm">
              <Smartphone className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span>Pasang Mas Chan Digital</span>
            </h3>
            <button
              type="button"
              onClick={handleDismiss}
              className="hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              aria-label="Tutup pemberitahuan pasang aplikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
            Akses marketplace lokal Kota Serang lebih cepat dan hemat kuota
            langsung dari layar utama HP Anda.
          </p>

          <div className="flex items-center gap-2 pt-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 shadow-xs px-3 py-1.5 h-auto font-bold text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Pasang Sekarang</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="px-2.5 py-1.5 h-auto text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 dark:text-slate-400 text-xs"
            >
              Nanti Saja
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
