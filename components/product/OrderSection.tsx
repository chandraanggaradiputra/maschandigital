"use client";

import React, { useEffect, useState } from "react";
import {
  MessageCircle,
  ExternalLink,
  Clock,
  XCircle,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { checkStoreStatus, type StoreStatus } from "@/lib/storeStatus";
import type { StoreHours, VacationMode } from "@/types";
import { WhatsAppOrderModal } from "./WhatsAppOrderModal";

export interface OrderSectionProps {
  // Hasil checkStoreStatus() yang SUDAH dihitung di Server Component (page.tsx)
  // saat request — dipakai untuk render pertama, supaya HTML dari server dan
  // hasil hydration di client sama persis (tidak ada mismatch).
  initialStoreStatus: StoreStatus;
  // Data mentah jam operasional & vacation mode, dipakai HANYA untuk revalidasi
  // ringan setelah mount (lihat useEffect di bawah) — bukan untuk render pertama.
  storeHours?: StoreHours;
  vacationMode?: VacationMode;
  whatsappNumber: string;
  vendorName: string;
  productName: string;
  unitPrice: number;
  productUrl: string;
  isAffiliate: boolean;
  affiliateUrl?: string;
  affiliateButtonText?: string;
}

export function OrderSection({
  initialStoreStatus,
  storeHours,
  vacationMode,
  whatsappNumber,
  vendorName,
  productName,
  unitPrice,
  productUrl,
  isAffiliate,
  affiliateUrl,
  affiliateButtonText,
}: OrderSectionProps) {
  const [storeStatus, setStoreStatus] =
    useState<StoreStatus>(initialStoreStatus);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Revalidasi status toko setelah mount — menangkap kasus halaman sudah lama
  // terbuka (mis. lewat tengah malam, atau di-cache ISR beberapa saat).
  // Render PERTAMA tetap pakai initialStoreStatus dari server (di atas), jadi
  // tidak ada hydration mismatch — ini cuma koreksi setelahnya, bukan penentu
  // tampilan awal.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStoreStatus(checkStoreStatus(storeHours, vacationMode));
  }, [storeHours, vacationMode]);

  // Format nomor WhatsApp untuk direct chat produk afiliasi
  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, "");
  const normalizedPhone = cleanPhone.startsWith("0")
    ? `62${cleanPhone.slice(1)}`
    : cleanPhone.startsWith("8")
      ? `62${cleanPhone}`
      : cleanPhone;

  const directWaUrl = `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(
    `Halo ${vendorName || "Admin"}, saya ingin bertanya mengenai produk ini dari *Mas Chan Digital*:\n\n📦 *Produk:* ${productName}\n🔗 *Link:* ${productUrl}\n\nTerima kasih!`,
  )}`;

  return (
    <>
      {/* Store Status Notification (Vacation / Closed Hours) */}
      {storeStatus.isVacation ? (
        <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/60 p-4 border border-amber-200 dark:border-amber-800 rounded-2xl">
          <XCircle
            className="mt-0.5 w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0"
            aria-hidden="true"
          />
          <div>
            <h4 className="font-slab font-bold text-amber-900 dark:text-amber-200 text-sm">
              Pemberitahuan Toko Sedang Libur
            </h4>
            <p className="mt-0.5 text-amber-800 dark:text-amber-300 text-xs leading-relaxed">
              {storeStatus.vacationMessage}
            </p>
          </div>
        </div>
      ) : !storeStatus.isOpen ? (
        <div className="flex items-start gap-3 bg-rose-50 dark:bg-rose-950/60 p-4 border border-rose-200 dark:border-rose-800 rounded-2xl">
          <Clock
            className="mt-0.5 w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0"
            aria-hidden="true"
          />
          <div>
            <h4 className="font-slab font-bold text-rose-900 dark:text-rose-200 text-sm">
              Maaf, Toko kami sedang tutup
            </h4>
            <p className="mt-0.5 text-rose-800 dark:text-rose-300 text-xs leading-relaxed">
              {storeStatus.todaySchedule
                ? `${storeStatus.todaySchedule}. Pemesanan dibuka kembali saat jam operasional toko aktif.`
                : "Pemesanan hanya dapat dilakukan saat jam operasional toko."}
            </p>
          </div>
        </div>
      ) : null}

      {/* Action Buttons: Conditional based on Store Status */}
      <div className="space-y-3 pt-2">
        {storeStatus.isVacation ? (
          <div className="space-y-2">
            <Button
              variant="outline"
              size="lg"
              fullWidth
              disabled
              className="bg-slate-100 dark:bg-slate-900 opacity-80 py-4 border-slate-300 dark:border-slate-800 font-bold text-slate-500 text-sm sm:text-base cursor-not-allowed"
            >
              <XCircle
                className="mr-2 w-5 h-5 text-amber-500 shrink-0"
                aria-hidden="true"
              />
              <span>Toko Sedang Libur (Pemesanan Ditutup)</span>
            </Button>
            <p className="text-[11px] text-slate-400 text-center">
              Tombol pemesanan dinonaktifkan sementara karena toko sedang dalam
              masa libur.
            </p>
          </div>
        ) : !storeStatus.isOpen ? (
          <div className="space-y-2">
            <Button
              variant="outline"
              size="lg"
              fullWidth
              disabled
              className="bg-slate-100 dark:bg-slate-900 opacity-80 py-4 border-slate-300 dark:border-slate-800 font-bold text-slate-500 text-sm sm:text-base cursor-not-allowed"
            >
              <Lock
                className="mr-2 w-5 h-5 text-rose-500 shrink-0"
                aria-hidden="true"
              />
              <span>Maaf, Toko kami sedang tutup</span>
            </Button>
            <p className="text-[11px] text-slate-400 text-center">
              Silakan hubungi kembali saat toko mulai beroperasi.
            </p>
          </div>
        ) : isAffiliate ? (
          /* 1. PRODUK AFILIASI: Tautan Afiliasi & Tanya via Chat Langsung (Tanpa Order Form Modal) */
          <>
            {affiliateUrl && (
              <a
                href={affiliateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 w-full"
                aria-label={`Buka tautan affiliasi resmi produk ${productName}`}
              >
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  className="shadow-card-hover py-4 font-bold text-sm sm:text-base"
                >
                  <ExternalLink className="mr-1 w-5 h-5" aria-hidden="true" />
                  <span>{affiliateButtonText || "Beli via Link"}</span>
                </Button>
              </a>
            )}

            {whatsappNumber && (
              <a
                href={directWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-whatsapp-500 w-full"
                aria-label={`Tanya penjual tentang ${productName} lewat chat WhatsApp`}
              >
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  fullWidth
                  className="hover:bg-emerald-50 dark:hover:bg-emerald-950/40 py-3.5 border-emerald-500 font-bold text-emerald-700 dark:text-emerald-400 text-sm sm:text-base"
                >
                  <MessageCircle
                    className="mr-1 w-5 h-5 text-emerald-600 dark:text-emerald-400"
                    aria-hidden="true"
                  />
                  <span>Tanya via WhatsApp Vendor</span>
                </Button>
              </a>
            )}
          </>
        ) : (
          /* 2. PRODUK DIRECT WHATSAPP: Membuka Smart WhatsApp Order Form Modal */
          <Button
            type="button"
            variant="whatsapp"
            size="lg"
            fullWidth
            onClick={() => setIsModalOpen(true)}
            className="shadow-card-hover py-4 font-bold text-sm sm:text-base"
            aria-haspopup="dialog"
          >
            <MessageCircle
              className="fill-white mr-1 w-5 h-5"
              aria-hidden="true"
            />
            <span>Pesan Langsung via WhatsApp Vendor</span>
          </Button>
        )}
      </div>

      {/* WhatsAppOrderModal HANYA aktif dan dirender untuk Produk Direct WhatsApp */}
      {!isAffiliate && (
        <WhatsAppOrderModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          whatsappNumber={whatsappNumber}
          vendorName={vendorName}
          productName={productName}
          unitPrice={unitPrice}
          productUrl={productUrl}
        />
      )}
    </>
  );
}
