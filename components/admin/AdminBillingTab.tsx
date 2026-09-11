"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CreditCard,
  Check,
  X,
  Loader2,
  AlertCircle,
  ExternalLink,
  Store,
  Clock,
  CheckCircle2,
  ZoomIn,
  MessageCircle,
} from "lucide-react";
import { AdminBillingInvoice } from "@/types";
import { formatRupiah, formatIndonesianDate } from "@/lib/utils";

interface AdminBillingTabProps {
  invoices: AdminBillingInvoice[];
  pendingCount: number;
  isLoading: boolean;
  activeSubTab: "waiting_approval" | "all" | "approved";
  onSubTabChange: (tab: "waiting_approval" | "all" | "approved") => void;
  onApprove: (invoice: AdminBillingInvoice) => void;
  onOpenRejectModal: (invoice: AdminBillingInvoice) => void;
  actionLoadingId: number | null;
  onZoomImage: (url: string) => void;
  onRefresh: () => void;
}

export function AdminBillingTab({
  invoices,
  pendingCount,
  isLoading,
  activeSubTab,
  onSubTabChange,
  onApprove,
  onOpenRejectModal,
  actionLoadingId,
  onZoomImage,
}: AdminBillingTabProps) {
  return (
    <div className="space-y-4">
      {/* Sub-Filter Tab */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onSubTabChange("waiting_approval")}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === "waiting_approval"
              ? "bg-brand-800 text-white shadow-sm"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70"
          }`}
        >
          <Clock className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Menunggu Verifikasi</span>
          {pendingCount > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeSubTab === "waiting_approval"
                  ? "bg-white text-brand-800"
                  : "bg-rose-500 text-white"
              }`}
            >
              {pendingCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => onSubTabChange("approved")}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === "approved"
              ? "bg-brand-800 text-white shadow-sm"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Riwayat Disetujui</span>
        </button>

        <button
          type="button"
          onClick={() => onSubTabChange("all")}
          className={`py-2 px-3 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === "all"
              ? "bg-brand-800 text-white shadow-sm"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70"
          }`}
        >
          <span>Semua</span>
        </button>
      </div>

      {/* Konten Daftar Tagihan */}
      {isLoading ? (
        <div className="py-16 text-center space-y-3">
          <Loader2
            className="w-8 h-8 mx-auto animate-spin text-brand-800 dark:text-blue-400"
            aria-hidden="true"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Memuat daftar tagihan pembayaran paket...
          </p>
        </div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
            <CreditCard className="w-6 h-6" aria-hidden="true" />
          </div>
          <h2 className="font-slab font-bold text-base text-slate-800 dark:text-slate-200">
            {activeSubTab === "waiting_approval"
              ? "Tidak Ada Pembayaran Menunggu"
              : "Belum Ada Catatan Tagihan"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            {activeSubTab === "waiting_approval"
              ? "Alhamdulillah, seluruh pembayaran paket toko mitra telah diverifikasi dan disetujui."
              : "Belum ada riwayat tagihan paket dalam sistem."}
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {invoices.map((inv) => {
            const isActionLoading = actionLoadingId === inv.id;
            const waClean = (inv.whatsapp_number || "").replace(/[^0-9]/g, "");

            return (
              <article
                key={inv.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-3.5 transition-all"
              >
                {/* Header Kartu: Info Toko & Nomor Tagihan */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800/70 pb-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-mono font-bold text-brand-800 dark:text-blue-400 bg-brand-50 dark:bg-brand-950/50 px-2 py-0.5 rounded-lg">
                        {inv.invoice_number}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                          inv.invoice_status === "approved"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                            : inv.invoice_status === "rejected"
                            ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                            : inv.invoice_status === "waiting_approval"
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {inv.invoice_status === "approved"
                          ? "Disetujui"
                          : inv.invoice_status === "rejected"
                          ? "Ditolak"
                          : inv.invoice_status === "waiting_approval"
                          ? "Menunggu Persetujuan"
                          : inv.invoice_status}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                      <Store className="w-3.5 h-3.5 text-brand-800 shrink-0" />
                      <span className="font-semibold truncate">
                        {inv.store_name || "Toko Mitra"}
                      </span>
                      {inv.store_slug && (
                        <Link
                          href={`/vendors/${inv.store_slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-brand-800 ml-0.5"
                          title="Lihat profil toko"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Pemilik: {inv.owner_name || "-"} •{" "}
                      {formatIndonesianDate(inv.confirmed_at || inv.created_at)}
                    </p>
                  </div>

                  {waClean && (
                    <a
                      href={`https://wa.me/${waClean}?text=${encodeURIComponent(
                        `Halo ${inv.store_name || "Mitra"}, terkait konfirmasi pembayaran paket ${inv.plan_name || ""} (${inv.invoice_number}) di Mas Chan Digital:`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl transition-colors shrink-0"
                      title="Hubungi vendor via WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  )}
                </div>

                {/* Rincian Paket & Pembayaran */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl text-xs">
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                      Paket Langganan
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">
                      {inv.plan_name || inv.plan_id}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                      Nominal Transfer Pas
                    </span>
                    <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                      {formatRupiah(inv.amount)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                      Rekening Pengirim (Atas Nama)
                    </span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {inv.sender_account_name || "-"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                      Metode Transfer
                    </span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {inv.payment_method || "Transfer Bank Manual"}
                    </span>
                  </div>
                </div>

                {/* Bukti Struk Transfer */}
                {inv.proof_image_url && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <ZoomIn className="w-3 h-3" />
                      Foto Bukti Transfer (Klik untuk perbesar):
                    </span>
                    <button
                      type="button"
                      onClick={() => onZoomImage(inv.proof_image_url)}
                      className="relative w-full max-w-[200px] h-32 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group hover:opacity-90 transition-opacity text-left"
                    >
                      <Image
                        src={inv.proof_image_url}
                        alt={`Bukti transfer ${inv.invoice_number}`}
                        fill
                        className="object-cover"
                        sizes="200px"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1">
                        <ZoomIn className="w-4 h-4" />
                        <span>Perbesar</span>
                      </div>
                    </button>
                  </div>
                )}

                {/* Alasan Penolakan (jika ada) */}
                {inv.rejected_reason && (
                  <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 text-[11px] text-rose-700 dark:text-rose-400 flex items-start gap-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Alasan Penolakan: </span>
                      <span>{inv.rejected_reason}</span>
                    </div>
                  </div>
                )}

                {/* Tombol Aksi 1-Ketukan */}
                {inv.invoice_status === "waiting_approval" && (
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/70">
                    <button
                      type="button"
                      onClick={() => onApprove(inv)}
                      disabled={isActionLoading}
                      className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {isActionLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      <span>✓ Setujui Pembayaran</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenRejectModal(inv)}
                      disabled={isActionLoading}
                      className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-xl border border-rose-200 dark:border-rose-800/50 transition-all flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>✕ Tolak</span>
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
