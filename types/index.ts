export interface RankMathSEO {
  focus_keyword?: string;
  meta_title?: string;
  meta_description?: string;
  canonical_url?: string;
}

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  count?: number;
  parent?: number;
  children?: ProductCategory[];
  image?: string;
}

export interface ProductImage {
  id: number;
  src: string;
  alt: string;
  name?: string;
}

export interface VendorSummary {
  id: number;
  store_name: string;
  slug: string;
  phone?: string;
  whatsapp_number: string;
  avatar?: string;
  city?: string;
  is_verified?: boolean;
  store_hours?: StoreHours;
  vacation_mode?: VacationMode;
}

export type ProductType = "simple" | "external" | "affiliate";

export interface Product {
  id: number;
  name: string;
  slug: string;
  permalink?: string;
  type: ProductType;
  status: "publish" | "draft" | "pending";
  featured?: boolean;
  description: string;
  short_description: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  categories: ProductCategory[];
  category_ids?: number[];
  images: ProductImage[];
  external_url?: string;
  button_text?: string;
  vendor: VendorSummary;
  seo?: RankMathSEO;
  created_at?: string;
  total_sales?: number;
}

export interface StoreHoursDay {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface StoreHours {
  senin: StoreHoursDay;
  selasa: StoreHoursDay;
  rabu: StoreHoursDay;
  kamis: StoreHoursDay;
  jumat: StoreHoursDay;
  sabtu: StoreHoursDay;
  minggu: StoreHoursDay;
}

export interface VacationMode {
  isEnabled: boolean;
  vacationMessage: string;
}

export interface StoreSEO {
  seoTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  facebookTitle?: string;
  facebookDescription?: string;
}

export interface VendorSocials {
  instagram?: string;
  tiktok?: string;
  facebook?: string;
  youtube?: string;
  website?: string;
}

export interface Vendor {
  id: number;
  store_name: string;
  slug: string;
  owner_name?: string;
  email?: string;
  phone?: string;
  whatsapp_number: string;
  address?: {
    street_1?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  location_district?: string;
  banner?: string;
  avatar?: string;
  description?: string;
  is_verified: boolean;
  rating?: number;
  review_count?: number;
  products_count?: number;
  joined_date?: string;
  socials?: VendorSocials;
  store_hours?: StoreHours;
  vacation_mode?: VacationMode;
  store_seo?: StoreSEO;
}

export interface VendorAuthSession {
  token: string;
  user_id: number;
  user_email: string;
  user_display_name: string;
  vendor_id: number;
  vendor_slug?: string;
  role: string;
}

// ---------------------------------------------------------------------
// SISTEM LANGGANAN VENDOR (SUBSCRIPTION / BILLING)
// ---------------------------------------------------------------------

export type PlanId =
  | "free_forever"
  | "monthly_1m"
  | "quarterly_3m"
  | "biannual_6m"
  | "annual_1y";

export interface SubscriptionPlan {
  plan_id: PlanId;
  name: string;
  duration_days: number; // -1 = permanen/tidak pernah kedaluwarsa (beda makna dari max_products -1)
  price: number;
  max_products: number; // -1 = unlimited
}

// 7 status siklus hidup langganan — HARUS persis sama dengan definisi backend
// (maschan_subscription_statuses_can_add_product / maschan_subscription_closes_store).
// CATATAN (21 Agt 2026): 'trial' dan 'expired' dipertahankan untuk kompatibilitas
// data lama, TAPI tidak lagi dipakai alur otomatis — pendaftar baru langsung
// 'active' + 'free_forever', dan vendor yang lewat grace_period diturunkan ke
// 'active' + 'free_forever' (BUKAN 'expired'). Lihat AGENTS.md bagian 4E.
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
  plan_id: PlanId | "exempt"; // "exempt" = akun internal/demo, dikecualikan dari sistem langganan
  plan_name: string;
  end_date: string | null; // ISO datetime, null kalau belum pernah punya langganan ATAU exempt (tidak pernah berakhir)
  max_products: number; // -1 = unlimited
  is_unlimited: boolean;
  products_used: number;
  can_add_product: boolean; // dihitung backend — jangan hitung ulang tanggal/kuota di frontend
}

export type InvoiceStatus =
  | "unpaid"
  | "waiting_approval"
  | "approved"
  | "rejected";

export interface BillingInvoice {
  id: number;
  invoice_number: string;
  vendor_id: number;
  plan_id: PlanId;
  amount: number;
  payment_method: string;
  sender_account_name: string;
  proof_image_url: string;
  invoice_status: InvoiceStatus;
  admin_note?: string;
  rejected_reason?: string;
  approved_at?: string | null;
  approved_by?: number | null;
  created_at: string;
}