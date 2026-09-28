// Kharch Service Worker - v3
const CACHE_NAME = "kharch-v3";
const STATIC_ASSETS = [
  "/favicon.svg",
  "/manifest.json",
  "/offline.html",
];

// Install - cache static assets and the standalone offline document.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate - remove the previous cache and take control of open pages.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Leave non-GET requests to the browser and application unchanged.
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Handle document navigations explicitly. Redirects and 4xx responses pass
  // through untouched; 5xx responses use the standalone offline fallback.
  if (request.mode === "navigate" || request.destination === "document") {
    event.respondWith(
      fetch(request).then(async (response) => {
        // Server failures can resolve as HTTP responses instead of rejecting
        // the fetch. Route all 5xx responses through the offline fallback.
        if (response.status >= 500 && response.status < 600) {
          throw new Error("Navigation returned a server error");
        }

        // Return successful HTML documents and redirects normally without
        // persisting user-specific navigation responses.
        return response;
      }).catch(async () => {
        const offlinePage = await caches.match("/offline.html");
        if (offlinePage) return offlinePage;
        return new Response("You're offline. Turn on your internet connection to continue.", {
          status: 200,
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      })
    );
    return;
  }

  // Network-first for API calls and Next.js assets.
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/_next/")) {
    event.respondWith(fetch(request).catch(() => caches.match(request)));
    return;
  }

  // Cache-first for static assets.
  if (
    request.destination === "image" ||
    request.destination === "font" ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".js")
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok && !response.redirected) {
            const copy = response.clone();
            event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)));
          }
          return response;
        });
      })
    );
    return;
  }

  // Network-first for other GET requests, without storing failures or redirects.
  event.respondWith(
    fetch(request).then((response) => {
      if (response.ok && !response.redirected) {
        const copy = response.clone();
        event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)));
      }
      return response;
    }).catch(() => caches.match(request))
  );
});
