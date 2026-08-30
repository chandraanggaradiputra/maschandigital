"use client";

import React, { useState, useEffect } from "react";
import {
  Store,
  MessageCircle,
  MessageSquare,
  Save,
  CheckCircle2,
  Loader2,
  Share2,
  Clock,
  Sun,
  Search,
  Sparkles,
  AlertCircle,
  QrCode,
  Download,
  Printer,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { MediaUploader } from "@/components/forms/MediaUploader";
import { StoreQrModal } from "@/components/qr/StoreQrModal";
import {
  KECAMATAN_LIST,
  getKelurahanList,
} from "@/lib/constants/serangDistricts";
import {
  getVendorProfileById,
  getVendorBySlug,
  getVendors,
  updateVendorProfile,
} from "@/lib/api/wordpress";
import { getVendorSession } from "@/lib/api/auth";
import {
  Vendor,
  StoreHours,
  VacationMode,
  StoreSEO,
  VendorSocials,
  ChatIntegration,
} from "@/types";

export default function VendorProfilePage() {
  const [activeTab, setActiveTab] = useState<
    "profile" | "media" | "socials" | "hours" | "seo" | "qr" | "integrations"
  >("profile");
  const [vendorId, setVendorId] = useState<number>(2);
  const [vendorSlug, setVendorSlug] = useState("");

  // Tab 1: Profile
  const [storeName, setStoreName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [district, setDistrict] = useState("Cipocok Jaya");
  const [subdistrict, setSubdistrict] = useState("Banjaragung");

  const handleDistrictChange = (newDistrict: string) => {
    setDistrict(newDistrict);
    const kelList = getKelurahanList(newDistrict);
    if (kelList.length > 0) {
      setSubdistrict(kelList[0].name);
    }
  };
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");

  // Tab 2: Media
  const [avatar, setAvatar] = useState("");
  const [banner, setBanner] = useState("");

  // Tab 3: Socials
  const [socials, setSocials] = useState<VendorSocials>({
    instagram: "",
    tiktok: "",
    facebook: "",
    youtube: "",
    website: "",
  });

  // Tab 4: Store Hours & Vacation
  const [vacationMode, setVacationMode] = useState<VacationMode>({
    isEnabled: false,
    vacationMessage: "Toko kami sedang libur sementara waktu.",
  });

  const [storeHours, setStoreHours] = useState<StoreHours>({
    senin: { isOpen: true, openTime: "08:00", closeTime: "17:00" },
    selasa: { isOpen: true, openTime: "08:00", closeTime: "17:00" },
    rabu: { isOpen: true, openTime: "08:00", closeTime: "17:00" },
    kamis: { isOpen: true, openTime: "08:00", closeTime: "17:00" },
    jumat: { isOpen: true, openTime: "08:00", closeTime: "17:00" },
    sabtu: { isOpen: true, openTime: "08:00", closeTime: "17:00" },
    minggu: { isOpen: false, openTime: "08:00", closeTime: "17:00" },
  });

  // Tab 5: SEO
  const [storeSeo, setStoreSeo] = useState<StoreSEO>({
    seoTitle: "",
    metaDescription: "",
    metaKeywords: "",
  });

  // Tab 7: Integrasi Live Chat Tawk.to (opsional, per-vendor)
  const [chatIntegration, setChatIntegration] = useState<ChatIntegration>({
    enabled: false,
    property_id: "",
    widget_id: "",
  });

  // Modal QR Code
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadVendorProfile() {
      setIsFetching(true);
      try {
        const session = getVendorSession();
        let targetUserId = 2;

        if (session && session.user?.id) {
          targetUserId = Number(session.user.id);
        }

        setVendorId(targetUserId);
        if (session?.user?.slug) {
          setVendorSlug(session.user.slug);
        }

        // 1. Ambil data vendor spesifik per ID
        let currentV = await getVendorProfileById(targetUserId);

        // 2. Fallback via slug atau list vendor
        if (!currentV && session?.user?.slug) {
          currentV = await getVendorBySlug(session.user.slug);
        }
        if (!currentV) {
          const allVendors = await getVendors();
          if (allVendors && allVendors.length > 0) {
            currentV =
              allVendors.find((v) => v.id === targetUserId) || allVendors[0];
          }
        }

        if (currentV) {
          setStoreName(currentV.store_name || session?.user?.store_name || "");
          setVendorSlug(currentV.slug || session?.user?.slug || "toko-vendor");
          setOwnerName(currentV.owner_name || session?.user?.name || "");
          setEmail(currentV.email || session?.user?.email || "");
          setWhatsapp(currentV.whatsapp_number || session?.user?.phone || "");
          setDistrict(
            currentV.location_district ||
              session?.user?.district ||
              "Cipocok Jaya",
          );
          setSubdistrict(
            currentV.location_subdistrict ||
              currentV.subdistrict ||
              getKelurahanList(currentV.location_district || "Cipocok Jaya")[0]
                ?.name ||
              "Banjaragung",
          );
          setAddress(currentV.address?.street_1 || "");
          setDescription(currentV.description || "");
          setAvatar(currentV.avatar || "");
          setBanner(currentV.banner || "");

          if (currentV.socials) {
            setSocials({
              instagram: currentV.socials.instagram || "",
              tiktok: currentV.socials.tiktok || "",
              facebook: currentV.socials.facebook || "",
              youtube: currentV.socials.youtube || "",
              website: currentV.socials.website || "",
            });
          }
          if (currentV.store_hours) setStoreHours(currentV.store_hours);
          if (currentV.vacation_mode) setVacationMode(currentV.vacation_mode);
          if (currentV.store_seo) setStoreSeo(currentV.store_seo);
          if (currentV.chat_integration) {
            setChatIntegration({
              enabled: Boolean(currentV.chat_integration.enabled),
              property_id: currentV.chat_integration.property_id || "",
              widget_id: currentV.chat_integration.widget_id || "",
            });
          } else {
            setChatIntegration({
              enabled: false,
              property_id: "",
              widget_id: "",
            });
          }
        } else if (session?.user) {
          setStoreName(session.user.store_name || "");
          setVendorSlug(session.user.slug || "toko-vendor");
          setOwnerName(session.user.name || "");
          setEmail(session.user.email || "");
          setWhatsapp(session.user.phone || "");
          setDistrict(session.user.district || "Cipocok Jaya");
          setChatIntegration({
            enabled: false,
            property_id: "",
            widget_id: "",
          });
        }
      } catch (err: unknown) {
        console.error("Gagal mengambil profil vendor:", err);
      } finally {
        setIsFetching(false);
      }
    }
    loadVendorProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsSaved(false);
    setErrorMessage("");

    const payload = {
      store_name: storeName,
      owner_name: ownerName,
      email,
      whatsapp_number: whatsapp,
      location_district: district,
      location_subdistrict: subdistrict,
      address: { street_1: address, street_2: subdistrict },
      description,
      avatar,
      banner,
      socials,
      store_hours: storeHours,
      vacation_mode: vacationMode,
      store_seo: storeSeo,
      chat_integration: {
        enabled: Boolean(chatIntegration.enabled),
        property_id: (chatIntegration.property_id || "").trim(),
        widget_id: (chatIntegration.widget_id || "").trim(),
      },
    };

    const res = await updateVendorProfile(vendorId, payload);
    if (res.success) {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 4000);
    } else {
      setErrorMessage(res.message || "Gagal menyimpan pengaturan toko.");
    }
    setIsLoading(false);
  };

  if (isFetching) {
    return (
      <div className="flex flex-col justify-center items-center gap-2 p-12 text-slate-500 text-center">
        <Loader2 className="w-6 h-6 text-brand-700 dark:text-brand-400 animate-spin" />
        <span className="font-semibold text-xs">
          Memuat profil toko Anda...
        </span>
      </div>
    );
  }

  const daysLabel: { key: keyof StoreHours; label: string }[] = [
    { key: "senin", label: "Senin" },
    { key: "selasa", label: "Selasa" },
    { key: "rabu", label: "Rabu" },
    { key: "kamis", label: "Kamis" },
    { key: "jumat", label: "Jumat" },
    { key: "sabtu", label: "Sabtu" },
    { key: "minggu", label: "Minggu" },
  ];

  return (
    <form onSubmit={handleSave} className="space-y-6 pb-12 max-w-4xl">
      <header className="flex sm:flex-row flex-col justify-between sm:items-center gap-4">
        <div>
          <h2 className="font-slab font-bold text-slate-900 dark:text-white text-xl">
            Pengaturan Toko {storeName || "Vendor"}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs">
            Kelola profil, media sosial, jam operasional, mode libur, QR Code,
            dan SEO toko Anda di Kota Serang
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsQrModalOpen(true)}
          className="flex items-center gap-1.5 font-bold text-xs shrink-0"
        >
          <QrCode className="w-4 h-4 text-brand-600" />
          <span>Lihat QR Code Toko</span>
        </Button>
      </header>

      {/* Alerts */}
      {isSaved && (
        <aside
          aria-live="polite"
          className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/80 p-4 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-200 text-xs"
        >
          <CheckCircle2
            className="w-5 h-5 text-emerald-500 shrink-0"
            aria-hidden="true"
          />
          <span>Semua pengaturan toko Anda berhasil disimpan!</span>
        </aside>
      )}

      {errorMessage && (
        <aside
          aria-live="assertive"
          className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/80 p-4 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-700 dark:text-rose-300 text-xs"
        >
          <AlertCircle
            className="w-5 h-5 text-rose-500 shrink-0"
            aria-hidden="true"
          />
          <span>{errorMessage}</span>
        </aside>
      )}

      {/* Tab Navigation */}
      <nav
        aria-label="Tab Pengaturan Toko"
        className="flex items-center gap-2 pb-1 border-slate-200 dark:border-slate-800 border-b overflow-x-auto no-scrollbar"
      >
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all border shrink-0 ${
            activeTab === "profile"
              ? "bg-brand-gradient text-white border-transparent shadow-subtle"
              : "bg-white dark:bg-surface-darkCard text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50"
          }`}
        >
          <Store className="w-4 h-4" />
          <span>1. Profil & Alamat</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("media")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all border shrink-0 ${
            activeTab === "media"
              ? "bg-brand-gradient text-white border-transparent shadow-subtle"
              : "bg-white dark:bg-surface-darkCard text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50"
          }`}
        >
          <Sun className="w-4 h-4" />
          <span>2. Branding & Foto</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("socials")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all border shrink-0 ${
            activeTab === "socials"
              ? "bg-brand-gradient text-white border-transparent shadow-subtle"
              : "bg-white dark:bg-surface-darkCard text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50"
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>3. Media Sosial</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("hours")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all border shrink-0 ${
            activeTab === "hours"
              ? "bg-brand-gradient text-white border-transparent shadow-subtle"
              : "bg-white dark:bg-surface-darkCard text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>4. Jam Buka & Libur</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("seo")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all border shrink-0 ${
            activeTab === "seo"
              ? "bg-brand-gradient text-white border-transparent shadow-subtle"
              : "bg-white dark:bg-surface-darkCard text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50"
          }`}
        >
          <Search className="w-4 h-4" />
          <span>5. SEO Toko & Meta</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("qr")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all border shrink-0 ${
            activeTab === "qr"
              ? "bg-brand-gradient text-white border-transparent shadow-subtle"
              : "bg-white dark:bg-surface-darkCard text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50"
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>6. QR Code Standee</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("integrations")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all border shrink-0 ${
            activeTab === "integrations"
              ? "bg-brand-gradient text-white border-transparent shadow-subtle"
              : "bg-white dark:bg-surface-darkCard text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>7. Live Chat Tawk.to</span>
        </button>
      </nav>

      {/* TAB 1: PROFIL & ALAMAT */}
      {activeTab === "profile" && (
        <section
          aria-labelledby="store-details-heading"
          className="space-y-6 bg-white dark:bg-surface-darkCard shadow-subtle p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 rounded-3xl"
        >
          <h3
            id="store-details-heading"
            className="pb-3 border-slate-100 dark:border-slate-800 border-b font-slab font-bold text-slate-900 dark:text-white text-base"
          >
            Detail Toko & Kontak Penjual
          </h3>

          <div className="space-y-4">
            <div className="gap-4 grid grid-cols-1 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="prof-store-name"
                  className="block mb-1.5 font-slab font-bold text-slate-700 dark:text-slate-300 text-xs"
                >
                  Nama Toko <span className="text-rose-500">*</span>
                </label>
                <input
                  id="prof-store-name"
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 border border-slate-200 focus:border-brand-500 dark:border-slate-800 rounded-xl outline-none w-full text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="prof-owner-name"
                  className="block mb-1.5 font-slab font-bold text-slate-700 dark:text-slate-300 text-xs"
                >
                  Nama Pemilik Usaha
                </label>
                <input
                  id="prof-owner-name"
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 border border-slate-200 focus:border-brand-500 dark:border-slate-800 rounded-xl outline-none w-full text-slate-900 dark:text-white text-sm"
                />
              </div>
            </div>

            <div className="gap-4 grid grid-cols-1 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="prof-whatsapp"
                  className="block mb-1.5 font-slab font-bold text-slate-700 dark:text-slate-300 text-xs"
                >
                  Nomor WhatsApp Toko <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="prof-whatsapp"
                    type="tel"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="081234567890"
                    className="bg-slate-50 dark:bg-slate-900 py-2.5 pr-3.5 pl-9 border border-slate-200 focus:border-brand-500 dark:border-slate-800 rounded-xl outline-none w-full text-slate-900 dark:text-white text-sm"
                  />
                  <MessageCircle
                    className="top-1/2 left-3 absolute w-4 h-4 text-whatsapp-500 -translate-y-1/2"
                    aria-hidden="true"
                  />
                </div>
              </div>

              <div className="gap-4 grid grid-cols-1 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="prof-district"
                    className="block mb-1.5 font-slab font-bold text-slate-700 dark:text-slate-300 text-xs"
                  >
                    Kecamatan di Kota Serang{" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="prof-district"
                    value={district}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 border border-slate-200 focus:border-brand-500 dark:border-slate-800 rounded-xl outline-none w-full font-medium text-slate-900 dark:text-white text-sm cursor-pointer"
                  >
                    {KECAMATAN_LIST.map((kec) => (
                      <option key={kec} value={kec}>
                        Kec. {kec}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="prof-subdistrict"
                    className="block mb-1.5 font-slab font-bold text-slate-700 dark:text-slate-300 text-xs"
                  >
                    Kelurahan / Desa <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="prof-subdistrict"
                    value={subdistrict}
                    onChange={(e) => setSubdistrict(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 border border-slate-200 focus:border-brand-500 dark:border-slate-800 rounded-xl outline-none w-full font-medium text-slate-900 dark:text-white text-sm cursor-pointer"
                  >
                    {getKelurahanList(district).map((kel) => (
                      <option key={kel.name} value={kel.name}>
                        Kel. {kel.name} ({kel.postalCode})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="prof-address"
                className="block mb-1.5 font-slab font-bold text-slate-700 dark:text-slate-300 text-xs"
              >
                Alamat Lengkap Toko
              </label>
              <textarea
                id="prof-address"
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 border border-slate-200 focus:border-brand-500 dark:border-slate-800 rounded-xl outline-none w-full text-slate-900 dark:text-white text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="prof-desc"
                className="block mb-1.5 font-slab font-bold text-slate-700 dark:text-slate-300 text-xs"
              >
                Deskripsi Profil Toko
              </label>
              <textarea
                id="prof-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 border border-slate-200 focus:border-brand-500 dark:border-slate-800 rounded-xl outline-none w-full text-slate-900 dark:text-white text-sm"
              />
            </div>
          </div>
        </section>
      )}

      {/* TAB 2: BRANDING */}
      {activeTab === "media" && (
        <section
          aria-labelledby="store-media-heading"
          className="space-y-6 bg-white dark:bg-surface-darkCard shadow-subtle p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 rounded-3xl"
        >
          <h3
            id="store-media-heading"
            className="pb-3 border-slate-100 dark:border-slate-800 border-b font-slab font-bold text-slate-900 dark:text-white text-base"
          >
            Foto Profil & Banner Toko
          </h3>

          <div className="gap-6 grid grid-cols-1 sm:grid-cols-2">
            <MediaUploader
              initialImage={avatar}
              onImageChange={(url) => setAvatar(url)}
              label="Logo / Avatar Toko"
              helpText="Rasio 1:1. Tampil di kartu vendor dan halaman profil."
            />

            <MediaUploader
              initialImage={banner}
              onImageChange={(url) => setBanner(url)}
              label="Cover Banner Toko"
              helpText="Rasio lebar (16:9). Tampil sebagai sampul atas profil toko."
            />
          </div>
        </section>
      )}

      {/* TAB 3: SOCIALS */}
      {activeTab === "socials" && (
        <section
          aria-labelledby="store-socials-heading"
          className="space-y-6 bg-white dark:bg-surface-darkCard shadow-subtle p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 rounded-3xl"
        >
          <h3
            id="store-socials-heading"
            className="pb-3 border-slate-100 dark:border-slate-800 border-b font-slab font-bold text-slate-900 dark:text-white text-base"
          >
            Tautan Media Sosial Toko
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block mb-1.5 font-slab font-bold text-slate-700 dark:text-slate-300 text-xs">
                Instagram URL
              </label>
              <input
                type="url"
                value={socials.instagram || ""}
                onChange={(e) =>
                  setSocials({ ...socials, instagram: e.target.value })
                }
                placeholder="https://instagram.com/tokoanda"
                className="bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 border border-slate-200 focus:border-brand-500 dark:border-slate-800 rounded-xl outline-none w-full text-slate-900 dark:text-white text-sm"
              />
            </div>

            <div>
              <label className="block mb-1.5 font-slab font-bold text-slate-700 dark:text-slate-300 text-xs">
                TikTok URL
              </label>
              <input
                type="url"
                value={socials.tiktok || ""}
                onChange={(e) =>
                  setSocials({ ...socials, tiktok: e.target.value })
                }
                placeholder="https://tiktok.com/@tokoanda"
                className="bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 border border-slate-200 focus:border-brand-500 dark:border-slate-800 rounded-xl outline-none w-full text-slate-900 dark:text-white text-sm"
              />
            </div>

            <div>
              <label className="block mb-1.5 font-slab font-bold text-slate-700 dark:text-slate-300 text-xs">
                Facebook Page URL
              </label>
              <input
                type="url"
                value={socials.facebook || ""}
                onChange={(e) =>
                  setSocials({ ...socials, facebook: e.target.value })
                }
                placeholder="https://facebook.com/tokoanda"
                className="bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 border border-slate-200 focus:border-brand-500 dark:border-slate-800 rounded-xl outline-none w-full text-slate-900 dark:text-white text-sm"
              />
            </div>

            <div>
              <label className="block mb-1.5 font-slab font-bold text-slate-700 dark:text-slate-300 text-xs">
                YouTube Channel
              </label>
              <input
                type="url"
                value={socials.youtube || ""}
                onChange={(e) =>
                  setSocials({ ...socials, youtube: e.target.value })
                }
                placeholder="https://youtube.com/@channelanda"
                className="bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 border border-slate-200 focus:border-brand-500 dark:border-slate-800 rounded-xl outline-none w-full text-slate-900 dark:text-white text-sm"
              />
            </div>

            <div>
              <label className="block mb-1.5 font-slab font-bold text-slate-700 dark:text-slate-300 text-xs">
                Website Resmi / Landing Page
              </label>
              <input
                type="url"
                value={socials.website || ""}
                onChange={(e) =>
                  setSocials({ ...socials, website: e.target.value })
                }
                placeholder="https://tokoanda.com"
                className="bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 border border-slate-200 focus:border-brand-500 dark:border-slate-800 rounded-xl outline-none w-full text-slate-900 dark:text-white text-sm"
              />
            </div>
          </div>
        </section>
      )}

      {/* TAB 4: JAM OPERASIONAL & LIBUR */}
      {activeTab === "hours" && (
        <section
          aria-labelledby="store-hours-heading"
          className="space-y-6 bg-white dark:bg-surface-darkCard shadow-subtle p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 rounded-3xl"
        >
          <h3
            id="store-hours-heading"
            className="pb-3 border-slate-100 dark:border-slate-800 border-b font-slab font-bold text-slate-900 dark:text-white text-base"
          >
            Jam Buka & Mode Libur (Vacation Mode)
          </h3>

          <div className="space-y-3 bg-amber-50/80 dark:bg-amber-950/40 p-4 border border-amber-200 dark:border-amber-800/80 rounded-2xl">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-slab font-bold text-amber-900 dark:text-amber-200 text-sm">
                  Mode Libur (Vacation Mode)
                </span>
                <p className="mt-0.5 text-amber-700 dark:text-amber-300 text-xs">
                  Aktifkan jika toko Anda sedang tutup sementara waktu / cuti
                  bersama.
                </p>
              </div>
              <input
                type="checkbox"
                checked={vacationMode.isEnabled}
                onChange={(e) =>
                  setVacationMode({
                    ...vacationMode,
                    isEnabled: e.target.checked,
                  })
                }
                className="rounded focus:ring-amber-500 w-5 h-5 text-amber-600 cursor-pointer"
              />
            </div>

            {vacationMode.isEnabled && (
              <div>
                <label className="block mb-1 font-bold text-amber-900 dark:text-amber-200 text-xs">
                  Pesan Pemberitahuan Libur untuk Pelanggan:
                </label>
                <textarea
                  rows={2}
                  value={vacationMode.vacationMessage}
                  onChange={(e) =>
                    setVacationMode({
                      ...vacationMode,
                      vacationMessage: e.target.value,
                    })
                  }
                  placeholder="Toko kami sedang tutup untuk libur Idul Fitri hingga tanggal..."
                  className="bg-white dark:bg-slate-900 px-3 py-2 border border-amber-200 dark:border-amber-800 rounded-xl outline-none w-full text-slate-800 dark:text-slate-100 text-xs"
                />
              </div>
            )}
          </div>

          <div className="space-y-3 pt-2">
            <h4 className="font-slab font-bold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider">
              Jadwal Operasional Toko
            </h4>

            <div className="space-y-2">
              {daysLabel.map(({ key, label }) => {
                const d = storeHours[key];
                return (
                  <div
                    key={key}
                    className="flex sm:flex-row flex-col justify-between sm:items-center gap-3 bg-slate-50 dark:bg-slate-900 p-3 border border-slate-100 dark:border-slate-800 rounded-2xl"
                  >
                    <label className="flex items-center gap-2.5 min-w-[120px] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={d.isOpen}
                        onChange={(e) =>
                          setStoreHours({
                            ...storeHours,
                            [key]: { ...d, isOpen: e.target.checked },
                          })
                        }
                        className="rounded focus:ring-brand-500 w-4 h-4 text-brand-800"
                      />
                      <span
                        className={`text-xs font-bold ${d.isOpen ? "text-slate-900 dark:text-white" : "text-slate-400"}`}
                      >
                        {label}
                      </span>
                    </label>

                    {d.isOpen ? (
                      <div className="flex items-center gap-2 text-xs">
                        <span>Buka:</span>
                        <input
                          type="time"
                          value={d.openTime}
                          onChange={(e) =>
                            setStoreHours({
                              ...storeHours,
                              [key]: { ...d, openTime: e.target.value },
                            })
                          }
                          className="bg-white dark:bg-slate-800 px-2 py-1 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                        />
                        <span>Tutup:</span>
                        <input
                          type="time"
                          value={d.closeTime}
                          onChange={(e) =>
                            setStoreHours({
                              ...storeHours,
                              [key]: { ...d, closeTime: e.target.value },
                            })
                          }
                          className="bg-white dark:bg-slate-800 px-2 py-1 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                        />
                      </div>
                    ) : (
                      <span className="font-semibold text-rose-500 text-xs">
                        Tutup
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* TAB 5: SEO TOKO */}
      {activeTab === "seo" && (
        <section
          aria-labelledby="store-seo-heading"
          className="space-y-6 bg-white dark:bg-surface-darkCard shadow-subtle p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 rounded-3xl"
        >
          <h3
            id="store-seo-heading"
            className="flex items-center gap-2 pb-3 border-slate-100 dark:border-slate-800 border-b font-slab font-bold text-slate-900 dark:text-white text-base"
          >
            <span>Optimasi Pencarian Google (SEO Toko)</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block mb-1.5 font-slab font-bold text-slate-700 dark:text-slate-300 text-xs">
                SEO Meta Title Toko
              </label>
              <input
                type="text"
                value={storeSeo.seoTitle || ""}
                onChange={(e) =>
                  setStoreSeo({ ...storeSeo, seoTitle: e.target.value })
                }
                placeholder="Contoh: Toko Oleh-Oleh Khas Serang Terlengkap - Mas Chan Digital"
                className="bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 border border-slate-200 focus:border-brand-500 dark:border-slate-800 rounded-xl outline-none w-full text-slate-900 dark:text-white text-sm"
              />
            </div>

            <div>
              <label className="block mb-1.5 font-slab font-bold text-slate-700 dark:text-slate-300 text-xs">
                Meta Description Toko
              </label>
              <textarea
                rows={3}
                value={storeSeo.metaDescription || ""}
                onChange={(e) =>
                  setStoreSeo({ ...storeSeo, metaDescription: e.target.value })
                }
                placeholder="Deskripsi profil toko yang akan tampil di hasil pencarian Google..."
                className="bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 border border-slate-200 focus:border-brand-500 dark:border-slate-800 rounded-xl outline-none w-full text-slate-900 dark:text-white text-sm"
              />
            </div>

            <div>
              <label className="block mb-1.5 font-slab font-bold text-slate-700 dark:text-slate-300 text-xs">
                Meta Keywords Toko
              </label>
              <input
                type="text"
                value={storeSeo.metaKeywords || ""}
                onChange={(e) =>
                  setStoreSeo({ ...storeSeo, metaKeywords: e.target.value })
                }
                placeholder="sate bandeng, madu serang, kuliner banten"
                className="bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 border border-slate-200 focus:border-brand-500 dark:border-slate-800 rounded-xl outline-none w-full text-slate-900 dark:text-white text-sm"
              />
            </div>
          </div>
        </section>
      )}

      {/* TAB 6: QR CODE TOKO SIAP CETAK */}
      {activeTab === "qr" && (
        <section
          aria-labelledby="store-qr-heading"
          className="space-y-6 bg-white dark:bg-surface-darkCard shadow-subtle p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 rounded-3xl"
        >
          <div className="flex justify-between items-center pb-3 border-slate-100 dark:border-slate-800 border-b">
            <div>
              <h3
                id="store-qr-heading"
                className="flex items-center gap-2 font-slab font-bold text-slate-900 dark:text-white text-base"
              >
                <QrCode className="w-5 h-5 text-brand-600" />
                <span>QR Code Standee Toko Siap Cetak</span>
              </h3>
              <p className="mt-0.5 text-slate-500 dark:text-slate-400 text-xs">
                Cetak dan pajang QR Code ini di etalase, meja kasir, atau stiker
                kemasan produk Anda
              </p>
            </div>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setIsQrModalOpen(true)}
              className="flex items-center gap-1.5 shadow-subtle font-bold text-xs"
            >
              <QrCode className="w-4 h-4" />
              <span>Buka Standee Siap Cetak</span>
            </Button>
          </div>

          <div className="flex sm:flex-row flex-col justify-between items-center gap-4 bg-brand-50/60 dark:bg-brand-950/40 p-5 border border-brand-100 dark:border-brand-900/60 rounded-2xl">
            <div className="space-y-1 sm:text-left text-center">
              <h4 className="font-slab font-bold text-brand-900 dark:text-brand-200 text-sm">
                Tautkan Pembeli Offline ke Katalog Online Anda
              </h4>
              <p className="text-slate-600 dark:text-slate-400 text-xs">
                Pengunjung warung fisik yang memindai QR Code ini akan langsung
                diarahkan ke:
                <code className="block mt-1 font-mono text-brand-800 dark:text-brand-300">
                  https://maschandigital.id/vendors/{vendorSlug || "toko-anda"}
                </code>
              </p>
            </div>

            <div className="flex gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsQrModalOpen(true)}
                className="font-bold text-xs"
              >
                <Download className="mr-1 w-3.5 h-3.5" />
                <span>Unduh PNG</span>
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setIsQrModalOpen(true)}
                className="font-bold text-xs"
              >
                <Printer className="mr-1 w-3.5 h-3.5" />
                <span>Cetak</span>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* TAB 7: INTEGRASI LIVE CHAT TAWK.TO */}
      {activeTab === "integrations" && (
        <section
          aria-labelledby="tawkto-integration-heading"
          className="space-y-6 bg-white dark:bg-surface-darkCard shadow-subtle p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 rounded-3xl"
        >
          <div>
            <h3
              id="tawkto-integration-heading"
              className="flex items-center gap-2 pb-3 border-slate-100 dark:border-slate-800 border-b font-slab font-bold text-slate-900 dark:text-white text-base"
            >
              <MessageSquare className="w-5 h-5 text-brand-600" />
              <span>Live Chat Tawk.to (Opsional)</span>
            </h3>
            <p className="mt-2 text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
              Fitur ini{" "}
              <strong className="text-slate-700 dark:text-slate-300">
                tidak wajib
              </strong>
              . WhatsApp tetap jadi kanal utama pemesanan. Kalau Anda sudah
              punya akun Tawk.to sendiri, tautkan di sini supaya pembeli bisa
              chat langsung di halaman produk/toko Anda tanpa pindah aplikasi.
            </p>
          </div>

          {/* SECTION PENGATURAN TAWK.TO LIVE CHAT */}
          <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            
            {/* 1. Header & Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
              <div className="pr-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white font-slab">
                  Aktifkan Live Chat di Toko Saya
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Kalau Property ID / Widget ID belum diisi, widget tidak akan muncul walau tombol ini aktif.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={chatIntegration.enabled}
                onClick={() =>
                  setChatIntegration((prev) => ({
                    ...prev,
                    enabled: !prev.enabled,
                  }))
                }
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                  chatIntegration.enabled
                    ? "bg-[#093c96]"
                    : "bg-slate-300 dark:bg-slate-700"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                    chatIntegration.enabled
                      ? "translate-x-5"
                      : "translate-x-0"
                  )}
                />
              </button>
            </div>

            {/* 2. KOLOM INPUT PROPERTY ID (WAJIB SELALU TERLIHAT) */}
            <div className="space-y-1.5">
              <label
                htmlFor="tawk_property_id_input"
                className="block text-xs font-bold text-slate-800 dark:text-slate-200 font-slab"
              >
                Property ID <span className="text-rose-500">*</span>
              </label>
              <input
                id="tawk_property_id_input"
                type="text"
                value={chatIntegration.property_id || ""}
                onChange={(e) =>
                  setChatIntegration((prev) => ({
                    ...prev,
                    property_id: e.target.value.trim(),
                  }))
                }
                placeholder="Contoh: 65a8b1c2d3e4f5a6b7c8d9e0"
                className="w-full h-11 px-4 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 focus:border-[#093c96] focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white outline-none font-mono transition-all block shadow-sm"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                ID Properti unik dari dashboard Tawk.to Anda (24 karakter hex).
              </p>
            </div>

            {/* 3. KOLOM INPUT WIDGET ID (WAJIB SELALU TERLIHAT) */}
            <div className="space-y-1.5">
              <label
                htmlFor="tawk_widget_id_input"
                className="block text-xs font-bold text-slate-800 dark:text-slate-200 font-slab"
              >
                Widget ID <span className="text-rose-500">*</span>
              </label>
              <input
                id="tawk_widget_id_input"
                type="text"
                value={chatIntegration.widget_id || ""}
                onChange={(e) =>
                  setChatIntegration((prev) => ({
                    ...prev,
                    widget_id: e.target.value.trim(),
                  }))
                }
                placeholder="Contoh: 1h9k8m7n6 atau default"
                className="w-full h-11 px-4 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 focus:border-[#093c96] focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white outline-none font-mono transition-all block shadow-sm"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                ID Widget chat (biasanya berawalan &quot;1h...&quot; atau &quot;default&quot;).
              </p>
            </div>

            {/* 4. Box Petunjuk */}
            <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
              <p className="font-bold text-[#093c96] dark:text-blue-400">
                Cara mendapatkan Property ID &amp; Widget ID:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-slate-500 dark:text-slate-400">
                <li>
                  Buat akun gratis di{" "}
                  <a
                    href="https://www.tawk.to"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#093c96] dark:text-blue-400 font-semibold underline"
                  >
                    tawk.to
                  </a>{" "}
                  (kalau belum punya)
                </li>
                <li>Buka Dashboard Tawk.to ➔ Administration ➔ Channels ➔ Chat Widget</li>
                <li>
                  Lihat kode embed yang muncul — formatnya:{" "}
                  <code className="bg-white dark:bg-slate-800 px-1 py-0.5 rounded font-mono text-[10px]">
                    embed.tawk.to/PROPERTY_ID/WIDGET_ID
                  </code>
                </li>
                <li>Salin kedua bagian ID tersebut ke kolom di atas lalu klik tombol Simpan di bawah.</li>
              </ol>
            </div>

          </div>
        </section>
      )}

      {/* Save Button (Disembunyikan saat membuka tab QR) */}
      {activeTab !== "qr" && (
        <footer className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isLoading}
            className="min-w-[180px] font-bold"
          >
            <Save className="mr-2 w-4 h-4" aria-hidden="true" />
            <span>
              {isLoading ? "Menyimpan..." : "Simpan Semua Pengaturan"}
            </span>
          </Button>
        </footer>
      )}

      {/* Modal QR Code Standee */}
      <StoreQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        storeName={storeName || "Toko Vendor"}
        storeSlug={vendorSlug || "toko-vendor"}
        storeDistrict={district}
        avatarUrl={avatar}
      />
    </form>
  );
}
