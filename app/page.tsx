import React from "react";
import Link from "next/link";
import {
  Search,
  Store,
  ShoppingBag,
  MapPin,
  ShieldCheck,
  MessageCircle,
  ArrowRight,
  Sparkles,
  HeartPulse,
  Shirt,
  Utensils,
  Laptop,
  Smartphone,
  Sprout,
  Users,
  CheckCircle2,
} from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { ProductCard } from "@/components/cards/ProductCard";
import { VendorCard } from "@/components/cards/VendorCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getProducts, getVendors, getCategories } from "@/lib/api/wordpress";

export default async function HomePage() {
  const products = await getProducts();
  const vendors = await getVendors();
  const categories = await getCategories();

  const featuredProducts = products.slice(0, 4);

  const categoryIcons: Record<string, React.ReactNode> = {
    "kuliner-serang": (
      <Utensils className="w-6 h-6 text-amber-500" aria-hidden="true" />
    ),
    "fashion-batik": (
      <Shirt className="w-6 h-6 text-rose-500" aria-hidden="true" />
    ),
    "herbal-madu": (
      <HeartPulse className="w-6 h-6 text-emerald-500" aria-hidden="true" />
    ),
    "jasa-digital": (
      <Laptop className="w-6 h-6 text-brand-500" aria-hidden="true" />
    ),
    "elektronik-gadget": (
      <Smartphone className="w-6 h-6 text-indigo-500" aria-hidden="true" />
    ),
    "pertanian-lokal": (
      <Sprout className="w-6 h-6 text-lime-600" aria-hidden="true" />
    ),
  };

  return (
    <div className="space-y-6 sm:space-y-10">
      {/* 1. HERO SECTION */}
      <section
        aria-labelledby="hero-title"
        className="relative bg-brand-gradient py-12 sm:py-20 lg:py-24 overflow-hidden text-white"
      >
        <div
          className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] opacity-10 pointer-events-none [background-size:16px_16px]"
          aria-hidden="true"
        />

        <div className="relative mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="space-y-6 mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 border border-white/20 rounded-full font-semibold text-xs tracking-wide">
              <Sparkles className="w-4 h-4 text-amber-300" aria-hidden="true" />
              <span>Platform Direktori & Marketplace UMKM Kota Serang</span>
            </div>

            <h1
              id="hero-title"
              className="font-slab font-black text-2xl sm:text-4xl lg:text-5xl leading-tight tracking-tight"
            >
              Dukung Produk Lokal, Transaksi Langsung ke WhatsApp Vendor
            </h1>

            <p className="font-normal text-slate-200 text-sm sm:text-base leading-relaxed">
              Temukan oleh-oleh khas Banten, madu akasia asli, kuliner
              legendaris, fashion batik, hingga jasa digital terbaik di Kota
              Serang tanpa biaya perantara.
            </p>

            {/* Quick Hero Search Box */}
            <search
              role="search"
              aria-label="Pencarian Cepat Beranda"
              className="mx-auto pt-4 max-w-2xl"
            >
              <form
                action="/vendors"
                method="GET"
                className="flex sm:flex-row flex-col gap-2.5 bg-white/95 dark:bg-slate-900/95 shadow-card-hover backdrop-blur-lg p-2 border border-white/30 rounded-2xl sm:rounded-full"
              >
                <div className="flex flex-1 items-center px-4 py-2">
                  <label htmlFor="hero-search-query" className="sr-only">
                    Kata kunci pencarian produk atau toko
                  </label>
                  <Search
                    className="mr-3 w-5 h-5 text-slate-400 shrink-0"
                    aria-hidden="true"
                  />
                  <input
                    id="hero-search-query"
                    type="search"
                    name="q"
                    placeholder="Cari produk, madu akasia, sate bandeng..."
                    className="bg-transparent outline-none w-full text-slate-800 dark:text-slate-100 text-sm placeholder-slate-400"
                  />
                </div>

                <div className="flex items-center px-4 py-2 border-slate-200 dark:border-slate-800 sm:border-l">
                  <label htmlFor="hero-district-select" className="sr-only">
                    Pilih Kecamatan di Kota Serang
                  </label>
                  <MapPin
                    className="mr-2 w-4 h-4 text-brand-600 shrink-0"
                    aria-hidden="true"
                  />
                  <select
                    id="hero-district-select"
                    name="district"
                    className="bg-transparent outline-none font-medium text-slate-700 dark:text-slate-200 text-xs cursor-pointer"
                  >
                    <option value="">Semua Kecamatan</option>
                    <option value="Serang">Kec. Serang</option>
                    <option value="Cipocok Jaya">Kec. Cipocok Jaya</option>
                    <option value="Kasemen">Kec. Kasemen</option>
                    <option value="Curug">Kec. Curug</option>
                    <option value="Taktakan">Kec. Taktakan</option>
                    <option value="Walantaka">Kec. Walantaka</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="sm:rounded-full"
                >
                  Temukan
                </Button>
              </form>
            </search>

            {/* Value Proportions Badges */}
            <ul className="flex flex-wrap justify-center items-center gap-6 sm:gap-10 m-0 p-0 pt-4 font-medium text-slate-200 text-xs list-none">
              <li className="flex items-center gap-1.5">
                <ShieldCheck
                  className="w-4 h-4 text-emerald-400"
                  aria-hidden="true"
                />
                <span>Vendor Terverifikasi</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MessageCircle
                  className="w-4 h-4 text-emerald-400"
                  aria-hidden="true"
                />
                <span>Direct Chat WhatsApp</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShoppingBag
                  className="w-4 h-4 text-amber-300"
                  aria-hidden="true"
                />
                <span>Bebas Biaya Gateway</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 2. KATEGORI PILIHAN */}
      <SectionContainer
        aria-labelledby="kategori-heading"
        className="py-6 sm:py-10"
      >
        <header className="flex justify-between items-center mb-6 sm:mb-8">
          <div>
            <h2
              id="kategori-heading"
              className="font-slab font-bold text-slate-900 dark:text-white text-xl sm:text-2xl"
            >
              Kategori Produk Serang
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
              Jelajahi berbagai sektor usaha unggulan di Kota Serang
            </p>
          </div>
          <Link
            href="/vendors"
            className="inline-flex items-center gap-1 focus-visible:outline-none font-semibold text-brand-800 dark:text-brand-400 text-xs sm:text-sm hover:underline focus-visible:underline"
          >
            Lihat Semua
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </header>

        <ul className="gap-3 sm:gap-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 m-0 p-0 list-none">
          {categories.map((cat) => (
            <li key={cat.id}>
              <Link
                href={`/vendors?category=${cat.slug}`}
                className="group flex flex-col items-center bg-white dark:bg-surface-darkCard shadow-subtle hover:shadow-card-hover p-4 border border-slate-200/80 dark:border-slate-800 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 text-center transition-all duration-200"
                aria-label={`Kategori ${cat.name}, total ${cat.count} produk`}
              >
                <div className="flex justify-center items-center bg-slate-50 dark:bg-slate-800 mb-3 rounded-2xl w-12 h-12 group-hover:scale-110 transition-transform">
                  {categoryIcons[cat.slug] || (
                    <ShoppingBag
                      className="w-6 h-6 text-brand-600"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <span className="font-bold text-slate-800 dark:group-hover:text-brand-400 dark:text-slate-200 group-hover:text-brand-800 text-xs sm:text-sm line-clamp-1">
                  {cat.name}
                </span>
                <span className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
                  {cat.count} Produk
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </SectionContainer>

      {/* 3. VENDOR UNGGULAN KOTA SERANG */}
      <SectionContainer
        aria-labelledby="vendor-heading"
        className="bg-slate-100/50 dark:bg-slate-900/40 py-6 sm:py-10 rounded-3xl"
      >
        <header className="flex sm:flex-row flex-col justify-between sm:items-end gap-3 mb-6 sm:mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-brand-100 dark:bg-brand-950/80 mb-2 px-2.5 py-0.5 rounded-full font-semibold text-brand-800 dark:text-brand-300 text-xs">
              <Store className="w-3.5 h-3.5" aria-hidden="true" />
              Direktori Terpercaya
            </div>
            <h2
              id="vendor-heading"
              className="font-slab font-bold text-slate-900 dark:text-white text-xl sm:text-2xl"
            >
              Vendor Unggulan Kota Serang
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
              Pelaku usaha dan toko lokal yang siap melayani pesanan Anda
            </p>
          </div>
          <Link href="/vendors">
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex"
            >
              <span>Lihat Semua Toko</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Button>
          </Link>
        </header>

        <div className="gap-4 sm:gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {vendors.slice(0, 4).map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))}
        </div>
      </SectionContainer>

      {/* 4. PRODUK PILIHAN & PROMO */}
      <SectionContainer
        aria-labelledby="products-heading"
        className="py-6 sm:py-10"
      >
        <header className="flex justify-between items-center mb-6 sm:mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-rose-100 dark:bg-rose-950/80 mb-2 px-2.5 py-0.5 rounded-full font-semibold text-rose-700 dark:text-rose-300 text-xs">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              Rekomendasi Terbaik
            </div>
            <h2
              id="products-heading"
              className="font-slab font-bold text-slate-900 dark:text-white text-xl sm:text-2xl"
            >
              Produk & Layanan Populer
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
              Pilihan produk lokal favorit dengan kontak langsung ke penjual
            </p>
          </div>
        </header>

        <div className="gap-4 sm:gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product, index) => (
            <ProductCard
              key={
                product.id
                  ? `prod-${product.id}-${product.slug}`
                  : `prod-idx-${index}`
              }
              product={product}
            />
          ))}
        </div>
      </SectionContainer>

      {/* 5. CALL TO ACTION: DAFTAR VENDOR */}
      <SectionContainer aria-labelledby="cta-heading" className="py-8 sm:py-14">
        <div className="relative bg-brand-gradient shadow-card-hover p-8 sm:p-12 lg:p-16 rounded-3xl overflow-hidden text-white">
          <div className="z-10 relative space-y-6 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 border border-white/20 rounded-full font-semibold text-amber-300 text-xs">
              <Users className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Untuk Pemilik Usaha di Kota Serang</span>
            </div>

            <h2
              id="cta-heading"
              className="font-slab font-black text-2xl sm:text-3xl lg:text-4xl leading-tight"
            >
              Punya Usaha di Kota Serang? Buka Toko Online Anda Sekarang!
            </h2>

            <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
              Daftarkan bisnis Anda di Mas Chan Digital secara mudah. Kelola
              katalog produk, pasang nomor WhatsApp toko, optimasi SEO Rank
              Math, dan terima pesanan langsung dari pelanggan tanpa potongan
              transaksi.
            </p>

            <ul className="space-y-2 m-0 p-0 text-slate-200 text-xs sm:text-sm list-none">
              <li className="flex items-center gap-2">
                <CheckCircle2
                  className="w-4 h-4 text-emerald-400 shrink-0"
                  aria-hidden="true"
                />
                <span>
                  Tanpa biaya gateway & tanpa potongan fee per pesanan
                </span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2
                  className="w-4 h-4 text-emerald-400 shrink-0"
                  aria-hidden="true"
                />
                <span>Pelanggan langsung chat ke WhatsApp Anda</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2
                  className="w-4 h-4 text-emerald-400 shrink-0"
                  aria-hidden="true"
                />
                <span>
                  Dashboard vendor mandiri & terintegrasi SEO Rank Math
                </span>
              </li>
            </ul>

            <div className="flex sm:flex-row flex-col gap-3 pt-2">
              <Link href="/vendor/register">
                <Button
                  variant="secondary"
                  size="md"
                  className="bg-white hover:bg-slate-100 shadow-md font-bold text-brand-900"
                >
                  <span>Daftar Toko Gratis</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Button>
              </Link>
              <Link href="/tentang-kami">
                <Button
                  variant="outline"
                  size="md"
                  className="hover:bg-white/10 border-white/30 text-white"
                >
                  <span>Pelajari Lebih Lanjut</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </SectionContainer>
    </div>
  );
}
