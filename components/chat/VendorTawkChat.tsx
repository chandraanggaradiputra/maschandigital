"use client";

import { useEffect, useRef } from "react";

// Tawk.to tidak punya API resmi untuk "ganti properti saat runtime" (script
// embed-nya didesain untuk situs multi-halaman biasa, dimuat sekali per page
// load — bukan untuk SPA yang berpindah vendor tanpa reload). Jadi satu-satunya
// cara yang benar-benar bekerja: bersihkan total elemen DOM + state global
// yang disuntikkan Tawk.to sebelumnya, baru suntik script baru.
//
// Ini agak rapuh karena mengandalkan struktur internal Tawk.to yang tidak
// didokumentasikan resmi (id/class elemen bisa berubah kalau Tawk.to update
// widget mereka) — makanya SELALU dites ulang manual kalau ada laporan widget
// tidak muncul/dobel setelah ini berjalan lama tanpa masalah.

declare global {
  interface Window {
    Tawk_API?: Record<string, unknown>;
    Tawk_LoadStart?: Date;
  }
}

function removeExistingTawkWidget() {
  if (typeof window === "undefined") return;

  // Hapus semua node yang disuntikkan Tawk.to ke DOM (script tag + iframe
  // widget). Tawk.to selalu menandai elemen-elemennya dengan id/atribut yang
  // mengandung "tawk" — dicari secara longgar (bukan satu id pasti) supaya
  // tetap menangkap variasi versi widget yang berbeda.
  document
    .querySelectorAll(
      '[id*="tawk" i], [class*="tawk" i], script[src*="tawk.to" i]',
    )
    .forEach((el) => el.remove());

  // Hapus state global Tawk.to supaya script baru benar-benar inisialisasi
  // dari nol, bukan mengira sudah pernah dimuat.
  delete window.Tawk_API;
  delete window.Tawk_LoadStart;
}

function injectTawkWidget(propertyId: string, widgetId: string) {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  window.Tawk_API = window.Tawk_API || {};
  window.Tawk_LoadStart = new Date();

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
  script.charset = "UTF-8";
  script.setAttribute("crossorigin", "*");
  script.setAttribute("data-maschan-tawk", "true"); // penanda untuk cleanup selanjutnya

  document.body.appendChild(script);
}

export interface VendorTawkChatProps {
  enabled: boolean;
  propertyId: string;
  widgetId: string;
}

/**
 * Live chat Tawk.to per-vendor. SENGAJA dipasang langsung di halaman
 * produk/toko (bukan di root layout) — supaya lifecycle-nya otomatis benar:
 * - Pindah ke Beranda/halaman lain → komponen ini tidak pernah dirender di
 *   sana → cleanup jalan otomatis lewat useEffect return, tanpa perlu deteksi
 *   route manual.
 * - Pindah dari Toko A ke Toko B (props propertyId/widgetId berubah) →
 *   dependency array useEffect otomatis mendeteksi & jalankan cleanup+init.
 *
 * Kalau vendor tidak isi Tawk.to (enabled: false), komponen ini SENGAJA
 * tidak merender/memuat apa pun — "Zero Silent Fallback": tidak pernah diam-
 * diam menampilkan chat admin/vendor lain sebagai pengganti.
 */
export function VendorTawkChat({
  enabled,
  propertyId,
  widgetId,
}: VendorTawkChatProps) {
  // Lacak kombinasi property+widget yang SEDANG dimuat, supaya effect tidak
  // membersihkan lalu memuat ulang widget yang SAMA kalau parent re-render
  // tanpa perubahan data (mis. karena state lain di halaman berubah).
  const loadedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || !propertyId || !widgetId) {
      // Tidak ada kredensial valid — pastikan tidak ada widget lama yang
      // tersisa (mis. dari vendor sebelumnya) sebelum berhenti di sini.
      if (loadedKeyRef.current !== null) {
        removeExistingTawkWidget();
        loadedKeyRef.current = null;
      }
      return;
    }

    const key = `${propertyId}:${widgetId}`;
    if (loadedKeyRef.current === key) return; // sudah termuat, tidak perlu ulang

    removeExistingTawkWidget();
    injectTawkWidget(propertyId, widgetId);
    loadedKeyRef.current = key;

    return () => {
      removeExistingTawkWidget();
      loadedKeyRef.current = null;
    };
  }, [enabled, propertyId, widgetId]);

  // Tidak ada elemen visual yang dirender React sendiri — widget-nya
  // sepenuhnya dikelola Tawk.to lewat DOM manipulation di atas.
  return null;
}
