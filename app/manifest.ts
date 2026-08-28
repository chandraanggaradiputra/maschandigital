import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mas Chan Digital - Marketplace Lokal Kota Serang",
    short_name: "Mas Chan Digital",
    description:
      "Pusat belanja produk, kuliner khas Banten, madu akasia asli, batik Banten, dan jasa UMKM lokal Kota Serang. Transaksi langsung via WhatsApp tanpa potongan biaya.",
    start_url: "/",
    display: "standalone",
    background_color: "#093c96",
    theme_color: "#093c96",
    orientation: "portrait-primary",
    scope: "/",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    categories: ["shopping", "business", "lifestyle"],
    lang: "id",
    dir: "ltr",
    shortcuts: [
      {
        name: "Katalog Produk",
        short_name: "Produk",
        description: "Jelajahi katalog produk UMKM Kota Serang",
        url: "/products",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Daftar Toko Vendor",
        short_name: "Vendor",
        description: "Lihat direktori toko lokal Kota Serang",
        url: "/vendors",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Dashboard Vendor",
        short_name: "Dashboard",
        description: "Kelola produk dan profil toko Anda",
        url: "/dashboard",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
