import React from "react";
import Link from "next/link";
import { Store, Phone, MapPin, Mail, Heart, ArrowRight } from "lucide-react";
import { getCategories } from "@/lib/api/wordpress";

export async function Footer() {
  const allCategories = await getCategories();

  // Filter khusus subkategori saja (mengecualikan 'Produk Fisik', 'Produk Digital', 'Tanpa Kategori', dan 'Umum')
  const subCategories = allCategories
    .filter((c) => {
      const s = c.slug.toLowerCase().trim();
      const n = c.name.toLowerCase().trim();

      // 1. Kecualikan parent categories eksplisit
      if (
        s === "produk-fisik" ||
        s === "produk-digital" ||
        n === "produk fisik" ||
        n === "produk digital" ||
        s === "uncategorized" ||
        s === "tanpa-kategori" ||
        s === "umum"
      ) {
        return false;
      }

      // 2. Jika ada data parent > 0, dipastikan subkategori
      if (c.parent && c.parent > 0) {
        return true;
      }

      return true;
    })
    .slice(0, 6); // Tampilkan hingga 6 subkategori

  return (
    <footer
      role="contentinfo"
      className="bg-slate-900 border-slate-800 border-t text-slate-300 transition-colors"
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 max-w-7xl">
        <div className="gap-8 lg:gap-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Info & Address */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex justify-center items-center bg-brand-gradient shadow-subtle p-2 rounded-2xl w-10 h-10 text-white">
                <Store className="w-6 h-6" aria-hidden="true" />
              </div>
              <span className="font-slab font-bold text-white text-xl tracking-tight">
                Mas Chan Digital
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Platform Marketplace Lokal Kota Serang yang menghubungkan UMKM,
              produsen oleh-oleh, dan penyedia jasa secara langsung tanpa
              perantara ke WhatsApp vendor.
            </p>
            <address className="inline-flex flex items-center gap-2 bg-brand-950/80 px-3 py-2 border border-brand-800/60 rounded-xl text-brand-300 text-xs not-italic">
              <MapPin
                className="w-4 h-4 text-brand-400 shrink-0"
                aria-hidden="true"
              />
              <span>Kota Serang, Banten 42111, Indonesia</span>
            </address>
          </div>

          {/* Quick Navigation */}
          <nav aria-label="Navigasi Footer Utama" className="space-y-4">
            <h4 className="font-slab font-bold text-white text-base tracking-wide">
              Navigasi Utama
            </h4>
            <ul className="space-y-2.5 m-0 p-0 text-sm list-none">
              <li>
                <Link
                  href="/"
                  className="focus-visible:outline-none hover:text-brand-300 focus-visible:underline transition-colors"
                >
                  Beranda
                </Link>
              </li>
              <li>
                <Link
                  href="/vendors"
                  className="focus-visible:outline-none hover:text-brand-300 focus-visible:underline transition-colors"
                >
                  Daftar Toko & Vendor
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="focus-visible:outline-none hover:text-brand-300 focus-visible:underline transition-colors"
                >
                  Semua Kategori
                </Link>
              </li>
              <li>
                <Link
                  href="/tentang-kami"
                  className="focus-visible:outline-none hover:text-brand-300 focus-visible:underline transition-colors"
                >
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link
                  href="/vendor/register"
                  className="focus-visible:outline-none hover:text-brand-300 focus-visible:underline transition-colors"
                >
                  Daftar Sebagai Vendor
                </Link>
              </li>
              <li>
                <Link
                  href="/vendor/login"
                  className="focus-visible:outline-none hover:text-brand-300 focus-visible:underline transition-colors"
                >
                  Login Dashboard
                </Link>
              </li>
            </ul>
          </nav>

          {/* Subkategori Produk Aktif */}
          <nav aria-label="Navigasi Sub Kategori Footer" className="space-y-4">
            <h4 className="font-slab font-bold text-white text-base tracking-wide">
              Kategori Produk
            </h4>
            {subCategories.length > 0 ? (
              <ul className="space-y-2.5 m-0 p-0 text-sm list-none">
                {subCategories.map((cat, idx) => (
                  <li
                    key={
                      cat.id
                        ? `footer-cat-${cat.id}-${cat.slug}`
                        : `footer-cat-idx-${idx}`
                    }
                  >
                    <Link
                      href={`/categories/${cat.slug}`}
                      className="group flex justify-between items-center focus-visible:outline-none hover:text-brand-300 focus-visible:underline transition-colors"
                    >
                      <span>{cat.name}</span>
                      {cat.count !== undefined && cat.count > 0 && (
                        <span className="bg-slate-800 px-2 py-0.5 rounded-full text-[11px] text-slate-400 group-hover:text-brand-300 transition-colors">
                          {cat.count}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
                <li className="pt-1">
                  <Link
                    href="/categories"
                    className="inline-flex items-center gap-1 font-semibold text-brand-400 hover:text-brand-300 text-xs transition-colors"
                  >
                    <span>Lihat Semua Kategori</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                </li>
              </ul>
            ) : (
              <p className="text-slate-500 text-xs">
                Kategori sedang disinkronkan...
              </p>
            )}
          </nav>

          {/* Contact Support */}
          <div className="space-y-4">
            <h4 className="font-slab font-bold text-white text-base tracking-wide">
              Kontak Bantuan
            </h4>
            <address className="space-y-2.5 text-slate-400 text-sm not-italic">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-400" aria-hidden="true" />
                <a
                  href="tel:+6282298148474"
                  className="hover:text-white transition-colors"
                >
                  0822-9814-8474 (Mas Chan)
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-400" aria-hidden="true" />
                <a
                  href="mailto:support@maschandigital.com"
                  className="hover:text-white transition-colors"
                >
                  support@maschandigital.com
                </a>
              </div>
            </address>
          </div>
        </div>

        <div className="flex sm:flex-row flex-col justify-between items-center gap-4 mt-12 pt-8 border-slate-800 border-t text-slate-500 text-xs">
          <p>
            © {new Date().getFullYear()} Mas Chan Digital. All rights reserved.
          </p>
          <p className="flex items-center gap-1">
            Dibuat dengan{" "}
            <Heart
              className="fill-rose-500 w-3.5 h-3.5 text-rose-500"
              aria-hidden="true"
            />{" "}
            untuk kemajuan UMKM Kota Serang
          </p>
        </div>
      </div>
    </footer>
  );
}
