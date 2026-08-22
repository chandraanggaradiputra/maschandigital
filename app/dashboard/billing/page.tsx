"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  CreditCard,
  Calendar,
  Package,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldCheck,
  Building2,
  MessageCircle,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { MediaUploader } from "@/components/forms/MediaUploader";
import {
  getBillingInfo,
  renewSubscription,
  confirmPayment,
  type BillingInfoResponse,
} from "@/lib/api/billing";
import {
  formatRupiah,
  generateWhatsAppBillingConfirmationUrl,
} from "@/lib/utils";
import { getVendorSession } from "@/lib/api/auth";
import { PlanId, SubscriptionStatus } from "@/types";

// PENTING: lengkapi nomor rekening lain di bawah ini kalau sudah ada — yang
// masih "GANTI-NOMOR-REKENING" otomatis TIDAK ditampilkan ke vendor (lihat
// filter di BANK_ACCOUNTS.filter() pada bagian render), supaya tidak ada
// teks placeholder yang kelihatan oleh vendor sungguhan.
const BANK_ACCOUNTS = [
  { bank: "BCA", number: "GANTI-NOMOR-REKENING", holder: "GANTI NAMA PEMILIK" },
  {
    bank: "Mandiri",
    number: "GANTI-NOMOR-REKENING",
    holder: "GANTI NAMA PEMILIK",
  },
  { bank: "BSI", number: "7304526968", holder: "Chandra Anggara Diputra" },
  { bank: "BRI", number: "GANTI-NOMOR-REKENING", holder: "GANTI NAMA PEMILIK" },
];

const PLAN_ORDER: PlanId[] = [
  "free_forever",
  "monthly_1m",
  "quarterly_3m",
  "biannual_6m",
  "annual_1y",
];

const STATUS_CONFIG: Record<
  SubscriptionStatus,
  { label: string; badge: "primary" | "success" | "warning" | "danger" }
> = {
  trial: { label: "Masa Trial", badge: "primary" },
  active: { label: "Aktif", badge: "success" },
  renewal_due: { label: "Segera Berakhir", badge: "warning" },
  pending_approval: { label: "Menunggu Verifikasi", badge: "primary" },
  payment_rejected: { label: "Pembayaran Ditolak", badge: "danger" },
  grace_period: { label: "Masa Tenggang", badge: "danger" },
  expired: { label: "Berakhir", badge: "danger" },
};

