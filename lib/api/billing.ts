import { getVendorSession } from "@/lib/api/auth";
import {
  BillingInvoice,
  PlanId,
  SubscriptionPlan,
  VendorSubscription,
} from "@/types";

const WP_API_URL =
  process.env.NEXT_PUBLIC_WORDPRESS_URL || "https://app.maschandigital.id";

export interface BillingInfoResponse {
  subscription: VendorSubscription | null;
  plans: Record<PlanId, SubscriptionPlan>;
  invoices: BillingInvoice[];
}

/**
 * Ambil Informasi Status Langganan & Riwayat Tagihan Vendor
 */
export async function getBillingInfo(): Promise<BillingInfoResponse | null> {
  try {
    const session = getVendorSession();
    if (!session || !session.token) return null;

    const res = await fetch(`${WP_API_URL}/wp-json/maschan/v1/billing`, {
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      return data as BillingInfoResponse;
    }
  } catch (err: unknown) {
    console.error("Gagal mengambil data billing:", err);
  }
  return null;
}

/**
 * Buat Tagihan Perpanjangan Baru
 */
export async function renewSubscription(
  planId: PlanId,
): Promise<{ success: boolean; invoice?: BillingInvoice; message: string }> {
  try {
    const session = getVendorSession();
    if (!session || !session.token) {
      return {
        success: false,
        message: "Sesi login tidak valid. Silakan login ulang.",
      };
    }

    const res = await fetch(`${WP_API_URL}/wp-json/maschan/v1/billing/renew`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.token}`,
      },
      body: JSON.stringify({ plan_id: planId }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return {
        success: true,
        invoice: data.invoice,
        message: data.message || "Tagihan berhasil dibuat.",
      };
    }
    return {
      success: false,
      message: data.message || "Gagal membuat tagihan perpanjangan.",
    };
  } catch (err: unknown) {
    const msg =
      err instanceof Error
        ? err.message
        : "Gagal menghubungi server WordPress.";
    return { success: false, message: msg };
  }
}

/**
 * Konfirmasi Pembayaran Tagihan (Upload Bukti & Nama Pengirim)
 */
export async function confirmPayment(params: {
  invoiceId: number;
  proofImageUrl: string;
  senderAccountName: string;
  paymentMethod: string;
}): Promise<{ success: boolean; invoice?: BillingInvoice; message: string }> {
  try {
    const session = getVendorSession();
    if (!session || !session.token) {
      return {
        success: false,
        message: "Sesi login tidak valid. Silakan login ulang.",
      };
    }

    const res = await fetch(
      `${WP_API_URL}/wp-json/maschan/v1/billing/confirm`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          invoice_id: params.invoiceId,
          proof_image_url: params.proofImageUrl,
          sender_account_name: params.senderAccountName,
          payment_method: params.paymentMethod,
        }),
      },
    );

    const data = await res.json();
    if (res.ok && data.success) {
      return {
        success: true,
        invoice: data.invoice,
        message: data.message || "Konfirmasi pembayaran berhasil dikirim.",
      };
    }
    return {
      success: false,
      message: data.message || "Gagal mengirim konfirmasi pembayaran.",
    };
  } catch (err: unknown) {
    const msg =
      err instanceof Error
        ? err.message
        : "Gagal menghubungi server WordPress.";
    return { success: false, message: msg };
  }
}

/**
 * Batalkan Tagihan / Batal Pilih Paket
 */
export async function cancelInvoice(
  invoiceId: number,
): Promise<{ success: boolean; message: string }> {
  try {
    const session = getVendorSession();
    if (!session || !session.token) {
      return {
        success: false,
        message: "Sesi login tidak valid. Silakan login ulang.",
      };
    }

    const res = await fetch(`${WP_API_URL}/wp-json/maschan/v1/billing/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.token}`,
      },
      body: JSON.stringify({ invoice_id: invoiceId }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return {
        success: true,
        message: data.message || "Tagihan berhasil dibatalkan.",
      };
    }
    return {
      success: false,
      message: data.message || "Gagal membatalkan tagihan.",
    };
  } catch (err: unknown) {
    const msg =
      err instanceof Error
        ? err.message
        : "Gagal menghubungi server WordPress.";
    return { success: false, message: msg };
  }
}
