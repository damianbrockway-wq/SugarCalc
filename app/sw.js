// SweetRun Service Worker — v1
// Cache name: bump this string on every deploy to force all clients to update cleanly.
// Example: 'sweetrun-v1' → 'sweetrun-v2'
// localStorage data is NEVER touched by this file — it is purely cache management.

const CACHE      = 'sweetrun-v1';
const TILE_CACHE = 'sweetrun-tiles-v1';   // kept separately — never auto-purged on app update

// Core app shell — everything SweetRun needs to run fully offline
const ASSETS = [
  '/app/',
  '/app/index.html',
];

// ── Install: cache the app shell ──────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())   // activate immediately, don't wait for old SW to die
  );
});

// ── Activate: delete any old SweetRun or SugarCalc caches ────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => k !== CACHE && k !== TILE_CACHE)   // keep app cache AND tile cache
          .map(k => {
            console.log('[SweetRun SW] Clearing old cache:', k);
            return caches.delete(k);
          })
      ))
      .then(() => self.clients.claim())  // take control of open tabs immediately
  );
});

// ── Fetch: network-first for API calls, cache-first for app shell ─────────────
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Always hit the network for weather/geo APIs — these need live data
  const isApi = url.hostname === 'api.open-meteo.com'
             || url.hostname === 'geocoding-api.open-meteo.com'
             || url.hostname === 'api.qrserver.com'
             || url.hostname === 'nominatim.openstreetmap.org';

  if (isApi) {
    event.respondWith(
      fetch(event.request).catch(() =>
        new Response(JSON.stringify({ error: 'offline' }), {
          headers: { 'Content-Type': 'application/json' }
        })
      )
    );
    return;
  }

  // Map tiles — cache-first so the sugarbush map works offline after a save
  const isTile = url.hostname === 'server.arcgisonline.com'
              || url.hostname === 'services.arcgisonline.com'
              || url.hostname === 'clarity.maptiles.arcgis.com'
              || url.hostname === 'gis.apfo.usda.gov'
              || url.hostname.endsWith('openstreetmap.org');

  if (isTile) {
    event.respondWith(
      caches.open(TILE_CACHE).then(cache =>
        cache.match(event.request).then(cached => {
          if (cached) return cached;
          return fetch(event.request)
            .then(response => {
              if (response && response.status === 200) {
                cache.put(event.request, response.clone());
              }
              return response;
            })
            .catch(() => new Response('', { status: 503, statusText: 'Tile offline' }));
        })
      )
    );
    return;
  }

  // For CDN assets (React, Leaflet, Babel) — cache-first, fall back to network
  const isCdn = url.hostname === 'cdnjs.cloudflare.com'
             || url.hostname === 'unpkg.com';

  if (isCdn) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE).then(cache => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // For the app shell (app/index.html) — network-first so updates propagate immediately,
  // fall back to cache so it still works offline.
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache a fresh copy on every successful network fetch
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))  // offline fallback
  );
});
