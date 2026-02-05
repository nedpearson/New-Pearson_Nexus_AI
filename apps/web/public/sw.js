/* PearsonNexusAI Service Worker
 *
 * Lightweight SW to enable PWA install + reliable updates.
 * (We intentionally avoid aggressive caching here to prevent stale builds.)
 */

const CACHE = "pnx-shell-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE);
        await cache.addAll([
          "/",
          "/index.html",
          "/manifest.json",
          "/logo.png",
        ]);
      } catch {
        // ignore (offline during install)
      }
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Clean old caches
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => (k === CACHE ? null : caches.delete(k))));
      } catch {
        // ignore
      }
      await self.clients.claim();
    })()
  );
});

// Network-first for navigations; cache fallback for offline.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Navigations: try network so updates roll out quickly.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(async () => (await caches.match("/index.html")) || Response.error())
    );
    return;
  }

  // Everything else: just passthrough (no aggressive asset caching).
});

