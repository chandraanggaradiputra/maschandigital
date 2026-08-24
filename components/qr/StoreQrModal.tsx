"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  X,
  Download,
  Printer,
  Copy,
  Check,
  QrCode,
  Sparkles,
} from "lucide-react";
import { QRCodeGenerator } from "@/lib/qrGenerator";
import { Button } from "@/components/ui/Button";

interface StoreQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeName: string;
  storeSlug: string;
  storeDistrict?: string;
  avatarUrl?: string;
}

export function StoreQrModal({
  isOpen,
  onClose,
  storeName,
  storeSlug,
  storeDistrict,
}: StoreQrModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const cleanSlug = storeSlug || "toko-vendor";
  const targetUrl = `https://maschandigital.id/vendors/${cleanSlug}`;
  const districtName = storeDistrict ? `Kec. ${storeDistrict}` : "Kota Serang";

  const renderCanvas = useCallback(
    (logoImage?: HTMLImageElement | null) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Dimensi Kanvas Kualitas Tinggi (Standee A5 rasio: 600 x 850 px)
      const width = 600;
      const height = 850;
      canvas.width = width;
      canvas.height = height;

      // 1. Background Dasar Putih Bersih
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, width, height);

      // 2. Header Brand Gradient Banner
      const grad = ctx.createLinearGradient(0, 0, width, 180);
      grad.addColorStop(0, "#093c96");
      grad.addColorStop(1, "#1e3a8a");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, 180);

      // Header Pattern Accent
      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      for (let i = 0; i < width; i += 20) {
        ctx.fillRect(i, 0, 10, 180);
      }

      // Gambar Logo Mas Chan Digital di Header jika tersedia
      if (logoImage && logoImage.complete && logoImage.naturalWidth > 0) {
        const logoSize = 46;
        const logoX = width / 2 - logoSize / 2;
        const logoY = 22;

        // Bingkai Lingkaran Putih untuk Logo
        ctx.save();
        ctx.beginPath();
        ctx.arc(
          width / 2,
          logoY + logoSize / 2,
          logoSize / 2 + 3,
          0,
          Math.PI * 2,
        );
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();
        ctx.clip();
        ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
        ctx.restore();

        // Brand Text di Bawah Logo
        ctx.fillStyle = "#fde047"; // Amber yellow
        ctx.font = "bold 11px system-ui, -apple-system, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(
          "DIREKTORI & MARKETPLACE RESMI KOTA SERANG",
          width / 2,
          92,
        );

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "900 24px system-ui, -apple-system, sans-serif";
        ctx.fillText("MAS CHAN DIGITAL", width / 2, 122);

        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.font = "13px system-ui, -apple-system, sans-serif";
        ctx.fillText(
          "Beli Produk UMKM Lokal Langsung via WhatsApp",
          width / 2,
          146,
        );
      } else {
        // Fallback Layout jika gambar belum termuat
        ctx.fillStyle = "#fde047";
        ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(
          "DIREKTORI & MARKETPLACE RESMI KOTA SERANG",
          width / 2,
          45,
        );

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "900 28px system-ui, -apple-system, sans-serif";
        ctx.fillText("MAS CHAN DIGITAL", width / 2, 85);

        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.font = "14px system-ui, -apple-system, sans-serif";
        ctx.fillText(
          "Beli Produk UMKM Lokal Langsung via WhatsApp",
          width / 2,
          115,
        );
      }

      // 3. Nama Toko & Badge Lokasi
      ctx.fillStyle = "#0f172a";
      ctx.font = "900 26px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(storeName || "Toko Vendor", width / 2, 235);

      ctx.fillStyle = "#f1f5f9";
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(width / 2 - 130, 255, 260, 32, 16);
        ctx.fill();
      } else {
        ctx.fillRect(width / 2 - 130, 255, 260, 32);
      }

      ctx.fillStyle = "#093c96";
      ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
      ctx.fillText(`📍 ${districtName}, Kota Serang`, width / 2, 276);

      // 4. Generate & Gambar QR Code Matriks
      const matrix = QRCodeGenerator.generateMatrix(targetUrl);
      const matrixSize = matrix.length;
      const qrSize = 340;
      const qrX = (width - qrSize) / 2;
      const qrY = 320;
      const cellSize = qrSize / matrixSize;

      ctx.fillStyle = "#f8fafc";
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 2;
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(qrX - 15, qrY - 15, qrSize + 30, qrSize + 30, 20);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillRect(qrX - 15, qrY - 15, qrSize + 30, qrSize + 30);
      }

      ctx.fillStyle = "#0f172a";
      for (let r = 0; r < matrixSize; r++) {
        for (let c = 0; c < matrixSize; c++) {
          if (matrix[r][c]) {
            ctx.fillRect(
              qrX + c * cellSize,
              qrY + r * cellSize,
              cellSize + 0.4,
              cellSize + 0.4,
            );
          }
        }
      }

      // 5. Teks Panduan Pindai
      ctx.fillStyle = "#1e293b";
      ctx.font = "bold 15px system-ui, -apple-system, sans-serif";
      ctx.fillText("Pindai QR ini dengan Kamera HP Anda", width / 2, 705);

      ctx.fillStyle = "#64748b";
      ctx.font = "12px system-ui, -apple-system, sans-serif";
      ctx.fillText(
        "Lihat seluruh katalog produk kami & pesan mudah via WhatsApp",
        width / 2,
        730,
      );

      // 6. Footer Standee
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(40, 765);
      ctx.lineTo(width - 40, 765);
      ctx.stroke();

      ctx.fillStyle = "#059669";
      ctx.font = "bold 12px system-ui, -apple-system, sans-serif";
      ctx.fillText(
        "✓ 0% Biaya Admin  •  ✓ 100% Produk Lokal Asli  •  maschandigital.id",
        width / 2,
        800,
      );

      setIsReady(true);
    },
    [districtName, storeName, targetUrl],
  );

  useEffect(() => {
    if (!isOpen) return;

    // Muat gambar logo secara asinkron dari folder /public
    const logoImg = new Image();
    logoImg.src = "/maschandigital.webp";

    logoImg.onload = () => {
      renderCanvas(logoImg);
    };

    logoImg.onerror = () => {
      renderCanvas(null);
    };

    const timer = setTimeout(() => {
      renderCanvas(logoImg.complete ? logoImg : null);
    }, 50);

    return () => clearTimeout(timer);
  }, [isOpen, renderCanvas]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = `standee-qr-${cleanSlug}-maschandigital.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    const windowContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cetak Standee QR Toko - ${storeName}</title>
          <style>
            @page { size: auto; margin: 10mm; }
            body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; font-family: sans-serif; background: #fff; }
            img { max-width: 100%; height: auto; max-height: 95vh; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" onload="window.print();window.close();" />
        </body>
      </html>
    `;

    const printWindow = window.open("", "", "width=700,height=900");
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(windowContent);
      printWindow.document.close();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(targetUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-modal-title"
      className="z-50 fixed inset-0 flex justify-center items-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in"
    >
      <div className="space-y-6 bg-white dark:bg-slate-900 shadow-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg max-h-[95vh] overflow-y-auto">
        {/* Header Modal */}
        <div className="flex justify-between items-center pb-3 border-slate-100 dark:border-slate-800 border-b">
          <div className="flex items-center gap-2.5">
            <div className="flex justify-center items-center bg-brand-50 dark:bg-brand-950/80 border border-brand-200 dark:border-brand-800 rounded-2xl w-9 h-9 text-brand-700 dark:text-brand-300 shrink-0">
              <QrCode className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3
                id="qr-modal-title"
                className="font-slab font-bold text-slate-900 dark:text-white text-base"
              >
                QR Code Toko Siap Cetak
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                Pajang di etalase/meja kasir toko fisik Anda di Kota Serang
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
            aria-label="Tutup modal QR Code"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Canvas Preview */}
        <div className="flex flex-col justify-center items-center bg-slate-50 dark:bg-slate-800/50 p-4 border border-slate-200/80 dark:border-slate-700 rounded-2xl">
          <canvas
            ref={canvasRef}
            className="bg-white shadow-lg border border-slate-200 dark:border-slate-700 rounded-xl max-w-full h-auto"
            style={{ maxHeight: "380px" }}
          />
          <span className="flex items-center gap-1 mt-2 text-[11px] text-slate-400">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Format Standee Siap Cetak (Kualitas Tinggi)</span>
          </span>
        </div>

        {/* Action Buttons */}
        <div className="gap-3 grid grid-cols-1 sm:grid-cols-2">
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleDownload}
            disabled={!isReady}
            className="flex justify-center items-center gap-2 py-3 font-bold text-xs"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Gambar PNG</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handlePrint}
            disabled={!isReady}
            className="flex justify-center items-center gap-2 py-3 font-bold text-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Standee (Print)</span>
          </Button>
        </div>

        {/* Quick Link Share */}
        <div className="flex justify-between items-center gap-3 bg-slate-100 dark:bg-slate-800/80 p-3 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs">
          <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300 truncate">
            {targetUrl}
          </span>
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center gap-1 bg-white hover:bg-slate-50 dark:bg-slate-700 shadow-xs px-3 py-1.5 rounded-xl font-bold text-slate-800 dark:text-white transition-all shrink-0"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">
                  Tersalin
                </span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
