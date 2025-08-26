// Bump version to force cache refresh on updates.
const CACHE = 'fcc-cache-v11';
const PRECACHE = ['.', 'index.html', 'manifest.webmanifest'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE ? caches.delete(k) : null)))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  const req = e.request;
  e.respondWith(
    caches.match(req).then(hit =>
      hit || fetch(req).then(net => {
        if (req.method === 'GET' && net.ok) {
          const clone = net.clone();
          caches.open(CACHE).then(c => c.put(req, clone));
        }
        return net;
      }).catch(() => hit)
    )
  );
});
