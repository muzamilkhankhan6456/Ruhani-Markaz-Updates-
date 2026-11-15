// Ruhani Markaz Updates - Service Worker
// Version: ruhani-v19 - Agar kabhi bhi App update karni ho to sirf yahan v19 ko v20, v21 kar dena

const CACHE = 'ruhani-v19';
const CORE_FILES = [
  './',
  './index.html',
  './manifest.json'
];

// 1. INSTALL - Nayi file aate hi purani ko khatam karo
self.addEventListener('install', (e) => {
  console.log('[SW] Install ho raha hai - Naya Version: ' + CACHE);
  e.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.addAll(CORE_FILES).catch((err) => {
        console.log('[SW] Core cache fail, koi baat nahi:', err);
      });
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// 2. ACTIVATE - Purana cache delete karo, taake purani App kabhi na khule
self.addEventListener('activate', (e) => {
  console.log('[SW] Activate ho raha hai - Purana cache delete ho raha hai');
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE) {
            console.log('[SW] Purana cache delete kiya: ' + k);
            return caches.delete(k);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// 3. FETCH - Har request ka faisla
self.addEventListener('fetch', (e) => {
  const url = e.request.url;

  // A. index.html - HAMESHA Internet se naya lao, kabhi cache se mat dikhao
  // Isi se tumhara masla hal hoga - App band karke khologe to nayi file khulegi
  if (url.includes('index.html') || url.endsWith('/') || url.includes('github.io')) {
    e.respondWith(
      fetch(e.request).then((res) => {
        // Nayi file mil gayi to cache me bhi update kar do
        const resClone = res.clone();
        caches.open(CACHE).then((cache) => {
          cache.put(e.request, resClone);
        });
        return res;
      }).catch(() => {
        // Net nahi hai to phir cache wali dikhao
        return caches.match(e.request).then((cached) => {
          if (cached) return cached;
          return caches.match('./index.html');
        });
      })
    );
    return;
  }

  // B. JSONBin + Cloudinary - Kabhi cache mat karo, hamesha taza data lao
  // Isi se Post gayab hone wala masla khatam hoga
  if (url.includes('jsonbin') || url.includes('cloudinary') || url.includes('api.jsonbin.io')) {
    e.respondWith(fetch(e.request));
    return;
  }

  // C. Baqi sab - Pehle net, nahi to cache
  // Jaise photos, icons, manifest
  e.respondWith(
    fetch(e.request).then((res) => {
      const resClone = res.clone();
      caches.open(CACHE).then((cache) => {
        cache.put(e.request, resClone);
      });
      return res;
    }).catch(() => {
      return caches.match(e.request);
    })
  );
});

// 4. MESSAGE - Jab App kahe to turant update ho jao
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
