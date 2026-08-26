import type { Metadata, Viewport } from "next";
import { Roboto_Slab } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { DesktopHeader } from "@/components/layout/DesktopHeader";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Footer } from "@/components/layout/Footer";
import { MarketplaceJsonLd } from "@/components/seo/MarketplaceJsonLd";

const robotoSlab = Roboto_Slab({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-roboto-slab",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#093c96" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "Mas Chan Digital - Marketplace Lokal Kota Serang",
    template: "%s | Mas Chan Digital",
  },
  description:
    "Pusat belanja produk, oleh-oleh khas, dan jasa UMKM lokal Kota Serang. Transaksi langsung via WhatsApp dan link affiliasi resmi tanpa payment gateway.",
  metadataBase: new URL("https://maschandigital.id"),
  keywords: [
    "Marketplace Serang",
    "UMKM Kota Serang",
    "Kuliner Serang",
    "Sate Bandeng Serang",
    "Madu Akasia Serang",
    "Batik Banten",
    "Mas Chan Digital",
  ],
  authors: [
    { name: "Chandra Anggara Diputra", url: "https://maschandigital.id" },
  ],
  creator: "Chandra Anggara Diputra",
  publisher: "Mas Chan Digital",
  openGraph: {
    title: "Mas Chan Digital - Marketplace Lokal Kota Serang",
    description:
      "Beli madu akasia, sate bandeng, batik Banten, dan aneka produk lokal langsung ke WhatsApp vendor tanpa potongan biaya.",
    url: "https://maschandigital.id",
    siteName: "Mas Chan Digital",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/mas-chan-digital.webp",
        width: 1200,
        height: 630,
        alt: "Mas Chan Digital - Direktori & Marketplace UMKM Kota Serang",
        type: "image/webp",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mas Chan Digital - Marketplace Lokal Kota Serang",
    description:
      "Beli produk UMKM lokal Serang langsung via WhatsApp tanpa perantara.",
    images: ["/mas-chan-digital.webp"],
    creator: "@maschandigital",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning className={robotoSlab.variable}>
      <head></head>
      <body className="flex flex-col bg-surface-light dark:bg-surface-dark min-h-screen font-sans antialiased transition-colors duration-200">
        <MarketplaceJsonLd />
        <ThemeProvider>
          {/* Aksesibilitas: Skip Link */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:top-4 focus:left-4 focus:z-50 focus:absolute focus:bg-brand-800 focus:shadow-lg focus:px-4 focus:py-2 focus:rounded-xl focus:outline-none focus:text-white"
          >
            Lewati ke konten utama
          </a>

          {/* Desktop Header */}
          <DesktopHeader />

          {/* Main Content Area */}
          <main
            id="main-content"
            tabIndex={-1}
            className="flex-1 focus:outline-none w-full"
          >
            {children}
          </main>

          {/* Footer */}
          <Footer />

          {/* Mobile Bottom Navigation */}
          <MobileBottomNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
