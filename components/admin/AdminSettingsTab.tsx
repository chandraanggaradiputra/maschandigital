"use client";

import React from "react";
import {
  Phone,
  Mail,
  MapPin,
  CreditCard,
  ExternalLink,
  Loader2,
  Globe,
  Building,
  Bell,
} from "lucide-react";
import { SiteSettings } from "@/types";

interface AdminSettingsTabProps {
  settings: SiteSettings | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export function AdminSettingsTab({
  settings,
  isLoading,
}: AdminSettingsTabProps) {
  if (isLoading) {
    return (
      <div className="py-16 text-center space-y-3">
        <Loader2
          className="w-8 h-8 mx-auto animate-spin text-brand-800 dark:text-blue-400"
          aria-hidden="true"
        />
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Memuat pengaturan bisnis resmi Mas Chan Digital...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Kartu Status Utama */}
      <div className="bg-gradient-to-br from-brand-800 to-blue-900 text-white rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Building className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h2 className="font-slab font-bold text-base">Mas Chan Digital</h2>
              <p className="text-[11px] text-blue-200">
                Marketplace & Direktori UMKM Kota Serang, Banten
              </p>
            </div>
          </div>

          <a
            href="https://app.maschandigital.id/wp-admin/admin.php?page=maschan-settings"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-semibold backdrop-blur-sm transition-colors flex items-center gap-1.5 shrink-0"
          >
            <span>WP Admin</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Pengumuman Header */}
        {settings?.top_announcement && (
          <div className="p-3 bg-white/10 rounded-xl text-xs text-blue-100 flex items-start gap-2">
            <Bell className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block text-amber-200 text-[11px] uppercase">
                Pengumuman Berjalan (Top Bar)
              </span>
              <p className="mt-0.5">{settings.top_announcement}</p>
            </div>
          </div>
        )}
      </div>

      {/* Kontak & Layanan Pelanggan */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-3.5">
        <h3 className="font-slab font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <Phone className="w-4 h-4 text-brand-800" />
          <span>Kontak Resmi Mas Chan Digital</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
              WhatsApp CS Resmi (24/7)
            </span>
            <a
              href={`https://wa.me/${(settings?.cs_whatsapp || "082298148474").replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
            >
              <span>{settings?.cs_whatsapp || "0822-9814-8474"}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
              Email Bantuan & Kerjasama
            </span>
            <a
              href={`mailto:${settings?.cs_email || "admin@maschandigital.id"}`}
              className="font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
            >
              <span>{settings?.cs_email || "admin@maschandigital.id"}</span>
              <Mail className="w-3 h-3" />
            </a>
          </div>

          <div className="sm:col-span-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium flex items-center gap-1">
              <MapPin className="w-3 h-3 text-rose-500" />
              Alamat Kantor Operasional
            </span>
            <p className="font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
              {settings?.address ||
                "Banten Indah Permai Blok E1 No.12A, Kelurahan Unyur, Kota Serang, Banten 42111, Indonesia."}
            </p>
          </div>
        </div>
      </div>

      {/* Rekening Pembayaran Resmi */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-3.5">
        <h3 className="font-slab font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-emerald-600" />
          <span>Rekening Bank Penerima Pembayaran Paket</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(settings?.bank_accounts || []).map((acc, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-brand-800 dark:text-blue-400 text-sm">
                  {acc.bank}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                  Aktif
                </span>
              </div>
              <p className="font-mono font-bold text-slate-900 dark:text-white text-sm tracking-wider">
                {acc.account_number}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Atas Nama: <strong className="text-slate-700 dark:text-slate-300">{acc.holder_name}</strong>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Media Sosial & Tautan Eksternal */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-3.5">
        <h3 className="font-slab font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-500" />
          <span>Saluran Media Sosial Resmi</span>
        </h3>

        <div className="flex flex-wrap gap-2">
          {(settings?.social_media || []).map((sm, idx) => (
            <a
              key={idx}
              href={sm.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
            >
              <span>{sm.platform}</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
