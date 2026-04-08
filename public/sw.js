
const CACHE_NAME = 'career-vision-v2';
const APP_SHELL = '/';
const PRE_CACHE_URLS = [
  APP_SHELL,
  '/placeholder.svg',
  '/favicon.ico',
];

function shouldBypassRequest(request) {
  const url = new URL(request.url);

  if (request.method !== 'GET') return true;
  if (url.origin !== self.location.origin) return true;
  if (url.pathname.startsWith('/api/')) return true;
  if (url.pathname.startsWith('/auth/')) return true;
  if (url.pathname.startsWith('/src/')) return true;
  if (url.pathname.startsWith('/@vite')) return true;
  if (url.pathname.includes('hot-update')) return true;

  return false;
}

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(PRE_CACHE_URLS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function (name) {
            return name !== CACHE_NAME;
          })
          .map(function (name) {
            return caches.delete(name);
          })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (event) {
  if (shouldBypassRequest(event.request)) {
    return;
  }

  const request = event.request;

  // Keep navigation resilient by preferring fresh HTML and falling back to cached shell.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(function (response) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(APP_SHELL, copy);
          });
          return response;
        })
        .catch(function () {
          return caches.match(APP_SHELL).then(function (cachedShell) {
            if (cachedShell) return cachedShell;
            return new Response('Offline', {
              status: 503,
              headers: { 'Content-Type': 'text/plain; charset=utf-8' },
            });
          });
        })
    );
    return;
  }

  const isStaticAsset = ['style', 'script', 'font', 'image', 'worker'].includes(request.destination);

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then(function (cached) {
        const networkFetch = fetch(request)
          .then(function (response) {
            if (response && response.ok) {
              const copy = response.clone();
              caches.open(CACHE_NAME).then(function (cache) {
                cache.put(request, copy);
              });
            }
            return response;
          })
          .catch(function () {
            return cached || new Response('Network error', { status: 408 });
          });

        return cached || networkFetch;
      })
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then(function (response) {
        return response;
      })
      .catch(function () {
        return caches.match(request).then(function (cached) {
          return cached || new Response('Network error', { status: 408 });
        });
      })
  );
});
