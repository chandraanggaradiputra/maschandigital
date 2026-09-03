// Service Worker untuk PWA Mas Chan Digital Kota Serang
const CACHE_NAME = "maschan-pwa-v3";
const STATIC_PRECACHE = [
  "/",
  "/offline",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_PRECACHE).catch(() => {});
    }),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name)),
      );
    }),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  let url;
  try {
    url = new URL(event.request.url);
  } catch (e) {
    return;
  }

  if (url.origin !== self.location.origin) return;

  const urlStr = url.href;
  if (
    urlStr.includes("gtm_debug") ||
    urlStr.includes("/wp-json/") ||
    urlStr.includes("/graphql") ||
    urlStr.includes("/api/")
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request).catch(async () => {
      const cachedResponse = await caches.match(event.request);
      if (cachedResponse) return cachedResponse;

      if (event.request.mode === "navigate") {
        const offlinePage = await caches.match("/offline");
        if (offlinePage) return offlinePage;
      }

      return new Response(
        "Anda sedang offline dan halaman tidak tersedia di cache.",
        { status: 503, statusText: "Service Unavailable" },
      );
    })
  );
});
