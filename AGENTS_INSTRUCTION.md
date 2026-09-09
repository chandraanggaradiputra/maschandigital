import { cn } from "./lib/utils";
### 🎯 Instruksi Lengkap Antigravity: Tampilan Deskripsi WYSIWYG & Pemilihan Kategori Bertingkat (Cascading Parent ➔ Subkategori)

Terapkan SOP Kerja Penuh: Isolasi Git Branch -> Perbaiki Tampilan Deskripsi Produk -> Perbarui Komponen Pemilih Kategori di ProductForm -> Evaluasi Mandiri (tsc, lint, build) -> Merge ke Main -> Push ke GitHub -> Tulis Laporan ke AGENTS.OUTPUT.md & Output Wajib Git Diff.

---

#### 1. Alur Git Awal (Branching)
Jalankan di terminal PC lokal:
1. `git checkout main && git pull origin main`
2. `git checkout -b feature/wysiwyg-description-and-cascading-categories`

---

#### 2. Spesifikasi Berkas Target & Kode Implementasi

##### A. Perbaikan 1: Tampilan Deskripsi Lengkap Produk WYSIWYG (`app/products/[slug]/page.tsx`)
Buka berkas `app/products/[slug]/page.tsx`, temukan bagian rendering `Deskripsi Lengkap Produk`:

Ganti rendering teks polos `{product.description}` di dalam `<p>` menjadi rendering HTML aman dengan kelas tipografi WYSIWYG terstruktur:

