// lib/analytics.ts
'use client';

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

function pushToDataLayer(payload: Record<string, unknown>): void {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push(payload);
  }
}

// 🛒 1. Pelacak Klik WhatsApp Vendor
export function trackWhatsAppClick(params: {
  vendorName: string;
  productId?: string | number;
  productName?: string;
  kecamatan: string;
}): void {
  pushToDataLayer({
    event: 'click_whatsapp_vendor',
    vendor_name: params.vendorName,
    product_id: params.productId ? String(params.productId) : 'direct_store',
    product_name: params.productName ?? 'General Inquiry',
    kecamatan: params.kecamatan,
  });
}

// 🔍 2. Pelacak Pencarian & Filter Kecamatan
export function trackSearchEvent(params: {
  searchTerm: string;
  district?: string;
}): void {
  if (!params.searchTerm.trim() && (!params.district || params.district === 'all')) return;
  pushToDataLayer({
    event: 'search_query',
    search_term: params.searchTerm.trim() || 'Semua Produk',
    district_filter: params.district || 'Semua Kecamatan',
  });
}

// 🛍️ 3. Pelacak Kunjungan Halaman Detail Produk
export function trackViewProduct(params: {
  productId: string | number;
  productName: string;
  price: number;
  vendorName: string;
  category: string;
}): void {
  pushToDataLayer({
    event: 'view_product_detail',
    product_id: String(params.productId),
    product_name: params.productName,
    price: params.price,
    vendor_name: params.vendorName,
    category: params.category,
  });
}

// 🏪 4. Pelacak Kunjungan Profil Toko Vendor
export function trackViewVendor(params: {
  vendorName: string;
  district: string;
}): void {
  pushToDataLayer({
    event: 'view_vendor_profile',
    vendor_name: params.vendorName,
    district: params.district,
  });
}

// 🚀 5. Pelacak Klik CTA "Daftar Toko Gratis"
export function trackVendorRegisterClick(sourceLocation: string): void {
  pushToDataLayer({
    event: 'click_vendor_register',
    source_location: sourceLocation,
  });
}

// 📢 6. Pelacak Share / QR Code Toko
export function trackShareAction(params: {
  actionType: 'share_link' | 'open_qr';
  targetName: string;
}): void {
  pushToDataLayer({
    event: params.actionType,
    target_name: params.targetName,
  });
}

// 🕌 7. Pelacak Filter Kajian (Jalur B: Standar Akhwat & Ikhwan)
export function trackKajianFilter(params: {
  targetAudience: 'Akhwat' | 'Ikhwan' | 'Umum';
  masjidName?: string;
  kecamatan?: string;
}): void {
  pushToDataLayer({
    event: 'filter_kajian',
    target_audience: params.targetAudience,
    masjid_name: params.masjidName ?? 'Semua Masjid',
    kecamatan: params.kecamatan ?? 'Semua Kecamatan',
  });
}