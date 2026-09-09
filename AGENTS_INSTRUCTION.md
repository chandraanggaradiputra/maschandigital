### 🎯 Instruksi Lengkap Antigravity: Penambahan Fitur Hapus Testimoni Permanen Khusus Super Admin (/admin/moderasi)

Terapkan SOP Kerja Penuh: Isolasi Git Branch -> Tambahkan Aksi 'delete' di Backend & API Client -> Tambahkan Tombol Hapus & Modal Konfirmasi di Halaman Moderasi -> Evaluasi Mandiri (tsc, lint, build) -> Merge ke Main -> Push ke GitHub -> Tulis Laporan ke AGENTS.OUTPUT.md & Output Wajib Git Diff.

---

#### 1. Alur Git Awal (Branching)
Jalankan di terminal PC lokal:
1. `git checkout main && git pull origin main`
2. `git checkout -b feature/super-admin-delete-testimonial`

---

#### 2. Spesifikasi Berkas Target & Kode Implementasi

##### A. Backend WordPress (`maschan-headless.php`)
Pada endpoint penanganan aksi moderasi ulasan `POST /wp-json/maschan/v1/admin/reviews/<id>/action`:
Tambahkan penanganan untuk `action === 'delete'` menggunakan fungsi bawaan WordPress `wp_delete_comment`:

```php
// Penanganan Aksi Hapus Permanen Khusus Super Admin
if ($action === 'delete') {
    $deleted = wp_delete_comment($review_id, true); // true = force delete permanen dari database
    if ($deleted) {
        return rest_ensure_response([
            'success' => true,
            'message' => 'Testimoni telah berhasil dihapus secara permanen dari database.'
        ]);
    } else {
        return new WP_Error('delete_failed', 'Gagal menghapus testimoni dari database.', ['status' => 500]);
    }
}

B. Perbarui API Client Frontend (lib/api/wordpress.ts)
Buka lib/api/wordpress.ts, temukan fungsi performReviewAction:
Perluas tipe parameter action agar menerima 'delete':

export async function performReviewAction(
  token: string,
  id: number,
  action: "approve" | "reject" | "delete",
  reason?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(
      `${WORDPRESS_URL}/wp-json/maschan/v1/admin/reviews/${id}/action`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({ action, reason }),
      }
    );
    const data = await res.json();
    return {
      success: data.success ?? false,
      message: data.message || "Aksi berhasil diproses.",
    };
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Terjadi kesalahan jaringan.";
    return { success: false, message: msg };
  }
}

C. Perbarui Halaman Moderasi Super Admin (app/admin/moderasi/page.tsx)
Buka app/admin/moderasi/page.tsx:

Impor Ikon Trash2 dari lucide-react:

import { Trash2 } from "lucide-react";

Tambahkan State & Handler Hapus Testimoni:

const [deletingReview, setDeletingReview] = useState<AdminReviewItem | null>(null);
const [isDeleting, setIsDeleting] = useState<boolean>(false);

const handleConfirmDelete = async () => {
  if (!deletingReview || !token) return;

  setIsDeleting(true);
  try {
    const res = await performReviewAction(token, deletingReview.id, "delete");
    if (res.success) {
      showToast(
        "success",
        `Testimoni dari "${deletingReview.author_name}" berhasil dihapus permanen.`
      );

      // Pembaruan Optimistik
      setReviews((prev) => prev.filter((r) => r.id !== deletingReview.id));
      if (deletingReview.status === "pending") {
        setPendingCount((prev) => Math.max(0, prev - 1));
      }
      setDeletingReview(null);
    } else {
      showToast("error", res.message || "Gagal menghapus testimoni.");
    }
  } catch {
    showToast("error", "Terjadi kesalahan jaringan saat menghapus ulasan.");
  } finally {
    setIsDeleting(false);
  }
};

3. Tambahkan Tombol Hapus pada Kartu Ulasan:
Pada blok tombol aksi di setiap kartu ulasan (tersedia di tab pending maupun tab approved):
Sematkan tombol [🗑️ Hapus] berwarna merah:

<button
  type="button"
  onClick={() => setDeletingReview(review)}
  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900/50 transition-colors shrink-0"
  title="Hapus testimoni ini secara permanen"
>
  <Trash2 className="w-4 h-4" />
  <span className="hidden sm:inline">Hapus</span>
</button>

4. Sematkan Modal Dialog Konfirmasi Keamanan Penghapusan:
Di bagian bawah halaman (sebelum penutup </main>):

{/* Modal Konfirmasi Hapus Permanen */}
{deletingReview && (
  <div
    role="dialog"
    aria-modal="true"
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
  >
    <div
      className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 animate-in zoom-in-95 duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
          <Trash2 className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-slab font-bold text-base text-slate-900 dark:text-white">
            Hapus Testimoni?
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tindakan ini permanen dan tidak dapat dibatalkan.
          </p>
        </div>
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
        Ulasan dari <strong>{deletingReview.author_name}</strong> untuk produk <em>&ldquo;{deletingReview.product_name}&rdquo;</em> akan dihapus sepenuhnya dari database.
      </p>

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setDeletingReview(null)}
          disabled={isDeleting}
          className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={handleConfirmDelete}
          disabled={isDeleting}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-sm disabled:opacity-50 transition-all"
        >
          {isDeleting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Menghapus...</span>
            </>
          ) : (
            <span>Ya, Hapus Permanen</span>
          )}
        </button>
      </div>
    </div>
  </div>
)}