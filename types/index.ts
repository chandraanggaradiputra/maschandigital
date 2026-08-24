// Tambahkan/Pastikan bagian SISTEM LANGGANAN VENDOR di types/index.ts seperti berikut:
export type PlanId =
  | "free_forever"
  | "trial_30d"
  | "monthly_1m"
  | "quarterly_3m"
  | "biannual_6m"
  | "annual_1y"
  | "exempt";

export type SubscriptionPlanId = PlanId;

export interface SubscriptionPlan {
  id: SubscriptionPlanId;
  name: string;
  duration_days: number;
  price: number;
  max_products: number; // -1 untuk unlimited
  is_popular?: boolean;
  features?: string[];
}

export type SubscriptionStatus =
  | "trial"
  | "active"
  | "renewal_due"
  | "pending_approval"
  | "payment_rejected"
  | "grace_period"
  | "expired";

export interface VendorSubscription {
  status: SubscriptionStatus;
  plan_id: SubscriptionPlanId | string;
  plan_name: string;
  end_date: string | null;
  days_left?: number;
  is_exempt?: boolean;
  max_products: number;
  is_unlimited: boolean;
  products_used: number;
  can_add_product: boolean;
  rejection_reason?: string;
}

export type InvoiceStatus =
  | "unpaid"
  | "waiting_approval"
  | "approved"
  | "rejected"
  | "cancelled";

export interface BillingInvoice {
  id: number;
  invoice_number: string;
  vendor_id: number;
  plan_id: SubscriptionPlanId | string;
  amount: number;
  payment_method: string;
  sender_account_name?: string;
  proof_image_url?: string;
  invoice_status: InvoiceStatus;
  admin_note?: string;
  rejected_reason?: string;
  approved_at?: string | null;
  approved_by?: number | string | null;
  confirmed_at?: string | null;
  is_overdue?: boolean;
  created_at: string;
}

export interface BillingDetailsResponse {
  subscription: VendorSubscription | null;
  plans: Record<string, SubscriptionPlan>;
  invoices: BillingInvoice[];
}
