"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  KECAMATAN_LIST,
  getKelurahanList,
} from "@/lib//constants/serangDistricts";
import {
  Store,
  UserPlus,
  MessageCircle,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { registerVendor } from "@/lib/api/auth";

export default function VendorRegisterPage() {
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
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) return;

    setIsLoading(true);
    setErrorMessage("");
    setIsSuccess(false);

    const result = await registerVendor({
      store_name: storeName.trim(),
      owner_name: ownerName.trim(),
      email: email.trim(),
      password,
      whatsapp_number: whatsapp.trim(),
      location_district: district,
      location_subdistrict: subdistrict,
    });

    if (result.success && result.session) {
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1200);
    } else {
      setErrorMessage(
        result.message ||
          "Pendaftaran gagal. Silakan periksa kembali data Anda.",
      );
    }
    setIsLoading(false);
  };

  return (
    <div className="px-4 py-10 sm:py-16">
      <div className="space-y-6 bg-white dark:bg-surface-darkCard shadow-card-hover mx-auto p-6 sm:p-10 border border-slate-200/80 dark:border-slate-800 rounded-3xl max-w-xl">
        {/* Header Title */}
        <header className="space-y-2 text-center">
          <div className="flex justify-center items-center bg-brand-gradient shadow-subtle mx-auto mb-3 rounded-2xl w-12 h-12 text-white">
            <UserPlus className="w-6 h-6" aria-hidden="true" />
          </div>
          <h1 className="font-slab font-black text-slate-900 dark:text-white text-2xl sm:text-3xl">
            Pendaftaran Toko Vendor
          </h1>
          <p className="mx-auto max-w-sm text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
            Buka toko online gratis di Mas Chan Digital dan jangkau ribuan
            pelanggan di Kota Serang
          </p>
        </header>

        {/* Success Alert */}
        {isSuccess && (
          <aside
            aria-live="polite"
            className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/80 p-4 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-200 text-xs"
          >
            <CheckCircle2
              className="w-5 h-5 text-emerald-500 shrink-0"
              aria-hidden="true"
            />
            <div>
              <p className="font-bold">Pendaftaran Toko Berhasil!</p>
              <p>Mengarahkan Anda langsung ke Dashboard Vendor...</p>
            </div>
          </aside>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <aside
            aria-live="assertive"
            className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/80 p-4 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-700 dark:text-rose-300 text-xs"
          >
            <AlertCircle
              className="w-4 h-4 text-rose-500 shrink-0"
              aria-hidden="true"
            />
            <span>{errorMessage}</span>
          </aside>
        )}

        {/* Form Registration */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="gap-4 grid grid-cols-1 sm:grid-cols-2">
            <div>
              <label
                htmlFor="reg-store-name"
                className="block mb-1.5 font-slab font-bold text-slate-700 dark:text-slate-300 text-xs"
              >
                Nama Toko / Usaha <span className="text-rose-500">*</span>
              </label>
              <input
                id="reg-store-name"
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Contoh: Madu Akasia Serang"
                className="bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 border border-slate-200 focus:border-brand-500 dark:border-slate-800 rounded-xl outline-none w-full text-slate-900 dark:text-white text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="reg-owner-name"
                className="block mb-1.5 font-slab font-bold text-slate-700 dark:text-slate-300 text-xs"
              >
                Nama Pemilik Usaha <span className="text-rose-500">*</span>
              </label>
              <input
                id="reg-owner-name"
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Nama Lengkap Anda"
                className="bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 border border-slate-200 focus:border-brand-500 dark:border-slate-800 rounded-xl outline-none w-full text-slate-900 dark:text-white text-sm"
              />
            </div>
          </div>

          <div className="gap-4 grid grid-cols-1 sm:grid-cols-2">
            <div>
              <label
                htmlFor="reg-whatsapp"
                className="block mb-1.5 font-slab font-bold text-slate-700 dark:text-slate-300 text-xs"
              >
                Nomor WhatsApp Aktif <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="reg-whatsapp"
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
              <p className="mt-1 text-[10px] text-slate-400">
                Digunakan untuk menerima pesanan langsung dari pelanggan via
                WhatsApp.
              </p>
            </div>

            <div className="gap-4 grid grid-cols-2 sm:grid-cols-1">
              <div>
                <label
                  htmlFor="reg-district"
                  className="block mb-1.5 font-slab font-bold text-slate-700 dark:text-slate-300 text-xs"
                >
                  Kecamatan di Kota Serang{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="reg-district"
                    value={district}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-900 py-2.5 pr-3.5 pl-9 border border-slate-200 focus:border-brand-500 dark:border-slate-800 rounded-xl outline-none w-full font-medium text-slate-900 dark:text-white text-sm cursor-pointer"
                  >
                    {KECAMATAN_LIST.map((kec) => (
                      <option key={kec} value={kec}>
                        Kec. {kec}
                      </option>
                    ))}
                  </select>
                  <MapPin
                    className="top-1/2 left-3 absolute w-4 h-4 text-brand-600 -translate-y-1/2"
                    aria-hidden="true"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="reg-subdistrict"
                  className="block mb-1.5 font-slab font-bold text-slate-700 dark:text-slate-300 text-xs"
                >
                  Kelurahan / Desa <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="reg-subdistrict"
                    value={subdistrict}
                    onChange={(e) => setSubdistrict(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-900 py-2.5 pr-3.5 pl-9 border border-slate-200 focus:border-brand-500 dark:border-slate-800 rounded-xl outline-none w-full font-medium text-slate-900 dark:text-white text-sm cursor-pointer"
                  >
                    {getKelurahanList(district).map((kel) => (
                      <option key={kel.name} value={kel.name}>
                        Kel. {kel.name} ({kel.postalCode})
                      </option>
                    ))}
                  </select>
                  <MapPin
                    className="top-1/2 left-3 absolute w-4 h-4 text-emerald-600 -translate-y-1/2"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="reg-email"
              className="block mb-1.5 font-slab font-bold text-slate-700 dark:text-slate-300 text-xs"
            >
              Email Toko <span className="text-rose-500">*</span>
            </label>
            <input
              id="reg-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="kontak@tokoanda.com"
              className="bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 border border-slate-200 focus:border-brand-500 dark:border-slate-800 rounded-xl outline-none w-full text-slate-900 dark:text-white text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="reg-password"
              className="block mb-1.5 font-slab font-bold text-slate-700 dark:text-slate-300 text-xs"
            >
              Kata Sandi Dashboard <span className="text-rose-500">*</span>
            </label>
            <input
              id="reg-password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 border border-slate-200 focus:border-brand-500 dark:border-slate-800 rounded-xl outline-none w-full text-slate-900 dark:text-white text-sm"
            />
          </div>

          <div className="pt-1">
            <label className="flex items-start gap-2.5 text-slate-600 dark:text-slate-400 text-xs cursor-pointer">
              <input
                type="checkbox"
                required
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 rounded focus:ring-brand-500 text-brand-800"
              />
              <span>
                Saya menyetujui ketentuan marketplace Mas Chan Digital dan
                bersedia melayani pelanggan dengan ramah melalui WhatsApp.
              </span>
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={isLoading || !agreeTerms}
            className="mt-2 py-3.5 font-bold"
          >
            <span>
              {isLoading
                ? "Mendaftarkan Toko..."
                : "Daftar Jadi Vendor Sekarang"}
            </span>
          </Button>
        </form>

        {/* Footer Link to Login */}
        <footer className="pt-4 border-slate-100 dark:border-slate-800 border-t text-slate-500 dark:text-slate-400 text-xs text-center">
          <span>Sudah memiliki akun toko? </span>
          <Link
            href="/vendor/login"
            className="font-bold text-brand-800 dark:text-brand-400 hover:underline"
          >
            Login di Sini
          </Link>
        </footer>
      </div>
    </div>
  );
}
