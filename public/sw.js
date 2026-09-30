// Kharch Service Worker - v4
const CACHE_NAME = "kharch-v4";
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

  // Handle document navigations explicitly. HTTP responses, including errors
  // and redirects, pass through; only a rejected network fetch uses fallback.
  if (request.mode === "navigate" || request.destination === "document") {
    event.respondWith(
      fetch(request).catch(async () => {
        const offlinePage = await caches.match("/offline.html");
        if (offlinePage) {
          const target = new URL(request.url);
          const retryPath = `${target.pathname}${target.search}`;
          const html = (await offlinePage.text()).replace(
            "__KHARCH_RETRY_URL__",
            encodeURIComponent(retryPath)
          );
          return new Response(html, {
            headers: { "Content-Type": "text/html; charset=utf-8" },
          });
        }
        return new Response("You're offline. Turn on your internet connection to continue.", {
          status: 200,
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      })
    );
    return;
  }

  // Keep APIs and Next.js requests network-only; responses may contain
  // user-specific data and must not be served from a previous session.
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/_next/")) {
    event.respondWith(fetch(request));
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

  // Do not cache arbitrary responses: app-router/RSC requests can contain
  // authenticated page data even though they are not document navigations.
  event.respondWith(fetch(request));
});
