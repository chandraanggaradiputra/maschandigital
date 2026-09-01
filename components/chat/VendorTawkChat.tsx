// "use client";

// import { useEffect, useRef } from "react";

// // Tawk.to tidak punya API resmi untuk "ganti properti saat runtime" (script
// // embed-nya didesain untuk situs multi-halaman biasa, dimuat sekali per page
// // load — bukan untuk SPA yang berpindah vendor tanpa reload). Jadi satu-satunya
// // cara yang benar-benar bekerja: bersihkan total elemen DOM + state global
// // yang disuntikkan Tawk.to sebelumnya, baru suntik script baru.
// //
// // Ini agak rapuh karena mengandalkan struktur internal Tawk.to yang tidak
// // didokumentasikan resmi (id/class elemen bisa berubah kalau Tawk.to update
// // widget mereka) — makanya SELALU dites ulang manual kalau ada laporan widget
// // tidak muncul/dobel setelah ini berjalan lama tanpa masalah.

// declare global {
//   interface Window {
//     Tawk_API?: Record<string, unknown>;
//     Tawk_LoadStart?: Date;
//   }
// }

// function removeExistingTawkWidget() {
//   if (typeof window === "undefined") return;

//   // Hapus semua node yang disuntikkan Tawk.to ke DOM (script tag + iframe
//   // widget). Tawk.to selalu menandai elemen-elemennya dengan id/atribut yang
//   // mengandung "tawk" — dicari secara longgar (bukan satu id pasti) supaya
//   // tetap menangkap variasi versi widget yang berbeda.
//   document
//     .querySelectorAll(
//       '[id*="tawk" i], [class*="tawk" i], script[src*="tawk.to" i]',
//     )
//     .forEach((el) => el.remove());

//   // Hapus state global Tawk.to supaya script baru benar-benar inisialisasi
//   // dari nol, bukan mengira sudah pernah dimuat.
//   delete window.Tawk_API;
//   delete window.Tawk_LoadStart;
// }

// function injectTawkWidget(propertyId: string, widgetId: string) {
//   if (typeof window === "undefined" || typeof document === "undefined") return;

//   window.Tawk_API = window.Tawk_API || {};
//   window.Tawk_LoadStart = new Date();

//   const script = document.createElement("script");
//   script.async = true;
//   script.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
//   script.charset = "UTF-8";
//   script.setAttribute("crossorigin", "*");
//   script.setAttribute("data-maschan-tawk", "true"); // penanda untuk cleanup selanjutnya

//   document.body.appendChild(script);
// }

// export interface VendorTawkChatProps {
//   enabled: boolean;
//   propertyId: string;
//   widgetId: string;
// }

// /**
//  * Live chat Tawk.to per-vendor. SENGAJA dipasang langsung di halaman
//  * produk/toko (bukan di root layout) — supaya lifecycle-nya otomatis benar:
//  * - Pindah ke Beranda/halaman lain → komponen ini tidak pernah dirender di
//  *   sana → cleanup jalan otomatis lewat useEffect return, tanpa perlu deteksi
//  *   route manual.
//  * - Pindah dari Toko A ke Toko B (props propertyId/widgetId berubah) →
//  *   dependency array useEffect otomatis mendeteksi & jalankan cleanup+init.
//  *
//  * Kalau vendor tidak isi Tawk.to (enabled: false), komponen ini SENGAJA
//  * tidak merender/memuat apa pun — "Zero Silent Fallback": tidak pernah diam-
//  * diam menampilkan chat admin/vendor lain sebagai pengganti.
//  */
// export function VendorTawkChat({
//   enabled,
//   propertyId,
//   widgetId,
// }: VendorTawkChatProps) {
//   // Lacak kombinasi property+widget yang SEDANG dimuat, supaya effect tidak
//   // membersihkan lalu memuat ulang widget yang SAMA kalau parent re-render
//   // tanpa perubahan data (mis. karena state lain di halaman berubah).
//   const loadedKeyRef = useRef<string | null>(null);

//   useEffect(() => {
//     if (!enabled || !propertyId || !widgetId) {
//       // Tidak ada kredensial valid — pastikan tidak ada widget lama yang
//       // tersisa (mis. dari vendor sebelumnya) sebelum berhenti di sini.
//       if (loadedKeyRef.current !== null) {
//         removeExistingTawkWidget();
//         loadedKeyRef.current = null;
//       }
//       return;
//     }

//     const key = `${propertyId}:${widgetId}`;
//     if (loadedKeyRef.current === key) return; // sudah termuat, tidak perlu ulang

//     removeExistingTawkWidget();
//     injectTawkWidget(propertyId, widgetId);
//     loadedKeyRef.current = key;

//     return () => {
//       removeExistingTawkWidget();
//       loadedKeyRef.current = null;
//     };
//   }, [enabled, propertyId, widgetId]);

