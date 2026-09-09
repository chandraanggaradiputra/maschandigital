"use client";

import React from "react";
import { Play, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewVideoEmbedProps {
  url: string;
  authorName?: string;
}

export function ReviewVideoEmbed({ url, authorName }: ReviewVideoEmbedProps) {
  if (!url) return null;

  // 1. Deteksi YouTube / YouTube Shorts
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return (
      <div className={cn("mt-3 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 shadow-sm max-w-sm")}>
        <div className={cn("relative aspect-9/16 sm:aspect-video w-full max-h-[380px]")}>
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`}
            title={`Video testimoni dari ${authorName || "Pelanggan"}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className={cn("w-full h-full border-0")}
          />
        </div>
      </div>
    );
  }

  // 2. Deteksi TikTok
  const tiktokMatch = url.match(/tiktok\.com\/@[\w.-]+\/video\/(\d+)/i);
  if (tiktokMatch && tiktokMatch[1]) {
    const videoId = tiktokMatch[1];
    return (
      <div className={cn("mt-3 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-black shadow-sm max-w-[320px]")}>
        <div className={cn("relative aspect-9/16 w-full max-h-[420px]")}>
          <iframe
            src={`https://www.tiktok.com/embed/v2/${videoId}`}
            title={`Video TikTok testimoni dari ${authorName || "Pelanggan"}`}
            allowFullScreen
            className={cn("w-full h-full border-0")}
          />
        </div>
      </div>
    );
  }

  // 3. Fallback Tautan Video (Instagram Reels / Platform Lain)
  return (
    <div className="mt-2.5">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold",
          "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
          "border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40",
          "transition-all shadow-xs group"
        )}
      >
        <Play className={cn("w-3.5 h-3.5 fill-emerald-600 text-emerald-600 group-hover:scale-110 transition-transform")} />
        <span className={cn("truncate max-w-xs")}>Putar Video Testimoni (Buka Tautan)</span>
        <ExternalLink className={cn("w-3.5 h-3.5 text-emerald-500")} />
      </a>
    </div>
  );
}
