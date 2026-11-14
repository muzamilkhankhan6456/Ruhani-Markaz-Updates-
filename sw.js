const CACHE_NAME = 'ruhani-markaz-updates-v2';
const FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Install - nayi files cache karo
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate - purana v1 cache delete karo
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch - pehle cache, phir net, live ke liye hamesha net
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  // YouTube / Facebook Live ko kabhi cache mat karo, hamesha fresh lo
  if (url.includes('youtube.com') || url.includes('facebook.com') || url.includes('youtu.be')) {
    event.respondWith(fetch(event.request));
    return;
  }
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchRes) => {
        return fetchRes;
      }).catch(() => {
        // Offline ho to cached index dikhao
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
