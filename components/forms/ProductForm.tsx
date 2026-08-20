'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  Save, 
  CheckCircle2, 
  Globe, 
  Plus, 
  FolderPlus, 
  ChevronRight, 
  AlertCircle 
} from 'lucide-react';
import { Product, ProductType, ProductCategory } from '@/types';
import { Button } from '@/components/ui/Button';
import { MediaUploader } from '@/components/forms/MediaUploader';
import { createProduct, updateProduct, getCategories, createCategory } from '@/lib/api/wordpress';

interface ProductFormProps {
  initialData?: Partial<Product>;
  isEditing?: boolean;
}

export function ProductForm({ initialData, isEditing = false }: ProductFormProps) {
  const router = useRouter();

  const [name, setName] = useState(initialData?.name || '');
  const [productType, setProductType] = useState<ProductType>(initialData?.type || 'simple');
  const [shortDesc, setShortDesc] = useState(initialData?.short_description || '');
  const [description, setDescription] = useState(initialData?.description || '');

  // Hierarchical Categories State
  const [availableCategories, setAvailableCategories] = useState<ProductCategory[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>(
    initialData?.category_ids || (initialData?.categories?.map(c => c.id) || [])
  );
  
  // Add Category Inline Form
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatParent, setNewCatParent] = useState<number>(0);
  const [isAddingCat, setIsAddingCat] = useState(false);

  // Pricing
  const [regularPrice, setRegularPrice] = useState(initialData?.regular_price || initialData?.price || '');
  const [onSale, setOnSale] = useState(Boolean(initialData?.on_sale));
  const [salePrice, setSalePrice] = useState(initialData?.sale_price || '');

  // Affiliate
  const [externalUrl, setExternalUrl] = useState(initialData?.external_url || '');
  const [buttonText, setButtonText] = useState(initialData?.button_text || 'Beli via Link');

  // Media
  const [imageUrl, setImageUrl] = useState(initialData?.images?.[0]?.src || '');

  // Rank Math SEO
  const [focusKeyword, setFocusKeyword] = useState(initialData?.seo?.focus_keyword || '');
  const [seoTitle, setSeoTitle] = useState(initialData?.seo?.meta_title || '');
  const [metaDesc, setMetaDesc] = useState(initialData?.seo?.meta_description || '');

  // Submit State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadCats() {
      const cats = await getCategories();
      setAvailableCategories(cats);
    }
    loadCats();
  }, []);

  const handleToggleCategory = (id: number) => {
    setSelectedCategoryIds(prev => 
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  const handleAddNewCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setIsAddingCat(true);

    const res = await createCategory(newCatName.trim(), newCatParent);
    if (res.success && res.category) {
      const updatedCats = await getCategories();
      setAvailableCategories(updatedCats);
      setSelectedCategoryIds(prev => [...prev, res.category!.id]);
      setNewCatName('');
      setShowAddCat(false);
    } else {
      alert(res.message || 'Gagal menambahkan kategori.');
    }
    setIsAddingCat(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');

    const payload = {
      name,
      type: productType,
      regular_price: regularPrice,
      sale_price: onSale ? salePrice : '',
      on_sale: onSale,
      short_description: shortDesc,
      description,
      category_ids: selectedCategoryIds,
      images: imageUrl ? [{ src: imageUrl }] : [],
      external_url: productType === 'affiliate' ? externalUrl : '',
      button_text: productType === 'affiliate' ? buttonText : '',
      seo: {
        focus_keyword: focusKeyword,
        meta_title: seoTitle || name,
        meta_description: metaDesc || shortDesc,
      },
    };

    let result;
    if (isEditing && initialData?.id) {
      result = await updateProduct(initialData.id, payload);
    } else {
      result = await createProduct(payload);
    }

    if (result.success) {
      setSuccessMessage(result.message || (isEditing ? 'Perubahan produk berhasil disimpan!' : 'Produk berhasil diterbitkan ke WordPress!'));
      setTimeout(() => {
        router.push('/dashboard/products');
        router.refresh();
      }, 1200);
    } else {
      setErrorMessage(result.message || 'Terjadi kendala saat menyimpan ke WordPress.');
    }
    setIsSubmitting(false);
  };

  const previewTitle = seoTitle || (name ? `${name} - Mas Chan Digital Serang` : 'Nama Produk - Mas Chan Digital');
  const previewDesc = metaDesc || shortDesc || 'Beli produk UMKM asli Kota Serang berkualitas. Hubungi langsung WhatsApp vendor tanpa biaya perantara.';

  const renderCategoryTree = (categories: ProductCategory[], level = 0) => {
    return categories.map(cat => (
      <div key={cat.id} className="space-y-1">
        <label 
          className="flex items-center gap-2.5 py-1 text-slate-700 hover:text-brand-800 dark:hover:text-brand-400 dark:text-slate-300 text-xs sm:text-sm cursor-pointer"
          style={{ paddingLeft: `${level * 18}px` }}
        >
          <input
            type="checkbox"
            checked={selectedCategoryIds.includes(cat.id)}
            onChange={() => handleToggleCategory(cat.id)}
            className="border-slate-300 rounded focus:ring-brand-500 w-4 h-4 text-brand-800 cursor-pointer"
          />
          {level > 0 && <ChevronRight className="w-3 h-3 text-slate-400" aria-hidden="true" />}
          <span className="font-medium">{cat.name}</span>
          {cat.count !== undefined && (
            <span className="text-[11px] text-slate-400">({cat.count})</span>
          )}
        </label>
        {cat.children && cat.children.length > 0 && renderCategoryTree(cat.children, level + 1)}
      </div>
    ));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-12 max-w-4xl">
      {successMessage && (
        <aside aria-live="polite" className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/80 p-4 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" aria-hidden="true" />
          <span className="font-semibold text-sm">{successMessage}</span>
        </aside>
      )}

      {errorMessage && (
        <aside aria-live="assertive" className="flex items-center gap-3 bg-rose-50 dark:bg-rose-950/80 p-4 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" aria-hidden="true" />
          <span className="font-semibold text-sm">{errorMessage}</span>
        </aside>
      )}

      {/* 1. INFORMASI DASAR */}
      <section aria-labelledby="basic-info-heading" className="space-y-6 bg-white dark:bg-surface-darkCard shadow-subtle p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 rounded-3xl">
        <header className="flex items-center gap-2.5 pb-4 border-slate-100 dark:border-slate-800 border-b">
          <div className="flex justify-center items-center bg-brand-100 dark:bg-brand-950/80 rounded-xl w-8 h-8 font-bold text-brand-700 dark:text-brand-400">
            1
          </div>
          <div>
            <h2 id="basic-info-heading" className="font-slab font-bold text-slate-900 dark:text-white text-lg">
              Informasi Dasar Produk
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs">
              Judul, kategori checkbox, dan deskripsi produk Anda
            </p>
          </div>
        </header>

        <div className="space-y-4">
          <div>
            <label htmlFor="product-name" className="block mb-1.5 font-slab font-bold text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
              Nama Produk <span className="text-rose-500">*</span>
            </label>
            <input
              id="product-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Madu Akasia Asli Serang 500g"
              className="bg-slate-50 dark:bg-slate-900 px-4 py-2.5 border border-slate-200 focus:border-brand-500 dark:border-slate-800 rounded-xl outline-none w-full text-slate-900 dark:text-white text-sm"
            />
          </div>

          {/* Kategori Checkbox Tree */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block font-slab font-bold text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
                Kategori Produk (Pilih satu atau lebih) <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowAddCat(!showAddCat)}
                className="inline-flex items-center gap-1 font-semibold text-brand-800 dark:text-brand-400 text-xs hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showAddCat ? 'Tutup Form' : '+ Tambah Kategori Baru'}</span>
              </button>
            </div>

            {showAddCat && (
              <div className="space-y-3 bg-brand-50/70 dark:bg-brand-950/40 p-3.5 border border-brand-200 dark:border-brand-800 rounded-2xl">
                <div className="gap-2.5 grid grid-cols-1 sm:grid-cols-2">
                  <div>
                    <label className="block mb-1 font-bold text-[11px] text-slate-700 dark:text-slate-300">
                      Nama Kategori Baru
                    </label>
                    <input
                      type="text"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder="Nama Kategori..."
                      className="bg-white dark:bg-slate-900 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl outline-none w-full text-xs"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-bold text-[11px] text-slate-700 dark:text-slate-300">
                      Induk Kategori (Opsional)
                    </label>
                    <select
                      value={newCatParent}
                      onChange={(e) => setNewCatParent(Number(e.target.value))}
                      className="bg-white dark:bg-slate-900 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl outline-none w-full text-xs cursor-pointer"
                    >
                      <option value={0}>— Tanpa Induk (Kategori Utama) —</option>
                      {availableCategories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="primary"
                  onClick={handleAddNewCategory}
                  disabled={isAddingCat || !newCatName.trim()}
                  className="text-xs"
                >
                  <FolderPlus className="mr-1 w-3.5 h-3.5" />
                  <span>{isAddingCat ? 'Menambahkan...' : 'Simpan Kategori'}</span>
                </Button>
              </div>
            )}

            <div className="bg-slate-50 dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-800 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800/50 max-h-48 overflow-y-auto">
              {availableCategories.length > 0 ? (
                renderCategoryTree(availableCategories)
              ) : (
                <p className="py-2 text-slate-400 text-xs text-center">
                  Memuat kategori dari backend WordPress...
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="product-type" className="block mb-1.5 font-slab font-bold text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
              Metode Transaksi Produk <span className="text-rose-500">*</span>
            </label>
            <select
              id="product-type"
              value={productType}
              onChange={(e) => setProductType(e.target.value as ProductType)}
              className="bg-slate-50 dark:bg-slate-900 px-4 py-2.5 border border-slate-200 focus:border-brand-500 dark:border-slate-800 rounded-xl outline-none w-full text-slate-900 dark:text-white text-sm cursor-pointer"
            >
              <option value="simple">Direct Chat WhatsApp Vendor</option>
              <option value="affiliate">Tautan Afiliasi / Link Luar</option>
            </select>
          </div>

          <div>
            <label htmlFor="product-short-desc" className="block mb-1.5 font-slab font-bold text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
              Deskripsi Singkat (Ringkasan)
            </label>
            <textarea
              id="product-short-desc"
              rows={2}
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              placeholder="Jelaskan ringkasan produk yang memikat pembeli..."
              className="bg-slate-50 dark:bg-slate-900 px-4 py-2.5 border border-slate-200 focus:border-brand-500 dark:border-slate-800 rounded-xl outline-none w-full text-slate-900 dark:text-white text-sm"
            />
          </div>

          <div>
            <label htmlFor="product-full-desc" className="block mb-1.5 font-slab font-bold text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
              Deskripsi Lengkap & Spesifikasi
            </label>
            <textarea
              id="product-full-desc"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tuliskan detail komposisi, ukuran, cara pemesanan, atau ketentuan layanan..."
              className="bg-slate-50 dark:bg-slate-900 px-4 py-2.5 border border-slate-200 focus:border-brand-500 dark:border-slate-800 rounded-xl outline-none w-full text-slate-900 dark:text-white text-sm"
            />
          </div>
        </div>
      </section>

      {/* 2. HARGA & TRANSAKSI */}
      <section aria-labelledby="pricing-heading" className="space-y-6 bg-white dark:bg-surface-darkCard shadow-subtle p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 rounded-3xl">
        <header className="flex items-center gap-2.5 pb-4 border-slate-100 dark:border-slate-800 border-b">
          <div className="flex justify-center items-center bg-brand-100 dark:bg-brand-950/80 rounded-xl w-8 h-8 font-bold text-brand-700 dark:text-brand-400">
            2
          </div>
          <div>
            <h2 id="pricing-heading" className="font-slab font-bold text-slate-900 dark:text-white text-lg">
              Harga & Detail Transaksi
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs">
              Atur harga normal, diskon promo, dan link tujuan
            </p>
          </div>
        </header>

        <div className="space-y-4">
          <div className="gap-4 grid grid-cols-1 sm:grid-cols-2">
            <div>
              <label htmlFor="regular-price" className="block mb-1.5 font-slab font-bold text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
                Harga Normal (Rp) <span className="text-rose-500">*</span>
              </label>
              <input
                id="regular-price"
                type="number"
                required
                value={regularPrice}
                onChange={(e) => setRegularPrice(e.target.value)}
                placeholder="Contoh: 150000"
                className="bg-slate-50 dark:bg-slate-900 px-4 py-2.5 border border-slate-200 focus:border-brand-500 dark:border-slate-800 rounded-xl outline-none w-full text-slate-900 dark:text-white text-sm"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="sale-price" className="block font-slab font-bold text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
                  Harga Diskon / Promo (Rp)
                </label>
                <label className="inline-flex items-center gap-1.5 text-brand-700 dark:text-brand-400 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onSale}
                    onChange={(e) => setOnSale(e.target.checked)}
                    className="rounded focus:ring-brand-500 text-brand-800"
                  />
                  <span>Aktifkan Diskon</span>
                </label>
              </div>
              <input
                id="sale-price"
                type="number"
                disabled={!onSale}
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                placeholder="Contoh: 120000"
                className="bg-slate-50 dark:bg-slate-900 disabled:opacity-40 px-4 py-2.5 border border-slate-200 focus:border-brand-500 dark:border-slate-800 rounded-xl outline-none w-full text-slate-900 dark:text-white text-sm"
              />
            </div>
          </div>

          {productType === 'affiliate' && (
            <div className="space-y-4 bg-brand-50/60 dark:bg-brand-950/40 p-4 border border-brand-100 dark:border-brand-900 rounded-2xl">
              <div>
                <label htmlFor="external-url" className="block mb-1 font-slab font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
                  Tautan / Link Affiliasi Vendor <span className="text-rose-500">*</span>
                </label>
                <input
                  id="external-url"
                  type="url"
                  required
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  placeholder="https://website-anda.com/produk"
                  className="bg-white dark:bg-slate-900 px-4 py-2.5 border border-slate-200 focus:border-brand-500 dark:border-slate-800 rounded-xl outline-none w-full text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label htmlFor="button-text" className="block mb-1 font-slab font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
                  Teks Tombol Aksi
                </label>
                <input
                  id="button-text"
                  type="text"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  placeholder="Beli via Link"
                  className="bg-white dark:bg-slate-900 px-4 py-2.5 border border-slate-200 focus:border-brand-500 dark:border-slate-800 rounded-xl outline-none w-full text-slate-900 dark:text-white text-sm"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. FOTO PRODUK */}
      <section aria-labelledby="media-heading" className="space-y-6 bg-white dark:bg-surface-darkCard shadow-subtle p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 rounded-3xl">
        <header className="flex items-center gap-2.5 pb-4 border-slate-100 dark:border-slate-800 border-b">
          <div className="flex justify-center items-center bg-brand-100 dark:bg-brand-950/80 rounded-xl w-8 h-8 font-bold text-brand-700 dark:text-brand-400">
            3
          </div>
          <div>
            <h2 id="media-heading" className="font-slab font-bold text-slate-900 dark:text-white text-lg">
              Foto Produk (WordPress Media Library)
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs">
              Unggah, ganti, atau hapus gambar produk dari dashboard
            </p>
          </div>
        </header>

        <MediaUploader
          initialImage={imageUrl}
          onImageChange={(url) => setImageUrl(url)}
        />
      </section>

      {/* 4. OPTIMASI SEO RANK MATH */}
      <section aria-labelledby="seo-heading" className="space-y-6 bg-white dark:bg-surface-darkCard shadow-subtle p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 rounded-3xl">
        <header className="flex items-center gap-2.5 pb-4 border-slate-100 dark:border-slate-800 border-b">
          <div className="flex justify-center items-center bg-brand-100 dark:bg-brand-950/80 rounded-xl w-8 h-8 font-bold text-brand-700 dark:text-brand-400">
            4
          </div>
          <div>
            <h2 id="seo-heading" className="flex items-center gap-2 font-slab font-bold text-slate-900 dark:text-white text-lg">
              <span>Optimasi SEO Rank Math</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs">
              Atur kata kunci dan meta deskripsi agar produk Anda mudah ditemukan di Google
            </p>
          </div>
        </header>

        <div className="space-y-4">
          <div>
            <label htmlFor="focus-keyword" className="block mb-1.5 font-slab font-bold text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
              Focus Keyword (Kata Kunci Utama)
            </label>
            <input
              id="focus-keyword"
              type="text"
              value={focusKeyword}
              onChange={(e) => setFocusKeyword(e.target.value)}
              placeholder="Contoh: Madu Akasia Serang"
              className="bg-slate-50 dark:bg-slate-900 px-4 py-2.5 border border-slate-200 focus:border-brand-500 dark:border-slate-800 rounded-xl outline-none w-full text-slate-900 dark:text-white text-sm"
            />
          </div>

          <div>
            <label htmlFor="seo-title" className="block mb-1.5 font-slab font-bold text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
              SEO Meta Title
            </label>
            <input
              id="seo-title"
              type="text"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder={name ? `${name} - Mas Chan Digital` : 'Judul Produk di Hasil Pencarian'}
              className="bg-slate-50 dark:bg-slate-900 px-4 py-2.5 border border-slate-200 focus:border-brand-500 dark:border-slate-800 rounded-xl outline-none w-full text-slate-900 dark:text-white text-sm"
            />
          </div>

          <div>
            <label htmlFor="meta-description" className="block mb-1.5 font-slab font-bold text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
              SEO Meta Description (Maks. 160 Karakter)
            </label>
            <textarea
              id="meta-description"
              rows={3}
              maxLength={160}
              value={metaDesc}
              onChange={(e) => setMetaDesc(e.target.value)}
              placeholder="Tuliskan deskripsi singkat produk untuk calon pembeli di Google..."
              className="bg-slate-50 dark:bg-slate-900 px-4 py-2.5 border border-slate-200 focus:border-brand-500 dark:border-slate-800 rounded-xl outline-none w-full text-slate-900 dark:text-white text-sm"
            />
            <span className="block text-[11px] text-slate-400 text-right">
              {metaDesc.length}/160 karakter
            </span>
          </div>

          {/* Live Google SERP Preview */}
          <div className="space-y-1.5 bg-slate-50 dark:bg-slate-900 mt-4 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <span className="block mb-2 font-slab font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
              Live Google SERP Preview
            </span>
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-xs">
              <Globe className="w-3.5 h-3.5" aria-hidden="true" />
              <span>https://maschandigital.id/products/contoh-produk</span>
            </div>
            <h3 className="font-medium text-blue-700 dark:text-blue-400 text-base hover:underline cursor-pointer">
              {previewTitle}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs line-clamp-2 leading-relaxed">
              {previewDesc}
            </p>
          </div>
        </div>
      </section>

      {/* SUBMIT BUTTON */}
      <footer className="flex justify-end items-center gap-3 pt-4 border-slate-200 dark:border-slate-800 border-t">
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={() => router.push('/dashboard/products')}
        >
          Batal
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={isSubmitting}
          className="min-w-[160px] font-bold"
        >
          <Save className="mr-2 w-4 h-4" aria-hidden="true" />
          <span>{isSubmitting ? 'Menyimpan...' : (isEditing ? 'Simpan Perubahan' : 'Terbitkan Produk')}</span>
        </Button>
      </footer>
    </form>
  );
}