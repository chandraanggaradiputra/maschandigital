"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mail,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch(
        "https://app.maschandigital.id/wp-json/maschan/v1/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim() }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Gagal mengirim permintaan reset kata sandi.",
        );
      }

      setSuccessMsg(
        data.message ||
          "Tautan atur ulang kata sandi telah dikirim ke email Anda.",
      );
      setEmail("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Terjadi kesalahan koneksi. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center bg-slate-50 p-4 min-h-screen">
      <div className="bg-white shadow-sm p-6 sm:p-8 border border-slate-200 rounded-2xl w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="inline-flex justify-center items-center bg-blue-50 mb-3 rounded-xl w-12 h-12 text-[#093c96]">
            <Mail className="w-6 h-6" />
          </div>
          <h1 className="font-bold text-slate-900 text-xl">Lupa Kata Sandi?</h1>
          <p className="mt-1 text-slate-500 text-sm">
            Masukkan alamat email toko Anda. Kami akan mengirimkan tautan untuk
            membuat kata sandi baru.
          </p>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 bg-rose-50 mb-4 p-3 border border-rose-200 rounded-xl text-rose-700 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg ? (
          <div className="py-4 text-center">
            <div className="inline-flex justify-center items-center bg-emerald-50 mb-3 rounded-full w-12 h-12 text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="font-medium text-slate-800 text-sm">{successMsg}</p>
            <p className="mt-2 text-slate-500 text-xs">
              Silakan periksa kotak masuk atau folder spam email Anda.
            </p>
            <Link
              href="/vendor/login"
              className="inline-flex justify-center items-center bg-[#093c96] hover:bg-blue-800 mt-6 px-4 py-2.5 rounded-xl w-full font-semibold text-white text-sm transition"
            >
              Kembali ke Halaman Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-semibold text-slate-700 text-xs">
                Alamat Email Toko / Username
              </label>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="px-3.5 py-2.5 border border-slate-200 focus:border-[#093c96] rounded-xl focus:outline-none focus:ring-[#093c96]/20 focus:ring-2 w-full text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex justify-center items-center gap-2 bg-[#093c96] hover:bg-blue-800 disabled:opacity-50 px-4 py-2.5 rounded-xl w-full font-semibold text-white text-sm transition"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>
                {loading ? "Mengirim..." : "Kirim Tautan Reset Password"}
              </span>
            </button>

            <div className="pt-2 text-center">
              <Link
                href="/vendor/login"
                className="inline-flex items-center gap-1.5 font-medium text-slate-500 hover:text-slate-800 text-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Login</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
