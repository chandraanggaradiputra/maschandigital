import { getVendorSession } from "@/lib/api/auth";
import {
  SubscriptionPlan,
  VendorSubscription,
  BillingInvoice,
  AdminInvoicesResponse,
  PlanId,
} from "@/types";

const WP_API_URL =
  process.env.NEXT_PUBLIC_WORDPRESS_URL || "https://app.maschandigital.id";

function getErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

// Bentuk 'plans' dari GET /billing adalah objek {plan_id: {...}} — plan_id ada
// sebagai KEY, bukan field di dalam value-nya (beda dengan interface SubscriptionPlan
// yang dipakai di tempat lain). Jangan disamakan begitu saja, supaya tidak salah tafsir.
export type BillingPlansMap = Record<PlanId, Omit<SubscriptionPlan, "plan_id">>;

export interface BillingInfoResponse {
  subscription: VendorSubscription | null;
  plans: BillingPlansMap;
  invoices: BillingInvoice[];
}

interface ActionResult {
  success: boolean;
  message: string;
  invoice?: BillingInvoice;
}

/**
 * Ambil status langganan + riwayat invoice vendor yang sedang login.
 * Mengembalikan null kalau sesi tidak valid — TIDAK PERNAH menebak vendor mana.
 */
export async function getBillingInfo(): Promise<BillingInfoResponse | null> {
  const session = getVendorSession();
  if (!session?.token) return null;

  try {
    const res = await fetch(`${WP_API_URL}/wp-json/maschan/v1/billing`, {
      headers: { Authorization: `Bearer ${session.token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function renewSubscription(planId: PlanId): Promise<ActionResult> {
  const session = getVendorSession();
  if (!session?.token) {
    return {
      success: false,
      message: "Sesi login tidak valid. Silakan login ulang.",
    };
  }

  try {
    const res = await fetch(`${WP_API_URL}/wp-json/maschan/v1/billing/renew`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.token}`,
      },
      body: JSON.stringify({ plan_id: planId }),
    });
    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        message: data.message || "Gagal membuat tagihan baru.",
      };
    }
    return data;
  } catch (err) {
    return {
      success: false,
      message: getErrorMessage(err, "Gagal menghubungi server."),
    };
  }
}

export async function confirmPayment(params: {
  invoiceId: number;
  proofImageUrl: string;
  senderAccountName: string;
  paymentMethod: string;
}): Promise<ActionResult> {
  const session = getVendorSession();
  if (!session?.token) {
    return {
      success: false,
      message: "Sesi login tidak valid. Silakan login ulang.",
    };
  }

  try {
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
    if (!res.ok) {
      return {
        success: false,
        message: data.message || "Gagal mengirim konfirmasi pembayaran.",
      };
    }
    return data;
  } catch (err) {
    return {
      success: false,
      message: getErrorMessage(err, "Gagal menghubungi server."),
    };
  }
}

/**
 * Batalkan invoice yang belum diproses (status 'unpaid' atau 'waiting_approval')
 * supaya vendor bisa memilih paket lain. Endpoint sudah memvalidasi kepemilikan
 * invoice (invoice_id harus milik vendor yang login) di sisi server.
 */
export async function cancelInvoice(invoiceId: number): Promise<ActionResult> {
  const session = getVendorSession();
  if (!session?.token) {
    return {
      success: false,
      message: "Sesi login tidak valid. Silakan login ulang.",
    };
  }

  try {
    const res = await fetch(`${WP_API_URL}/wp-json/maschan/v1/billing/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.token}`,
      },
      body: JSON.stringify({ invoice_id: invoiceId }),
    });
    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        message: data.message || "Gagal membatalkan tagihan.",
      };
    }
    return data;
  } catch (err) {
    return {
      success: false,
      message: getErrorMessage(err, "Gagal menghubungi server."),
    };
  }
}

/**
 * Mengambil daftar invoice tagihan paket untuk Super Admin
 */
export async function getAdminInvoices(
  token: string,
  status: string = "pending_approval"
): Promise<AdminInvoicesResponse> {
  if (!token) {
    return { pending_count: 0, invoices: [] };
  }

  try {
    const res = await fetch(
      `${WP_API_URL}/wp-json/maschan/v1/admin/billing/invoices?status=${encodeURIComponent(status)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return { pending_count: 0, invoices: [] };
    }

    const data = await res.json();
    return {
      pending_count: Number(data.pending_count) || 0,
      invoices: Array.isArray(data.invoices) ? data.invoices : [],
    };
  } catch {
    return { pending_count: 0, invoices: [] };
  }
}

/**
 * 1-Tap Approval: Super Admin menyetujui tagihan pembayaran paket vendor
 */
export async function approveAdminInvoice(
  token: string,
  invoiceId: number
): Promise<{ success: boolean; message: string; subscription?: VendorSubscription }> {
  if (!token || !invoiceId) {
    return { success: false, message: "Token atau ID Tagihan tidak valid." };
  }

  try {
    const res = await fetch(
      `${WP_API_URL}/wp-json/maschan/v1/admin/billing/approve`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ invoice_id: invoiceId }),
      }
    );

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        message: data.message || "Gagal menyetujui pembayaran paket.",
      };
    }
    return data;
  } catch (err) {
    return {
      success: false,
      message: getErrorMessage(err, "Gagal menghubungi server."),
    };
  }
}

/**
 * Penolakan Tagihan: Super Admin menolak pembayaran paket vendor dengan alasan
 */
export async function rejectAdminInvoice(
  token: string,
  invoiceId: number,
  reason: string
): Promise<{ success: boolean; message: string }> {
  if (!token || !invoiceId) {
    return { success: false, message: "Token atau ID Tagihan tidak valid." };
  }

  try {
    const res = await fetch(
      `${WP_API_URL}/wp-json/maschan/v1/admin/billing/reject`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          invoice_id: invoiceId,
          reason: reason || "Bukti transfer tidak valid atau tidak terbaca.",
        }),
      }
    );

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        message: data.message || "Gagal menolak tagihan pembayaran.",
      };
    }
    return data;
  } catch (err) {
    return {
      success: false,
      message: getErrorMessage(err, "Gagal menghubungi server."),
    };
  }
}

