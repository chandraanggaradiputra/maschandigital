"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const key = searchParams.get("key") || "";
  const login = searchParams.get("login") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!key || !login) {
    return (
      <div className="py-6 text-center">
        <div className="inline-flex justify-center items-center bg-rose-50 mb-3 rounded-full w-12 h-12 text-rose-600">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="font-bold text-slate-900 text-base">
          Tautan Tidak Valid
        </h2>
        <p className="mt-1 mb-4 text-slate-500 text-xs">
          Tautan atur ulang kata sandi tidak lengkap atau sudah kedaluwarsa.
        </p>
        <Link
          href="/vendor/forgot-password"
          className="inline-block bg-[#093c96] px-4 py-2 rounded-xl font-semibold text-white text-xs"
        >
          Ajukan Ulang Reset Password
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (password.length < 6) {
      setErrorMsg("Kata sandi baru minimal 6 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        "https://app.maschandigital.id/wp-json/maschan/v1/auth/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, login, password }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal mengatur ulang kata sandi.");
      }

      setSuccess(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Terjadi kesalahan. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {errorMsg && (
        <div className="flex items-center gap-2 bg-rose-50 mb-4 p-3 border border-rose-200 rounded-xl text-rose-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {success ? (
        <div className="py-4 text-center">
          <div className="inline-flex justify-center items-center bg-emerald-50 mb-3 rounded-full w-12 h-12 text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="font-bold text-slate-900 text-base">
            Kata Sandi Berhasil Diubah!
          </h2>
          <p className="mt-1 mb-6 text-slate-500 text-xs">
            Silakan masuk kembali ke dashboard toko menggunakan kata sandi baru
            Anda.
          </p>
          <button
            onClick={() => router.push("/vendor/login")}
            className="bg-[#093c96] hover:bg-blue-800 px-4 py-2.5 rounded-xl w-full font-semibold text-white text-sm transition"
          >
            Masuk ke Dashboard
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-semibold text-slate-700 text-xs">
              Kata Sandi Baru
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="px-3.5 py-2.5 pr-10 border border-slate-200 focus:border-[#093c96] rounded-xl focus:outline-none focus:ring-[#093c96]/20 focus:ring-2 w-full text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="top-1/2 right-3 absolute text-slate-400 hover:text-slate-600 -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block mb-1 font-semibold text-slate-700 text-xs">
              Konfirmasi Kata Sandi Baru
            </label>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi kata sandi baru"
              className="px-3.5 py-2.5 border border-slate-200 focus:border-[#093c96] rounded-xl focus:outline-none focus:ring-[#093c96]/20 focus:ring-2 w-full text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex justify-center items-center gap-2 bg-[#093c96] hover:bg-blue-800 disabled:opacity-50 px-4 py-2.5 rounded-xl w-full font-semibold text-white text-sm transition"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{loading ? "Menyimpan..." : "Simpan Kata Sandi Baru"}</span>
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex justify-center items-center bg-slate-50 p-4 min-h-screen">
      <div className="bg-white shadow-sm p-6 sm:p-8 border border-slate-200 rounded-2xl w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="inline-flex justify-center items-center bg-blue-50 mb-3 rounded-xl w-12 h-12 text-[#093c96]">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="font-bold text-slate-900 text-xl">
            Atur Ulang Kata Sandi
          </h1>
          <p className="mt-1 text-slate-500 text-sm">
            Buat kata sandi baru yang kuat untuk akun toko Anda.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="py-6 text-center">
              <Loader2 className="mx-auto w-6 h-6 text-[#093c96] animate-spin" />
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
