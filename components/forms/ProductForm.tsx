"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  Save,
  CheckCircle2,
  Globe,
  FolderPlus,
  AlertCircle,
  Check,
  Plus,
  Trash2,
  Layers,
  Wrench,
} from "lucide-react";
import {
  Product,
  ProductType,
  ProductCategory,
  ProductVariation,
  BusinessType,
  PriceModel,
  ServiceAction,
} from "@/types";
import { KECAMATAN_LIST } from "@/lib/constants/serangDistricts";
import { Button } from "@/components/ui/Button";
import { MediaUploader } from "@/components/forms/MediaUploader";
import {
  GalleryUploader,
  GalleryImageItem,
} from "@/components/forms/GalleryUploader";
import {
  createProduct,
  updateProduct,
  getCategories,
  createCategory,
} from "@/lib/api/wordpress";
import { getVendorSession } from "@/lib/api/auth";
import { getBillingInfo } from "@/lib/api/billing";
import { cn } from "@/lib/utils";
import { WysiwygEditor } from "@/components/forms/WysiwygEditor";

interface ProductFormProps {
  initialData?: Partial<Product>;
  isEditing?: boolean;
}

export function ProductForm({
  initialData,
  isEditing = false,
}: ProductFormProps) {
  const router = useRouter();

  const [name, setName] = useState(initialData?.name || "");
  const [productType, setProductType] = useState<ProductType>(
    initialData?.type || "simple",
  );
  const [shortDesc, setShortDesc] = useState(
    initialData?.short_description || "",
  );
  const [description, setDescription] = useState(
    initialData?.description || "",
  );

  // Service Commerce & Classification State
  const [businessType, setBusinessType] = useState<BusinessType>(() => {
    if (initialData?.business_type) return initialData.business_type;
    if (
      initialData?.categories?.some(
        (c) =>
          c.name.toLowerCase().includes("jasa") ||
          c.slug.toLowerCase().includes("jasa"),
      )
    ) {
      return "service";
    }
    return "product";
  });
  const [priceModel, setPriceModel] = useState<PriceModel>(
    initialData?.price_model || "fixed",
  );
  const [serviceAction, setServiceAction] = useState<ServiceAction>(
    initialData?.service_action || "consultation",
  );
  const [serviceAreas, setServiceAreas] = useState<string[]>(
    initialData?.service_areas || [],
  );

  // Status Langganan & Domisili Vendor untuk Gating Jasa
  const [isStarterPlan, setIsStarterPlan] = useState<boolean>(true);
  const [domicileDistrict, setDomicileDistrict] = useState<string>("Serang");

  // Jangkauan Wilayah Efektif (Derivasi murni tanpa cascading render)
  const effectiveServiceAreas =
    businessType === "service" && isStarterPlan
      ? [domicileDistrict]
      : serviceAreas;

  // Hierarchical Categories State
  const [flatCategories, setFlatCategories] = useState<ProductCategory[]>([]);
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>(
    initialData?.category_ids ||
      initialData?.categories?.map((c) => c.id) ||
      [],
  );

  const categories = flatCategories;

  // Helper identifikasi kategori Jasa
  const isJasaCategory = (c: ProductCategory) =>
    c.slug === "layanan-jasa" ||
    c.slug === "jasa" ||
    c.name.toLowerCase().includes("jasa");

  const jasaParentCategory = flatCategories.find(
    (c) => (!c.parent || c.parent === 0) && isJasaCategory(c),
  );

  // Kategori Utama (Parent Categories)
  const parentCategories = categories.filter((c) => {
    if (c.parent && c.parent !== 0) return false;
    if (businessType === "product") {
      return !isJasaCategory(c);
    }
    return isJasaCategory(c);
  });

  // Subkategori sesuai Kategori Utama yang dipilih
  const subcategories = categories.filter((c) => {
    if (businessType === "service") {
      if (jasaParentCategory) {
        return c.parent === jasaParentCategory.id;
      }
      return selectedParentId !== null && c.parent === selectedParentId;
    }
    return Boolean(
      selectedParentId !== null &&
        c.parent === selectedParentId &&
        !isJasaCategory(c),
    );
  });

  // Add Category Inline Form
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatParent, setNewCatParent] = useState<number>(0);
  const [isAddingCat, setIsAddingCat] = useState(false);

  // Pricing
  const [regularPrice, setRegularPrice] = useState(
    initialData?.regular_price || initialData?.price || "",
  );
  const [onSale, setOnSale] = useState(Boolean(initialData?.on_sale));
  const [salePrice, setSalePrice] = useState(initialData?.sale_price || "");

  // Variable Product
  const [isVariable, setIsVariable] = useState<boolean>(
    Boolean(
      initialData?.is_variable ||
        (initialData?.variations && initialData.variations.length > 0),
    ),
  );
  const [variations, setVariations] = useState<ProductVariation[]>(() => {
    if (initialData?.variations && initialData.variations.length > 0) {
      return initialData.variations;
    }
    return [
      { id: "var-1", name: "", price: 0, stock_status: "instock" },
      { id: "var-2", name: "", price: 0, stock_status: "instock" },
    ];
  });

  const handleAddVariation = () => {
    const newId = `var-${Date.now()}-${variations.length + 1}`;
    setVariations((prev) => [
      ...prev,
      { id: newId, name: "", price: 0, stock_status: "instock" },
    ]);
  };

  const handleRemoveVariation = (indexToRemove: number) => {
    if (variations.length <= 2) {
      alert("Produk variasi wajib memiliki minimal 2 pilihan varian.");
      return;
    }
    setVariations((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleVariationChange = (
    index: number,
    field: keyof ProductVariation,
    value: unknown,
  ) => {
    setVariations((prev) =>
      prev.map((v, idx) => (idx === index ? { ...v, [field]: value } : v)),
    );
  };

  // Affiliate
  const [externalUrl, setExternalUrl] = useState(
    initialData?.external_url || "",
  );
  const [buttonText, setButtonText] = useState(
    initialData?.button_text || "Beli via Link",
  );

  // Media
  const [imageUrl, setImageUrl] = useState(initialData?.images?.[0]?.src || "");
  const [galleryImages, setGalleryImages] = useState<GalleryImageItem[]>(
    (initialData?.images || [])
      .slice(1) // index 0 = foto utama, sisanya = galeri
      .map((img) => ({ id: img.id, src: img.src })),
  );

  // Rank Math SEO
  const [focusKeyword, setFocusKeyword] = useState(
    initialData?.seo?.focus_keyword || "",
  );
  const [seoTitle, setSeoTitle] = useState(initialData?.seo?.meta_title || "");
  const [metaDesc, setMetaDesc] = useState(
    initialData?.seo?.meta_description || "",
  );

  // Submit State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Periksa Status Langganan & Domisili Vendor untuk Gating Jasa
  useEffect(() => {
    async function checkPlanAndLocation() {
      try {
        const session = getVendorSession();
        if (session?.user?.district) {
          const found = KECAMATAN_LIST.find((k) =>
            session.user.district.toLowerCase().includes(k.toLowerCase()),
          );
          if (found) {
            setDomicileDistrict(found);
          }
        }

        const billingData = await getBillingInfo();
        if (billingData?.subscription) {
          const sub = billingData.subscription;
          const isExempt = sub.plan_id === "exempt";
          const isPaid =
            !isExempt &&
            sub.plan_id !== "free_forever" &&
            (sub.status === "active" || sub.status === "trial");
          setIsStarterPlan(!isExempt && !isPaid);
        } else {
          setIsStarterPlan(true);
        }
      } catch (err: unknown) {
        console.error("Gagal memeriksa status paket atau domisili vendor:", err);
        setIsStarterPlan(true);
      }
    }
    checkPlanAndLocation();
  }, []);

  useEffect(() => {
    async function loadCats() {
      const cats = await getCategories();
      setFlatCategories(cats);

      // Sinkronisasi Mode Edit (initialData)
      if (
        initialData?.categories &&
        initialData.categories.length > 0 &&
        cats.length > 0
      ) {
        const initialCatIds = initialData.categories.map((c) => c.id);
        setSelectedCategoryIds(initialCatIds);

        // Temukan parent category dari kategori yang tersimpan
        const activeCat = cats.find((c) => initialCatIds.includes(c.id));
        if (activeCat) {
          if (!activeCat.parent || activeCat.parent === 0) {
            setSelectedParentId(activeCat.id);
          } else {
            setSelectedParentId(activeCat.parent);
          }
        }
      } else if (businessType === "service" && cats.length > 0) {
        const jasaCat = cats.find(
          (c) =>
            (!c.parent || c.parent === 0) &&
            (c.slug === "layanan-jasa" ||
              c.slug === "jasa" ||
              c.name.toLowerCase().includes("jasa")),
        );
        if (jasaCat) {
          setSelectedParentId(jasaCat.id);
          setSelectedCategoryIds((prev) =>
            prev.includes(jasaCat.id) ? prev : [jasaCat.id, ...prev],
          );
        }
      }
    }
    loadCats();
  }, [initialData?.categories, businessType]);

  const handleSelectBusinessType = (type: BusinessType) => {
    setBusinessType(type);
    if (type === "service") {
      setIsVariable(false);
      if (isStarterPlan) {
        setServiceAreas([domicileDistrict]);
      } else if (serviceAreas.length === 0) {
        setServiceAreas([...KECAMATAN_LIST]);
      }
      const jasaCategory = flatCategories.find(
        (c) =>
          (!c.parent || c.parent === 0) &&
          (c.slug === "layanan-jasa" ||
            c.slug === "jasa" ||
            c.name.toLowerCase().includes("jasa")),
      );
      if (jasaCategory) {
        setSelectedParentId(jasaCategory.id);
        setSelectedCategoryIds((prev) => {
          const serviceSubIds = flatCategories
            .filter((c) => c.parent === jasaCategory.id && prev.includes(c.id))
            .map((c) => c.id);
          return [jasaCategory.id, ...serviceSubIds];
        });
      }
    } else {
      // Kembali ke produk fisik: lepaskan penguncian kategori layanan jasa
      const jasaCategory = flatCategories.find(
        (c) =>
          (!c.parent || c.parent === 0) &&
          (c.slug === "layanan-jasa" ||
            c.slug === "jasa" ||
            c.name.toLowerCase().includes("jasa")),
      );
      if (jasaCategory && selectedParentId === jasaCategory.id) {
        setSelectedParentId(null);
        setSelectedCategoryIds([]);
      }
    }
  };

  const handleSelectParentCategory = (parentId: number) => {
    setSelectedParentId(parentId);
    // Masukkan parent category ID ke daftar kategori terpilih
    setSelectedCategoryIds(() => {
      // Bersihkan subkategori lama dari parent lain jika diinginkan, atau pertahankan parent aktif
      return [parentId];
    });
  };

  const handleToggleSubcategory = (subId: number) => {
    setSelectedCategoryIds((prev) => {
      const exists = prev.includes(subId);
      const updated = exists
        ? prev.filter((id) => id !== subId)
        : [...prev, subId];
      // Pastikan parent category ID juga tetap tersimpan di dalam data submission
      if (selectedParentId && !updated.includes(selectedParentId)) {
        updated.push(selectedParentId);
      }
      return updated;
    });
  };

  const handleAddNewCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setIsAddingCat(true);

    const targetParent =
      businessType === "service"
        ? jasaParentCategory
          ? jasaParentCategory.id
          : newCatParent
        : newCatParent;

    const res = await createCategory(newCatName.trim(), targetParent);
    if (res.success && res.category) {
      const updatedCats = await getCategories();
      setFlatCategories(updatedCats);
      setSelectedCategoryIds((prev) => [...prev, res.category!.id]);
      if (!targetParent || targetParent === 0) {
        setSelectedParentId(res.category!.id);
      } else {
        setSelectedParentId(targetParent);
      }
      setNewCatName("");
      setShowAddCat(false);
    } else {
      alert(res.message || "Gagal menambahkan kategori.");
    }
    setIsAddingCat(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    if (businessType === "product" && isVariable) {
      if (variations.length < 2) {
        setErrorMessage("Produk variasi wajib memiliki minimal 2 pilihan varian.");
        setIsSubmitting(false);
        return;
      }
      for (let i = 0; i < variations.length; i++) {
        const v = variations[i];
        if (!v.name || !v.name.trim()) {
          setErrorMessage(`Nama pada Varian #${i + 1} wajib diisi.`);
          setIsSubmitting(false);
          return;
        }
        if (typeof v.price !== "number" || isNaN(v.price) || v.price <= 0) {
          setErrorMessage(
            `Harga pada Varian "${v.name}" wajib diisi lebih dari Rp 0.`,
          );
          setIsSubmitting(false);
          return;
        }
      }
    }

    if (
      businessType === "service" &&
      priceModel !== "consultation" &&
      (!regularPrice || Number(regularPrice) <= 0)
    ) {
      setErrorMessage("Tarif layanan wajib diisi lebih dari Rp 0.");
      setIsSubmitting(false);
      return;
    }

    const minVarPrice =
      businessType === "product" && isVariable && variations.length > 0
        ? Math.min(...variations.map((v) => Number(v.price) || 0))
        : 0;

    const calculatedRegularPrice =
      businessType === "service"
        ? priceModel === "consultation"
          ? "0"
          : regularPrice
        : isVariable
          ? String(minVarPrice)
          : regularPrice;

    const calculatedSalePrice =
      businessType === "service"
        ? ""
        : isVariable
          ? ""
          : onSale
            ? salePrice
            : "";

    const calculatedServiceAreas =
      businessType === "service" ? effectiveServiceAreas : [];

    const finalCategoryIds = [...selectedCategoryIds];
    if (selectedParentId && !finalCategoryIds.includes(selectedParentId)) {
      finalCategoryIds.push(selectedParentId);
    }

    const payload = {
      name,
      business_type: businessType,
      price_model: businessType === "service" ? priceModel : "fixed",
      service_action:
        businessType === "service" ? serviceAction : "consultation",
      service_areas: calculatedServiceAreas,
      type:
        productType === "affiliate"
          ? "affiliate"
          : businessType === "product" && isVariable
            ? "variable"
            : "simple",
      is_variable: businessType === "product" && isVariable,
      variations:
        businessType === "product" && isVariable ? variations : [],
      regular_price: calculatedRegularPrice,
      sale_price: calculatedSalePrice,
      on_sale:
        businessType === "product" && !isVariable ? onSale : false,
      short_description: shortDesc,
      description,
      category_ids: finalCategoryIds,
      images:
        imageUrl || galleryImages.length > 0
          ? [
              { src: imageUrl },
              ...galleryImages.map((g) => ({ src: g.src, id: g.id })),
            ]
          : [],
      external_url: productType === "affiliate" ? externalUrl : "",
      button_text: productType === "affiliate" ? buttonText : "",
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
      setSuccessMessage(
        result.message ||
          (isEditing
            ? "Perubahan produk berhasil disimpan!"
            : "Produk berhasil diterbitkan dan siap tampil di etalase!"),
      );
      setTimeout(() => {
        router.push("/dashboard/products");
        router.refresh();
      }, 1200);
    } else {
      setErrorMessage(
        result.message || "Terjadi kendala saat menyimpan data produk.",
      );
    }
    setIsSubmitting(false);
  };

  const previewTitle =
    seoTitle ||
    (name
      ? `${name} - Mas Chan Digital Serang`
      : "Nama Produk - Mas Chan Digital");
  const previewDesc =
    metaDesc ||
    shortDesc ||
    "Beli produk UMKM asli Kota Serang berkualitas. Hubungi langsung WhatsApp vendor tanpa biaya perantara.";


  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-12 max-w-4xl">
      {successMessage && (
        <aside
          aria-live="polite"
          className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/80 p-4 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-200"
        >
          <CheckCircle2
            className="w-5 h-5 text-emerald-500 shrink-0"
            aria-hidden="true"
          />
          <span className="font-semibold text-sm">{successMessage}</span>
        </aside>
      )}

      {errorMessage && (
        <aside
          aria-live="assertive"
          className="flex items-center gap-3 bg-rose-50 dark:bg-rose-950/80 p-4 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-700 dark:text-rose-300"
        >
          <AlertCircle
            className="w-5 h-5 text-rose-500 shrink-0"
            aria-hidden="true"
          />
          <span className="font-semibold text-sm">{errorMessage}</span>
        </aside>
      )}

      {/* 0. KLASIFIKASI: PRODUK FISIK VS LAYANAN JASA */}
      <section
        aria-labelledby="classification-heading"
        className="space-y-4 bg-white dark:bg-surface-darkCard shadow-subtle p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 rounded-3xl"
      >
        <div>
          <h2
            id="classification-heading"
            className="font-slab font-bold text-slate-900 dark:text-white text-lg"
          >
            Jenis Penawaran Toko <span className="text-rose-500">*</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
            Pilih apakah Anda menawarkan produk fisik (barang/kuliner) atau layanan jasa (panggilan/reparasi/keahlian)
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <button
            type="button"
            onClick={() => handleSelectBusinessType("product")}
            className={cn(
              "flex items-start gap-3.5 p-4 rounded-2xl border-2 text-left transition-all",
              businessType === "product"
                ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-950 dark:text-emerald-100 shadow-sm"
                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400"
            )}
          >
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-2xl",
                businessType === "product"
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800"
              )}
            >
              🛍️
            </div>
            <div>
              <p className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                Produk Fisik / Kuliner
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Untuk barang, makanan, minuman, kerajinan, fashion, atau produk dengan pilihan variasi & stok.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleSelectBusinessType("service")}
            className={cn(
              "flex items-start gap-3.5 p-4 rounded-2xl border-2 text-left transition-all",
              businessType === "service"
                ? "border-sky-600 bg-sky-50/50 dark:bg-sky-950/20 text-sky-950 dark:text-sky-100 shadow-sm"
                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400"
            )}
          >
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-2xl",
                businessType === "service"
                  ? "bg-sky-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800"
              )}
            >
              🛠️
            </div>
            <div>
              <p className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                Layanan Jasa & Keahlian
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Untuk servis AC, konstruksi/kanopi, legalitas, perbaikan, desain, atau jasa panggilan di Kota Serang.
              </p>
            </div>
          </button>
        </div>
      </section>

      {/* KONFIGURASI KHUSUS LAYANAN JASA */}
      {businessType === "service" && (
        <section
          aria-labelledby="service-config-heading"
          className="space-y-6 bg-white dark:bg-surface-darkCard shadow-subtle p-6 sm:p-8 border border-sky-200 dark:border-sky-900/60 rounded-3xl animate-in fade-in duration-200"
        >
          <header className="flex items-center gap-2.5 pb-4 border-slate-100 dark:border-slate-800 border-b">
            <div className="flex justify-center items-center bg-sky-100 dark:bg-sky-950/80 rounded-xl w-8 h-8 font-bold text-sky-700 dark:text-sky-400">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="service-config-heading"
                className="font-slab font-bold text-slate-900 dark:text-white text-lg"
              >
                Pengaturan Layanan Jasa Kota Serang
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                Tentukan skema tarif, tombol aksi WhatsApp pemesanan, dan wilayah jangkauan kecamatan
              </p>
            </div>
          </header>

          {/* Model Tarif / Skema Biaya */}
          <div className="space-y-3">
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
              Skema Tarif Layanan <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: "starting_at",
                  label: "Mulai Dari (Starting At)",
                  desc: "Cocok jika biaya dasar jelas namun bisa bertambah tergantung tingkat kesulitan.",
                },
                {
                  id: "consultation",
                  label: "Konsultasi / Sesuai Survei",
                  desc: "Tarif dinamis berdasarkan survei lapangan atau kesepakatan via WhatsApp.",
                },
                {
                  id: "fixed",
                  label: "Tarif Tetap (Fixed Price)",
                  desc: "Biaya jasa sudah pasti per kunjungan, per tindakan, atau per unit.",
                },
              ].map((m) => (
                <label
                  key={m.id}
                  className={cn(
                    "flex flex-col p-4 rounded-2xl border cursor-pointer transition-all text-left",
                    priceModel === m.id
                      ? "border-sky-500 bg-sky-50/50 dark:bg-sky-950/30 text-sky-950 dark:text-sky-100 ring-2 ring-sky-500/20"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  )}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {m.label}
                    </span>
                    <input
                      type="radio"
                      name="priceModel"
                      value={m.id}
                      checked={priceModel === m.id}
                      onChange={() => setPriceModel(m.id as PriceModel)}
                      className="text-sky-600 focus:ring-sky-500"
                    />
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {m.desc}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Tipe Aksi Pemesanan WhatsApp */}
          <div className="space-y-3">
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
              Tombol Aksi WhatsApp (Call To Action) <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: "appointment",
                  label: "📍 Panggil Teknisi / Buat Janji",
                  desc: "Cocok untuk servis AC, reparasi ke rumah/lokasi pelanggan.",
                },
                {
                  id: "reservation",
                  label: "📅 Cek Jadwal & Reservasi",
                  desc: "Cocok untuk salon, sewa studio, fotografer, booking slot.",
                },
                {
                  id: "consultation",
                  label: "💬 Konsultasi Kebutuhan Jasa",
                  desc: "Cocok untuk pembuatan kanopi, legalitas, desain & proyek custom.",
                },
              ].map((a) => (
                <label
                  key={a.id}
                  className={cn(
                    "flex flex-col p-4 rounded-2xl border cursor-pointer transition-all text-left",
                    serviceAction === a.id
                      ? "border-sky-500 bg-sky-50/50 dark:bg-sky-950/30 text-sky-950 dark:text-sky-100 ring-2 ring-sky-500/20"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  )}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {a.label}
                    </span>
                    <input
                      type="radio"
                      name="serviceAction"
                      value={a.id}
                      checked={serviceAction === a.id}
                      onChange={() => setServiceAction(a.id as ServiceAction)}
                      className="text-sky-600 focus:ring-sky-500"
                    />
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {a.desc}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Cakupan Wilayah Kecamatan Kota Serang */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                Wilayah Cakupan Kerja di Kota Serang
              </label>
              {!isStarterPlan ? (
                <button
                  type="button"
                  onClick={() => {
                    if (serviceAreas.length === KECAMATAN_LIST.length) {
                      setServiceAreas([]);
                    } else {
                      setServiceAreas([...KECAMATAN_LIST]);
                    }
                  }}
                  className="text-xs text-sky-600 dark:text-sky-400 hover:underline font-semibold"
                >
                  {serviceAreas.length === KECAMATAN_LIST.length
                    ? "Batalkan Semua"
                    : "Pilih Seluruh Kota Serang"}
                </button>
              ) : (
                <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                  Terkunci 1 Kecamatan (Paket Starter)
                </span>
              )}
            </div>

            {isStarterPlan && (
              <div className="flex items-start gap-3 p-3.5 bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-2xl text-xs text-amber-900 dark:text-amber-200 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">
                    Jangkauan Terkunci di Kecamatan Domisili Toko ({domicileDistrict})
                  </p>
                  <p className="text-[11px] leading-relaxed text-amber-800/90 dark:text-amber-300/90">
                    Paket Starter UMKM membatasi cakupan jasa Anda khusus untuk 1 kecamatan domisili toko Anda. Upgrade ke paket berbayar untuk membuka jangkauan ke seluruh 6 kecamatan Kota Serang.
                  </p>
                  <div className="pt-1">
                    <Link
                      href="/dashboard/billing"
                      className="inline-flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-300 hover:underline text-[11px]"
                    >
                      <span>Tingkatkan Paket Toko Sekarang &rarr;</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isStarterPlan
                ? `Wilayah domisili toko Anda terdaftar di Kecamatan ${domicileDistrict}:`
                : "Centang wilayah kecamatan yang dapat Anda jangkau untuk pekerjaan ini:"}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {KECAMATAN_LIST.map((kec) => {
                const isChecked = effectiveServiceAreas.includes(kec);
                const isDomicile =
                  kec.toLowerCase() === domicileDistrict.toLowerCase();
                const isDisabled = isStarterPlan && !isDomicile;

                return (
                  <label
                    key={kec}
                    className={cn(
                      "flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold transition-colors",
                      isDisabled
                        ? "border-slate-200 dark:border-slate-800/60 bg-slate-100/60 dark:bg-slate-900/40 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60"
                        : isChecked
                          ? "border-sky-500 bg-sky-50/70 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200 shadow-2xs cursor-pointer"
                          : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={isDisabled || (isStarterPlan && isDomicile)}
                      onChange={(e) => {
                        if (isStarterPlan) return;
                        if (e.target.checked) {
                          setServiceAreas((prev) => [...prev, kec]);
                        } else {
                          setServiceAreas((prev) =>
                            prev.filter((k) => k !== kec),
                          );
                        }
                      }}
                      className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 w-4 h-4 disabled:opacity-50"
                    />
                    <div className="flex flex-col">
                      <span>{kec}</span>
                      {isStarterPlan && isDomicile && (
                        <span className="text-[10px] text-sky-600 dark:text-sky-400 font-normal">
                          (Domisili Toko)
                        </span>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 1. INFORMASI DASAR */}
      <section
        aria-labelledby="basic-info-heading"
        className="space-y-6 bg-white dark:bg-surface-darkCard shadow-subtle p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 rounded-3xl"
      >
        <header className="flex items-center gap-2.5 pb-4 border-slate-100 dark:border-slate-800 border-b">
          <div className="flex justify-center items-center bg-brand-100 dark:bg-brand-950/80 rounded-xl w-8 h-8 font-bold text-brand-700 dark:text-brand-400">
            1
          </div>
          <div>
            <h2
              id="basic-info-heading"
              className="font-slab font-bold text-slate-900 dark:text-white text-lg"
            >
              {businessType === "service"
                ? "Informasi Dasar Layanan Jasa"
                : "Informasi Dasar Produk"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs">
              {businessType === "service"
                ? "Nama layanan jasa, kategori, dan deskripsi keahlian Anda"
                : "Judul, kategori checkbox, dan deskripsi produk Anda"}
            </p>
          </div>
        </header>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="product-name"
              className="block mb-1.5 font-slab font-bold text-slate-700 dark:text-slate-300 text-xs sm:text-sm"
            >
              {businessType === "service"
                ? "Nama Layanan Jasa"
                : "Nama Produk"}{" "}
              <span className="text-rose-500">*</span>
            </label>
            <input
              id="product-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                businessType === "service"
                  ? "Contoh: Jasa Pasang & Service AC Serang"
                  : "Contoh: Madu Akasia Asli Serang 500g"
              }
              className="bg-slate-50 dark:bg-slate-900 px-4 py-2.5 border border-slate-200 focus:border-brand-500 dark:border-slate-800 rounded-xl outline-none w-full text-slate-900 dark:text-white text-sm"
            />
          </div>

          {/* SEKSI KATEGORI PRODUK BERTINGKAT */}
          <div className={cn('space-y-4', 'pt-2')}>
            <div className={cn('flex', 'items-center', 'justify-between')}>
              <label className={cn('block', 'text-xs', 'sm:text-sm', 'font-semibold', 'text-slate-800', 'dark:text-slate-200')}>
                Kategori Produk <span className="text-rose-500">*</span>
              </label>
              {/* Tombol Tambah Kategori Baru Tetap Dipertahankan */}
              <button
                type="button"
                onClick={() => setShowAddCat(!showAddCat)}
                className={cn('text-xs', 'font-semibold', 'text-[#093c96]', 'hover:text-blue-800', 'dark:text-blue-400', 'dark:hover:text-blue-300', 'flex', 'items-center', 'gap-1', 'transition-colors')}
              >
                <span>{showAddCat ? "Tutup Form" : "+ Tambah Kategori Baru"}</span>
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
                      {businessType === "service" ? (
                        jasaParentCategory ? (
                          <option value={jasaParentCategory.id}>
                            {jasaParentCategory.name} (Kategori Utama Terkunci)
                          </option>
                        ) : (
                          <option value={0}>— Kategori Layanan Jasa —</option>
                        )
                      ) : (
                        <>
                          <option value={0}>
                            — Tanpa Induk (Kategori Utama) —
                          </option>
                          {parentCategories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </>
                      )}
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
                  <span>
                    {isAddingCat ? "Menambahkan..." : "Simpan Kategori"}
                  </span>
                </Button>
              </div>
            )}

            {/* SEKSI KATEGORI BERDASARKAN MODE BISNIS */}
            {businessType === "service" ? (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Kategori Utama:
                  </span>
                  <span className="text-[11px] font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-2.5 py-0.5 rounded-full border border-sky-200 dark:border-sky-800">
                    Terkunci Otomatis ke Layanan Jasa
                  </span>
                </div>
                <div className="p-3 bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 rounded-xl flex items-center justify-between text-xs text-sky-950 dark:text-sky-100 font-semibold shadow-2xs">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    <span>Layanan Jasa & Keahlian</span>
                  </div>
                  <Check className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                </div>

                {/* Subkategori Layanan Jasa Langsung Tampil */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold">
                      Pilih Subkategori Bidang Jasa <span className="text-rose-500">*</span>:
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {subcategories.length > 0
                        ? `${subcategories.length} Bidang keahlian tersedia`
                        : "Memuat bidang keahlian..."}
                    </span>
                  </div>

                  {subcategories.length > 0 ? (
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 max-h-52 overflow-y-auto space-y-1.5">
                      {subcategories.map((sub) => {
                        const isChecked = selectedCategoryIds.includes(sub.id);
                        return (
                          <label
                            key={sub.id}
                            className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800/80 transition-colors cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleSubcategory(sub.id)}
                              className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 w-4 h-4"
                            />
                            <span className="flex-1">{sub.name}</span>
                            {sub.count !== undefined && (
                              <span className="text-[10px] text-slate-400">
                                ({sub.count})
                              </span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-500 text-center">
                      Kategori utama Layanan Jasa belum memiliki subkategori. Layanan akan didaftarkan pada kategori umum Layanan Jasa.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Mode Produk Fisik: Langkah 1 & 2 Normal (Layanan Jasa tersembunyi) */
              <>
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

                {/* LANGKAH 2: PILIH SUBKATEGORI */}
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
              </>
            )}
          </div>

          <div>
            <label
              htmlFor="product-type"
              className="block mb-1.5 font-slab font-bold text-slate-700 dark:text-slate-300 text-xs sm:text-sm"
            >
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
            <label
              htmlFor="product-short-desc"
              className="block mb-1.5 font-slab font-bold text-slate-700 dark:text-slate-300 text-xs sm:text-sm"
            >
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

          <div className="space-y-1.5">
            <label htmlFor="description" className={cn('block', 'text-xs', 'sm:text-sm', 'font-semibold', 'text-slate-800', 'dark:text-slate-200')}>
              Deskripsi Lengkap Produk <span className="text-rose-500">*</span>
            </label>
            <p className={cn('text-[11px]', 'text-slate-500', 'dark:text-slate-400', 'mb-1.5')}>
              Gunakan format tebal, poin-poin (bullets), dan paragraf untuk memudahkan pembeli memahami produk Anda.
            </p>
            <WysiwygEditor
              value={description}
              onChange={(html) => setDescription(html)}
              placeholder="Jelaskan spesifikasi, ukuran, varian, keunggulan, atau cara penggunaan produk secara jelas..."
            />
          </div>
        </div>
      </section>

      {/* 2. HARGA & TRANSAKSI */}
      <section
        aria-labelledby="pricing-heading"
        className="space-y-6 bg-white dark:bg-surface-darkCard shadow-subtle p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 rounded-3xl"
      >
        <header className="flex items-center gap-2.5 pb-4 border-slate-100 dark:border-slate-800 border-b">
          <div className="flex justify-center items-center bg-brand-100 dark:bg-brand-950/80 rounded-xl w-8 h-8 font-bold text-brand-700 dark:text-brand-400">
            2
          </div>
          <div>
            <h2
              id="pricing-heading"
              className="font-slab font-bold text-slate-900 dark:text-white text-lg"
            >
              Harga & Detail Transaksi
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs">
              Atur harga normal, diskon promo, dan link tujuan
            </p>
          </div>
        </header>

        <div className="space-y-4">
          {/* Opsi Produk Fisik: Pilihan Varian */}
          {businessType === "product" && productType !== "affiliate" && (
            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <label
                    htmlFor="is-variable-toggle"
                    className="font-slab font-bold text-slate-900 dark:text-white text-xs sm:text-sm cursor-pointer flex items-center gap-1.5"
                  >
                    <Layers className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                    <span>Produk Memiliki Pilihan Varian?</span>
                  </label>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">
                    Aktifkan jika produk memiliki variasi ukuran, berat, atau rasa dengan harga berbeda.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    id="is-variable-toggle"
                    type="checkbox"
                    checked={isVariable}
                    onChange={(e) => setIsVariable(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-brand-600"></div>
                </label>
              </div>

              {/* Dynamic Variations Repeater */}
              {isVariable && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Daftar Pilihan Varian (Minimal 2):
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {variations.length} varian ditambahkan
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {variations.map((variant, idx) => (
                      <div
                        key={variant.id}
                        className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
                      >
                        <div className="w-6 text-center text-xs font-bold text-slate-400 shrink-0">
                          #{idx + 1}
                        </div>
                        <div className="flex-1 min-w-[140px]">
                          <input
                            type="text"
                            required={isVariable}
                            value={variant.name}
                            onChange={(e) =>
                              handleVariationChange(idx, "name", e.target.value)
                            }
                            placeholder="Nama Varian (mis. 250gr, Ukuran L, Cokelat)"
                            className="w-full bg-slate-50 dark:bg-slate-900 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-brand-500 text-slate-900 dark:text-white"
                          />
                        </div>
                        <div className="w-full sm:w-36">
                          <div className="relative">
                            <span className="absolute left-2.5 top-1.5 text-[10px] text-slate-400">
                              Rp
                            </span>
                            <input
                              type="number"
                              required={isVariable}
                              min={1}
                              value={variant.price || ""}
                              onChange={(e) =>
                                handleVariationChange(
                                  idx,
                                  "price",
                                  Number(e.target.value) || 0,
                                )
                              }
                              placeholder="Harga"
                              className="w-full bg-slate-50 dark:bg-slate-900 pl-8 pr-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-brand-500 text-slate-900 dark:text-white"
                            />
                          </div>
                        </div>
                        <div className="w-full sm:w-28">
                          <select
                            value={variant.stock_status || "instock"}
                            onChange={(e) =>
                              handleVariationChange(
                                idx,
                                "stock_status",
                                e.target.value,
                              )
                            }
                            className="w-full bg-slate-50 dark:bg-slate-900 px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none cursor-pointer text-slate-900 dark:text-white"
                          >
                            <option value="instock">Tersedia</option>
                            <option value="outofstock">Habis</option>
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveVariation(idx)}
                          disabled={variations.length <= 2}
                          aria-label={`Hapus varian ${variant.name || idx + 1}`}
                          className="p-2 text-slate-400 hover:text-rose-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors self-end sm:self-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddVariation}
                      className="text-xs self-start"
                    >
                      <Plus className="mr-1 w-3.5 h-3.5" />
                      <span>Tambah Varian Baru</span>
                    </Button>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      * Harga di etalase akan otomatis menampilkan rentang harga.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Harga Produk Fisik (Simple) */}
          {businessType === "product" && !isVariable && (
            <div className="gap-4 grid grid-cols-1 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="regular-price"
                  className="block mb-1.5 font-slab font-bold text-slate-700 dark:text-slate-300 text-xs sm:text-sm"
                >
                  Harga Normal (Rp) <span className="text-rose-500">*</span>
                </label>
                <input
                  id="regular-price"
                  type="number"
                  required={!isVariable}
                  value={regularPrice}
                  onChange={(e) => setRegularPrice(e.target.value)}
                  placeholder="Contoh: 150000"
                  className="bg-slate-50 dark:bg-slate-900 px-4 py-2.5 border border-slate-200 focus:border-brand-500 dark:border-slate-800 rounded-xl outline-none w-full text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label
                    htmlFor="sale-price"
                    className="block font-slab font-bold text-slate-700 dark:text-slate-300 text-xs sm:text-sm"
                  >
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
          )}

          {/* Tarif Layanan Jasa */}
          {businessType === "service" && (
            <div>
              {priceModel === "consultation" ? (
                <div className="p-4 bg-sky-50/70 dark:bg-sky-950/40 rounded-2xl border border-sky-200 dark:border-sky-800 text-sky-900 dark:text-sky-200 space-y-1">
                  <p className="font-bold text-sm flex items-center gap-2">
                    <span>💬</span> Tarif Konsultasi / Survei (Sesuai Kesepakatan)
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Anda telah memilih skema konsultasi. Layanan akan tampil dengan label <strong>&quot;Konsultasi Tarif&quot;</strong> di etalase dan halaman detail. Pembeli akan mendiskusikan biaya langsung melalui WhatsApp.
                  </p>
                </div>
              ) : (
                <div className="max-w-md">
                  <label
                    htmlFor="service-regular-price"
                    className="block mb-1.5 font-slab font-bold text-slate-700 dark:text-slate-300 text-xs sm:text-sm"
                  >
                    {priceModel === "starting_at"
                      ? "Tarif Mulai Dari (Rp)"
                      : "Biaya / Tarif Tetap (Rp)"}{" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="service-regular-price"
                    type="number"
                    required
                    min={1}
                    value={regularPrice}
                    onChange={(e) => setRegularPrice(e.target.value)}
                    placeholder={
                      priceModel === "starting_at"
                        ? "Contoh: 50000"
                        : "Contoh: 150000"
                    }
                    className="bg-slate-50 dark:bg-slate-900 px-4 py-2.5 border border-slate-200 focus:border-brand-500 dark:border-slate-800 rounded-xl outline-none w-full text-slate-900 dark:text-white text-sm"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    {priceModel === "starting_at"
                      ? "* Di etalase akan tampil sebagai 'Mulai dari Rp ...'"
                      : "* Tarif pasti yang berlaku untuk layanan ini."}
                  </p>
                </div>
              )}
            </div>
          )}

          {productType === "affiliate" && (
            <div className="space-y-4 bg-brand-50/60 dark:bg-brand-950/40 p-4 border border-brand-100 dark:border-brand-900 rounded-2xl">
              <div>
                <label
                  htmlFor="external-url"
                  className="block mb-1 font-slab font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm"
                >
                  Tautan / Link Affiliasi Vendor{" "}
                  <span className="text-rose-500">*</span>
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
                <label
                  htmlFor="button-text"
                  className="block mb-1 font-slab font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm"
                >
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
      <section
        aria-labelledby="media-heading"
        className="space-y-6 bg-white dark:bg-surface-darkCard shadow-subtle p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 rounded-3xl"
      >
        <header className="flex items-center gap-2.5 pb-4 border-slate-100 dark:border-slate-800 border-b">
          <div className="flex justify-center items-center bg-brand-100 dark:bg-brand-950/80 rounded-xl w-8 h-8 font-bold text-brand-700 dark:text-brand-400">
            3
          </div>
          <div>
            <h2
              id="media-heading"
              className="font-slab font-bold text-slate-900 dark:text-white text-lg"
            >
              Galeri Foto Produk
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

        <div className="mt-6 pt-6 border-slate-100 dark:border-slate-800 border-t">
          <GalleryUploader
            images={galleryImages}
            onImagesChange={setGalleryImages}
            maxImages={5}
          />
        </div>
      </section>

      {/* 4. OPTIMASI SEO RANK MATH */}
      <section
        aria-labelledby="seo-heading"
        className="space-y-6 bg-white dark:bg-surface-darkCard shadow-subtle p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 rounded-3xl"
      >
        <header className="flex items-center gap-2.5 pb-4 border-slate-100 dark:border-slate-800 border-b">
          <div className="flex justify-center items-center bg-brand-100 dark:bg-brand-950/80 rounded-xl w-8 h-8 font-bold text-brand-700 dark:text-brand-400">
            4
          </div>
          <div>
            <h2
              id="seo-heading"
              className="flex items-center gap-2 font-slab font-bold text-slate-900 dark:text-white text-lg"
            >
              <span>Optimasi Pencarian Google (SEO Produk) </span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs">
              Atur kata kunci dan meta deskripsi agar produk Anda mudah
              ditemukan di Google
            </p>
          </div>
        </header>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="focus-keyword"
              className="block mb-1.5 font-slab font-bold text-slate-700 dark:text-slate-300 text-xs sm:text-sm"
            >
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
            <label
              htmlFor="seo-title"
              className="block mb-1.5 font-slab font-bold text-slate-700 dark:text-slate-300 text-xs sm:text-sm"
            >
              SEO Meta Title
            </label>
            <input
              id="seo-title"
              type="text"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder={
                name
                  ? `${name} - Mas Chan Digital`
                  : "Judul Produk di Hasil Pencarian"
              }
              className="bg-slate-50 dark:bg-slate-900 px-4 py-2.5 border border-slate-200 focus:border-brand-500 dark:border-slate-800 rounded-xl outline-none w-full text-slate-900 dark:text-white text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="meta-description"
              className="block mb-1.5 font-slab font-bold text-slate-700 dark:text-slate-300 text-xs sm:text-sm"
            >
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
          onClick={() => router.push("/dashboard/products")}
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
          <span>
            {isSubmitting
              ? "Menyimpan..."
              : isEditing
                ? "Simpan Perubahan"
                : "Terbitkan Produk"}
          </span>
        </Button>
      </footer>
    </form>
  );
}
