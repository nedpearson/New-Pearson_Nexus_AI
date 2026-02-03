/* Service Worker kill switch:
 * If a previous deployment registered a SW, serve this file so the browser can
 * update to it, clear caches, and unregister. This prevents `/sw.js` from being
 * rewritten to `index.html` by static SPA servers (which breaks SW updates).
 */

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      } catch {
        // ignore
      }

      try {
        await self.registration.unregister();
      } catch {
        // ignore
      }

      // Best effort: refresh open tabs
      try {
        const clientsList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        for (const c of clientsList) {
          try {
            await c.navigate(c.url);
          } catch {
            // ignore
          }
        }
      } catch {
        // ignore
      }
    })()
  );
});

