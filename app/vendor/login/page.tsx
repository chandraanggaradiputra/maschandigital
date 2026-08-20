"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Store,
  LogIn,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { loginVendor } from "@/lib/api/auth";

export default function VendorLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setIsSuccess(false);

    const result = await loginVendor(email.trim(), password);

    if (result.success && result.session) {
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1000);
    } else {
      setErrorMessage(
        result.message ||
          "Email atau kata sandi tidak sesuai. Silakan coba lagi.",
      );
    }
    setIsLoading(false);
  };

  return (
    <div className="px-4 py-12 sm:py-20">
      <div className="space-y-6 bg-white dark:bg-surface-darkCard shadow-card-hover mx-auto p-6 sm:p-10 border border-slate-200/80 dark:border-slate-800 rounded-3xl max-w-md">
        {/* Header Title */}
        <header className="space-y-2 text-center">
          <div className="flex justify-center items-center bg-brand-gradient shadow-subtle mx-auto mb-3 rounded-2xl w-12 h-12 text-white">
            <Store className="w-6 h-6" aria-hidden="true" />
          </div>
          <h1 className="font-slab font-black text-slate-900 dark:text-white text-2xl">
            Login Dashboard Vendor
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
            Masuk untuk mengelola produk dan pesanan toko Anda di Serang
          </p>
        </header>

        {/* Success Alert */}
        {isSuccess && (
          <aside
            aria-live="polite"
            className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/80 p-3.5 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-200 text-xs"
          >
            <CheckCircle2
              className="w-4 h-4 text-emerald-500 shrink-0"
              aria-hidden="true"
            />
            <span className="font-semibold">
              Login berhasil! Membuka Dashboard Vendor...
            </span>
          </aside>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <aside
            aria-live="assertive"
            className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/80 p-3.5 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-700 dark:text-rose-300 text-xs"
          >
            <AlertCircle
              className="w-4 h-4 text-rose-500 shrink-0"
              aria-hidden="true"
            />
            <span>{errorMessage}</span>
          </aside>
        )}

        {/* Form Login */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              htmlFor="vendor-email"
              className="block mb-1.5 font-slab font-bold text-slate-700 dark:text-slate-300 text-xs"
            >
              Email Toko / Username <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="vendor-email"
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@toko-anda.com"
                className="bg-slate-50 dark:bg-slate-900 py-2.5 pr-4 pl-10 border border-slate-200 focus:border-brand-500 dark:border-slate-800 rounded-xl outline-none w-full text-slate-900 dark:text-white text-sm"
              />
              <Mail
                className="top-1/2 left-3.5 absolute w-4 h-4 text-slate-400 -translate-y-1/2"
                aria-hidden="true"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="vendor-password"
              className="block mb-1.5 font-slab font-bold text-slate-700 dark:text-slate-300 text-xs"
            >
              Kata Sandi <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="vendor-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-slate-50 dark:bg-slate-900 py-2.5 pr-4 pl-10 border border-slate-200 focus:border-brand-500 dark:border-slate-800 rounded-xl outline-none w-full text-slate-900 dark:text-white text-sm"
              />
              <Lock
                className="top-1/2 left-3.5 absolute w-4 h-4 text-slate-400 -translate-y-1/2"
                aria-hidden="true"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-1 text-xs">
            <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded focus:ring-brand-500 text-brand-800"
              />
              <span>Ingat saya</span>
            </label>
            <Link
              href="/tentang-kami"
              className="text-brand-800 dark:text-brand-400 hover:underline"
            >
              Butuh bantuan?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={isLoading}
            className="mt-2 py-3 font-bold"
          >
            <LogIn className="mr-2 w-4 h-4" aria-hidden="true" />
            <span>{isLoading ? "Memproses..." : "Masuk ke Dashboard"}</span>
          </Button>
        </form>

        {/* Footer Link to Register */}
        <footer className="pt-4 border-slate-100 dark:border-slate-800 border-t text-slate-500 dark:text-slate-400 text-xs text-center">
          <span>Belum memiliki akun toko di Serang? </span>
          <Link
            href="/vendor/register"
            className="inline-flex items-center gap-0.5 font-bold text-brand-800 dark:text-brand-400 hover:underline"
          >
            <span>Daftar Sekarang</span>
            <ArrowRight className="w-3 h-3" aria-hidden="true" />
          </Link>
        </footer>
      </div>
    </div>
  );
}
