// SweetRun root SW — kill switch for old SugarCalc service worker.
// This file exists only to clear the old 'sugarcalc-v1' cache that was
// registered at the root scope. It does nothing else.
// localStorage data is never touched.

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => {
        console.log('[SweetRun root SW] Clearing cache:', k);
        return caches.delete(k);
      })))
      .then(() => self.clients.claim())
  );
});

// No fetch handler — let all requests pass through naturally.
// The real app SW at /app/sw.js handles /app/ requests.
