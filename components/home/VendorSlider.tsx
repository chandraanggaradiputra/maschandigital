"use client";

import React, { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Vendor } from "@/types";
import { VendorCard } from "@/components/cards/VendorCard";

interface VendorSliderProps {
  vendors: Vendor[];
}

export function VendorSlider({ vendors }: VendorSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Fungsi scroll manual (Tombol Panah Kiri & Kanan)
  const scroll = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const scrollAmount = 340; // Kurang lebih lebar 1 kartu + gap
      sliderRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Autoplay setiap 3000 ms (Jeda saat mouse hover)
  useEffect(() => {
    if (isPaused || !sliderRef.current || vendors.length === 0) return;

    const interval = setInterval(() => {
      if (sliderRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
        // Jika sudah mendekati akhir, putar kembali ke awal (looping)
        if (scrollLeft + clientWidth >= scrollWidth - 20) {
          sliderRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          sliderRef.current.scrollBy({ left: 340, behavior: "smooth" });
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused, vendors.length]);

  return (
    <div
      className="relative group/slider"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Tombol Panah Kiri Desktop */}
      <button
        type="button"
        onClick={() => scroll("left")}
        aria-label="Geser ke vendor sebelumnya"
        className="hidden md:flex absolute -left-4 sm:-left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg text-slate-700 dark:text-slate-200 hover:text-[#093c96] items-center justify-center transition-all hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#093c96]"
      >
        <ChevronLeft className="w-5 h-5" aria-hidden="true" />
      </button>

      {/* Tombol Panah Kanan Desktop */}
      <button
        type="button"
        onClick={() => scroll("right")}
        aria-label="Geser ke vendor berikutnya"
        className="hidden md:flex absolute -right-4 sm:-right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg text-slate-700 dark:text-slate-200 hover:text-[#093c96] items-center justify-center transition-all hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#093c96]"
      >
        <ChevronRight className="w-5 h-5" aria-hidden="true" />
      </button>

      {/* Track Slider Kontainer */}
      <div className="-mx-4 px-4 sm:mx-0 sm:px-0">
        <div
          ref={sliderRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-none scroll-smooth items-stretch"
        >
          {vendors.map((vendor) => (
            <div
              key={vendor.id}
              className="w-[280px] sm:w-[320px] md:w-[340px] shrink-0 snap-start flex flex-col"
            >
              {/* Kartu dibuat h-full flex flex-col justify-between agar tingginya seragam */}
              <VendorCard
                vendor={vendor}
                className="h-full flex-1 flex flex-col justify-between"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
