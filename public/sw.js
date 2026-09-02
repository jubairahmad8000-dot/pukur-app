// পুকুর হিসাব - অফলাইন সার্ভিস ওয়ার্কার (Service Worker)
const CACHE_NAME = 'pukur-hisab-v1';

const STATIC_PRECACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/apple-touch-icon.png'
];

// ইনস্টল ইভেন্ট: কোর ফাইল ক্যাশ করা
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_PRECACHE);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// এক্টিভেট ইভেন্ট: পুরাতন ক্যাশ ডিলিট এবং অবিলম্বে সক্রিয় হওয়া
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// ফেচ ইভেন্ট: অফলাইনে অ্যাপ চালানোর ক্যাশিং স্ট্র্যাটেজি
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // শুধুমাত্র http / https GET রিকোয়েস্ট ক্যাশ করা হবে
  if (request.method !== 'GET') return;
  if (!request.url.startsWith('http')) return;

  // নেভিগেশন / পেজ রিকোয়েস্ট: Network first with Cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || caches.match('/index.html');
          });
        })
    );
    return;
  }

  // স্ট্যাটিক রিসোর্স (JS, CSS, Images, Fonts): Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // অফলাইন অবস্থায় কোনো এরর না দিয়ে ক্যাশড ডেটা ফেরত
          return cachedResponse;
        });

      return cachedResponse || fetchPromise;
    })
  );
});

// স্কিপ ওয়েটিং মেসেজ হ্যান্ডলার
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