//   // Tidak ada elemen visual yang dirender React sendiri — widget-nya
//   // sepenuhnya dikelola Tawk.to lewat DOM manipulation di atas.
//   return null;
// }
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    Tawk_API?: {
      hideWidget?: () => void;
      showWidget?: () => void;
      shutdown?: () => void;
      onLoad?: () => void;
      isChatHidden?: () => boolean;
      disableTitleNotification?: boolean;
      [key: string]: unknown;
    };
    Tawk_LoadStart?: Date;
    __maschan_current_tawk_key?: string;
  }
}

/**
 * Menyembunyikan widget Tawk.to secara visual & instan di halaman publik (0ms delay)
 */
export function hideTawkWidget() {
  if (typeof window === "undefined") return;

  try {
    if (window.Tawk_API && typeof window.Tawk_API.hideWidget === "function") {
      window.Tawk_API.hideWidget();
    }
  } catch {}

  // Tambahkan CSS injector untuk menjamin container iframe tawk 100% lenyap dari layar di halaman publik
  let styleEl = document.getElementById("maschan-tawk-hide-style");
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = "maschan-tawk-hide-style";
    styleEl.innerHTML = `
      #tawk-script-element,
      #tawk-bubble-container,
      .tawk-min-container,
      .tawk-chat-panel,
      iframe[src*="tawk.to" i],
      iframe[title*="chat" i],
      div[style*="z-index: 2147483647"],
      div[style*="z-index:2147483647"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
    `;
    document.head.appendChild(styleEl);
  }
}

/**
 * Menampilkan kembali widget Tawk.to secara seketika saat masuk ke halaman produk / toko vendor
 */
export function showTawkWidget() {
  if (typeof window === "undefined") return;

  // Hapus CSS penyembunyi
  const styleEl = document.getElementById("maschan-tawk-hide-style");
  if (styleEl) {
    styleEl.remove();
  }

  try {
    if (window.Tawk_API && typeof window.Tawk_API.showWidget === "function") {
      window.Tawk_API.showWidget();
    }
  } catch {}
}

/**
 * Pembersihan total DOM (hanya dieksekusi saat berganti vendor ID yang berbeda)
 */
export function purgeTawkDOM() {
  if (typeof window === "undefined") return;

  hideTawkWidget();

  try {
    if (window.Tawk_API?.shutdown) {
      window.Tawk_API.shutdown();
    }
  } catch {}

  const selectors = [
    "#tawk-script-element",
    'script[src*="tawk.to" i]',
    'iframe[src*="tawk.to" i]',
    'iframe[title*="chat" i]',
    "#tawk-bubble-container",
    ".tawk-min-container",
    ".tawk-chat-panel",
    'div[style*="z-index: 2147483647"]',
    'div[style*="z-index:2147483647"]',
  ];

  try {
    document
      .querySelectorAll(selectors.join(", "))
      .forEach((el) => el.remove());
  } catch {}

  try {
    delete window.Tawk_API;
    delete window.Tawk_LoadStart;
    delete window.__maschan_current_tawk_key;
  } catch {
    window.Tawk_API = undefined;
    window.Tawk_LoadStart = undefined;
    window.__maschan_current_tawk_key = undefined;
  }
}

function injectTawkScript(propertyId: string, widgetId: string) {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  window.Tawk_API = window.Tawk_API || {};
  window.Tawk_LoadStart = new Date();

  window.Tawk_API.onLoad = function () {
    showTawkWidget();
  };
  window.Tawk_API.disableTitleNotification = true;

  const script = document.createElement("script");
  script.id = "tawk-script-element";
  script.async = true;
  script.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
  script.charset = "UTF-8";
  script.setAttribute("crossorigin", "*");
  script.setAttribute("data-maschan-tawk", "true");

  document.body.appendChild(script);
  window.__maschan_current_tawk_key = `${propertyId}:${widgetId}`;
}

export interface VendorTawkChatProps {
  enabled: boolean;
  propertyId: string;
  widgetId: string;
}

export function VendorTawkChat({
  enabled,
  propertyId,
  widgetId,
}: VendorTawkChatProps) {
  const pathname = usePathname();

  useEffect(() => {
    // 1. Jika fitur tidak aktif atau ID tidak ada
    if (!enabled || !propertyId || !widgetId) {
      hideTawkWidget();
      return;
    }

    const targetKey = `${propertyId}:${widgetId}`;
    const currentKey = window.__maschan_current_tawk_key;

    // 2. Jika widget untuk vendor yang SAMA sudah ada di memori browser
    if (currentKey === targetKey) {
      showTawkWidget();
      return;
    }

    // 3. Jika berganti ke vendor BARU yang berbeda ID
    if (currentKey && currentKey !== targetKey) {
      purgeTawkDOM();
    }

    // 4. Inject script vendor baru
    injectTawkScript(propertyId, widgetId);
    showTawkWidget();

    // 5. Cleanup saat unmount dari halaman produk/vendor
    return () => {
      hideTawkWidget();
    };
  }, [enabled, propertyId, widgetId, pathname]);

  return null;
}
