// Service Worker untuk PWA Mas Chan Digital Kota Serang
const CACHE_NAME = "maschan-pwa-v4";
const STATIC_PRECACHE = [
  "/",
  "/offline",
  "/manifest.webmanifest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_PRECACHE).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // a. Hanya proses request method 'GET'
  if (event.request.method !== "GET") return;

  let url;
  try {
    url = new URL(event.request.url);
  } catch {
    return;
  }

  // b. Lewati (bypass) jika request berasal dari domain luar
  if (url.origin !== self.location.origin) return;

  // c. Lewati (bypass) jika request memuat '/wp-json/', '/api/', '/graphql', atau query 'gtm_debug'
  const urlStr = url.href;
  if (
    urlStr.includes("gtm_debug") ||
    urlStr.includes("/wp-json/") ||
    urlStr.includes("/graphql") ||
    urlStr.includes("/api/")
  ) {
    return;
  }

  // d. Terapkan strategi Stale-While-Revalidate aman
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Helper fetch data terbaru di latar belakang untuk memperbarui cache
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === "basic"
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          if (event.request.mode === "navigate") {
            const offlinePage = await caches.match("/offline");
            if (offlinePage) return offlinePage;
          }
          return new Response(
            "Anda sedang offline dan halaman tidak tersedia di cache.",
            { status: 503, statusText: "Service Unavailable" }
          );
        });

      // Jika ada di cache: kembalikan cachedResponse seketika, dan fetch terbaru di latar belakang
      if (cachedResponse) {
        event.waitUntil(fetchPromise);
        return cachedResponse;
      }

      // Jika tidak ada di cache: lakukan fetch ke network
      return fetchPromise;
    })
  );
});
