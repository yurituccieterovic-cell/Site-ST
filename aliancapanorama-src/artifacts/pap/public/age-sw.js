// Service Worker — Age PWA
// Network-first: sempre busca do servidor; fallback em cache para offline básico.
const CACHE = "age-v1";
const PRECACHE = ["/aliancapanorama/age-manifest.json", "/aliancapanorama/age-icon-192.png"];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE).catch(() => {})));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then((r) => {
        const clone = r.clone();
        caches.open(CACHE).then((c) => c.put(e.request, clone)).catch(() => {});
        return r;
      })
      .catch(() => caches.match(e.request))
  );
});
