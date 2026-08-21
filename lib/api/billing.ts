import { getVendorSession } from "@/lib/api/auth";
import {
  SubscriptionPlan,
  VendorSubscription,
  BillingInvoice,
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
