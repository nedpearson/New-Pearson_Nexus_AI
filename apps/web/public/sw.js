/* PearsonNexusAI Service Worker
 *
 * Lightweight SW to enable PWA install + reliable updates.
 * (We intentionally avoid aggressive caching here to prevent stale builds.)
 */

const SHELL = "pnx-shell-v2";
const ASSETS = "pnx-assets-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(SHELL);
        await cache.addAll([
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
        await Promise.all(keys.map((k) => ([SHELL, ASSETS].includes(k) ? null : caches.delete(k))));
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
      (async () => {
        try {
          const fresh = await fetch(req);
          // Keep the latest app shell for offline fallback, but never cache-bust assets (Vite assets are hashed).
          const cache = await caches.open(SHELL);
          cache.put("/index.html", fresh.clone()).catch(() => null);
          return fresh;
        } catch {
          return (await caches.match("/index.html")) || Response.error();
        }
      })()
    );
    return;
  }

  // Runtime cache hashed Vite assets so the app works offline after first visit.
  const p = url.pathname || "";
  const isAsset = p.startsWith("/assets/");

  if (isAsset) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(ASSETS);
        const hit = await cache.match(req);
        if (hit) return hit;
        try {
          const fresh = await fetch(req);
          if (fresh.ok) cache.put(req, fresh.clone()).catch(() => null);
          return fresh;
        } catch {
          return hit || Response.error();
        }
      })()
    );
  }
});

