import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
