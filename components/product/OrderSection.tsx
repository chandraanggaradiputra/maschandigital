"use client";

import React, { useEffect, useState } from "react";
import {
  MessageCircle,
  ExternalLink,
  Clock,
  XCircle,
  Lock,
  Home,
  Store,
  MapPin,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { checkStoreStatus, type StoreStatus } from "@/lib/storeStatus";
import type {
  StoreHours,
  VacationMode,
  ProductVariation,
  BusinessType,
  PriceModel,
  ServiceAction,
} from "@/types";
import { WhatsAppOrderModal } from "./WhatsAppOrderModal";
import { trackWhatsAppClick } from "@/lib/analytics";
import { formatRupiah } from "@/lib/utils";

export interface OrderSectionProps {
  initialStoreStatus: StoreStatus;
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
  productId?: number;
  vendorSlug?: string;
  isVariable?: boolean;
  variations?: ProductVariation[];
  businessType?: BusinessType;
  priceModel?: PriceModel;
  serviceAction?: ServiceAction;
  serviceAreas?: string[];
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
  productId,
  vendorSlug,
  isVariable,
  variations,
  businessType = "product",
  priceModel = "fixed",
  serviceAction = "consultation",
  serviceAreas = [],
}: OrderSectionProps) {
  const [storeStatus, setStoreStatus] =
    useState<StoreStatus>(initialStoreStatus);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const hasVariations = Boolean(
    isVariable && variations && variations.length > 0,
  );
  const [selectedVariantId, setSelectedVariantId] = useState<
    string | number | null
  >(() => {
    if (!hasVariations || !variations || variations.length === 0) return null;
    const firstInStock = variations.find(
      (v) => v.stock_status !== "outofstock",
    );
    return (firstInStock || variations[0]).id;
  });

  const activeVariation =
    hasVariations && variations
      ? variations.find((v) => v.id === selectedVariantId) || variations[0]
      : null;

  const effectivePrice = activeVariation ? activeVariation.price : unitPrice;
  const isOutOfStock = activeVariation?.stock_status === "outofstock";

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStoreStatus(checkStoreStatus(storeHours, vacationMode));
  }, [storeHours, vacationMode]);

  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, "");
  const normalizedPhone = cleanPhone.startsWith("0")
    ? `62${cleanPhone.slice(1)}`
    : cleanPhone.startsWith("8")
      ? `62${cleanPhone}`
      : cleanPhone;

  const directWaUrl = `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(
    `Halo ${vendorName || "Admin"}, saya ingin bertanya mengenai produk ini dari *Mas Chan Digital*:\n\n📦 *Produk:* ${productName}${activeVariation ? `\n🏷️ *Varian:* ${activeVariation.name}\n💰 *Harga:* ${formatRupiah(effectivePrice)}` : ""}\n🔗 *Link:* ${productUrl}\n\nTerima kasih!`,
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

      {/* Pilihan Varian Produk (Variable Products) */}
      {hasVariations && businessType !== "service" && variations && variations.length > 0 && (
        <div className="space-y-3 bg-slate-50/80 dark:bg-slate-900/60 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
              Pilihan Varian Produk:
            </span>
            {activeVariation && (
              <span className="text-xs font-bold text-brand-700 dark:text-brand-400">
                {formatRupiah(activeVariation.price)}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {variations.map((v) => {
              const isSelected = v.id === activeVariation?.id;
              const isOut = v.stock_status === "outofstock";
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => !isOut && setSelectedVariantId(v.id)}
                  disabled={isOut}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 border ${
                    isSelected
                      ? "border-[#093c96] bg-blue-50 text-[#093c96] dark:bg-blue-950/60 dark:border-blue-500 dark:text-blue-300 ring-2 ring-[#093c96]/20 shadow-xs"
                      : isOut
                        ? "border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-400 cursor-not-allowed line-through opacity-60"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                  aria-pressed={isSelected}
                  aria-disabled={isOut}
                >
                  <span>{v.name}</span>
                  <span className="text-[11px] opacity-80">
                    {isOut ? "(Habis)" : formatRupiah(v.price)}
                  </span>
                </button>
              );
            })}
          </div>
          {isOutOfStock && (
            <p className="text-xs text-rose-500 font-medium">
              * Varian yang Anda pilih sedang habis stoknya. Silakan pilih varian lain.
            </p>
          )}
        </div>
      )}

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
          /* 1. PRODUK AFILIASI */
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
                onClick={() => {
                  trackWhatsAppClick({
                    vendorName,
                    productId: productId ? String(productId) : undefined,
                    productName,
                    kecamatan: "Unknown",
                  });
                }}
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
        ) : businessType === "service" ? (
          /* 2. LAYANAN JASA KONSULTASI / RESERVASI MODAL */
          <Button
            type="button"
            variant="whatsapp"
            size="lg"
            fullWidth
            onClick={() => setIsModalOpen(true)}
            className="shadow-card-hover py-4 font-bold text-sm sm:text-base flex items-center justify-center gap-2"
            aria-haspopup="dialog"
            aria-label={`Buka formulir konsultasi jasa ${productName}`}
          >
            {serviceAction === "appointment" ? (
              <>
                <MapPin className="w-5 h-5 text-white shrink-0" aria-hidden="true" />
                <span>📍 Panggil Teknisi / Buat Janji Temu</span>
              </>
            ) : serviceAction === "reservation" ? (
              <>
                <Calendar className="w-5 h-5 text-white shrink-0" aria-hidden="true" />
                <span>📅 Cek Jadwal & Reservasi</span>
              </>
            ) : (
              <>
                <MessageCircle className="w-5 h-5 text-white fill-white shrink-0" aria-hidden="true" />
                <span>💬 Konsultasi Kebutuhan Jasa</span>
              </>
            )}
          </Button>
        ) : isOutOfStock ? (
          /* 3. VARIAN HABIS */
          <Button
            type="button"
            variant="outline"
            size="lg"
            fullWidth
            disabled
            className="bg-slate-100 dark:bg-slate-900 opacity-80 py-4 border-slate-300 dark:border-slate-800 font-bold text-slate-500 text-sm sm:text-base cursor-not-allowed"
          >
            <span>Varian Ini Sedang Habis</span>
          </Button>
        ) : (
          /* 4. PRODUK DIRECT WHATSAPP */
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

      {/* WhatsAppOrderModal */}
      {!isAffiliate && (
        <WhatsAppOrderModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          whatsappNumber={whatsappNumber}
          vendorName={vendorName}
          productName={productName}
          selectedVariation={activeVariation ? activeVariation.name : undefined}
          unitPrice={effectivePrice}
          productUrl={productUrl}
          productId={productId}
          businessType={businessType}
          priceModel={priceModel}
          serviceAction={serviceAction}
          serviceAreas={serviceAreas}
        />
      )}

      {/* STICKY MOBILE ORDER BAR */}
      {!isModalOpen && (
        <div className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-white/95 dark:bg-surface-darkCard/95 border-t border-slate-200/90 dark:border-slate-800/90 px-3 py-2 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-md pb-safe">
          <div className="flex items-center gap-2 max-w-md mx-auto">
            {/* Zona Navigasi Kiri (2 Tombol Cepat Statis) */}
            <Link
              href="/"
              className="flex flex-col items-center justify-center min-w-[3.5rem] focus-visible:outline-none group"
              aria-label="Beranda"
            >
              <div className="p-1.5 rounded-xl group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-colors">
                <Home className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-brand-600 dark:group-hover:text-brand-400" />
              </div>
              <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium mt-0.5 group-hover:text-brand-600 dark:group-hover:text-brand-400">
                Beranda
              </span>
            </Link>

            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700 mx-0.5 shrink-0" />

            <Link
              href={`/vendors/${vendorSlug || "vendor-serang"}`}
              className="flex flex-col items-center justify-center min-w-[3.5rem] focus-visible:outline-none group"
              aria-label="Profil Toko"
            >
              <div className="p-1.5 rounded-xl group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-colors">
                <Store className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-brand-600 dark:group-hover:text-brand-400" />
              </div>
              <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium mt-0.5 group-hover:text-brand-600 dark:group-hover:text-brand-400">
                Toko
              </span>
            </Link>

            {/* Zona Aksi Kanan (Tombol WhatsApp Utama) */}
            <div className="flex-1 shrink-0 ml-1">
              {storeStatus.isVacation ? (
                <Button
                  variant="outline"
                  size="md"
                  fullWidth
                  disabled
                  className="bg-slate-100 dark:bg-slate-900 opacity-80 border-slate-300 dark:border-slate-800 font-bold text-slate-500 text-xs sm:text-sm py-2.5 h-auto cursor-not-allowed"
                >
                  <XCircle className="mr-1.5 w-4 h-4 text-amber-500" aria-hidden="true" />
                  <span>Toko Sedang Libur</span>
                </Button>
              ) : !storeStatus.isOpen ? (
                <Button
                  variant="outline"
                  size="md"
                  fullWidth
                  disabled
                  className="bg-slate-100 dark:bg-slate-900 opacity-80 border-slate-300 dark:border-slate-800 font-bold text-slate-500 text-xs sm:text-sm py-2.5 h-auto cursor-not-allowed"
                >
                  <Lock className="mr-1.5 w-4 h-4 text-rose-500" aria-hidden="true" />
                  <span>Toko Sedang Tutup</span>
                </Button>
              ) : isAffiliate ? (
                affiliateUrl ? (
                  <a
                    href={affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-xl"
                  >
                    <Button
                      variant="primary"
                      size="md"
                      fullWidth
                      className="font-bold text-xs sm:text-sm py-2.5 h-auto shadow-sm flex items-center justify-between px-3"
                    >
                      <div className="flex flex-col items-start leading-none text-left">
                        <span className="text-[10px] opacity-90 block">Beli via Link</span>
                        <span className="text-xs sm:text-sm font-bold block mt-0.5">{formatRupiah(effectivePrice)}</span>
                      </div>
                      <ExternalLink className="w-5 h-5 ml-2" aria-hidden="true" />
                    </Button>
                  </a>
                ) : whatsappNumber ? (
                  <a
                    href={directWaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      trackWhatsAppClick({
                        vendorName,
                        productId: productId ? String(productId) : undefined,
                        productName,
                        kecamatan: "Unknown",
                      });
                    }}
                    className="block w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-whatsapp-500 rounded-xl"
                  >
                    <Button
                      type="button"
                      variant="whatsapp"
                      size="md"
                      fullWidth
                      className="font-bold text-xs sm:text-sm py-2.5 h-auto shadow-sm flex items-center justify-between px-3"
                    >
                      <div className="flex flex-col items-start leading-none text-left">
                        <span className="text-[10px] opacity-90 block">Tanya WA</span>
                        <span className="text-xs sm:text-sm font-bold block mt-0.5">{formatRupiah(effectivePrice)}</span>
                      </div>
                      <MessageCircle className="w-5 h-5 ml-2 fill-white" aria-hidden="true" />
                    </Button>
                  </a>
                ) : null
              ) : businessType === "service" ? (
                <Button
                  type="button"
                  variant="whatsapp"
                  size="md"
                  fullWidth
                  onClick={() => setIsModalOpen(true)}
                  className="font-bold text-xs sm:text-sm py-2.5 h-auto shadow-sm flex items-center justify-between px-3 w-full"
                  aria-haspopup="dialog"
                  aria-label={`Buka formulir konsultasi jasa ${productName}`}
                >
                  <div className="flex flex-col items-start leading-none text-left">
                    <span className="text-[10px] opacity-90 block truncate max-w-[140px]">
                      {serviceAction === "appointment"
                        ? "Panggil Teknisi"
                        : serviceAction === "reservation"
                          ? "Reservasi Jadwal"
                          : "Konsultasi Jasa"}
                    </span>
                    <span className="text-xs sm:text-sm font-bold block mt-0.5">
                      {priceModel === "consultation"
                        ? "Konsultasi Tarif"
                        : formatRupiah(unitPrice)}
                    </span>
                  </div>
                  <MessageCircle
                    className="fill-white w-5 h-5 ml-2 shrink-0"
                    aria-hidden="true"
                  />
                </Button>
              ) : isOutOfStock ? (
                <Button
                  variant="outline"
                  size="md"
                  fullWidth
                  disabled
                  className="bg-slate-100 dark:bg-slate-900 opacity-80 border-slate-300 dark:border-slate-800 font-bold text-slate-500 text-xs sm:text-sm py-2.5 h-auto cursor-not-allowed"
                >
                  <span>Stok Varian Habis</span>
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="whatsapp"
                  size="md"
                  fullWidth
                  onClick={() => setIsModalOpen(true)}
                  className="font-bold text-xs sm:text-sm py-2.5 h-auto shadow-sm flex items-center justify-between px-3 w-full"
                >
                  <div className="flex flex-col items-start leading-none text-left">
                    <span className="text-[10px] opacity-90 block truncate max-w-[110px]">
                      {activeVariation ? activeVariation.name : "Beli via WA"}
                    </span>
                    <span className="text-xs sm:text-sm font-bold block mt-0.5">{formatRupiah(effectivePrice)}</span>
                  </div>
                  <MessageCircle className="fill-white w-5 h-5 ml-2 shrink-0" aria-hidden="true" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
