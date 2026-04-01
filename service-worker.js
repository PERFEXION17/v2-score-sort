// 1. Bump the cache version to invalidate the old cache
const CACHE_NAME = "jtihs-report-card-v1";
const urlsToCache = [
  "./",
  "index.html",
  "styles.css",
  "app.js",
  "manifest.json",
];

self.addEventListener("install", (event) => {
  // 2. Force the new service worker to activate immediately
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache: ", CACHE_NAME);
      return cache.addAll(urlsToCache);
    }),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(event.request);
    }),
  );
});

self.addEventListener("activate", (event) => {
  // 3. Take control of all open pages immediately
  event.waitUntil(self.clients.claim());

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // 4. Deletes the old 'v1' cache
          if (cacheName !== CACHE_NAME) {
            console.log("Deleting old cache: ", cacheName);
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
});
