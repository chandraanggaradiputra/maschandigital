// --- SERVICE WORKER MAS CHAN DIGITAL ---
const CACHE_NAME = 'mcd-pwa-v1';
const STATIC_PRECACHE = [
  '/',
  '/offline',
  '/manifest.webmanifest',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_PRECACHE).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  return self.clients.claim();
});

// --- FETCH LISTENER DENGAN CACHE BYPASS UNTUK API ---
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  let url;
  try {
    url = new URL(event.request.url);
  } catch {
    return;
  }

  // Lewati jika request berasal dari domain eksternal
  if (url.origin !== self.location.origin) return;

  // Lewati request API, WordPress REST, GraphQL, atau GTM debug
  const urlStr = url.href;
  if (
    urlStr.includes('gtm_debug') ||
    urlStr.includes('/wp-json/') ||
    urlStr.includes('/graphql') ||
    urlStr.includes('/api/')
  ) {
    return;
  }

  // Strategi Stale-While-Revalidate untuk PWA
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === 'basic'
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          if (event.request.mode === 'navigate') {
            const offlinePage = await caches.match('/offline');
            if (offlinePage) return offlinePage;
          }
          return new Response(
            'Anda sedang offline dan halaman tidak tersedia di cache.',
            { status: 503, statusText: 'Service Unavailable' }
          );
        });

      if (cachedResponse) {
        event.waitUntil(fetchPromise);
        return cachedResponse;
      }

      return fetchPromise;
    })
  );
});

// --- EVENT: TERIMA PUSH NOTIFICATION DARI SERVER ---
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'Mas Chan Digital', body: event.data.text() };
  }

  const title = payload.title || 'Promo Menarik - Mas Chan Digital';
  const options = {
    body: payload.body || 'Ada produk baru dan promo spesial UMKM Kota Serang!',
    icon: '/logo.png', // Logo resmi Mas Chan Digital
    badge: '/logo.png',
    data: {
      url: payload.url || '/',
    },
    vibrate: [150, 50, 150],
    requireInteraction: false,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// --- EVENT: KLIK NOTIFIKASI OLEH PELANGGAN ---
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
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
