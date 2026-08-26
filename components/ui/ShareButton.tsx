"use client";

import React, { useState } from "react";
import { Share2, Check } from "lucide-react";
import { Button, ButtonProps } from "@/components/ui/Button";

export interface ShareButtonProps {
  title?: string;
  text?: string;
  url?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  fullWidth?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function ShareButton({
  title = "Mas Chan Digital - Marketplace UMKM Kota Serang",
  text = "Lihat rekomendasi produk & toko lokal Kota Serang di Mas Chan Digital!",
  url,
  variant = "outline",
  size = "md",
  fullWidth = false,
  className,
  children,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const targetUrl =
      url || (typeof window !== "undefined" ? window.location.href : "");

    // Pengecekan Web Share API (HP / Browser Pendukung)
    if (
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function"
    ) {
      try {
        await navigator.share({
          title,
          text,
          url: targetUrl,
        });
        return;
      } catch (error: unknown) {
        // Jika pengguna membatalkan dialog share bawaan OS, abaikan error
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
      }
    }

    // Fallback: Salin URL ke Clipboard (Desktop / Laptop)
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(targetUrl);
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, 2500);
      } catch {
        // Fallback jika clipboard API diblokir
        const textarea = document.createElement("textarea");
        textarea.value = targetUrl;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand("copy");
          setCopied(true);
          setTimeout(() => {
            setCopied(false);
          }, 2500);
        } finally {
          document.body.removeChild(textarea);
        }
      }
    }
  };

  return (
    <Button
      variant={copied ? "secondary" : variant}
      size={size}
      fullWidth={fullWidth}
      className={className}
      onClick={handleShare}
      type="button"
      aria-label={copied ? "Tautan Disalin" : "Bagikan Halaman Ini"}
    >
      {copied ? (
        <>
          <Check
            className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0"
            aria-hidden="true"
          />
          <span>Tautan Disalin! ✓</span>
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{children || "Bagikan"}</span>
        </>
      )}
    </Button>
  );
}
