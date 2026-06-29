const CACHE_NAME = 'textify-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/New_Textify.png',
  '/ocr-assets/worker.min.js',
  '/ocr-assets/eng.traineddata.gz',
  '/ocr-assets/tesseract-core-lstm.wasm',
  '/ocr-assets/tesseract-core-lstm.wasm.js',
  '/ocr-assets/tesseract-core-simd-lstm.wasm',
  '/ocr-assets/tesseract-core-simd-lstm.wasm.js',
  '/ocr-assets/tesseract-core-simd.wasm',
  '/ocr-assets/tesseract-core-simd.wasm.js',
  '/ocr-assets/tesseract-core.wasm',
  '/ocr-assets/tesseract-core.wasm.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Force cache installation
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Avoid intercepting Firebase Auth, Firestore cloud endpoints, or external APIs
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        // Cache dynamic assets (compiled JS/CSS from Vite) and root files on the fly
        if (
          networkResponse.status === 200 &&
          (url.pathname.includes('/assets/') || url.pathname === '/' || url.pathname === '/docs')
        ) {
          const cacheCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, cacheCopy);
          });
        }
        return networkResponse;
      });
    })
  );
});
