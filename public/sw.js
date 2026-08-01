// ===== OptiTalk - Service Worker =====
// بيشتغل في الـ background وبيخلي التطبيق يقدر يثبّت كـ PWA

const CACHE_NAME = 'optitalk-v1';
const STATIC_ASSETS = [
  '/',
  '/install',
  '/manifest.json',
  '/logo.png',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.png',
  '/apple-touch-icon.png',
];

// ===== Install - خزّن الـ static assets =====
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
      .catch((err) => console.log('[SW] Cache error:', err))
  );
});

// ===== Activate - امسح الـ caches القديمة =====
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// ===== Fetch - استراتيجية Network First مع fallback للـ cache =====
self.addEventListener('fetch', (event) => {
  // تجاهل الـ requests اللي مش GET
  if (event.request.method !== 'GET') return;

  // تجاهل الـ API requests (دول بيروحوا للسيرفر دايماً)
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // خزّن نسخة في الـ cache
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // fallback للـ cache لو في network error
        return caches.match(event.request);
      })
  );
});

// ===== beforeinstallprompt بيتعالج في الـ page =====
