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
  parent: number; // 0 = Parent Category, > 0 = Subcategory ID
  count?: number;
  description?: string;
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
  location_district?: string;
  is_verified?: boolean;
  store_hours?: StoreHours;
  vacation_mode?: VacationMode;
}

export interface ProductVariation {
  id: string | number;
  name: string;
  price: number;
  regular_price?: number;
  sale_price?: number;
  stock_status?: "instock" | "outofstock";
}

export type ProductType = "simple" | "external" | "affiliate" | "variable";
export type BusinessType = "product" | "service";
export type PriceModel = "fixed" | "starting_at" | "consultation";
export type ServiceAction = "appointment" | "reservation" | "consultation";

export interface Product {
  id: number;
  name: string;
  slug: string;
  permalink?: string;
  type: ProductType;
  business_type?: BusinessType;
  price_model?: PriceModel;
  service_areas?: string[];
  service_action?: ServiceAction;
  status: "publish" | "draft" | "pending";
  featured?: boolean;
  is_variable?: boolean;
  variations?: ProductVariation[];
  price_range?: { min: number; max: number };
  views?: number;
  view_count?: number;
  total_views?: number;
  views_count?: number;
  wa_clicks_count?: number;
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
  reviews_data?: ProductReviewsData;
}

export interface BankAccount {
  bank: string;
  account_number: string;
  holder_name: string;
}

export interface SocialMediaItem {
  platform: string;
  url: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface SiteSettings {
  cs_whatsapp: string;
  cs_email: string;
  address: string;
  top_announcement?: string;
  bank_accounts: BankAccount[];
  social_media: SocialMediaItem[];
  faqs?: FAQItem[];
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

export interface ChatIntegration {
  enabled: boolean;
  property_id: string;
  widget_id: string;
}

export interface Vendor {
  id: number;
  store_name: string;
  slug: string;
  owner_name?: string;
  email?: string;
  phone?: string;
  views_count?: number;
  whatsapp_number: string;
  address?: {
    street_1?: string;
    street_2?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  location_district?: string;
  location_subdistrict?: string;
  subdistrict?: string;
  banner?: string;
  avatar?: string;
  description?: string;
  is_verified: boolean;
  rating?: number;
  review_count?: number;
  products_count?: number;
  wa_clicks_count?: number;
  joined_date?: string;
  socials?: VendorSocials;
  store_hours?: StoreHours;
  vacation_mode?: VacationMode;
  store_seo?: StoreSEO;
  chat_integration?: ChatIntegration;
  is_exempt?: boolean;
  subscription?: VendorSubscription | null;
  plan_id?: PlanId;
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
  | "rejected"
  | "cancelled";

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
  confirmed_at?: string | null; // Kapan vendor unggah bukti bayar — dipakai cron hitung toleransi 3 hari
  is_overdue?: boolean; // true kalau sudah lewat toleransi verifikasi tapi admin belum approve/reject
  approved_by?: number | null;
  created_at: string;
}

export interface AdminBillingInvoice extends BillingInvoice {
  store_name?: string;
  store_slug?: string;
  owner_name?: string;
  vendor_email?: string;
  whatsapp_number?: string;
  plan_name?: string;
}

export interface AdminInvoicesResponse {
  pending_count: number;
  invoices: AdminBillingInvoice[];
}

export interface AdminVendorItem extends Vendor {
  subscription?: VendorSubscription | null;
  remaining_days?: number | null;
  status_label?: string;
  is_exempt?: boolean;
}

export interface ProductReview {
  id: number;
  author_name: string;
  rating: number;
  content: string;
  date: string;
  images?: string[]; // Array URL foto bukti ulasan (maksimal 5 foto)
  video_url?: string; // URL Video YouTube Shorts / TikTok / Instagram Reels
}

export interface ProductReviewsData {
  average_rating: number;
  total_reviews: number;
  reviews: ProductReview[];
}

export interface AdminReviewItem {
  id: number;
  product_id: number;
  product_name: string;
  product_slug: string;
  vendor_name: string;
  author_name: string;
  rating: number;
  content: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  images?: string[]; // Foto bukti yang diverifikasi admin
  video_url?: string; // Video review pembeli
}

export interface AdminReviewsResponse {
  pending_count: number;
  reviews: AdminReviewItem[];
}

export interface StoredPushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  role: "admin" | "vendor" | "guest";
  userId?: number;
  updatedAt: string;
}

export interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

export interface PushSubscriptionRecord {
  endpoint: string;
  keys: PushSubscriptionKeys;
  subscribedAt: string;
  role?: "admin" | "vendor" | "guest";
}

export interface PushSubscriptionInput {
  endpoint: string;
  expirationTime?: number | null;
  keys: PushSubscriptionKeys;
}

export interface BroadcastNotificationPayload {
  title: string;
  body: string;
  url?: string;
}

export interface BroadcastNotificationResult {
  success: boolean;
  message: string;
  sentCount?: number;
}

declare global {
  var globalPushSubscriptions: StoredPushSubscription[] | undefined;
}

export * from "./blog";



