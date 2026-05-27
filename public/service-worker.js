/**
 * =============================================================================
 * FLASHCART PARTNER PORTAL — Service Worker
 * =============================================================================
 * 
 * Purpose: Service worker for the partner portal with push notification handling.
 * 
 * This service worker has additional responsibilities beyond caching:
 * 1. Handle OneSignal push notifications (when browser is closed)
 * 2. Show OS-level notifications for new orders
 * 3. Handle notification click events (open partner portal)
 * 4. Background sync for order status updates
 * 5. Cache management for dashboard data
 * 
 * CRITICAL: This SW works alongside OneSignal's service worker.
 * OneSignal has its own SW (OneSignalSDKWorker.js) that handles
 * its push subscription. This SW handles app-level caching and
 * custom notification logic.
 * 
 * Developer: Rizwan Rahim Chowdhury
 * Powered by: Bangladesh Software Development Community (BSDC)
 * =============================================================================
 */

/* --- Cache Version --- */
const CACHE_VERSION = 'flashcart-partner-v1.0.0';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;

/* --- Pre-cache URLs --- */
const PRECACHE_URLS = [
  '/',
  '/offline.html',
  '/manifest.json'
];

/* --- Network-First Domains (APIs needing fresh data) --- */
const NETWORK_FIRST_DOMAINS = [
  'firestore.googleapis.com',
  'flashcart-bd-default-rtdb.asia-southeast1.firebasedatabase.app',
  'identitytoolkit.googleapis.com',
  'securetoken.googleapis.com',
  'api.imgbb.com',
  'nominatim.openstreetmap.org',
  'onesignal.com'
];

/* --- Cache-First Domains (CDN resources) --- */
const CACHE_FIRST_DOMAINS = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'unpkg.com',
  'tile.openstreetmap.org',
  'cdn.onesignal.com'
];

/**
 * INSTALL EVENT
 */
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((error) => {
        console.warn('[Partner SW] Pre-cache partial failure:', error);
      });
    })
  );
});

/**
 * ACTIVATE EVENT
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('flashcart-partner-') && name !== STATIC_CACHE && name !== DYNAMIC_CACHE && name !== IMAGE_CACHE)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

/**
 * FETCH EVENT — Same strategies as main app
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (!request.url.startsWith('http')) return;

  if (NETWORK_FIRST_DOMAINS.some((domain) => url.hostname.includes(domain))) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  if (CACHE_FIRST_DOMAINS.some((domain) => url.hostname.includes(domain))) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  if (request.destination === 'image' || url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/i)) {
    event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE));
    return;
  }

  if (url.pathname.match(/\.(js|css|woff|woff2|ttf|eot)$/i)) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  event.respondWith(staleWhileRevalidateStrategy(request));
});

/**
 * =============================================================================
 * PUSH EVENT — OneSignal Push Notification Handler
 * =============================================================================
 * When a push notification arrives from OneSignal while the browser is closed
 * or the partner tab is in the background, this event fires.
 * 
 * We show a custom OS notification with order details.
 */
self.addEventListener('push', (event) => {
  /* Parse push notification data */
  let notificationData = {};

  if (event.data) {
    try {
      notificationData = event.data.json();
    } catch (e) {
      notificationData = {
        title: 'FlashCart Partner',
        body: event.data.text() || 'You have a new notification'
      };
    }
  }

  /* Build notification options */
  const options = {
    body: notificationData.body || notificationData.alert || 'New order received! Open FlashCart Partner to view.',
    icon: '/icon-192x192.png',
    badge: '/icon-96x96.png',
    vibrate: [200, 100, 200, 100, 200], /* Vibration pattern for urgency */
    tag: 'flashcart-new-order',         /* Group similar notifications */
    renotify: true,                     /* Alert even if tag matches existing */
    requireInteraction: true,           /* Keep notification visible until interacted */
    data: {
      url: notificationData.url || '/',
      orderId: notificationData.orderId || null,
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'view-order',
        title: 'View Order'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(
      notificationData.title || 'New Order - FlashCart',
      options
    )
  );
});

/**
 * =============================================================================
 * NOTIFICATION CLICK EVENT
 * =============================================================================
 * When partner clicks the push notification, open/focus the partner portal.
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';
  const orderId = event.notification.data?.orderId;

  /* Determine final URL */
  let targetUrl = urlToOpen;
  if (event.action === 'view-order' && orderId) {
    targetUrl = `/orders/${orderId}`;
  }

  event.waitUntil(
    /* Try to focus an existing partner portal tab */
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      /* Check if partner portal is already open in a tab */
      for (const client of clientList) {
        if (client.url.includes('partner.flashcart') && 'focus' in client) {
          /* Focus existing tab and navigate to order */
          client.postMessage({
            type: 'NOTIFICATION_CLICKED',
            orderId: orderId,
            url: targetUrl
          });
          return client.focus();
        }
      }
      /* No existing tab — open new one */
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

/**
 * BACKGROUND SYNC — Sync order status updates made offline
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-order-status') {
    event.waitUntil(syncOrderStatusUpdates());
  }
});

async function syncOrderStatusUpdates() {
  try {
    const db = await openDatabase('FlashCartPartnerOffline');
    const updates = await getAllFromStore(db, 'pendingStatusUpdates');
    
    for (const update of updates) {
      try {
        const response = await fetch(
          `https://flashcart-bd-default-rtdb.asia-southeast1.firebasedatabase.app/orders/${update.orderId}/status.json`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(update.newStatus)
          }
        );
        
        if (response.ok) {
          await deleteFromStore(db, 'pendingStatusUpdates', update.orderId);
        }
      } catch (err) {
        console.warn('[Partner SW] Failed to sync status update:', err);
      }
    }
  } catch (error) {
    console.error('[Partner SW] Background sync failed:', error);
  }
}

/**
 * MESSAGE EVENT — Communication with React App
 */
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data?.type === 'CLEAR_CACHE') {
    caches.keys().then((names) => names.forEach((name) => caches.delete(name)));
  }
});

/* --- Cache Strategy Functions (same as main app) --- */

async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;
    if (request.mode === 'navigate') return caches.match('/offline.html');
    return new Response('Network error', { status: 503 });
  }
}

async function cacheFirstStrategy(request, cacheName = STATIC_CACHE) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) return cachedResponse;
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    if (request.mode === 'navigate') return caches.match('/offline.html');
    return new Response('', { status: 404 });
  }
}

async function staleWhileRevalidateStrategy(request) {
  const cachedResponse = await caches.match(request);
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, networkResponse.clone()));
    }
    return networkResponse;
  }).catch(() => null);

  if (cachedResponse) return cachedResponse;
  const networkResponse = await fetchPromise;
  if (networkResponse) return networkResponse;
  if (request.mode === 'navigate') return caches.match('/offline.html');
  return new Response('Offline', { status: 503 });
}

/* --- IndexedDB Helpers --- */
function openDatabase(dbName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pendingStatusUpdates')) {
        db.createObjectStore('pendingStatusUpdates', { keyPath: 'orderId' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getAllFromStore(db, storeName) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function deleteFromStore(db, storeName, key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.delete(key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
