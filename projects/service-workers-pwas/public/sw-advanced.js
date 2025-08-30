// Advanced Service Worker with multiple caching strategies
const CACHE_VERSION = 'v2';
const CACHE_NAMES = {
  static: `static-cache-${CACHE_VERSION}`,
  dynamic: `dynamic-cache-${CACHE_VERSION}`,
  images: `images-cache-${CACHE_VERSION}`,
  api: `api-cache-${CACHE_VERSION}`
};

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/static/css/main.css',
  '/static/js/main.js'
];

const MAX_CACHE_SIZE = 50; // Maximum number of items in dynamic cache
const MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Install event - pre-cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAMES.static)
      .then((cache) => {
        console.log('[SW] Pre-caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Service worker installed successfully');
        return self.skipWaiting(); // Activate immediately
      })
      .catch((error) => {
        console.error('[SW] Installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return !Object.values(CACHE_NAMES).includes(cacheName);
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim(); // Take control of all pages
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-HTTP(S) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Determine caching strategy based on request type
  if (request.method === 'GET') {
    let responsePromise;

    if (isStaticAsset(url)) {
      // Cache First strategy for static assets
      responsePromise = cacheFirst(request, CACHE_NAMES.static);
    } else if (isImageRequest(request)) {
      // Cache First with fallback for images
      responsePromise = cacheFirst(request, CACHE_NAMES.images);
    } else if (isApiRequest(url)) {
      // Network First with cache fallback for API calls
      responsePromise = networkFirst(request, CACHE_NAMES.api);
    } else {
      // Stale While Revalidate for everything else
      responsePromise = staleWhileRevalidate(request, CACHE_NAMES.dynamic);
    }

    event.respondWith(responsePromise);
  } else if (request.method === 'POST') {
    // Handle POST requests with background sync
    event.respondWith(handlePostRequest(request));
  }
});

// Cache First Strategy
async function cacheFirst(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('[SW] Cache hit:', request.url);
      return cachedResponse;
    }

    console.log('[SW] Cache miss, fetching:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      await cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache first failed:', error);
    return offlineFallback();
  }
}

// Network First Strategy
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetchWithTimeout(request, 5000);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      await cache.put(request, networkResponse.clone());
      
      // Add timestamp to track cache age
      const headers = new Headers(networkResponse.headers);
      headers.append('sw-cache-time', new Date().toISOString());
      
      return new Response(networkResponse.body, {
        status: networkResponse.status,
        statusText: networkResponse.statusText,
        headers: headers
      });
    }
    
    throw new Error('Network response was not ok');
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      // Check if cache is stale
      const cacheTime = cachedResponse.headers.get('sw-cache-time');
      if (cacheTime && isCacheStale(cacheTime)) {
        console.log('[SW] Cache is stale but returning anyway');
      }
      return cachedResponse;
    }
    
    return offlineFallback();
  }
}

// Stale While Revalidate Strategy
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request)
    .then(async (networkResponse) => {
      if (networkResponse.ok) {
        await cache.put(request, networkResponse.clone());
        await trimCache(cacheName, MAX_CACHE_SIZE);
      }
      return networkResponse;
    })
    .catch((error) => {
      console.error('[SW] Background fetch failed:', error);
      return cachedResponse || offlineFallback();
    });

  return cachedResponse || fetchPromise;
}

// Handle POST requests with background sync
async function handlePostRequest(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch (error) {
    // Store failed request for background sync
    const requestData = await request.json();
    await saveFailedRequest(request.url, requestData);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Request queued for sync',
        queued: true
      }),
      {
        status: 202,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Background sync for failed requests
self.addEventListener('sync', async (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-failed-requests') {
    event.waitUntil(syncFailedRequests());
  }
});

async function syncFailedRequests() {
  const failedRequests = await getFailedRequests();
  
  for (const request of failedRequests) {
    try {
      const response = await fetch(request.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request.data)
      });
      
      if (response.ok) {
        await removeFailedRequest(request.id);
        console.log('[SW] Synced request:', request.url);
      }
    } catch (error) {
      console.error('[SW] Sync failed for:', request.url);
    }
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  let notification = {
    title: 'New Update',
    body: 'You have new content available',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      { action: 'explore', title: 'View', icon: 'checkmark.png' },
      { action: 'close', title: 'Dismiss', icon: 'xmark.png' }
    ]
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notification = { ...notification, ...data };
    } catch (error) {
      notification.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(notification.title, notification)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/notifications')
    );
  }
});

// Message handling for client communication
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data.type === 'CLEAR_CACHE') {
    clearAllCaches().then(() => {
      event.ports[0].postMessage({ success: true });
    });
  } else if (event.data.type === 'CACHE_URLS') {
    cacheUrls(event.data.urls).then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }
});

// Utility functions
function isStaticAsset(url) {
  return STATIC_ASSETS.some(asset => url.pathname.includes(asset));
}

function isImageRequest(request) {
  return request.destination === 'image' || 
         /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(request.url);
}

function isApiRequest(url) {
  return url.pathname.startsWith('/api/');
}

function isCacheStale(cacheTime) {
  const age = Date.now() - new Date(cacheTime).getTime();
  return age > MAX_AGE;
}

async function fetchWithTimeout(request, timeout = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const requests = await cache.keys();
  
  if (requests.length > maxItems) {
    const deleteCount = requests.length - maxItems;
    for (let i = 0; i < deleteCount; i++) {
      await cache.delete(requests[i]);
    }
    console.log(`[SW] Trimmed ${deleteCount} items from ${cacheName}`);
  }
}

function offlineFallback() {
  return caches.match('/offline.html') || 
         new Response('Offline', { status: 503 });
}

async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map(name => caches.delete(name)));
  console.log('[SW] All caches cleared');
}

async function cacheUrls(urls) {
  const cache = await caches.open(CACHE_NAMES.dynamic);
  await cache.addAll(urls);
  console.log('[SW] URLs cached:', urls);
}

// IndexedDB operations for failed requests
async function saveFailedRequest(url, data) {
  // Implementation would use IndexedDB to store failed requests
  console.log('[SW] Saving failed request:', url);
}

async function getFailedRequests() {
  // Implementation would retrieve failed requests from IndexedDB
  return [];
}

async function removeFailedRequest(id) {
  // Implementation would remove synced request from IndexedDB
  console.log('[SW] Removing synced request:', id);
}

// Performance monitoring
self.addEventListener('fetch', (event) => {
  const startTime = performance.now();
  
  event.waitUntil(
    event.request.clone().text().then(() => {
      const duration = performance.now() - startTime;
      if (duration > 1000) {
        console.warn(`[SW] Slow request (${duration}ms):`, event.request.url);
      }
    })
  );
});

console.log('[SW] Advanced service worker loaded');