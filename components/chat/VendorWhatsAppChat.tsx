"use client";

import React, { useState, useEffect, useRef, useId } from "react";
import { MessageCircle, X, CheckCircle, Send, Sparkles } from "lucide-react";
import { normalizeWhatsAppNumber } from "@/lib/utils";
import { trackWhatsAppClick } from "@/lib/analytics";

export interface VendorWhatsAppChatProps {
  whatsappNumber?: string | null;
  vendorName: string;
  productName?: string;
  productId?: number | string;
  isModalOpen?: boolean;
  enabled?: boolean;
  kecamatan?: string;
}

export function VendorWhatsAppChat({
  whatsappNumber,
  vendorName,
  productName,
  productId,
  isModalOpen = false,
  enabled = true,
  kecamatan = "Kota Serang",
}: VendorWhatsAppChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  const [hasActiveDomModal, setHasActiveDomModal] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  // Zero Silent Fallback: Normalisasi nomor WhatsApp resmi (wajib awalan 62)
  const cleanPhone = normalizeWhatsAppNumber(whatsappNumber || "");

  // Deteksi jika modal dialog lain (seperti modal checkout) sedang aktif di layar
  useEffect(() => {
    const checkActiveModal = () => {
      // Periksa elemen dialog modal aktif selain drawer ini sendiri
      const modals = document.querySelectorAll(
        '[role="dialog"][aria-modal="true"]:not([data-component="vendor-wa-drawer"])'
      );
      setHasActiveDomModal(modals.length > 0);
    };

    checkActiveModal();
    const observer = new MutationObserver(checkActiveModal);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  // Tutup drawer jika tombol Escape ditekan
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Tutup drawer jika klik di luar area drawer
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Zero Silent Fallback & Proteksi Layer:
  // Jangan tampilkan widget jika nomor kosong, fitur dinonaktifkan, atau modal checkout sedang terbuka
  if (!cleanPhone || enabled === false || isModalOpen || hasActiveDomModal) {
    return null;
  }

  // Opsi pesan cepat interaktif
  const quickOptions: string[] = productName
    ? [
        `Halo ${vendorName}, apakah stok untuk "${productName}" masih tersedia?`,
        `Halo ${vendorName}, bisa info pilihan varian atau warna untuk "${productName}"?`,
        `Halo ${vendorName}, apakah produk "${productName}" bisa dikirim hari ini via kurir lokal di Kota Serang?`,
      ]
    : [
        `Halo ${vendorName}, saya menemukan toko Anda di Mas Chan Digital dan ingin bertanya produk yang tersedia.`,
        `Halo ${vendorName}, apakah melayani pengiriman kurir lokal / COD di wilayah Kota Serang?`,
        `Halo ${vendorName}, bagaimana cara memesan langsung ke toko Anda?`,
      ];

  const defaultMessage = productName
    ? `Halo ${vendorName}, saya menemukan produk *${productName}* di Mas Chan Digital. Saya ingin bertanya lebih lanjut.`
    : `Halo ${vendorName}, saya menemukan toko Anda di *Mas Chan Digital (Marketplace Serang)*. Saya ingin bertanya seputar produk/layanan yang Anda sediakan. Terima kasih!`;

  const handleStartChat = () => {
    const finalMessage = customMessage.trim() || defaultMessage;
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(finalMessage)}`;

    trackWhatsAppClick({
      vendorName,
      productName: productName || "Toko Profil",
      productId: productId ? String(productId) : undefined,
      kecamatan,
    });

    window.open(waUrl, "_blank", "noopener,noreferrer");
    setIsOpen(false);
  };

  return (
    <>
      {/* 1. KARTU DRAWER OBROLAN (Mencegah overflow ke atas dengan batasan max-height adaptif) */}
      {isOpen && (
        <aside
          aria-label={`Layanan chat WhatsApp untuk ${vendorName}`}
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          data-component="vendor-wa-drawer"
          className="fixed bottom-[4.5rem] left-3 right-3 sm:left-auto sm:right-4 sm:w-[350px] md:bottom-6 md:right-6 md:w-[360px] z-50 max-h-[58dvh] md:max-h-[450px] flex flex-col bg-white dark:bg-surface-darkCard rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden transition-all animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          {/* Header Kartu: Judul, Toko, & Tombol Tutup ✕ Elegan */}
          <header className="flex-shrink-0 border-b border-gray-100 dark:border-slate-800 p-3 sm:p-3.5 bg-gray-50/80 dark:bg-slate-900/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              <div className="w-8 h-8 rounded-full bg-[#093c96] text-white flex items-center justify-center font-slab font-bold text-xs shrink-0 shadow-sm">
                {vendorName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-500 shrink-0" aria-hidden="true" />
                  <span className="text-[9px] sm:text-[10px] font-bold text-[#093c96] dark:text-blue-400 uppercase tracking-wider truncate">
                    Mas Chan Digital Chat Hub
                  </span>
                </div>
                <h3
                  id={titleId}
                  className="font-slab font-bold text-xs sm:text-sm leading-tight text-gray-900 dark:text-white truncate"
                >
                  {vendorName}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] shrink-0 animate-pulse" />
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle className="w-2.5 h-2.5 text-[#25D366]" />
                    Toko Terverifikasi
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Tutup obrolan"
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </header>

          {/* Body Konten Kartu: Scrollable dengan padding rapi */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {/* Bubble Sapaan */}
            <div className="bg-gray-50 dark:bg-slate-800/70 p-2.5 rounded-xl text-xs text-gray-700 dark:text-gray-300 leading-relaxed border border-gray-100 dark:border-slate-700/60">
              Halo! Ada yang bisa kami bantu seputar produk atau toko kami? Silakan pilih pertanyaan cepat di bawah atau tulis pesan langsung:
            </div>

            {/* Opsi Pertanyaan Cepat (Chips) */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
                Pilih Pesan Cepat:
              </span>
              <div className="flex flex-col gap-1.5">
                {quickOptions.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCustomMessage(opt)}
                    className="text-left text-xs bg-gray-50 dark:bg-slate-800/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-gray-700 dark:text-gray-300 hover:text-emerald-800 dark:hover:text-emerald-300 p-2 text-xs rounded-lg border border-gray-100 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]"
                  >
                    💬 {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Pesan Kustom */}
            <div className="pt-0.5">
              <label
                htmlFor="vendor-wa-custom-msg"
                className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1"
              >
                Pesan Anda:
              </label>
              <textarea
                id="vendor-wa-custom-msg"
                rows={2}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Ketik pesan pertanyaan Anda..."
                className="w-full text-xs p-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#25D366] resize-none"
              />
            </div>
          </div>

          {/* Footer Aksi: Tombol WhatsApp Utama */}
          <footer className="flex-shrink-0 p-3 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-surface-darkCard">
            <button
              type="button"
              onClick={handleStartChat}
              aria-label={`Mulai chat di WhatsApp dengan ${vendorName}`}
              className="w-full bg-[#25D366] hover:bg-[#20bd5a] active:scale-[0.99] text-white font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]"
            >
              <MessageCircle className="w-4 h-4 fill-white shrink-0" aria-hidden="true" />
              <span>Mulai Chat di WhatsApp</span>
              <Send className="w-3.5 h-3.5 shrink-0 ml-0.5 opacity-90" aria-hidden="true" />
            </button>
          </footer>
        </aside>
      )}

      {/* 2. TOMBOL PEMICU MENGAMBANG (Floating Trigger Button) */}
      {/* Sembunyikan otomatis saat drawer terbuka (isOpen === true) */}
      {!isOpen && (
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label={`Tanya penjual ${vendorName} via WhatsApp`}
          aria-haspopup="dialog"
          aria-expanded={false}
          className="fixed bottom-[4.5rem] md:bottom-6 right-4 md:right-6 z-40 bg-[#25D366] hover:bg-[#20bd5a] active:scale-95 text-white shadow-lg hover:shadow-xl rounded-full p-3 md:p-3.5 flex items-center gap-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
        >
          <MessageCircle
            className="w-6 h-6 fill-white text-[#25D366] shrink-0"
            aria-hidden="true"
          />
          <span className="text-xs font-bold font-sans hidden sm:inline-block pr-1">
            Tanya Penjual
          </span>
        </button>
      )}
    </>
  );
}
