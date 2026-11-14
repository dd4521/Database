const CACHE_NAME = "employee-database-pwa-v1";

const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-180.png"
];

// The Excel parser and visual libraries used by the original HTML.
// These are cached during service-worker installation where the CDN permits it.
const EXTERNAL_FILES = [
  "https://cdn.jsdelivr.net/npm/xlsx/dist/xlsx.full.min.js",
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);

    // App shell is essential. A failed optional file should not block installation.
    for (const file of APP_FILES) {
      try {
        await cache.add(file);
      } catch (error) {
        console.warn("Could not precache app file:", file, error);
      }
    }

    // Cache external libraries/styles when the CDN allows it.
    for (const file of EXTERNAL_FILES) {
      try {
        const response = await fetch(file, { mode: "cors", cache: "reload" });
        if (response && (response.ok || response.type === "opaque")) {
          await cache.put(file, response);
        }
      } catch (error) {
        console.warn("Could not precache external file:", file, error);
      }
    }

    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter(key => key.startsWith("employee-database-pwa-") && key !== CACHE_NAME)
          .map(key => caches.delete(key))
    );
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Navigation: try the latest page first, then use the cached app shell offline.
  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response && response.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put("./index.html", response.clone());
        }
        return response;
      } catch (error) {
        return (await caches.match(request)) ||
               (await caches.match("./index.html")) ||
               Response.error();
      }
    })());
    return;
  }

  // Cache-first for same-origin app files and previously cached CDN resources.
  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;

    try {
      const response = await fetch(request);

      if (response && (response.ok || response.type === "opaque")) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone());
      }

      return response;
    } catch (error) {
      return cached || Response.error();
    }
  })());
});