```tsx
{/* 1. DESKRIPSI PRODUK LENGKAP */}
<div className={cn('p-5', 'sm:p-7', 'bg-white', 'dark:bg-slate-900', 'border', 'border-slate-200', 'dark:border-slate-800', 'rounded-2xl', 'shadow-sm', 'space-y-4')}>
  <div className={cn('flex', 'items-center', 'gap-2', 'text-slate-900', 'dark:text-white', 'font-slab', 'font-bold', 'text-lg', 'border-b', 'border-slate-100', 'dark:border-slate-800', 'pb-3')}>
    <FileText className={cn('w-5', 'h-5', 'text-[#093c96]', 'dark:text-blue-400')} />
    <h3>Deskripsi Lengkap Produk</h3>
  </div>

  {/* Render Rich HTML dari WYSIWYG Editor dengan Jarak Paragraf & List Bullets Rapi */}
  <div
    className={cn('prose', 'prose-slate', 'dark:prose-invert', 'max-w-none', 'text-sm', 'sm:text-base', 'leading-relaxed', 'text-slate-700', 'dark:text-slate-300', '[&_p]:mb-4', '[&_p]:leading-relaxed', 'last:[&_p]:mb-0', '[&_ul]:list-disc', '[&_ul]:pl-6', '[&_ul]:mb-4', '[&_ul]:space-y-1.5', '[&_ol]:list-decimal', '[&_ol]:pl-6', '[&_ol]:mb-4', '[&_ol]:space-y-1.5', '[&_li]:text-slate-700', 'dark:[&_li]:text-slate-300', '[&_strong]:font-bold', '[&_strong]:text-slate-900', 'dark:[&_strong]:text-white', '[&_h1]:text-xl', '[&_h1]:font-bold', '[&_h1]:mb-3', '[&_h2]:text-lg', '[&_h2]:font-bold', '[&_h2]:mb-2.5', '[&_h3]:text-base', '[&_h3]:font-bold', '[&_h3]:mb-2', '[&_blockquote]:border-l-4', '[&_blockquote]:border-blue-500', '[&_blockquote]:pl-4', '[&_blockquote]:italic', '[&_blockquote]:my-3', '[&_br]:block', '[&_br]:content-['']', '[&_br]:my-1')}
    dangerouslySetInnerHTML={{ __html: product.description }}
  />
</div>

B. Perbaikan 2: Pemilihan Kategori Bertingkat (Parent ➔ Subkategori) di components/forms/ProductForm.tsx
Buka components/forms/ProductForm.tsx:

1. Kelola State Kategori Utama & Subkategori:
Pastikan terdapat state untuk melacak kategori induk yang sedang aktif:

const [selectedParentId, setSelectedParentId] = useState<number | null>(null);

2. Pisahkan Kategori Induk & Subkategori:

// Kategori Utama (Parent Categories: yang tidak memiliki parent atau parent === 0)
const parentCategories = categories.filter(
  (c) => !c.parent || c.parent === 0
);

// Subkategori sesuai Kategori Utama yang dipilih
const subcategories = categories.filter(
  (c) => selectedParentId !== null && c.parent === selectedParentId
);

3. Sinkronisasi Mode Edit (initialData):
Saat halaman edit dibuka dan produk sudah memiliki kategori sebelumnya:

useEffect(() => {
  if (initialData?.categories && initialData.categories.length > 0 && categories.length > 0) {
    const initialCatIds = initialData.categories.map((c) => c.id);
    setSelectedCategoryIds(initialCatIds);

    // Temukan parent category dari kategori yang tersimpan
    const activeCat = categories.find((c) => initialCatIds.includes(c.id));
    if (activeCat) {
      if (!activeCat.parent || activeCat.parent === 0) {
        setSelectedParentId(activeCat.id);
      } else {
        setSelectedParentId(activeCat.parent);
      }
    }
  }
}, [initialData, categories]);

4. Handler Pemilihan Kategori:

const handleSelectParentCategory = (parentId: number) => {
  setSelectedParentId(parentId);
  // Masukkan parent category ID ke daftar kategori terpilih
  setSelectedCategoryIds((prev) => {
    // Bersihkan subkategori lama dari parent lain jika diinginkan, atau pertahankan parent aktif
    return [parentId];
  });
};

const handleToggleSubcategory = (subId: number) => {
  setSelectedCategoryIds((prev) => {
    const exists = prev.includes(subId);
    let updated = exists ? prev.filter((id) => id !== subId) : [...prev, subId];
    // Pastikan parent category ID juga tetap tersimpan di dalam data submission
    if (selectedParentId && !updated.includes(selectedParentId)) {
      updated.push(selectedParentId);
    }
    return updated;
  });
};

5. Ganti Tampilan Bagian Kategori Produk di Formulir:
Ganti elemen pemilih kategori yang sekarang dengan tata letak bertingkat (Cascading) berikut (dengan tetap mempertahankan tombol + Tambah Kategori Baru):

{/* SEKSI KATEGORI PRODUK BERTINGKAT */}
<div className={cn('space-y-4', 'pt-2')}>
  <div className={cn('flex', 'items-center', 'justify-between')}>
    <label className={cn('block', 'text-xs', 'sm:text-sm', 'font-semibold', 'text-slate-800', 'dark:text-slate-200')}>
      Kategori Produk <span className="text-rose-500">*</span>
    </label>
    {/* Tombol Tambah Kategori Baru Tetap Dipertahankan */}
    <button
      type="button"
      onClick={() => setIsAddCategoryModalOpen(true)}
      className={cn('text-xs', 'font-semibold', 'text-[#093c96]', 'hover:text-blue-800', 'dark:text-blue-400', 'dark:hover:text-blue-300', 'flex', 'items-center', 'gap-1', 'transition-colors')}
    >
      <span>+ Tambah Kategori Baru</span>
    </button>
  </div>

  {/* LANGKAH 1: PILIH KATEGORI UTAMA */}
  <div className="space-y-2">
    <span className={cn('text-xs', 'text-slate-500', 'dark:text-slate-400', 'font-medium')}>
      1. Pilih Kategori Utama (Parent):
    </span>
    <div className={cn('grid', 'grid-cols-2', 'sm:grid-cols-3', 'gap-2')}>
      {parentCategories.map((parent) => {
        const isSelected = selectedParentId === parent.id;
        return (
          <button
            key={parent.id}
            type="button"
            onClick={() => handleSelectParentCategory(parent.id)}
            className={cn(
              "p-3 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between",
              isSelected
                ? "bg-blue-50 border-[#093c96] text-[#093c96] dark:bg-blue-950/50 dark:border-blue-500 dark:text-blue-300 ring-2 ring-[#093c96]/20 shadow-2xs"
                : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
            )}
          >
            <span className="truncate">{parent.name}</span>
            {isSelected && <Check className={cn('w-4', 'h-4', 'shrink-0', 'text-[#093c96]', 'dark:text-blue-400')} />}
          </button>
        );
      })}
    </div>
  </div>

  {/* LANGKAH 2: PILIH SUBKATEGORI (MUNCUL OTOMATIS SESUAI PARENT TERPILIH) */}
  {selectedParentId && (
    <div className={cn('space-y-2', 'animate-in', 'fade-in', 'duration-200', 'pt-2', 'border-t', 'border-slate-100', 'dark:border-slate-800')}>
      <div className={cn('flex', 'items-center', 'justify-between')}>
        <span className={cn('text-xs', 'text-slate-500', 'dark:text-slate-400', 'font-medium')}>
          2. Pilih Subkategori (Pilih satu atau lebih):
        </span>
        <span className={cn('text-[11px]', 'text-slate-400')}>
          {subcategories.length > 0 ? `${subcategories.length} Subkategori tersedia` : "Tanpa subkategori"}
        </span>
      </div>

      {subcategories.length > 0 ? (
        <div className={cn('p-3', 'bg-slate-50', 'dark:bg-slate-900/50', 'rounded-xl', 'border', 'border-slate-200', 'dark:border-slate-800', 'max-h-52', 'overflow-y-auto', 'space-y-1.5')}>
          {subcategories.map((sub) => {
            const isChecked = selectedCategoryIds.includes(sub.id);
            return (
              <label
                key={sub.id}
                className={cn('flex', 'items-center', 'gap-2.5', 'p-2', 'rounded-lg', 'hover:bg-white', 'dark:hover:bg-slate-800/80', 'transition-colors', 'cursor-pointer', 'text-xs', 'font-medium', 'text-slate-700', 'dark:text-slate-300')}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleToggleSubcategory(sub.id)}
                  className={cn('rounded', 'border-slate-300', 'text-[#093c96]', 'focus:ring-[#093c96]', 'w-4', 'h-4')}
                />
                <span className="flex-1">{sub.name}</span>
                {sub.count !== undefined && (
                  <span className={cn('text-[10px]', 'text-slate-400')}>({sub.count})</span>
                )}
              </label>
            );
          })}
        </div>
      ) : (
        <div className={cn('p-3', 'bg-slate-50', 'dark:bg-slate-900/50', 'rounded-xl', 'border', 'border-dashed', 'border-slate-200', 'dark:border-slate-800', 'text-xs', 'text-slate-500', 'text-center')}>
          Kategori utama ini belum memiliki subkategori. Produk akan didaftarkan pada kategori utama.
        </div>
      )}
    </div>
  )}
</div>

