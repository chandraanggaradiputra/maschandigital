import React from "react";
import Link from "next/link";
import { Store, Search, MapPin, Filter, RefreshCw } from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { VendorCard } from "@/components/cards/VendorCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getVendors } from "@/lib/api/wordpress";

type VendorsPageProps = {
  searchParams: Promise<{
    q?: string;
    district?: string;
    category?: string;
  }>;
};

export default async function VendorsPage({ searchParams }: VendorsPageProps) {
  const { q: query = "", district = "" } = await searchParams;
  const vendors = await getVendors(district, query);

  const districts = [
    "Semua",
    "Cipocok Jaya",
    "Serang",
    "Kasemen",
    "Curug",
    "Taktakan",
    "Walantaka",
  ];

  return (
    <div className="space-y-6 sm:space-y-8 py-6 sm:py-10">
      {/* Header Banner */}
      <SectionContainer className="py-0">
        <header className="relative bg-brand-gradient shadow-card-hover p-6 sm:p-10 rounded-3xl overflow-hidden text-white">
          <div className="z-10 relative space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 border border-white/20 rounded-full font-semibold text-amber-300 text-xs">
              <Store className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Direktori UMKM & Vendor Lokal</span>
            </div>
            <h1 className="font-slab font-black text-2xl sm:text-4xl leading-tight">
              Toko & Vendor di Kota Serang
            </h1>
            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
              Jelajahi pelaku usaha lokal terverifikasi di seluruh kecamatan
              Kota Serang. Hubungi langsung melalui WhatsApp untuk konsultasi
              dan pemesanan.
            </p>
          </div>
        </header>
      </SectionContainer>

      {/* Filter & Search Toolbar */}
      <SectionContainer className="py-0">
        <search
          role="search"
          aria-label="Pencarian dan Filter Vendor"
          className="block space-y-4 bg-white dark:bg-surface-darkCard shadow-subtle p-4 sm:p-6 border border-slate-200/80 dark:border-slate-800 rounded-2xl"
        >
          <form
            method="GET"
            action="/vendors"
            className="flex md:flex-row flex-col gap-3"
          >
            <div className="relative flex-1">
              <label htmlFor="vendor-search-input" className="sr-only">
                Cari toko, produk, kuliner, atau jasa
              </label>
              <input
                id="vendor-search-input"
                type="search"
                name="q"
                defaultValue={query}
                placeholder="Cari toko, produk, kuliner, atau jasa..."
                className="bg-slate-50 dark:bg-slate-900 py-2.5 pr-4 pl-10 border border-slate-200 focus:border-brand-500 dark:border-slate-800 rounded-xl outline-none w-full text-slate-800 dark:text-slate-100 text-sm transition-all placeholder-slate-400"
              />
              <Search
                className="top-1/2 left-3.5 absolute w-4 h-4 text-slate-400 -translate-y-1/2"
                aria-hidden="true"
              />
            </div>

            <div className="relative w-full md:w-56">
              <label htmlFor="district-filter-select" className="sr-only">
                Filter Berdasarkan Kecamatan
              </label>
              <select
                id="district-filter-select"
                name="district"
                defaultValue={district}
                className="bg-slate-50 dark:bg-slate-900 py-2.5 pr-8 pl-10 border border-slate-200 focus:border-brand-500 dark:border-slate-800 rounded-xl outline-none w-full text-slate-800 dark:text-slate-100 text-sm appearance-none cursor-pointer"
              >
                <option value="">Semua Kecamatan</option>
                {districts
                  .filter((d) => d !== "Semua")
                  .map((d) => (
                    <option key={d} value={d}>
                      Kec. {d}
                    </option>
                  ))}
              </select>
              <MapPin
                className="top-1/2 left-3.5 absolute w-4 h-4 text-slate-400 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
            </div>

            <Button type="submit" variant="primary" size="md">
              <Filter className="w-4 h-4" aria-hidden="true" />
              <span>Filter Toko</span>
            </Button>

            {(query || district) && (
              <Link href="/vendors">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  className="w-full md:w-auto"
                >
                  <RefreshCw className="w-4 h-4" aria-hidden="true" />
                  <span>Reset</span>
                </Button>
              </Link>
            )}
          </form>

          {/* Quick District Filter Chips */}
          <nav
            aria-label="Pilih Kecamatan Kota Serang"
            className="flex items-center gap-2 pt-1 pb-1 overflow-x-auto text-xs no-scrollbar"
          >
            <span className="mr-1 font-medium text-slate-400 dark:text-slate-500 shrink-0">
              Kecamatan:
            </span>
            <ul className="flex items-center gap-2 m-0 p-0 list-none">
              {districts.map((d) => {
                const isSelected =
                  (d === "Semua" && !district) ||
                  district.toLowerCase() === d.toLowerCase();
                const href =
                  d === "Semua"
                    ? query
                      ? `/vendors?q=${encodeURIComponent(query)}`
                      : "/vendors"
                    : `/vendors?district=${encodeURIComponent(d)}${query ? `&q=${encodeURIComponent(query)}` : ""}`;

                return (
                  <li key={d}>
                    <Link
                      href={href}
                      aria-current={isSelected ? "true" : undefined}
                    >
                      <Badge
                        variant={isSelected ? "primary" : "neutral"}
                        className={`cursor-pointer px-3 py-1 text-xs transition-all ${
                          isSelected
                            ? "font-bold scale-105 shadow-sm"
                            : "hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                      >
                        {d}
                      </Badge>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </search>
      </SectionContainer>

      {/* Vendor List Grid */}
      <SectionContainer aria-labelledby="vendor-list-heading" className="py-0">
        <div className="flex justify-between items-center mb-4">
          <p
            id="vendor-list-heading"
            className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm"
          >
            Menampilkan{" "}
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {vendors.length}
            </span>{" "}
            vendor lokal di Kota Serang
          </p>
        </div>

        {vendors.length > 0 ? (
          <div className="gap-4 sm:gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {vendors.map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} />
            ))}
          </div>
        ) : (
          <div className="space-y-4 bg-white dark:bg-surface-darkCard p-10 border border-slate-200/80 dark:border-slate-800 rounded-3xl text-center">
            <div className="flex justify-center items-center bg-brand-50 dark:bg-brand-950/80 mx-auto rounded-2xl w-16 h-16 text-brand-700 dark:text-brand-400">
              <Store className="w-8 h-8" aria-hidden="true" />
            </div>
            <h2 className="font-slab font-bold text-slate-900 dark:text-white text-lg">
              Tidak Ada Vendor yang Sesuai
            </h2>
            <p className="mx-auto max-w-md text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
              Kami tidak menemukan vendor dengan kata kunci atau filter
              kecamatan yang Anda pilih. Coba gunakan kata kunci lain atau reset
              filter.
            </p>
            <Link href="/vendors">
              <Button variant="outline" size="sm">
                Lihat Semua Vendor
              </Button>
            </Link>
          </div>
        )}
      </SectionContainer>
    </div>
  );
}
