// sw.js - React / PWA 版
const CACHE_NAME = 'ttl-pwa-v85';
const IMAGE_CACHE_NAME = 'ttl-images-v3';
const IMAGE_RETRY_PARAM = 'img_retry';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './LOGO.png',
  './icon-192.png',
  './icon-512.png',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&display=swap',
  'https://fonts.googleapis.com/icon?family=Material+Icons+Round'
];

function isImageRequest(request, url) {
  return request.destination === 'image' ||
    url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ||
    url.hostname.includes('githubusercontent.com') ||
    url.hostname.includes('jsdelivr.net');
}

function isAppShellRequest(request, url) {
  const isSameOrigin = url.origin === self.location.origin;
  const isGet = request.method === 'GET';
  const acceptsHtml = request.headers.get('accept')?.includes('text/html');
  return isSameOrigin && isGet && acceptsHtml;
}

function getImageCacheKey(url) {
  const normalized = new URL(url);
  normalized.searchParams.delete(IMAGE_RETRY_PARAM);
  return normalized.toString();
}

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => Promise.all(
      cacheNames.map(cacheName => {
        if (cacheName !== CACHE_NAME && cacheName !== IMAGE_CACHE_NAME) {
          return caches.delete(cacheName);
        }
      })
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  if (isImageRequest(request, url)) {
    event.respondWith((async () => {
      const cache = await caches.open(IMAGE_CACHE_NAME);
      const cacheKey = getImageCacheKey(request.url);
      const isRetryRequest = url.searchParams.has(IMAGE_RETRY_PARAM);
      const cachedResponse = isRetryRequest ? null : await cache.match(cacheKey);

      const fetchPromise = fetch(request, { cache: 'no-store' }).then(networkResponse => {
        if (networkResponse && (networkResponse.ok || networkResponse.type === 'opaque')) {
          cache.put(cacheKey, networkResponse.clone());
        }
        return networkResponse;
      });

      if (cachedResponse) {
        event.waitUntil(fetchPromise.catch(() => null));
        return cachedResponse;
      }

      return fetchPromise.catch(async () => {
        return (await cache.match(cacheKey)) || Response.error();
      });
    })());
    return;
  }

  if (isAppShellRequest(request, url)) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          return response;
        })
        .catch(async () => {
          return (await caches.match(request)) || (await caches.match('./index.html'));
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(response => {
      if (response) return response;
      return fetch(request).then(networkResponse => {
        if (
          networkResponse &&
          networkResponse.ok &&
          request.method === 'GET' &&
          url.origin === self.location.origin &&
          (url.pathname.includes('/assets/') || url.pathname.endsWith('.js') || url.pathname.endsWith('.css'))
        ) {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return networkResponse;
      });
    })
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
