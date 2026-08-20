import React from "react";
import Link from "next/link";
import { Store, Phone, MapPin, Mail, Heart } from "lucide-react";

export function Footer() {
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

          {/* Navigasi Utama */}
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

          {/* Kategori Populer */}
          <nav aria-label="Navigasi Kategori Footer" className="space-y-4">
            <h4 className="font-slab font-bold text-white text-base tracking-wide">
              Kategori Populer
            </h4>
            <ul className="space-y-2.5 m-0 p-0 text-sm list-none">
              <li>
                <Link
                  href="/vendors?category=kuliner-serang"
                  className="focus-visible:outline-none hover:text-brand-300 focus-visible:underline transition-colors"
                >
                  Kuliner Sate Bandeng
                </Link>
              </li>
              <li>
                <Link
                  href="/vendors?category=herbal-madu"
                  className="focus-visible:outline-none hover:text-brand-300 focus-visible:underline transition-colors"
                >
                  Madu Akasia Murni
                </Link>
              </li>
              <li>
                <Link
                  href="/vendors?category=fashion-batik"
                  className="focus-visible:outline-none hover:text-brand-300 focus-visible:underline transition-colors"
                >
                  Batik Khas Banten
                </Link>
              </li>
              <li>
                <Link
                  href="/vendors?category=jasa-digital"
                  className="focus-visible:outline-none hover:text-brand-300 focus-visible:underline transition-colors"
                >
                  Jasa Website & Digital
                </Link>
              </li>
            </ul>
          </nav>

          {/* Kontak Bantuan */}
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
