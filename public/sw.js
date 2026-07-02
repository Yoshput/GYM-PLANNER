const CACHE_NAME = "gymplanner-cache-v2";
const ASSETS_TO_CACHE = [
  "/",
  "/dashboard",
  "/workout",
  "/nutrition",
  "/progress",
  "/manifest.json"
];

self.addEventListener("install", (event) => {
  self.skipWaiting(); // Paksa SW baru langsung aktif
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache); // Hapus cache versi v1 yang lama
          }
        })
      );
    })
  );
});

// Strategi Network-First untuk menjamin update instan saat online
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Simpan hasil fetch terbaru ke cache
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Jika offline, baru kembalikan dari cache
        return caches.match(event.request);
      })
  );
});
