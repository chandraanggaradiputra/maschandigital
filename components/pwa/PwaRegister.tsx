"use client";

import { useEffect } from "react";

/**
 * Mendaftarkan Service Worker secara otomatis di browser klien.
 */
export function PwaRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log(
              "Mas Chan Digital PWA Service Worker aktif:",
              reg.scope,
            );
          })
          .catch((err) => {
            console.error("PWA Service Worker gagal mendaftar:", err);
          });
      });
    }
  }, []);

  return null;
}
