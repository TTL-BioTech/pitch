// sw.js - React / PWA 終極防禦版 (修復全有全無安裝與寫入崩潰)
const CACHE_NAME = 'ttl-pwa-v88';       // 🚀 升級快取版本
const IMAGE_CACHE_NAME = 'ttl-images-v5'; // 🚀 升級圖片快取版本
const IMAGE_RETRY_PARAM = 'img_retry';

// 🚀 修正 1：只保留絕對安全的同源檔案，徹底移除 Google Fonts 等外部跨域資源
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './LOGO.png',
  './icon-192.png',
  './icon-512.png'
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

function getImageCacheKey(input) {
  const normalized = new URL(typeof input === 'string' ? input : input.url);
  normalized.searchParams.delete(IMAGE_RETRY_PARAM);
  return normalized.toString();
}

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // 因為我們移除了不穩定的外部字型，這裡的 addAll() 成功率將逼近 100%
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== IMAGE_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }

  // 🖼️ 圖片請求處理
  if (isImageRequest(request, url)) {
    event.respondWith((async () => {
      const cacheKey = getImageCacheKey(request);
      const cache = await caches.open(IMAGE_CACHE_NAME);
      
      try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok && networkResponse.type !== 'opaque') {
          // 🚀 修正 2：為 cache.put 加上 try/catch。
          // 就算手機容量滿了 (QuotaExceededError)，也不會崩潰，依舊能把 networkResponse 回傳給畫面顯示！
          try {
            await cache.put(cacheKey, networkResponse.clone());
          } catch (putError) {
            console.warn('圖片快取寫入失敗 (可能是儲存空間不足或 iOS 異常):', putError);
          }
        }
        return networkResponse;
      } catch (networkError) {
        try {
          const cachedResponse = await cache.match(cacheKey);
          if (cachedResponse) return cachedResponse;
        } catch (cacheReadError) {
          console.warn('圖片快取讀取失敗:', cacheReadError);
        }
        return Response.error();
      }
    })());
    return;
  }

  // 📄 HTML 核心外殼請求處理
  if (isAppShellRequest(request, url)) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          // 🚀 修正 2：加上 catch 防護裸奔的 put
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, copy).catch(err => console.warn('AppShell 快取寫入失敗:', err));
          });
          return response;
        })
        .catch(async () => {
          return (await caches.match(request)) || (await caches.match('./index.html'));
        })
    );
    return;
  }

  // 📦 其他靜態資源處理 (JS, CSS)
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
          // 🚀 修正 2：加上 catch 防護裸奔的 put
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, copy).catch(err => console.warn('靜態資源快取寫入失敗:', err));
          });
        }
        return networkResponse;
      }).catch(() => Response.error());
    })
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});