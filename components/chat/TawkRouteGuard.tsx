"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { hideTawkWidget } from "./VendorTawkChat";

/**
 * TawkRouteGuard (Global Route Guard di Root Layout)
 *
 * Fungsi:
 * Menjaga seluruh rute publik non-vendor (Beranda '/', '/products', '/vendors',
 * '/categories', '/panduan', '/dashboard', dll.) agar 100% BEBAS dari tampilan widget Tawk.to.
 * Begitu pengunjung berpindah rute ke halaman publik, guard ini menyembunyikan widget seketika (0ms),
 * dan saat pengunjung kembali ke halaman produk/toko, widget akan langsung tampil tanpa perlu reload.
 */
export function TawkRouteGuard() {
  const pathname = usePathname();

  useEffect(() => {
    const isSingleProduct =
      pathname.startsWith("/products/") && pathname !== "/products";
    const isSingleVendor =
      pathname.startsWith("/vendors/") && pathname !== "/vendors";

    if (!isSingleProduct && !isSingleVendor) {
      hideTawkWidget();
    }
  }, [pathname]);

  return null;
}
