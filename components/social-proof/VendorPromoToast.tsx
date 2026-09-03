'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, X } from 'lucide-react';

export function VendorPromoToast() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the user has already closed it in this session
    const isClosed = sessionStorage.getItem('maschan_promo_toast_closed');
    if (isClosed === 'true') {
      return;
    }

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    sessionStorage.setItem('maschan_promo_toast_closed', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed z-40 bottom-20 left-4 md:bottom-6 md:left-6 max-w-sm">
      <div className="relative bg-white dark:bg-slate-900 border border-brand-500 shadow-2xl rounded-2xl p-4 flex gap-4 animate-in slide-in-from-bottom-5 fade-in duration-300">
        
        <button 
          onClick={handleClose}
          className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          aria-label="Tutup notifikasi"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="bg-amber-100 dark:bg-amber-900/30 rounded-xl w-10 h-10 flex justify-center items-center shrink-0 text-amber-500">
          <Sparkles className="w-5 h-5" aria-hidden="true" />
        </div>

        <div className="flex flex-col gap-1.5 pr-4">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs">Punya Usaha di Kota Serang?</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Daftarkan toko Anda gratis &amp; terima pesanan langsung via WhatsApp tanpa potongan biaya!
          </p>
          <div className="mt-1">
            <Link 
              href="/vendor/register"
              className="inline-flex justify-center items-center bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              Daftar Toko
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
