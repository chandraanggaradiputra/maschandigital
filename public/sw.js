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

// =======================================================================
// PWA WEB PUSH NOTIFICATION LISTENERS
// =======================================================================
self.addEventListener('push', function (event) {
  if (!event.data) return;

  try {
    const payload = event.data.json();
    const title = payload.title || 'Mas Chan Digital';
    const options = {
      body: payload.body || 'Pemberitahuan baru dari Mas Chan Digital',
      icon: payload.icon || '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [150, 50, 150],
      data: {
        url: payload.url || '/admin/moderasi',
      },
      tag: payload.tag || 'maschan-notification',
      renotify: true,
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.error('Error saat memproses payload push:', err);
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/admin/moderasi';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

