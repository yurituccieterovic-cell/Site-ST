const CACHE = "babel-v2";

self.addEventListener("install", e =>
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(["/", "/manifest.json"])))
);
self.addEventListener("activate", e =>
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))))
);
self.addEventListener("fetch", e => {
  if (e.request.url.includes("/api/")) return; // nunca cachear API
  e.respondWith(
    fetch(e.request)
      .then(r => { const c = r.clone(); caches.open(CACHE).then(cache => cache.put(e.request, c)); return r; })
      .catch(() => caches.match(e.request).then(r => r || caches.match("/")))
  );
});
