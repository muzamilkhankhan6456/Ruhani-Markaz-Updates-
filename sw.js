// Ruhani Markaz Updates - Service Worker - FULL FILE
// Version: v4 - Purani cache ko delete kar dega

const CACHE = 'ruhani-v4';
const FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
];

// Install - Nayi file aate hi purani ko hata do
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// Activate - Purani saari cache delete kar do
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch - Pehle Internet se nayi file lao, na mile to cache se lao
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Nayi file mili to cache me bhi save kar lo
        const copy = response.clone();
        caches.open(CACHE).then((cache) => {
          cache.put(event.request, copy);
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