function daysLeft(endDateIso: string | null): number | null {
  if (!endDateIso) return null;
  const diffMs = new Date(endDateIso).getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function formatDate(iso: string | null): string {
  if (!iso) return "-";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(
    new Date(iso),
  );
}

export default function DashboardBillingPage() {
  const [data, setData] = useState<BillingInfoResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [renewingPlan, setRenewingPlan] = useState<PlanId | null>(null);
  const [renewError, setRenewError] = useState("");

  const [proofImageUrl, setProofImageUrl] = useState("");
  const [senderAccountName, setSenderAccountName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("BCA");
  const [isSubmittingConfirm, setIsSubmittingConfirm] = useState(false);
  const [confirmError, setConfirmError] = useState("");
  const [confirmSuccess, setConfirmSuccess] = useState(false);

  const loadBilling = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    const result = await getBillingInfo();
    if (!result) {
      setLoadError(
        "Gagal memuat data langganan. Sesi Anda mungkin sudah berakhir — coba login ulang.",
      );
    }
    setData(result);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Ambil data langganan dari API saat mount — sumber data di luar React,
    // bukan kasus "effect tak perlu" (pola sama seperti sinkronisasi sesi
    // login di DesktopHeader/MobileBottomNav).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadBilling();
  }, [loadBilling]);

  const handleRenew = async (planId: PlanId) => {
    setRenewingPlan(planId);
    setRenewError("");
    const result = await renewSubscription(planId);
    if (result.success) {
      await loadBilling();
    } else {
      setRenewError(result.message);
    }
    setRenewingPlan(null);
  };

  const handleConfirmSubmit = async (invoiceId: number) => {
    if (!proofImageUrl || !senderAccountName.trim()) {
      setConfirmError(
        "Foto bukti transfer dan nama pemilik rekening wajib diisi.",
      );
      return;
    }
    setIsSubmittingConfirm(true);
    setConfirmError("");
    const result = await confirmPayment({
      invoiceId,
      proofImageUrl,
      senderAccountName: senderAccountName.trim(),
      paymentMethod,
    });
    if (result.success) {
      setConfirmSuccess(true);
      await loadBilling();
    } else {
      setConfirmError(result.message);
    }
    setIsSubmittingConfirm(false);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center gap-3 py-16 text-center">
        <Loader2 className="w-7 h-7 text-brand-700 dark:text-brand-400 animate-spin" />
        <p className="font-slab font-medium text-slate-500 text-xs sm:text-sm">
          Memuat status langganan...
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white dark:bg-surface-darkCard shadow-subtle p-8 border border-slate-200/80 dark:border-slate-800 rounded-3xl text-center">
        <AlertTriangle
          className="mx-auto mb-3 w-8 h-8 text-rose-500"
          aria-hidden="true"
        />
        <p className="mb-4 text-slate-600 dark:text-slate-300 text-sm">
          {loadError || "Terjadi kesalahan saat memuat data."}
        </p>
        <Button variant="outline" size="sm" onClick={loadBilling}>
          Coba Lagi
        </Button>
      </div>
    );
  }

  const { subscription, plans, invoices } = data;

  if (!subscription) {
    return (
      <div className="bg-white dark:bg-surface-darkCard shadow-subtle p-8 border border-slate-200/80 dark:border-slate-800 rounded-3xl text-center">
        <AlertTriangle
          className="mx-auto mb-3 w-8 h-8 text-amber-500"
          aria-hidden="true"
        />
        <p className="mb-1 font-slab font-bold text-slate-800 dark:text-slate-100 text-sm">
          Data langganan belum tersedia untuk akun Anda
        </p>
        <p className="text-slate-500 dark:text-slate-400 text-xs">
          Silakan hubungi Admin Mas Chan Digital melalui WhatsApp
          (0822-9814-8474) untuk mengaktifkan data langganan akun ini.
        </p>
      </div>
    );
  }

  const isExempt = subscription.plan_id === "exempt";
  const statusInfo = STATUS_CONFIG[subscription.status];
  const remainingDays = daysLeft(subscription.end_date);

  const pendingApprovalInvoice = invoices.find(
    (inv) => inv.invoice_status === "waiting_approval",
  );
  const payableInvoice = invoices.find(
    (inv) =>
      inv.invoice_status === "unpaid" || inv.invoice_status === "rejected",
  );

  const session = getVendorSession();
  const storeName = session?.user?.store_name || "Toko Vendor";

  return (
    <div className="space-y-6">
      <header>
        <h2 className="font-slab font-bold text-slate-900 dark:text-white text-xl">
          Langganan &amp; Tagihan
        </h2>
        <p className="mt-0.5 text-slate-500 dark:text-slate-400 text-xs">
          Kelola paket langganan toko dan riwayat pembayaran Anda
        </p>
      </header>

      {/* KARTU STATUS LANGGANAN */}
      <div className="bg-white dark:bg-surface-darkCard shadow-subtle p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 rounded-3xl">
        <div className="flex sm:flex-row flex-col sm:justify-between sm:items-start gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-slab font-bold text-slate-900 dark:text-white text-lg">
                {subscription.plan_name}
              </span>
              {isExempt ? (
                <Badge variant="success">
                  <ShieldCheck className="mr-1 w-3 h-3" aria-hidden="true" />
                  Akun Internal
                </Badge>
              ) : (
                <Badge variant={statusInfo.badge}>{statusInfo.label}</Badge>
              )}
            </div>
            {!isExempt && subscription.end_date && (
              <p className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs">
                <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                Berakhir {formatDate(subscription.end_date)}
                {remainingDays !== null &&
                  ` (${remainingDays > 0 ? `${remainingDays} hari lagi` : "sudah lewat"})`}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/60 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs">
            <Package className="w-4 h-4 text-slate-500" aria-hidden="true" />
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {subscription.products_used}
              {subscription.is_unlimited
                ? ""
                : ` / ${subscription.max_products}`}
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              {subscription.is_unlimited ? "produk (Tanpa Batas)" : "produk"}
            </span>
          </div>
        </div>

        {/* BANNER STATUS */}
        {!isExempt && subscription.status === "trial" && (
          <div className="flex items-start gap-2.5 bg-brand-50 dark:bg-brand-950/60 mt-4 p-3.5 border border-brand-200 dark:border-brand-800 rounded-2xl text-brand-800 dark:text-brand-300 text-xs">
            <Crown className="mt-0.5 w-4 h-4 shrink-0" aria-hidden="true" />
            <p>
              Anda sedang menikmati masa trial gratis 30 hari. Pilih paket
              berbayar kapan saja sebelum masa trial berakhir supaya toko tetap
              aktif tanpa jeda.
            </p>
          </div>
        )}
        {!isExempt && subscription.status === "renewal_due" && (
          <div className="flex items-start gap-2.5 bg-amber-50 dark:bg-amber-950/60 mt-4 p-3.5 border border-amber-200 dark:border-amber-800 rounded-2xl text-amber-800 dark:text-amber-300 text-xs">
            <AlertTriangle
              className="mt-0.5 w-4 h-4 shrink-0"
              aria-hidden="true"
            />
            <p>
              Langganan Anda akan segera berakhir. Perpanjang sekarang supaya
              toko tidak masuk masa tenggang.
            </p>
          </div>
        )}
        {!isExempt && subscription.status === "pending_approval" && (
          <div className="flex items-start gap-2.5 bg-brand-50 dark:bg-brand-950/60 mt-4 p-3.5 border border-brand-200 dark:border-brand-800 rounded-2xl text-brand-800 dark:text-brand-300 text-xs">
            <Clock className="mt-0.5 w-4 h-4 shrink-0" aria-hidden="true" />
            <p>
              Bukti pembayaran Anda sedang diverifikasi Admin (maksimal 3 hari
              kerja). Toko Anda <strong>tetap buka</strong> di halaman publik
              selama proses ini.
            </p>
          </div>
        )}
        {!isExempt && subscription.status === "grace_period" && (
          <div className="flex items-start gap-2.5 bg-rose-50 dark:bg-rose-950/60 mt-4 p-3.5 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-700 dark:text-rose-300 text-xs">
            <AlertTriangle
              className="mt-0.5 w-4 h-4 shrink-0"
              aria-hidden="true"
            />
            <p>
              Masa tenggang — toko Anda masih tampil di publik, tapi penambahan
              produk baru dinonaktifkan sementara. Segera perpanjang untuk
              menghindari toko ditutup.
            </p>
          </div>
        )}
        {!isExempt && subscription.status === "expired" && (
          <div className="flex items-start gap-2.5 bg-rose-50 dark:bg-rose-950/60 mt-4 p-3.5 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-700 dark:text-rose-300 text-xs">
            <XCircle className="mt-0.5 w-4 h-4 shrink-0" aria-hidden="true" />
            <p>
              Langganan Anda telah berakhir. Toko Anda saat ini{" "}
              <strong>tidak tampil</strong> di halaman publik. Perpanjang
              sekarang untuk mengaktifkan kembali.
            </p>
          </div>
        )}
      </div>

      {/* MENUNGGU VERIFIKASI — read-only, tidak ada form */}
      {!isExempt && pendingApprovalInvoice && (
        <div className="bg-white dark:bg-surface-darkCard shadow-subtle p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 rounded-3xl">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-brand-600" aria-hidden="true" />
            <h3 className="font-slab font-bold text-slate-900 dark:text-white text-sm">
              Menunggu Verifikasi Admin
            </h3>
          </div>
          <dl className="gap-x-4 gap-y-1.5 grid grid-cols-2 text-xs">
            <dt className="text-slate-500 dark:text-slate-400">No. Invoice</dt>
            <dd className="font-semibold text-slate-800 dark:text-slate-200">
              {pendingApprovalInvoice.invoice_number}
            </dd>
            <dt className="text-slate-500 dark:text-slate-400">Nominal</dt>
            <dd className="font-semibold text-slate-800 dark:text-slate-200">
              {formatRupiah(pendingApprovalInvoice.amount)}
            </dd>
          </dl>
          {pendingApprovalInvoice.is_overdue && (
            <p className="mt-3 text-amber-600 dark:text-amber-400 text-xs">
              Verifikasi sedang memakan waktu lebih lama dari biasanya — toko
              Anda tetap buka seperti biasa selama menunggu. Kalau ingin lebih
              cepat, silakan hubungi Admin lewat WhatsApp.
            </p>
          )}
        </div>
      )}

      {/* FORM BAYAR / KONFIRMASI — tampil kalau ada invoice unpaid atau rejected */}
      {!isExempt && !pendingApprovalInvoice && payableInvoice && (
        <div className="bg-white dark:bg-surface-darkCard shadow-subtle p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 rounded-3xl">
          {payableInvoice.invoice_status === "rejected" && (
            <div className="flex items-start gap-2.5 bg-rose-50 dark:bg-rose-950/60 mb-4 p-3.5 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-700 dark:text-rose-300 text-xs">
              <XCircle className="mt-0.5 w-4 h-4 shrink-0" aria-hidden="true" />
              <div>
                <p className="font-bold">Pembayaran sebelumnya ditolak</p>
                <p className="mt-0.5">
                  {payableInvoice.rejected_reason ||
                    "Bukti pembayaran tidak sesuai. Silakan unggah ulang."}
                </p>
              </div>
            </div>
          )}

          <h3 className="mb-1 font-slab font-bold text-slate-900 dark:text-white text-sm">
            Selesaikan Pembayaran
          </h3>
          <p className="mb-4 text-slate-500 dark:text-slate-400 text-xs">
            No. Invoice <strong>{payableInvoice.invoice_number}</strong> — total{" "}
            <strong>{formatRupiah(payableInvoice.amount)}</strong>
          </p>

          {/* Rekening tujuan */}
          <div className="gap-2.5 grid sm:grid-cols-2 mb-5">
            {BANK_ACCOUNTS.filter(
              (acc) => acc.number !== "GANTI-NOMOR-REKENING",
            ).map((acc) => (
              <div
                key={acc.bank}
                className="flex items-start gap-2.5 bg-slate-50 dark:bg-slate-800/60 p-3 border border-slate-200 dark:border-slate-700 rounded-xl"
              >
                <Building2
                  className="mt-0.5 w-4 h-4 text-slate-500 shrink-0"
                  aria-hidden="true"
                />
                <div className="text-xs">
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    {acc.bank}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400">
                    {acc.number}
                  </p>
                  <p className="text-slate-500 dark:text-slate-500">
                    a.n. {acc.holder}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {confirmSuccess ? (
            <div className="flex items-start gap-2.5 bg-emerald-50 dark:bg-emerald-950/60 p-3.5 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-700 dark:text-emerald-300 text-xs">
              <CheckCircle2
                className="mt-0.5 w-4 h-4 shrink-0"
                aria-hidden="true"
              />
              <p>
                Bukti pembayaran berhasil dikirim. Toko Anda tetap buka selama
                menunggu verifikasi Admin.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <MediaUploader
                label="Foto Bukti Transfer"
                helpText="Unggah screenshot/foto struk transfer yang jelas menampilkan nominal dan tanggal."
                onImageChange={(url) => setProofImageUrl(url)}
              />

              <div>
                <label
                  htmlFor="sender_account_name"
                  className="block mb-1.5 font-slab font-bold text-slate-800 dark:text-slate-200 text-sm"
                >
                  Nama Pemilik Rekening Pengirim
                </label>
                <input
                  id="sender_account_name"
                  type="text"
                  value={senderAccountName}
                  onChange={(e) => setSenderAccountName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="bg-white dark:bg-slate-900 px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 w-full text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="payment_method"
                  className="block mb-1.5 font-slab font-bold text-slate-800 dark:text-slate-200 text-sm"
                >
                  Transfer Dari Bank/Metode
                </label>
                <select
                  id="payment_method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="bg-white dark:bg-slate-900 px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 w-full text-sm"
                >
                  <option value="BCA">BCA</option>
                  <option value="Mandiri">Mandiri</option>
                  <option value="BSI">BSI</option>
                  <option value="BRI">BRI</option>
                  <option value="QRIS">QRIS</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              {confirmError && (
                <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/80 p-2.5 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs">
                  <AlertTriangle
                    className="w-4 h-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{confirmError}</span>
                </div>
              )}

              <div className="flex sm:flex-row flex-col gap-2.5">
                <Button
                  variant="primary"
                  onClick={() => handleConfirmSubmit(payableInvoice.id)}
                  disabled={isSubmittingConfirm}
                  fullWidth
                >
                  {isSubmittingConfirm ? (
                    <Loader2
                      className="w-4 h-4 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                  )}
                  <span>Kirim Konfirmasi Pembayaran</span>
                </Button>
                <a
                  href={generateWhatsAppBillingConfirmationUrl({
                    invoiceNumber: payableInvoice.invoice_number,
                    storeName,
                    planName:
                      plans[payableInvoice.plan_id as PlanId]?.name ||
                      payableInvoice.plan_id,
                    amount: payableInvoice.amount,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto"
                >
                  <Button variant="whatsapp" fullWidth>
                    <MessageCircle className="w-4 h-4" aria-hidden="true" />
                    <span>Konfirmasi via WhatsApp</span>
                  </Button>
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PILIH PAKET — hanya kalau tidak sedang ada invoice berjalan */}
      {!isExempt && !pendingApprovalInvoice && !payableInvoice && (
        <div>
          <h3 className="mb-3 font-slab font-bold text-slate-900 dark:text-white text-sm">
            {subscription.status === "trial" ||
            subscription.status === "expired"
              ? "Pilih Paket Langganan"
              : "Perpanjang / Upgrade Paket"}
          </h3>

          {renewError && (
            <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/80 mb-3 p-2.5 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{renewError}</span>
            </div>
          )}

          <div className="gap-3 grid sm:grid-cols-2 lg:grid-cols-3">
            {PLAN_ORDER.filter((id) => plans[id]).map((planId) => {
              const plan = plans[planId];
              const isCurrentPlan = subscription.plan_id === planId;
              const isUnlimited = plan.max_products === -1;

              return (
                <div
                  key={planId}
                  className="flex flex-col bg-white dark:bg-surface-darkCard shadow-subtle p-4 border border-slate-200/80 dark:border-slate-800 rounded-2xl"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <p className="font-slab font-bold text-slate-900 dark:text-white text-sm">
                      {plan.name}
                    </p>
                    {isCurrentPlan && (
                      <Badge variant="outline" className="text-[10px]">
                        Paket saat ini
                      </Badge>
                    )}
                  </div>
                  <p className="mb-3 font-slab font-black text-brand-700 dark:text-brand-400 text-lg">
                    {plan.price === 0 ? "Gratis" : formatRupiah(plan.price)}
                  </p>
                  <p className="mb-1 text-slate-500 dark:text-slate-400 text-xs">
                    {plan.duration_days === -1
                      ? "Berlaku selamanya"
                      : `${plan.duration_days} hari masa aktif`}
                  </p>
                  <p className="mb-4 text-slate-500 dark:text-slate-400 text-xs">
                    Kuota{" "}
                    {isUnlimited
                      ? "produk tanpa batas"
                      : `${plan.max_products} produk`}
                  </p>
                  <Button
                    variant={isCurrentPlan ? "outline" : "primary"}
                    size="sm"
                    fullWidth
                    disabled={renewingPlan !== null || isCurrentPlan}
                    onClick={() => handleRenew(planId)}
                    className="mt-auto"
                  >
                    {renewingPlan === planId ? (
                      <Loader2
                        className="w-3.5 h-3.5 animate-spin"
                        aria-hidden="true"
                      />
                    ) : (
                      <CreditCard className="w-3.5 h-3.5" aria-hidden="true" />
                    )}
                    <span>
                      {isCurrentPlan
                        ? "Paket Saat Ini"
                        : plan.price === 0
                          ? "Turun ke Paket Ini"
                          : "Pilih Paket Ini"}
                    </span>
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RIWAYAT INVOICE */}
      {invoices.length > 0 && (
        <div className="bg-white dark:bg-surface-darkCard shadow-subtle p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 rounded-3xl">
          <h3 className="mb-3 font-slab font-bold text-slate-900 dark:text-white text-sm">
            Riwayat Tagihan
          </h3>
          <div className="space-y-2">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="flex justify-between items-center gap-3 py-2 border-slate-100 dark:border-slate-800/80 border-b last:border-b-0 text-xs"
              >
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {inv.invoice_number}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">
                    {formatDate(inv.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {formatRupiah(inv.amount)}
                  </p>
                  <Badge
                    variant={
                      inv.invoice_status === "approved"
                        ? "success"
                        : inv.invoice_status === "rejected"
                          ? "danger"
                          : inv.invoice_status === "waiting_approval"
                            ? "primary"
                            : "neutral"
                    }
                    className="text-[10px]"
                  >
                    {inv.invoice_status === "approved" && "Disetujui"}
                    {inv.invoice_status === "rejected" && "Ditolak"}
                    {inv.invoice_status === "waiting_approval" && "Diproses"}
                    {inv.invoice_status === "unpaid" && "Belum Dibayar"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
