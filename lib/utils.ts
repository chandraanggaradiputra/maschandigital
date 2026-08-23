import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
    `Halo ${vendorName || "Admin Toko"}, saya tertarik dengan produk ini dari *${siteName}*:\n\n` +
    `📦 *Produk:* ${productName}${formattedPrice}\n` +
    (productUrl ? `🔗 *Link Produk:* ${productUrl}\n\n` : "\n") +
    `Mohon info ketersediaan stok dan cara pemesanannya. Terima kasih!`;

  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(text)}`;
}

export function generateWhatsAppVendorUrl(params: {
  whatsappNumber: string;
  vendorName: string;
}): string {
  const { whatsappNumber, vendorName } = params;
  const normalizedPhone = normalizeWhatsAppNumber(whatsappNumber);
  const text = `Halo *${vendorName}*, saya menemukan profil toko Anda di *Mas Chan Digital (Marketplace Serang)*. Saya ingin bertanya seputar produk/layanan Anda. Terima kasih!`;

  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(text)}`;
}

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

// Pesan pesanan terstruktur (Smart WhatsApp Order Form) — dipakai WhatsAppOrderModal.
// Sengaja jadi fungsi terpisah di sini (bukan ditulis inline di komponen) supaya
// satu-satunya tempat yang tahu cara membangun URL WA & normalisasi nomor tetap
// file ini, konsisten dengan 3 fungsi WA lain di atas.
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

export function generateWhatsAppBillingConfirmationUrl(params: {
  invoiceNumber: string;
  storeName: string;
  planName: string;
  amount: number;
}): string {
  const { invoiceNumber, storeName, planName, amount } = params;
  const text =
    `Halo Admin Mas Chan Digital, saya *${storeName}* ingin konfirmasi pembayaran langganan:\n\n` +
    `🧾 *No. Invoice:* ${invoiceNumber}\n` +
    `📦 *Paket:* ${planName}\n` +
    `💰 *Nominal:* ${formatRupiah(amount)}\n\n` +
    `Foto bukti transfer sudah saya unggah di dashboard. Mohon dicek dan disetujui ya, terima kasih!`;

  return `https://wa.me/${MASCHAN_ADMIN_WHATSAPP}?text=${encodeURIComponent(text)}`;
}
