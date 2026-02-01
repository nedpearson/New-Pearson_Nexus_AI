const CACHE_VERSION = 'v2.0.0';
const CACHE_NAME = `pearson-nexus-ai-${CACHE_VERSION}`;
const DATA_CACHE_NAME = `pearson-nexus-ai-data-${CACHE_VERSION}`;
const SYNC_INTERVAL = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

// Core app files to cache for instant loading
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/mobile',
  '/pearsonnexusai.png',
  '/pearsonnexusai_logo_banner_cropped.png',
  '/brand/pearson_nexus_ai_logo.png',
  '/manifest.json'
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching core assets');
        return cache.addAll(CORE_ASSETS);
      })
      .then(() => self.skipWaiting()) // Activate immediately
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache first, then network (Cache-First strategy)
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-HTTP(S) requests
  if (!request.url.startsWith('http')) {
    return;
  }

  // API requests - Network first with cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone the response before caching
          const responseClone = response.clone();
          caches.open(DATA_CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Network failed, try cache
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              console.log('[Service Worker] Serving API from cache (offline):', url.pathname);
              return cachedResponse;
            }
            // Return offline response
            return new Response(
              JSON.stringify({ error: 'Offline', message: 'No cached data available' }),
              { status: 503, headers: { 'Content-Type': 'application/json' } }
            );
          });
        })
    );
    return;
  }

  // Static assets - Cache first with network fallback
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached version immediately
          return cachedResponse;
        }

        // Not in cache, fetch from network
        return fetch(request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }

            // Clone the response before caching
            const responseClone = response.clone();

            caches.open(CACHE_NAME).then((cache) => {
              // Cache JavaScript, CSS, images, fonts
              if (
                request.method === 'GET' &&
                (url.pathname.endsWith('.js') ||
                 url.pathname.endsWith('.css') ||
                 url.pathname.endsWith('.png') ||
                 url.pathname.endsWith('.jpg') ||
                 url.pathname.endsWith('.jpeg') ||
                 url.pathname.endsWith('.svg') ||
                 url.pathname.endsWith('.woff') ||
                 url.pathname.endsWith('.woff2') ||
                 url.pathname.includes('/assets/'))
              ) {
                cache.put(request, responseClone);
              }
            });

            return response;
          })
          .catch(() => {
            // Network request failed, check cache again
            return caches.match('/index.html');
          });
      })
  );
});

// Background Sync - Sync data when connection is restored
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-data') {
    event.waitUntil(performSync());
  }
});

// Periodic Background Sync - Auto sync every 12 hours
self.addEventListener('periodicsync', (event) => {
  console.log('[Service Worker] Periodic sync triggered:', event.tag);
  
  if (event.tag === 'auto-sync-12h') {
    event.waitUntil(performSync());
  }
});

// Message handler for manual sync requests from the app
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);
  
  if (event.data && event.data.type === 'SYNC_NOW') {
    performSync().then(() => {
      // Notify all clients that sync completed
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'SYNC_COMPLETE',
            timestamp: Date.now()
          });
        });
      });
    });
  }
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Perform data synchronization
async function performSync() {
  console.log('[Service Worker] Performing data sync...');
  
  try {
    // Get all clients
    const clients = await self.clients.matchAll();
    
    // Notify clients to sync their data
    clients.forEach((client) => {
      client.postMessage({
        type: 'SYNC_REQUEST',
        timestamp: Date.now()
      });
    });
    
    // Store last sync time
    const cache = await caches.open(DATA_CACHE_NAME);
    const syncData = {
      lastSync: Date.now(),
      status: 'success'
    };
    
    await cache.put(
      new Request('/sync-status'),
      new Response(JSON.stringify(syncData), {
        headers: { 'Content-Type': 'application/json' }
      })
    );
    
    console.log('[Service Worker] Sync completed successfully');
    return true;
  } catch (error) {
    console.error('[Service Worker] Sync failed:', error);
    return false;
  }
}

// Push notification handler (for future use)
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received');
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Pearson Nexus AI';
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/brand/pearson_nexus_ai_logo.png',
    badge: '/brand/pearson_nexus_ai_logo.png',
    vibrate: [200, 100, 200],
    data: data.data || {}
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked');
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Focus existing window if available
        for (let client of clientList) {
          if (client.url.includes(self.registration.scope) && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window if no existing window
        if (clients.openWindow) {
          return clients.openWindow('/mobile');
        }
      })
  );
});

console.log('[Service Worker] Loaded successfully');
