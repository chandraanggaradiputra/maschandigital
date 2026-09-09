### 🎯 Instruksi Lengkap Antigravity: Penyelarasan Backend Media Ulasan, Komponen Video Embed Iframe, & Modal Zoom Foto Testimoni

Terapkan SOP Kerja Penuh: Isolasi Git Branch -> Sinkronisasi Backend PHP -> Buat Komponen ReviewVideoEmbed -> Tambahkan Modal Zoom & Video Iframe di Halaman Produk & Moderasi Admin -> Evaluasi Mandiri (tsc, lint, build) -> Merge ke Main -> Push ke GitHub -> Tulis Laporan ke AGENTS.OUTPUT.md & Output Wajib Git Diff.

---

#### 1. Alur Git Awal (Branching)
Jalankan di terminal PC lokal:
1. `git checkout main && git pull origin main`
2. `git checkout -b feature/review-media-embed-and-backend-sync`

---

#### 2. Spesifikasi Berkas Target & Kode Implementasi

##### A. Sinkronisasi Backend WordPress (`maschan-headless.php`)
Pastikan pada berkas `maschan-headless.php` di endpoint ulasan WordPress:

1. **Saat Menerima Ulasan Baru (`POST /wp-json/maschan/v1/products/<id>/reviews`)**:
   Simpan `images` dan `video_url` ke meta komentar:
   ```php
   // Simpan foto bukti ulasan (maksimal 5 foto)
   if (!empty($params['images']) && is_array($params['images'])) {
       $sanitized_images = array_slice(array_map('esc_url_raw',$params['images']), 0, 5);
       update_comment_meta($comment_id, 'review_images', wp_json_encode($sanitized_images));
   }

   // Simpan link video ulasan
   if (!empty($params['video_url'])) {
       update_comment_meta($comment_id, 'review_video_url', esc_url_raw(trim((string)$params['video_url'])));
   }

   1. Saat Membaca Ulasan (GET /products/<id>/reviews & GET /admin/reviews):
Baca meta ulasan dan kembalikan di respons JSON:

$raw_imgs = get_comment_meta($comment->comment_ID, 'review_images', true);$parsed_imgs = !empty($raw_imgs) ? json_decode($raw_imgs, true) : [];
$parsed_video = get_comment_meta($comment->comment_ID, 'review_video_url', true) ?: '';

// Tambahkan ke array output:
'images'    => is_array($parsed_imgs) ?$parsed_imgs : [],
'video_url' => (string) $parsed_video,

B. Buat Komponen Pemutar Video Sematan: components/ui/ReviewVideoEmbed.tsx
Buat berkas baru components/ui/ReviewVideoEmbed.tsx untuk mengonversi URL YouTube Shorts, YouTube standar, TikTok, atau Instagram menjadi pemutar video interaktif:

"use client";

import React from "react";
import { Play, ExternalLink } from "lucide-react";

interface ReviewVideoEmbedProps {
  url: string;
  authorName?: string;
}

export function ReviewVideoEmbed({ url, authorName }: ReviewVideoEmbedProps) {
  if (!url) return null;

  // 1. Deteksi YouTube / YouTube Shorts
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
  );
  if (ytMatch && ytMatch) {
    const videoId = ytMatch;
    return (
      <div className={cn('mt-3', 'overflow-hidden', 'rounded-2xl', 'border', 'border-slate-200', 'dark:border-slate-800', 'bg-slate-900', 'shadow-sm', 'max-w-sm')}>
        <div className={cn('relative', 'aspect-9/16', 'sm:aspect-video', 'w-full', 'max-h-[380px]')}>
          <iframe
            src={`[https://www.youtube-nocookie.com/embed/$](https://www.youtube-nocookie.com/embed/$){videoId}?rel=0`}
            title={`Video testimoni dari ${authorName || "Pelanggan"}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className={cn('w-full', 'h-full', 'border-0')}
          />
        </div>
      </div>
    );
  }

  // 2. Deteksi TikTok
  const tiktokMatch = url.match(/tiktok\.com\/@[\w.-]+\/video\/(\d+)/i);
  if (tiktokMatch && tiktokMatch) {
    const videoId = tiktokMatch;
    return (
      <div className={cn('mt-3', 'overflow-hidden', 'rounded-2xl', 'border', 'border-slate-200', 'dark:border-slate-800', 'bg-black', 'shadow-sm', 'max-w-[320px]')}>
        <div className={cn('relative', 'aspect-9/16', 'w-full', 'max-h-[420px]')}>
          <iframe
            src={`[https://www.tiktok.com/embed/v2/$](https://www.tiktok.com/embed/v2/$){videoId}`}
            title={`Video TikTok testimoni dari ${authorName || "Pelanggan"}`}
            allowFullScreen
            className={cn('w-full', 'h-full', 'border-0')}
          />
        </div>
      </div>
    );
  }

  // 3. Fallback Tautan Video (Instagram Reels / Platform Lain)
  return (
    <div className="mt-2.5">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn('inline-flex', 'items-center', 'gap-2', 'px-3.5', 'py-2', 'rounded-xl', 'text-xs', 'font-semibold', 'bg-emerald-50', 'text-emerald-700', 'dark:bg-emerald-950/40', 'dark:text-emerald-300', 'border', 'border-emerald-200', 'dark:border-emerald-800', 'hover:bg-emerald-100', 'dark:hover:bg-emerald-900/40', 'transition-all', 'shadow-2xs', 'group')}
      >
        <Play className={cn('w-3.5', 'h-3.5', 'fill-emerald-600', 'text-emerald-600', 'group-hover:scale-110', 'transition-transform')} />
        <span className={cn('truncate', 'max-w-xs')}>Putar Video Testimoni (Buka Tautan)</span>
        <ExternalLink className={cn('w-3.5', 'h-3.5', 'text-emerald-500')} />
      </a>
    </div>
  );
}

