"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { X, Minus, Plus, MessageCircle, ShieldCheck, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  trackWhatsAppClick,
  trackEcommerceBeginCheckout,
  trackEcommercePurchase,
} from "@/lib/analytics";
import {
  formatRupiah,
  generateWhatsAppOrderUrl,
  normalizeWhatsAppNumber,
  METODE_ANTAR_LABEL,
  type KecamatanSerang,
  type MetodeAntarProduk,
} from "@/lib/utils";
import type { BusinessType, PriceModel, ServiceAction } from "@/types";

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
  selectedVariation?: string;
  unitPrice: number;
  productUrl: string;
  productId?: number;
  businessType?: BusinessType;
  priceModel?: PriceModel;
  serviceAction?: ServiceAction;
  serviceAreas?: string[];
  vendorDistrict?: string;
}

export function WhatsAppOrderModal({
  isOpen,
  onClose,
  whatsappNumber,
  vendorName,
  productName,
  selectedVariation,
  unitPrice,
  productUrl,
  productId,
  businessType = "product",
  priceModel = "fixed",
  serviceAreas = [],
}: WhatsAppOrderModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);

  const isService = businessType === "service";

  // State untuk alur produk fisik
  const [qty, setQty] = useState(1);
  const [buyerName, setBuyerName] = useState("");
  const [kecamatan, setKecamatan] = useState<KecamatanSerang>(
    KECAMATAN_LIST[0],
  );
  const [metodeAntar, setMetodeAntar] =
    useState<MetodeAntarProduk>("kurir_lokal");
  const [catatan, setCatatan] = useState("");

  // State untuk alur layanan jasa
  const [serviceDistrict, setServiceDistrict] = useState<KecamatanSerang>(() => {
    if (serviceAreas && serviceAreas.length > 0) {
      const match = KECAMATAN_LIST.find((k) => serviceAreas.includes(k));
      if (match) return match;
    }
    return KECAMATAN_LIST[0];
  });
  const [serviceNotes, setServiceNotes] = useState("");
  const [preferredSchedule, setPreferredSchedule] = useState("");

  const subtotal = unitPrice * qty;

  // Evaluasi validitas formulir kontekstual
  const isValid = isService
    ? serviceNotes.trim().length > 0 && Boolean(serviceDistrict)
    : buyerName.trim().length > 0 && qty >= 1;

  // Hitung skema tarif untuk konteks jasa
  let tarifInfo = "";
  if (priceModel === "consultation") {
    tarifInfo = "Konsultasi Tarif / Sesuai Survei";
  } else if (priceModel === "starting_at") {
    tarifInfo = `Mulai dari ${formatRupiah(unitPrice)}`;
  } else {
    tarifInfo = `Tarif Tetap: ${formatRupiah(unitPrice)}`;
  }

  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement;
      dialogRef.current?.focus();

      if (!isService) {
        trackEcommerceBeginCheckout({
          productId: productId || "direct_store",
          productName,
          unitPrice,
          qty: 1,
          vendorName,
        });
      }
    } else if (triggerRef.current instanceof HTMLElement) {
      triggerRef.current.focus();
    }
  }, [isOpen, isService, productId, productName, unitPrice, vendorName]);

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

    if (isService) {
      const cleanPhone = normalizeWhatsAppNumber(whatsappNumber);
      const scheduleLine = preferredSchedule.trim()
        ? `📅 *Rencana Jadwal:* ${preferredSchedule.trim()}\n`
        : "";

      const serviceMessage =
        `Halo ${vendorName || "Penyedia Jasa"}, saya ingin berkonsultasi mengenai layanan jasa dari *Mas Chan Digital*:\n\n` +
        `🛠️ *Layanan:* ${productName}\n` +
        `📍 *Lokasi Pelanggan:* Kec. ${serviceDistrict}, Kota Serang\n` +
        `📝 *Rincian Kebutuhan:* ${serviceNotes.trim()}\n` +
        scheduleLine +
        `💰 *Skema Tarif:* ${tarifInfo}\n` +
        `🔗 *Link:* ${productUrl}\n\n` +
        `Mohon info ketersediaan jadwal atau konsultasi lebih lanjut. Terima kasih!`;

      trackWhatsAppClick({
        vendorName,
        productName,
        productId: productId ? String(productId) : undefined,
        kecamatan: serviceDistrict,
      });

      const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(serviceMessage)}`;
      window.open(url, "_blank", "noopener,noreferrer");
      onClose();
      return;
    }

    // Alur Pemesanan Produk Fisik
    const url = generateWhatsAppOrderUrl({
      whatsappNumber,
      vendorName,
      productName,
      selectedVariation,
      unitPrice,
      qty,
      buyerName: buyerName.trim(),
      kecamatan,
      metodeAntar,
      catatan,
      productUrl,
    });

    trackWhatsAppClick({
      vendorName,
      productName,
      productId: productId ? String(productId) : undefined,
      kecamatan,
    });

    trackEcommercePurchase({
      productId: productId || "direct_store",
      productName,
      unitPrice,
      qty,
      vendorName,
      kecamatan,
      metodeAntar: METODE_ANTAR_LABEL[metodeAntar],
    });

    window.open(url, "_blank", "noopener,noreferrer");
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
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
        onMouseDown={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-white dark:bg-surface-darkCard rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90dvh] flex flex-col focus:outline-none"
      >
        <header className="flex-shrink-0 border-b border-gray-100 dark:border-slate-800 p-4 sm:p-6 flex justify-between items-start gap-4">
          <div>
            <h2
              id={titleId}
              className="font-slab font-bold text-slate-900 dark:text-white text-lg"
            >
              {isService ? "Formulir Konsultasi Layanan" : "Lengkapi Pesanan"}
            </h2>
            <p className="mt-0.5 text-slate-500 dark:text-slate-400 text-xs">
              {isService
                ? "Rincian kebutuhan akan otomatis tersusun rapi ke WhatsApp penyedia jasa."
                : "Rincian ini otomatis tersusun jadi pesan WhatsApp ke vendor."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={isService ? "Tutup formulir konsultasi" : "Tutup formulir pesanan"}
            className="flex justify-center items-center hover:bg-slate-100 active:bg-slate-200 dark:hover:bg-slate-800 dark:active:bg-slate-700 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 min-w-[44px] min-h-[44px] w-[44px] h-[44px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors shrink-0"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 pb-2">
          {isService ? (
            <>
              {/* Info Layanan, Vendor & Skema Tarif */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800/80 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                      Layanan Jasa
                    </span>
                    <h3 className="font-slab font-bold text-slate-900 dark:text-white text-sm">
                      {productName}
                    </h3>
                  </div>
                  <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-semibold border border-emerald-200/60 dark:border-emerald-800/60 shrink-0">
                    <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                    <span>Terverifikasi</span>
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800/60 gap-2 text-xs">
                  <span className="text-slate-600 dark:text-slate-400">
                    Mitra: <strong className="text-slate-900 dark:text-slate-200 font-semibold">{vendorName || "Penyedia Jasa"}</strong>
                  </span>
                  <span className="font-bold text-brand-700 dark:text-brand-300">
                    {tarifInfo}
                  </span>
                </div>
              </div>

              {/* Dropdown Kecamatan (Wajib) */}
              <div>
                <label
                  htmlFor="service-district"
                  className="block mb-1.5 font-semibold text-slate-700 dark:text-slate-300 text-xs"
                >
                  Pilih Kecamatan Lokasi Anda di Kota Serang <span className="text-rose-500">*</span>
                </label>
                <select
                  id="service-district"
                  required
                  value={serviceDistrict}
                  onChange={(e) => setServiceDistrict(e.target.value as KecamatanSerang)}
                  className="bg-white dark:bg-slate-900 px-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 w-full text-slate-900 dark:text-white text-sm"
                >
                  {KECAMATAN_LIST.map((k) => (
                    <option key={k} value={k}>
                      Kec. {k}
                    </option>
                  ))}
                </select>
                {serviceAreas && serviceAreas.length > 0 && (
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-600 shrink-0" aria-hidden="true" />
                    <span>Jangkauan utama mitra: Kec. {serviceAreas.join(", ")}</span>
                  </p>
                )}
              </div>

              {/* Rincian Kebutuhan / Keluhan (Wajib) */}
              <div>
                <label
                  htmlFor="service-notes"
                  className="block mb-1.5 font-semibold text-slate-700 dark:text-slate-300 text-xs"
                >
                  Rincian Kebutuhan / Keluhan <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="service-notes"
                  rows={3}
                  required
                  maxLength={CATATAN_MAX_LENGTH}
                  value={serviceNotes}
                  onChange={(e) => setServiceNotes(e.target.value)}
                  placeholder="Misal: Mau konsultasi pasang kanopi ukuran 4x6 meter di daerah Ciracas..."
                  className="bg-white dark:bg-slate-900 px-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 w-full text-slate-900 dark:text-white text-sm resize-none"
                />
                <p className="mt-1 text-[11px] text-slate-400 text-right">
                  {serviceNotes.length}/{CATATAN_MAX_LENGTH}
                </p>
              </div>

              {/* Rencana Waktu / Jadwal Pengerjaan (Opsional) */}
              <div>
                <label
                  htmlFor="service-schedule"
                  className="block mb-1.5 font-semibold text-slate-700 dark:text-slate-300 text-xs"
                >
                  Rencana Waktu / Jadwal Pengerjaan <span className="font-normal text-slate-400">(opsional)</span>
                </label>
                <input
                  id="service-schedule"
                  type="text"
                  maxLength={100}
                  value={preferredSchedule}
                  onChange={(e) => setPreferredSchedule(e.target.value)}
                  placeholder="Misal: Sabtu ini, atau secepatnya"
                  className="bg-white dark:bg-slate-900 px-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 w-full text-slate-900 dark:text-white text-sm"
                />
              </div>

              {/* Tombol Konfirmasi Jasa */}
              <Button
                type="submit"
                variant="whatsapp"
                size="lg"
                fullWidth
                disabled={!isValid}
                className="py-3.5 font-bold shadow-md hover:shadow-lg transition-all"
              >
                <MessageCircle className="mr-2 w-5 h-5 fill-white" aria-hidden="true" />
                <span>Kirim Konsultasi ke WhatsApp {vendorName || "Penyedia Jasa"}</span>
              </Button>
            </>
          ) : (
            <>
              {/* Selected Variation Badge */}
              {selectedVariation && (
                <div className="flex items-center justify-between p-3 bg-brand-50/80 dark:bg-brand-950/50 rounded-xl border border-brand-100 dark:border-brand-900/60 text-xs">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">
                    Varian yang Dipilih:
                  </span>
                  <span className="font-bold text-brand-900 dark:text-brand-300 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-md border border-brand-200 dark:border-brand-800 shadow-2xs">
                    {selectedVariation}
                  </span>
                </div>
              )}

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

              {/* Tombol Konfirmasi Produk Fisik */}
              <Button
                type="submit"
                variant="whatsapp"
                size="lg"
                fullWidth
                disabled={!isValid}
                className="py-3.5 font-bold shadow-md hover:shadow-lg transition-all"
              >
                <MessageCircle className="mr-2 w-5 h-5 fill-white" aria-hidden="true" />
                <span>Lanjutkan Pesanan ke WhatsApp {vendorName || "Penjual"}</span>
              </Button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
