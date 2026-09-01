"use client";

import React, { useState } from "react";
import { Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { trackShareAction } from "@/lib/analytics";

interface ShareButtonProps {
  title: string;
  text?: string;
  url?: string;
  variant?: "primary" | "secondary" | "outline" | "whatsapp" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function ShareButton({
  title,
  text = "Lihat di Mas Chan Digital Kota Serang:",
  url,
  variant = "outline",
  size = "sm",
  fullWidth = false,
  className,
  children,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    // Tentukan URL target langsung saat tombol diklik (bebas dari useEffect/re-render)
    const targetUrl =
      url || (typeof window !== "undefined" ? window.location.href : "");

    trackShareAction({ actionType: "share_link", targetName: title });

    // 1. Coba Web Share API (Smartphone Android / iOS)
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: targetUrl,
        });
        return;
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
      }
    }

    // 2. Fallback: Clipboard API (Desktop / Laptop)
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(targetUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
        return;
      } catch (err) {
        console.error("Gagal menyalin ke clipboard:", err);
      }
    }

    // 3. Fallback jika Clipboard API diblokir
    if (typeof document !== "undefined") {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = targetUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch (err) {
        console.error("Gagal menyalin tautan:", err);
      }
    }
  };

  return (
    <div className="inline-block relative">
      <Button
        type="button"
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        onClick={handleShare}
        className={className}
      >
        {copied ? (
          <>
            <Check
              className="mr-1.5 w-4 h-4 text-emerald-500 shrink-0"
              aria-hidden="true"
            />
            <span>Tautan Disalin!</span>
          </>
        ) : (
          children || (
            <>
              <Share2 className="mr-1.5 w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Bagikan</span>
            </>
          )
        )}
      </Button>

      {copied && (
        <span
          role="status"
          className="bottom-full left-1/2 z-30 absolute bg-slate-900 dark:bg-slate-800 shadow-lg mb-2 px-2.5 py-1 rounded-lg font-bold text-[11px] text-white whitespace-nowrap -translate-x-1/2 pointer-events-none"
        >
          Tautan Disalin! ✓
        </span>
      )}
    </div>
  );
}
