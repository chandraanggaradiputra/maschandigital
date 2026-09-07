"use client";

import { useEffect, useState } from "react";
import { Bell, Check, X } from "lucide-react";
import { getVendorSession } from "@/lib/api/auth";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function WebPushSubscriber() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [showPrompt, setShowPrompt] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator) {
      const isDismissed = sessionStorage.getItem("mcd_push_dismissed");
      if (!isDismissed) {
        // Tampilkan ajakan aktivasi notifikasi setelah jeda singkat (asinkron aman React 19)
        const timer = setTimeout(() => {
          setPermission(Notification.permission);
          if (Notification.permission === "default") {
            setShowPrompt(true);
          }
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const subscribeUser = async () => {
    setIsSubscribing(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm === "granted") {
        const registration = await navigator.serviceWorker.ready;
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

        if (!vapidPublicKey) {
          console.error("VAPID public key belum disetel");
          return;
        }

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });

        // Tentukan peran pengguna aktif
        const session = getVendorSession();
        const role =
          session?.user?.role === "admin" || session?.user?.role === "administrator"
            ? "admin"
            : session?.user
            ? "vendor"
            : "guest";

        await fetch("/api/web-push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subscription,
            role,
            userId: session?.user?.id,
          }),
        });

        setShowPrompt(false);
      }
    } catch (err) {
      console.error("Gagal berlangganan push notification:", err);
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem("mcd_push_dismissed", "true");
  };

  if (!showPrompt || permission === "granted") return null;

  return (
    <div
      role="region"
      aria-label="Aktivasi Notifikasi Mas Chan Digital"
      className="fixed top-4 right-4 left-4 sm:left-auto sm:w-80 z-50 bg-slate-900 text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-3 duration-200"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
          <Bell className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold leading-tight truncate">Aktifkan Notifikasi</p>
          <p className="text-[10px] text-slate-400 truncate">Dapatkan info ulasan & pesanan langsung</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={subscribeUser}
          disabled={isSubscribing}
          className="bg-[#093c96] hover:bg-blue-800 text-white text-xs font-bold py-1.5 px-2.5 rounded-lg flex items-center gap-1 transition-all"
        >
          <Check className="w-3.5 h-3.5" />
          <span>{isSubscribing ? "..." : "Ya"}</span>
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Tutup"
          className="p-1 text-slate-400 hover:text-white rounded-lg"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
