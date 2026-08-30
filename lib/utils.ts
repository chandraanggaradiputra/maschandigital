import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ProductCategory } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format number to Indonesian Rupiah currency format (e.g. Rp 150.000)
 */
export function formatRupiah(
  amount: number | string | undefined | null,
): string {
  if (amount === undefined || amount === null || amount === "") return "Rp 0";
  const numericAmount =
    typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numericAmount)) return "Rp 0";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericAmount);
}

/**
 * Normalize Indonesian phone numbers to international 62 format
 */
export function normalizeWhatsAppNumber(phone: string): string {
  if (!phone) return "";
  let cleaned = phone.replace(/[^0-9]/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.slice(1);
  } else if (cleaned.startsWith("8")) {
    cleaned = "62" + cleaned;
  }
  return cleaned;
}

/**
 * Generate Direct WhatsApp Link for buying/inquiring about a product
 */
export function generateWhatsAppProductUrl(params: {
  whatsappNumber: string;
  productName: string;
  price?: string | number;
  productUrl?: string;
  vendorName?: string;
}): string {
  const { whatsappNumber, productName, price, productUrl, vendorName } = params;
  const normalizedPhone = normalizeWhatsAppNumber(whatsappNumber);

  let formattedPrice = "";
  if (price) {
    formattedPrice = ` (Harga: ${typeof price === "number" ? formatRupiah(price) : price})`;
  }

  const siteName = "Mas Chan Digital - Marketplace Lokal Serang";
  const text =
    `Halo ${vendorName ? vendorName : "Admin"}, saya tertarik untuk memesan produk ini dari *${siteName}*:\n\n` +
    `📦 *Produk:* ${productName}${formattedPrice}\n` +
    (productUrl ? `🔗 *Link Produk:* ${productUrl}\n\n` : "\n") +
    `Mohon info ketersediaan stok dan cara transaksi lanjutannya. Terima kasih!`;

  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * Generate Direct WhatsApp Link for general vendor inquiries
 */
export function generateWhatsAppVendorUrl(params: {
  whatsappNumber: string;
  vendorName: string;
}): string {
  const { whatsappNumber, vendorName } = params;
  const normalizedPhone = normalizeWhatsAppNumber(whatsappNumber);
  const text = `Halo *${vendorName}*, saya menemukan profil toko Anda di *Mas Chan Digital (Marketplace Serang)*. Saya ingin bertanya seputar produk/layanan yang Anda tawarkan. Terima kasih!`;

  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * Generate Direct WhatsApp Link for vendor subscription billing confirmation
 */
export function generateWhatsAppBillingConfirmationUrl(params: {
  invoiceNumber: string;
  storeName: string;
  planName: string;
  amount: number;
}): string {
  const adminWhatsApp = "6282298148474"; // WhatsApp Resmi Mas Chan Digital
  const text =
    `Halo Admin Mas Chan Digital, saya ingin konfirmasi pembayaran langganan toko:\n\n` +
    `🏪 *Nama Toko:* ${params.storeName}\n` +
    `🧾 *No. Invoice:* ${params.invoiceNumber}\n` +
    `📦 *Paket:* ${params.planName}\n` +
    `💰 *Nominal:* ${formatRupiah(params.amount)}\n\n` +
    `Saya sudah mengunggah bukti transfer di dashboard vendor. Mohon bantuannya untuk diverifikasi. Terima kasih!`;

  return `https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(text)}`;
}

export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

// ---------------------------------------------------------------------
// Smart WhatsApp Order Form (dipakai components/product/WhatsAppOrderModal.tsx)
// Sengaja ditulis di sini (bukan inline di komponen), reuse normalizeWhatsAppNumber
// di atas — satu-satunya tempat yang tahu cara membangun URL WA & normalisasi nomor.
// ---------------------------------------------------------------------

export type KecamatanSerang =
  | "Serang"
  | "Cipocok Jaya"
  | "Kasemen"
  | "Curug"
  | "Taktakan"
  | "Walantaka";

export type MetodeAntarProduk = "kurir_lokal" | "cod" | "ambil_di_toko";

export const METODE_ANTAR_LABEL: Record<MetodeAntarProduk, string> = {
  kurir_lokal: "Kurir Lokal",
  cod: "COD (Titik Ketemuan)",
  ambil_di_toko: "Ambil di Toko",
};

export function generateWhatsAppOrderUrl(params: {
  whatsappNumber: string;
  vendorName: string;
  productName: string;
  unitPrice: number;
  qty: number;
  buyerName: string;
  kecamatan: KecamatanSerang;
  metodeAntar: MetodeAntarProduk;
  catatan?: string;
  productUrl: string;
}): string {
  const {
    whatsappNumber,
    vendorName,
    productName,
    unitPrice,
    qty,
    buyerName,
    kecamatan,
    metodeAntar,
    catatan,
    productUrl,
  } = params;

  const normalizedPhone = normalizeWhatsAppNumber(whatsappNumber);
  const subtotal = unitPrice * qty;

  const text =
    `Halo ${vendorName || "Admin Toko"}, saya ingin memesan produk dari Mas Chan Digital:\n\n` +
    `🛒 *RINCIAN PESANAN:*\n` +
    `• Produk: ${productName}\n` +
    `• Harga Satuan: ${formatRupiah(unitPrice)}\n` +
    `• Jumlah: ${qty} pcs\n` +
    `• Estimasi Total: ${formatRupiah(subtotal)}\n\n` +
    `📍 *INFORMASI PEMESAN & TUJUAN:*\n` +
    `• Nama Pemesan: ${buyerName}\n` +
    `• Wilayah/Kecamatan: ${kecamatan}, Kota Serang\n` +
    `• Pilihan Pengiriman: ${METODE_ANTAR_LABEL[metodeAntar]}\n` +
    (catatan?.trim() ? `• Catatan: ${catatan.trim()}\n` : ``) +
    `\n🔗 Tautan Produk: ${productUrl}`;

  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(text)}`;
}

// Nomor WhatsApp resmi admin Mas Chan Digital untuk konfirmasi pembayaran langganan.
export const MASCHAN_ADMIN_WHATSAPP = "6282298148474";

/**
 * Ubah daftar kategori DATAR dari GET /categories (tiap item cuma tahu `parent`,
 * tanpa `children`) jadi struktur POHON bersarang (`children` terisi).
 * Satu-satunya tempat logika ini boleh berada — dipakai ProductForm.tsx dan
 * komponen manapun yang butuh tampilan kategori hierarkis, supaya tidak ada
 * dua cara berbeda membangun pohon yang sama dari data yang sama.
 */
export function buildCategoryTree(
  flatCategories: ProductCategory[],
): ProductCategory[] {
  const byId = new Map<number, ProductCategory>();
  flatCategories.forEach((cat) => {
    byId.set(cat.id, { ...cat, children: [] });
  });

  const roots: ProductCategory[] = [];
  byId.forEach((cat) => {
    if (cat.parent && byId.has(cat.parent)) {
      byId.get(cat.parent)!.children!.push(cat);
    } else {
      // parent = 0, atau parent merujuk ID yang tidak ada di daftar (data
      // tidak konsisten) — perlakukan sebagai kategori level teratas, jangan
      // sampai kategori itu hilang dari tampilan sama sekali.
      roots.push(cat);
    }
  });

  return roots;
}

/**
 * Resolusi Kecamatan Vendor Kota Serang secara akurat tanpa bias kata "Kota Serang".
 * Memetakan domisili vendor ke salah satu dari 6 kecamatan resmi Kota Serang.
 */
export function resolveVendorDistrict(
  vendor?: {
    location_district?: string;
    city?: string;
    store_name?: string;
    address?: {
      street_1?: string;
      street_2?: string;
      city?: string;
      state?: string;
    };
  } | null,
): string {
  if (!vendor) return "Serang";

  // Gabungkan seluruh teks lokasi vendor
  const fullLocation = [
    vendor.location_district || "",
    vendor.city || "",
    vendor.address?.street_1 || "",
    vendor.address?.street_2 || "",
    vendor.address?.city || "",
    vendor.address?.state || "",
    vendor.store_name || "",
  ]
    .join(" ")
    .toLowerCase();

  // 1. Periksa kecamatan spesifik terlebih dahulu
  if (fullLocation.includes("cipocok")) return "Cipocok Jaya";
  if (fullLocation.includes("taktakan")) return "Taktakan";
  if (fullLocation.includes("kasemen")) return "Kasemen";
  if (fullLocation.includes("curug")) return "Curug";
  if (fullLocation.includes("walantaka")) return "Walantaka";

  // 2. Periksa kelurahan / area khusus Kecamatan Serang (Unyur, BIP, Kotabaru, Kaligandu, Serang Kota, dll)
  if (
    fullLocation.includes("unyur") ||
    fullLocation.includes("banten indah permai") ||
    fullLocation.includes("bip") ||
    fullLocation.includes("kotabaru") ||
    fullLocation.includes("kaligandu") ||
    fullLocation.includes("sukawana") ||
    fullLocation.includes("kagungan") ||
    fullLocation.includes("lopang") ||
    fullLocation.includes("terondol") ||
    fullLocation.includes("cipare") ||
    fullLocation.includes("cimuncang") ||
    fullLocation.includes("lontarbaru") ||
    fullLocation.includes("sumurpecung")
  ) {
    return "Serang";
  }

  // 3. Jika hanya memuat kata "serang" tanpa ada kecamatan lain
  const isOther =
    fullLocation.includes("cipocok") ||
    fullLocation.includes("taktakan") ||
    fullLocation.includes("kasemen") ||
    fullLocation.includes("curug") ||
    fullLocation.includes("walantaka");

  if (!isOther && fullLocation.includes("serang")) {
    return "Serang";
  }

  return "Serang";
}

