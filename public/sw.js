/**
 * Service Worker for Carbonara Detector PWA
 * オフライン対応とキャッシング戦略
 */

const CACHE_NAME = 'carbonara-detector-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// インストール時：基本的なファイルをキャッシュ
self.addEventListener('install', (event) => {
  console.log('[Service Worker] インストール中...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] キャッシュを開きました');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[Service Worker] インストール完了');
        return self.skipWaiting();
      })
  );
});

// アクティベーション時：古いキャッシュを削除
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] アクティベート中...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] 古いキャッシュを削除:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] アクティベート完了');
      return self.clients.claim();
    })
  );
});

// フェッチ時：キャッシュファースト戦略
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // キャッシュにあればそれを返す
        if (response) {
          console.log('[Service Worker] キャッシュから返却:', event.request.url);
          return response;
        }

        // なければネットワークから取得
        console.log('[Service Worker] ネットワークから取得:', event.request.url);
        return fetch(event.request).then((response) => {
          // レスポンスが有効な場合はキャッシュに追加
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        });
      })
      .catch(() => {
        // オフライン時のフォールバック
        console.log('[Service Worker] オフライン - フォールバック');
        return caches.match('/index.html');
      })
  );
});
