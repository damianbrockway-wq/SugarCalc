// SugarCalc Service Worker — Cache-first with network fallback
const CACHE_NAME = 'sugarcalc-v1';

// Files to cache on install (core app shell)
const PRECACHE_URLS = [
  './sugarcalc.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.2/babel.min.js',
];

// Install: pre-cache all core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Cache CDN assets individually so one failure doesn't break everything
      const coreFiles = [
        './sugarcalc.html',
        './manifest.json',
        './icon-192.png',
        './icon-512.png',
        './apple-touch-icon.png',
      ];
      const cdnFiles = [
        'https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.2/babel.min.js',
      ];
      return cache.addAll(coreFiles).then(() =>
        Promise.allSettled(cdnFiles.map(url => cache.add(url)))
      );
    }).then(() => self.skipWaiting())
  );
});

// Activate: remove old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: cache-first for app shell & CDN, network-first for weather API
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Always go to network for weather/geo APIs (need live data)
  if (url.hostname === 'api.open-meteo.com' || url.hostname === 'geocoding-api.open-meteo.com') {
    event.respondWith(
      fetch(event.request).catch(() =>
        new Response(JSON.stringify({ error: 'offline' }), {
          headers: { 'Content-Type': 'application/json' }
        })
      )
    );
    return;
  }

  // Cache-first for everything else (app shell, CDN assets)
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Cache successful GET responses
        if (event.request.method === 'GET' && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    }).catch(() =>
      // Offline fallback: return main app HTML for navigation requests
      event.request.mode === 'navigate'
        ? caches.match('./sugarcalc.html')
        : new Response('Offline', { status: 503 })
    )
  );
});
