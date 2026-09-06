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
    <aside
      aria-label={`Layanan chat WhatsApp untuk ${vendorName}`}
      className="fixed bottom-20 md:bottom-6 right-4 z-40"
    >
      {/* 1. KARTU DRAWER POPUP */}
      {isOpen && (
        <div
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          data-component="vendor-wa-drawer"
          className="mb-3 w-[calc(100vw-2rem)] sm:w-84 max-w-sm bg-white dark:bg-surface-darkCard rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden flex flex-col transition-all animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          {/* Header Drawer */}
          <header className="bg-brand-gradient text-white p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center font-slab font-bold text-white text-base shrink-0">
                {vendorName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h3
                  id={titleId}
                  className="font-slab font-bold text-sm leading-tight text-white truncate max-w-[170px]"
                >
                  {vendorName}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
                  <span className="text-[11px] text-emerald-200 font-medium flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-[#25D366]" />
                    Toko Terverifikasi
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Tutup jendela obrolan"
              className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </header>

          {/* Body Konten Obrolan */}
          <div className="p-4 space-y-3.5 max-h-[380px] overflow-y-auto bg-slate-50/50 dark:bg-slate-900/30">
            {/* Bubble Sapaan Ramah */}
            <div className="bg-white dark:bg-slate-800/90 p-3.5 rounded-2xl rounded-tl-sm text-xs text-slate-700 dark:text-slate-200 leading-relaxed shadow-sm border border-slate-100 dark:border-slate-700/60">
              <p className="font-semibold text-brand-800 dark:text-brand-300 mb-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Mas Chan Digital Chat Hub
              </p>
              Halo! Ada yang bisa kami bantu? Silakan pilih topik pertanyaan cepat di bawah atau tulis pesan Anda langsung.
            </div>

            {/* Opsi Pertanyaan Cepat */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block px-1">
                Pilih Pesan Cepat:
              </span>
              <div className="flex flex-col gap-1.5">
                {quickOptions.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCustomMessage(opt)}
                    className="text-left text-xs bg-white dark:bg-slate-800/70 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-300 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-800 transition-colors shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]"
                  >
                    💬 {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Pesan Kustom */}
            <div className="pt-1">
              <label
                htmlFor="vendor-wa-custom-msg"
                className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1 px-1"
              >
                Pesan Anda:
              </label>
              <textarea
                id="vendor-wa-custom-msg"
                rows={2}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Ketik pesan pertanyaan Anda di sini..."
                className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:border-transparent resize-none shadow-inner"
              />
            </div>
          </div>

          {/* Footer & Tombol Aksi Utama */}
          <footer className="p-3 bg-white dark:bg-surface-darkCard border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleStartChat}
              aria-label={`Mulai chat di WhatsApp dengan ${vendorName}`}
              className="w-full bg-[#25D366] hover:bg-[#20bd5a] active:scale-[0.99] text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
            >
              <MessageCircle className="w-4 h-4 fill-white shrink-0" aria-hidden="true" />
              <span>Mulai Chat di WhatsApp</span>
              <Send className="w-3.5 h-3.5 shrink-0 ml-0.5 opacity-90" aria-hidden="true" />
            </button>
          </footer>
        </div>
      )}

      {/* 2. TOMBOL UTAMA FLOATING (WhatsApp Green) */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={
          isOpen
            ? "Tutup obrolan WhatsApp"
            : `Tanya penjual ${vendorName} via WhatsApp`
        }
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className="bg-[#25D366] hover:bg-[#20bd5a] active:scale-95 text-white shadow-lg hover:shadow-xl rounded-full p-3.5 flex items-center gap-2 transition-all duration-200 transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white shrink-0" aria-hidden="true" />
        ) : (
          <MessageCircle
            className="w-6 h-6 fill-white text-[#25D366] shrink-0"
            aria-hidden="true"
          />
        )}
        <span className="text-xs font-bold font-sans hidden sm:inline-block pr-1">
          {isOpen ? "Tutup" : "Tanya Penjual"}
        </span>
      </button>
    </aside>
  );
}
