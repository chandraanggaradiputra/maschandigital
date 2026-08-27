"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { X, Minus, Plus, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { trackWhatsAppClick } from "@/lib/api/wordpress";
import {
  formatRupiah,
  generateWhatsAppOrderUrl,
  METODE_ANTAR_LABEL,
  type KecamatanSerang,
  type MetodeAntarProduk,
} from "@/lib/utils";

const KECAMATAN_LIST: KecamatanSerang[] = [
  "Serang",
  "Cipocok Jaya",
  "Kasemen",
  "Curug",
  "Taktakan",
  "Walantaka",
];

const METODE_ANTAR_LIST: MetodeAntarProduk[] = [
  "kurir_lokal",
  "cod",
  "ambil_di_toko",
];

const CATATAN_MAX_LENGTH = 300;

export interface WhatsAppOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  whatsappNumber: string;
  vendorName: string;
  productName: string;
  unitPrice: number;
  productUrl: string;
  productId?: number; // Tambahan aman untuk pelacak klik WA
}

export function WhatsAppOrderModal({
  isOpen,
  onClose,
  whatsappNumber,
  vendorName,
  productName,
  unitPrice,
  productUrl,
  productId,
}: WhatsAppOrderModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);

  const [qty, setQty] = useState(1);
  const [buyerName, setBuyerName] = useState("");
  const [kecamatan, setKecamatan] = useState<KecamatanSerang>(
    KECAMATAN_LIST[0],
  );
  const [metodeAntar, setMetodeAntar] =
    useState<MetodeAntarProduk>("kurir_lokal");
  const [catatan, setCatatan] = useState("");

  const subtotal = unitPrice * qty;
  const isValid = buyerName.trim().length > 0 && qty >= 1;

  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement;
      dialogRef.current?.focus();
    } else if (triggerRef.current instanceof HTMLElement) {
      triggerRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  function handleTrapKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "Tab" || !dialogRef.current) return;
    const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    const url = generateWhatsAppOrderUrl({
      whatsappNumber,
      vendorName,
      productName,
      unitPrice,
      qty,
      buyerName: buyerName.trim(),
      kecamatan,
      metodeAntar,
      catatan,
      productUrl,
    });

    if (productId) {
      trackWhatsAppClick(productId);
    }

    window.open(url, "_blank", "noopener,noreferrer");
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div
      className="z-50 fixed inset-0 flex justify-center items-end sm:items-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={handleTrapKeyDown}
        className="bg-white dark:bg-surface-darkCard shadow-card-hover border border-slate-200/80 dark:border-slate-800 sm:rounded-3xl rounded-t-3xl focus:outline-none w-full sm:max-w-md max-h-[90vh] overflow-y-auto"
      >
        <header className="flex justify-between items-start gap-4 p-5 pb-3">
          <div>
            <h2
              id={titleId}
              className="font-slab font-bold text-slate-900 dark:text-white text-lg"
            >
              Lengkapi Pesanan
            </h2>
            <p className="mt-0.5 text-slate-500 dark:text-slate-400 text-xs">
              Rincian ini otomatis tersusun jadi pesan WhatsApp ke vendor.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup formulir pesanan"
            className="flex justify-center items-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 w-8 h-8 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors shrink-0"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4 p-5 pt-2">
          {/* Qty */}
          <div>
            <label
              htmlFor="order-qty"
              className="block mb-1.5 font-semibold text-slate-700 dark:text-slate-300 text-xs"
            >
              Jumlah Pesanan
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
                aria-label="Kurangi jumlah"
                className="flex justify-center items-center bg-slate-100 dark:bg-slate-800 disabled:opacity-40 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 w-9 h-9 text-slate-700 dark:text-slate-200 shrink-0"
              >
                <Minus className="w-4 h-4" aria-hidden="true" />
              </button>
              <input
                id="order-qty"
                type="number"
                inputMode="numeric"
                min={1}
                max={99}
                value={qty}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setQty(
                    Number.isFinite(val) ? Math.min(99, Math.max(1, val)) : 1,
                  );
                }}
                className="bg-white dark:bg-slate-900 px-2 py-2 border border-slate-300 dark:border-slate-700 rounded-lg w-16 text-slate-900 dark:text-white text-sm text-center"
              />
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(99, q + 1))}
                disabled={qty >= 99}
                aria-label="Tambah jumlah"
                className="flex justify-center items-center bg-slate-100 dark:bg-slate-800 disabled:opacity-40 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 w-9 h-9 text-slate-700 dark:text-slate-200 shrink-0"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
              </button>
              <span className="ml-auto font-slab font-bold text-brand-800 dark:text-brand-400 text-sm">
                {formatRupiah(subtotal)}
              </span>
            </div>
          </div>

          {/* Nama Pemesan */}
          <div>
            <label
              htmlFor="order-buyer-name"
              className="block mb-1.5 font-semibold text-slate-700 dark:text-slate-300 text-xs"
            >
              Nama Pemesan
            </label>
            <input
              id="order-buyer-name"
              type="text"
              required
              maxLength={100}
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              placeholder="Nama Anda"
              className="bg-white dark:bg-slate-900 px-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 w-full text-slate-900 dark:text-white text-sm"
            />
          </div>

          {/* Kecamatan */}
          <div>
            <label
              htmlFor="order-kecamatan"
              className="block mb-1.5 font-semibold text-slate-700 dark:text-slate-300 text-xs"
            >
              Wilayah / Kecamatan (Kota Serang)
            </label>
            <select
              id="order-kecamatan"
              value={kecamatan}
              onChange={(e) => setKecamatan(e.target.value as KecamatanSerang)}
              className="bg-white dark:bg-slate-900 px-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 w-full text-slate-900 dark:text-white text-sm"
            >
              {KECAMATAN_LIST.map((k) => (
                <option key={k} value={k}>
                  Kec. {k}
                </option>
              ))}
            </select>
          </div>

          {/* Metode Antar */}
          <fieldset>
            <legend className="mb-1.5 font-semibold text-slate-700 dark:text-slate-300 text-xs">
              Pilihan Pengiriman
            </legend>
            <div className="gap-2 grid grid-cols-3">
              {METODE_ANTAR_LIST.map((m) => (
                <label
                  key={m}
                  className={`flex items-center justify-center text-center rounded-xl border px-2 py-2 text-xs font-medium cursor-pointer transition-colors ${
                    metodeAntar === m
                      ? "border-brand-500 bg-brand-50 text-brand-800 dark:bg-brand-950/50 dark:text-brand-300"
                      : "border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <input
                    type="radio"
                    name="metode_antar"
                    value={m}
                    checked={metodeAntar === m}
                    onChange={() => setMetodeAntar(m)}
                    className="sr-only"
                  />
                  {METODE_ANTAR_LABEL[m]}
                </label>
              ))}
            </div>
          </fieldset>

          {/* Catatan */}
          <div>
            <label
              htmlFor="order-catatan"
              className="block mb-1.5 font-semibold text-slate-700 dark:text-slate-300 text-xs"
            >
              Catatan Tambahan{" "}
              <span className="font-normal text-slate-400">(opsional)</span>
            </label>
            <textarea
              id="order-catatan"
              rows={2}
              maxLength={CATATAN_MAX_LENGTH}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Mis. warna, ukuran, atau permintaan khusus"
              className="bg-white dark:bg-slate-900 px-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 w-full text-slate-900 dark:text-white text-sm resize-none"
            />
            <p className="mt-1 text-[11px] text-slate-400 text-right">
              {catatan.length}/{CATATAN_MAX_LENGTH}
            </p>
          </div>

          <Button
            type="submit"
            variant="whatsapp"
            size="lg"
            fullWidth
            disabled={!isValid}
            className="py-3.5 font-bold"
          >
            <MessageCircle className="mr-1 w-5 h-5" aria-hidden="true" />
            <span>Lanjutkan ke WhatsApp</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
