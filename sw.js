// Ruhani Markaz Updates - Service Worker
// Version: ruhani-v20 - Video + Firebase Rules Fix

const CACHE = 'ruhani-v20';
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
  if (url.includes('index.html') || url.endsWith('/') || url.includes('github.io')) {
    e.respondWith(
      fetch(e.request).then((res) => {
        const resClone = res.clone();
        caches.open(CACHE).then((cache) => {
          cache.put(e.request, resClone);
        });
        return res;
      }).catch(() => {
        return caches.match(e.request).then((cached) => {
          if (cached) return cached;
          return caches.match('./index.html');
        });
      })
    );
    return;
  }

  // B. JSONBin + Cloudinary + Firebase Videos - Kabhi cache mat karo, hamesha taza data lao
  // Isi se Post gayab hone wala + 1000 Videos List wala masla khatam hoga
  // Firebase ka link hai: firebasedatabase.app
  if (url.includes('jsonbin') || url.includes('cloudinary') || url.includes('api.jsonbin.io') || url.includes('firebasedatabase') || url.includes('firebaseio.com')) {
    e.respondWith(fetch(e.request));
    return;
  }

  // C. YouTube + TikTok Videos - Kabhi cache mat karo, ye online hi chalengi
  // Inko cache karoge to App hang ho jayega
  if (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('tiktok.com') || url.includes('googlevideo.com') || url.includes('ytimg.com')) {
    e.respondWith(fetch(e.request));
    return;
  }

  // D. MP4 Videos - Jo download ki hui videos hain, unko cache karo taake offline chalein
  // Sirf .mp4 wali videos offline chalengi
  if (url.includes('.mp4')) {
    e.respondWith(
      caches.match(e.request).then((cached) => {
        if (cached) return cached;
        return fetch(e.request).then((res) => {
          const resClone = res.clone();
          caches.open(CACHE).then((cache) => {
            cache.put(e.request, resClone);
          });
          return res;
        }).catch(() => {
          return caches.match(e.request);
        });
      })
    );
    return;
  }

  // E. Baqi sab - Pehle net, nahi to cache
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
