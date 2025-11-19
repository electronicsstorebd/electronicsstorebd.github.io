self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("estore-cache-v1").then((cache) => {
      return cache.addAll([
        "/",
        "/index.html",
        "/IMG/favicon-192x192.png",
        "/IMG/favicon-512x512.png"
      ]);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
