// lib/analytics.ts

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

// 🛒 1. Pelacak Klik WhatsApp UMKM (Jalur A)
export function trackWhatsAppClick(params: {
  vendorName: string;
  productId?: string;
  productName?: string;
  kecamatan: string;
}): void {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'click_whatsapp_vendor',
      vendor_name: params.vendorName,
      product_id: params.productId ?? 'direct_store',
      product_name: params.productName ?? 'General Inquiry',
      kecamatan: params.kecamatan,
    });
  }
}

// 🕌 2. Pelacak Filter Jadwal Kajian (Jalur B)
export function trackKajianFilter(params: {
  targetAudience: 'Akhwat' | 'Ikhwan' | 'Umum';
  masjidName?: string;
  kecamatan?: string;
}): void {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'filter_kajian',
      target_audience: params.targetAudience,
      masjid_name: params.masjidName ?? 'Semua Masjid',
      kecamatan: params.kecamatan ?? 'Semua Kecamatan',
    });
  }
}