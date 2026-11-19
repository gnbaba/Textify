const SHELL_CACHE = 'textify-shell-v4';
const OCR_ASSET_CACHE = 'textify-ocr-assets-v1';
const CACHE_ALLOWLIST = [SHELL_CACHE, OCR_ASSET_CACHE];
const ASSETS_TO_CACHE = ['/', '/favicon.png', '/New_Textify.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => !CACHE_ALLOWLIST.includes(cacheName))
            .map((cacheName) => caches.delete(cacheName))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin) return;
  if (event.request.method !== 'GET') return;
  if (url.pathname.startsWith('/api/')) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const fallback = await caches.match('/');
        return fallback || Response.error();
      })
    );
    return;
  }

  if (url.pathname.startsWith('/ocr-assets/')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        return fetch(event.request).then(async (networkResponse) => {
          const contentType = networkResponse.headers.get('content-type') || '';

          if (networkResponse.ok && !contentType.includes('text/html')) {
            const cache = await caches.open(OCR_ASSET_CACHE);
            await cache.put(event.request, networkResponse.clone());
          }

          return networkResponse;
        });
      })
    );
    return;
  }

  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        return fetch(event.request).then(async (networkResponse) => {
          const contentType = networkResponse.headers.get('content-type') || '';

          if (networkResponse.ok && !contentType.includes('text/html')) {
            const cache = await caches.open(SHELL_CACHE);
            await cache.put(event.request, networkResponse.clone());
          }

          return networkResponse;
        });
      })
    );
  }
});
