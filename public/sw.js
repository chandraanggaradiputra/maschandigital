// Service Worker untuk PWA Mas Chan Digital Kota Serang
const CACHE_NAME = "maschan-pwa-v1";
const STATIC_PRECACHE = [
  "/",
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
  // Hanya proses request GET, lewati API calls dan GraphQL agar data selalu fresh
  if (event.request.method !== "GET") return;
  const url = event.request.url;
  if (url.includes("/wp-json/") || url.includes("/graphql")) {
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    }),
  );
});
