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
