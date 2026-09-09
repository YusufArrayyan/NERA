/**
 * Service Worker for NERA
 * Provides offline support, caching strategy, and background sync
 */

const CACHE_VERSION = 'v1';
const CACHE_NAME = `nera-${CACHE_VERSION}`;

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/app-shell.html',
];

// Patterns to cache on network success
const CACHE_PATTERNS = {
  static: /\.(js|css|woff2|png|jpg|jpeg|svg|ico)$/,
  html: /\.html$/,
  api: /^https?:\/\/api\./,
};

/**
 * Cache strategies
 */
const STRATEGIES = {
  // For static assets: cache first, fallback to network
  cacheFirst: async (request) => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    if (cached) return cached;

    try {
      const response = await fetch(request);
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    } catch {
      return new Response('Network unavailable', { status: 503 });
    }
  },

  // For HTML: network first, fallback to cache
  networkFirst: async (request) => {
    try {
      const response = await fetch(request);
      if (response.ok) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone());
      }
      return response;
    } catch {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);
      return cached || new Response('Offline', { status: 503 });
    }
  },

  // For API: network only
  networkOnly: async (request) => {
    try {
      return await fetch(request);
    } catch {
      return new Response('Network unavailable', { status: 503 });
    }
  },
};

/**
 * Installation event
 * Cache essential assets
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      cache.addAll(STATIC_ASSETS).catch(() => {
        console.warn('[SW] Failed to cache static assets');
      });
      self.skipWaiting();
    })
  );
});

/**
 * Activation event
 * Clean up old caches
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      self.clients.claim();
    })
  );
});

/**
 * Fetch event
 * Implement caching strategy based on request type
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external URLs
  if (!url.origin.includes(self.location.origin) && !url.hostname.includes('localhost')) {
    return;
  }

  // Determine strategy based on request type
  let strategy;
  if (CACHE_PATTERNS.api.test(url.href)) {
    strategy = STRATEGIES.networkOnly;
  } else if (CACHE_PATTERNS.html.test(url.pathname)) {
    strategy = STRATEGIES.networkFirst;
  } else if (CACHE_PATTERNS.static.test(url.pathname)) {
    strategy = STRATEGIES.cacheFirst;
  } else {
    strategy = STRATEGIES.networkFirst;
  }

  event.respondWith(strategy(request));
});

/**
 * Background sync
 * Queue failed requests for retry
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(
      // Retry failed requests
      caches.open(CACHE_NAME).then((cache) => {
        // Implement retry logic here
        console.debug('[SW] Background sync triggered');
      })
    );
  }
});

/**
 * Push notifications
 */
self.addEventListener('push', (event) => {
  const data = event.data?.json() || { title: 'NERA' };
  const options = {
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    ...data,
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'NERA', options)
  );
});

/**
 * Notification click handler
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === event.notification.data?.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data?.url || '/');
      }
    })
  );
});