C. Perbarui Halaman Produk Publik (components/product/ProductReviewsSection.tsx)
Buka components/product/ProductReviewsSection.tsx:

1. Impor Komponen Pemutar Video & Ikon:

import { ReviewVideoEmbed } from "@/components/ui/ReviewVideoEmbed";
import { ZoomIn, X } from "lucide-react";
import { cn } from "./lib/utils";

2. Tambahkan State Modal Zoom Foto (Lightbox):

const [zoomedImage, setZoomedImage] = useState<string | null>(null);

3. Render Galeri Foto & Pemutar Video di Kartu Ulasan:
Pada masing-masing ulasan di daftar ulasan:

{/* Foto-Foto Bukti Ulasan */}
{review.images && review.images.length > 0 && (
  <div className="pt-2">
    <p className={cn('text-[11px]', 'font-semibold', 'text-slate-500', 'dark:text-slate-400', 'mb-1.5')}>
      Bukti Foto Pembeli ({review.images.length}):
    </p>
    <div className={cn('flex', 'flex-wrap', 'gap-2')}>
      {review.images.map((imgUrl, i) => (
        <button
          key={i}
          type="button"
          onClick={() => setZoomedImage(imgUrl)}
          className={cn('relative', 'w-16', 'h-16', 'sm:w-20', 'sm:h-20', 'rounded-xl', 'overflow-hidden', 'border', 'border-slate-200', 'dark:border-slate-800', 'hover:border-[#093c96]', 'group', 'cursor-zoom-in', 'transition-all', 'shadow-2xs')}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imgUrl} alt={`Bukti ulasan ${i + 1}`} className={cn('w-full', 'h-full', 'object-cover', 'group-hover:scale-105', 'transition-transform')} />
          <div className={cn('absolute', 'inset-0', 'bg-black/20', 'opacity-0', 'group-hover:opacity-100', 'flex', 'items-center', 'justify-center', 'transition-opacity', 'text-white')}>
            <ZoomIn className={cn('w-4', 'h-4')} />
          </div>
        </button>
      ))}
    </div>
  </div>
)}

{/* Pemutar Video Embed */}
{review.video_url && (
  <ReviewVideoEmbed url={review.video_url} authorName={review.author_name} />
)}

4. Sematkan Modal Zoom Foto (Lightbox) di bagian bawah komponen:

{/* Modal Zoom Foto Ulasan */}
{zoomedImage && (
  <div
    role="dialog"
    aria-modal="true"
    onClick={() => setZoomedImage(null)}
    className={cn('fixed', 'inset-0', 'z-50', 'flex', 'items-center', 'justify-center', 'p-4', 'bg-black/80', 'backdrop-blur-sm', 'animate-in', 'fade-in', 'duration-200')}
  >
    <div className={cn('relative', 'max-w-2xl', 'max-h-[85vh]', 'w-full', 'flex', 'items-center', 'justify-center')} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setZoomedImage(null)}
        aria-label="Tutup pratinjau foto"
        className={cn('absolute', '-top-10', 'right-0', 'p-2', 'text-white/80', 'hover:text-white', 'rounded-full', 'transition-colors')}
      >
        <X className={cn('w-6', 'h-6')} />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={zoomedImage}
        alt="Foto bukti ulasan resolusi penuh"
        className={cn('max-w-full', 'max-h-[80vh]', 'object-contain', 'rounded-2xl', 'shadow-2xl', 'border', 'border-slate-700')}
      />
    </div>
  </div>
)}

D. Perbarui Pusat Moderasi Super Admin (app/admin/moderasi/page.tsx)
Buka app/admin/moderasi/page.tsx:

1. Impor ReviewVideoEmbed dan modal zoom foto yang sama.

2. Pada kartu ulasan yang sedang ditinjau Super Admin, tampilkan deretan foto bukti ulasan (yang bisa di-zoom untuk membaca teks chat WhatsApp / bukti transfer) serta pemutar video embed agar Super Admin dapat memverifikasi dengan jelas sebelum menyetujui ulasan.