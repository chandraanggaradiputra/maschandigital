### 🎯 Instruksi Lengkap Antigravity: Integrasi Media Testimoni (Maksimal 5 Foto Bukti & Sematan Video YouTube/TikTok/Reels)

Terapkan SOP Kerja Penuh: Isolasi Git Branch -> Update Tipe Data & API Client -> Tambahkan Penyimpanan Meta di Backend -> Perbarui Form Pengajuan Vendor -> Tampilkan Media di Halaman Publik & Pusat Moderasi -> Evaluasi Mandiri (tsc, lint, build) -> Merge ke Main -> Push ke GitHub -> Tulis Laporan ke AGENTS.OUTPUT.md & Output Wajib Git Diff.

---

#### 1. Alur Git Awal (Branching)
Jalankan di terminal PC lokal:
1. `git checkout main && git pull origin main`
2. `git checkout -b feature/review-media-photos-and-video-embed`

---

#### 2. Spesifikasi Berkas Target & Kode Implementasi

##### A. Perbarui Tipe Data (`types/index.ts`)
Buka `types/index.ts`, tambahkan properti opsional `images?: string[]` dan `video_url?: string` pada interface ulasan:

```typescript
export interface ProductReview {
  id: number;
  author_name: string;
  rating: number;
  content: string;
  date: string;
  images?: string[];     // Array URL foto bukti ulasan (maksimal 5 foto)
  video_url?: string;    // URL Video YouTube Shorts / TikTok / Instagram Reels
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
  images?: string[];     // Foto bukti yang diverifikasi admin
  video_url?: string;    // Video review pembeli
}

B. Backend WordPress (maschan-headless.php)
1. Saat Menyimpan Ulasan Baru (submit_review):
Simpan meta ulasan review_images dan review_video_url:

// Simpan foto bukti (maksimal 5 foto)
if (!empty($params['images']) && is_array($params['images'])) {
    $sanitized_images = array_slice(array_map('esc_url_raw',$params['images']), 0, 5);
    update_comment_meta($comment_id, 'review_images', wp_json_encode($sanitized_images));
}

// Simpan link video embed sosial media
if (!empty($params['video_url'])) {
    update_comment_meta($comment_id, 'review_video_url', esc_url_raw(trim($params['video_url'])));
}

2. Saat Mengambil Ulasan (get_reviews & get_admin_reviews):
Baca meta ulasan dan sertakan dalam respons:

$raw_images = get_comment_meta($comment->comment_ID, 'review_images', true);$images_list = !empty($raw_images) ? json_decode($raw_images, true) : [];
$video_link = get_comment_meta($comment->comment_ID, 'review_video_url', true) ?: '';

// Sertakan di array ulasan:
'images'    => is_array($images_list) ?$images_list : [],
'video_url' => (string) $video_link,

C. Perbarui API Client Frontend (lib/api/wordpress.ts)
Buka lib/api/wordpress.ts, perbarui fungsi submitProductReview:

export async function submitProductReview(
  productId: number,
  data: {
    author_name: string;
    rating: number;
    content: string;
    images?: string[];
    video_url?: string;
  }
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(
      `${WORDPRESS_URL}/wp-json/maschan/v1/products/${productId}/reviews`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    const result = await res.json();
    return {
      success: result.success ?? false,
      message: result.message || "Ulasan berhasil diajukan.",
    };
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Terjadi kesalahan saat mengajukan ulasan.";
    return { success: false, message: msg };
  }
}

D. Perbarui Form Testimoni Vendor (components/dashboard/ProductVendorReviewsManager.tsx)
Buka components/dashboard/ProductVendorReviewsManager.tsx:

1. Impor Ikon Pendukung:

import { Camera, Video, X, Loader2, Play } from "lucide-react";
import { getVendorSession } from "@/lib/api/auth";
import { cn } from "./lib/utils";

2. Tambahkan State Unggah Media:

const [reviewImages, setReviewImages] = useState<string[]>([]);
const [videoUrl, setVideoUrl] = useState<string>("");
const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
const [uploadError, setUploadError] = useState<string>("");

3. Handler Unggah Foto Bukti (Maksimal 5 Foto):

const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  const remaining = 5 - reviewImages.length;
  if (remaining <= 0) {
    setUploadError("Maksimal 5 foto bukti ulasan yang diizinkan.");
    return;
  }

  const filesToUpload = Array.from(files).slice(0, remaining);
  setIsUploadingPhoto(true);
  setUploadError("");

  try {
    const session = getVendorSession();
    const newUrls: string[] = [];

    for (const file of filesToUpload) {
      if (file.size > 5 * 1024 * 1024) continue; // Maks 5MB

      const formData = new FormData();
      formData.append("file", file);

      const WP_API = process.env.NEXT_PUBLIC_WORDPRESS_URL || "[https://app.maschandigital.id](https://app.maschandigital.id)";
      const res = await fetch(`${WP_API}/wp-json/maschan/v1/media/upload`, {
        method: "POST",
        headers: session?.token ? { Authorization: `Bearer ${session.token}` } : {},
        body: formData,
      });
      const json = await res.json();
      if (res.ok && json.success && json.url) {
        newUrls.push(json.url);
      }
    }

    if (newUrls.length > 0) {
      setReviewImages((prev) => [...prev, ...newUrls].slice(0, 5));
    }
  } catch {
    setUploadError("Gagal mengunggah beberapa foto.");
  } finally {
    setIsUploadingPhoto(false);
    e.target.value = "";
  }
};

const handleRemovePhoto = (index: number) => {
  setReviewImages((prev) => prev.filter((_, i) => i !== index));
};

4. Kirim Data Media saat Submit:
Pada handleSubmit, sertakan:

const res = await submitProductReview(productId, {
  author_name: authorName.trim(),
  rating,
  content: content.trim(),
  images: reviewImages,
  video_url: videoUrl.trim(),
});

Reset setReviewImages([]) dan setVideoUrl("") saat modal ditutup atau berhasil disubmit.

5. Tambahkan Elemen UI Input Media di Modal Form:
Di bawah kolom Isi Kutipan Testimoni, tambahkan:

{/* Unggah Foto Bukti Testimoni */}
<div className="space-y-1.5">
  <div className={cn('flex', 'items-center', 'justify-between')}>
    <label className={cn('text-xs', 'font-semibold', 'text-slate-700', 'dark:text-slate-300', 'flex', 'items-center', 'gap-1.5')}>
      <Camera className={cn('w-4', 'h-4', 'text-[#093c96]', 'dark:text-blue-400')} />
      <span>Foto Bukti Chat WhatsApp / Produk ({reviewImages.length}/5)</span>
    </label>
    <span className={cn('text-[10px]', 'text-slate-400')}>Opsional • Maks. 5 foto</span>
  </div>

  <div className={cn('flex', 'flex-wrap', 'gap-2', 'pt-1')}>
    {reviewImages.map((imgUrl, idx) => (
      <div key={idx} className={cn('relative', 'w-16', 'h-16', 'rounded-xl', 'overflow-hidden', 'border', 'border-slate-200', 'dark:border-slate-700', 'group')}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imgUrl} alt={`Bukti ${idx + 1}`} className={cn('w-full', 'h-full', 'object-cover')} />
        <button
          type="button"
          onClick={() => handleRemovePhoto(idx)}
          className={cn('absolute', 'top-1', 'right-1', 'p-1', 'bg-rose-600', 'hover:bg-rose-700', 'text-white', 'rounded-full', 'transition-colors')}
        >
          <X className={cn('w-3', 'h-3')} />
        </button>
      </div>
    ))}

    {reviewImages.length < 5 && (
      <label className={cn('w-16', 'h-16', 'rounded-xl', 'border-2', 'border-dashed', 'border-slate-300', 'dark:border-slate-700', 'hover:border-[#093c96]', 'dark:hover:border-blue-400', 'flex', 'flex-col', 'items-center', 'justify-center', 'text-slate-400', 'hover:text-[#093c96]', 'cursor-pointer', 'transition-colors')}>
        {isUploadingPhoto ? (
          <Loader2 className={cn('w-4', 'h-4', 'animate-spin', 'text-[#093c96]')} />
        ) : (
          <Camera className={cn('w-4', 'h-4')} />
        )}
        <span className={cn('text-[9px]', 'mt-0.5', 'font-medium')}>{isUploadingPhoto ? "..." : "+ Foto"}</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/jpg"
          multiple
          disabled={isUploadingPhoto}
          onChange={handleUploadPhoto}
          className="hidden"
        />
      </label>
    )}
  </div>
  {uploadError && <p className={cn('text-[11px]', 'text-rose-500')}>{uploadError}</p>}
</div>

{/* Input Video Embed Sosial Media */}
<div className="space-y-1">
  <label className={cn('text-xs', 'font-semibold', 'text-slate-700', 'dark:text-slate-300', 'flex', 'items-center', 'gap-1.5')}>
    <Video className={cn('w-4', 'h-4', 'text-emerald-600', 'dark:text-emerald-400')} />
    <span>Tautan Video Testimoni (Sosial Media)</span>
  </label>
  <input
    type="url"
    value={videoUrl}
    onChange={(e) => setVideoUrl(e.target.value)}
    placeholder="Tempel tautan YouTube Shorts, TikTok, atau Instagram Reels..."
    className={cn('w-full', 'px-3', 'py-2', 'text-xs', 'bg-white', 'dark:bg-slate-800', 'border', 'border-slate-200', 'dark:border-slate-700', 'rounded-xl', 'text-slate-900', 'dark:text-white', 'placeholder:text-slate-400', 'focus:outline-none', 'focus:ring-2', 'focus:ring-[#093c96]')}
  />
  <p className={cn('text-[10px]', 'text-slate-400')}>
    Mendukung format video pendek dari YouTube Shorts, TikTok, dan Instagram (0 MB penyimpanan server).
  </p>
</div>

E. Tampilkan Foto & Video di Halaman Produk Publik & Pusat Moderasi

1. Pada components/product/ProductReviewsSection.tsx:
Di dalam kartu review:

Jika review.images && review.images.length > 0, tampilkan deretan thumbnail foto bukti ulasan:

<div className={cn('flex', 'flex-wrap', 'gap-2', 'pt-2')}>
  {review.images.map((img, i) => (
    <a key={i} href={img} target="_blank" rel="noopener noreferrer" className={cn('block', 'w-14', 'h-14', 'rounded-xl', 'overflow-hidden', 'border', 'border-slate-200', 'dark:border-slate-800', 'hover:opacity-90', 'transition-opacity')}>
      <img src={img} alt={`Foto ulasan ${review.author_name}`} className={cn('w-full', 'h-full', 'object-cover')} />
    </a>
  ))}
</div>

Jika review.video_url:
Tampilkan tombol tautan video yang elegan:

<a
  href={review.video_url}
  target="_blank"
  rel="noopener noreferrer"
  className={cn('inline-flex', 'items-center', 'gap-1.5', 'px-3', 'py-1.5', 'mt-2', 'rounded-xl', 'text-xs', 'font-semibold', 'bg-emerald-50', 'text-emerald-700', 'dark:bg-emerald-950/40', 'dark:text-emerald-300', 'border', 'border-emerald-200', 'dark:border-emerald-800', 'hover:bg-emerald-100', 'transition-colors')}
>
  <Play className={cn('w-3.5', 'h-3.5', 'fill-emerald-600', 'text-emerald-600')} />
  <span>Tonton Video Testimoni</span>
</a>

2. Pada app/admin/moderasi/page.tsx:
Tampilkan juga pratinjau review.images dan review.video_url pada kartu ulasan agar Super Admin dapat melihat bukti foto chat WhatsApp atau mengklik video ulasan sebelum melakukan moderasi.