// sw.js — Custom service worker for FlashCart Partner PWA.
// Handles: lifecycle, push events (background notifications even when tab closed),
// and notification clicks (focus/open the relevant order). OneSignal uses its own
// worker (OneSignalSDKWorker.js); this one powers the custom PWA push + clicks.

const CACHE = 'flashcart-partner-v2'

// Activate immediately so updates take effect without a manual refresh.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))

// Show a system notification when a push arrives (works when tab is closed/locked).
self.addEventListener('push', (event) => {
  let data = {}
  try { data = event.data ? event.data.json() : {} } catch (e) { data = {} }

  const title = data.title || 'New Order Received!'
  const options = {
    body: data.body || 'You have a new order on FlashCart.',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    // Strong vibration pattern on mobile.
    vibrate: [500, 200, 500, 200, 500],
    // requireInteraction keeps the notification on screen until tapped.
    requireInteraction: true,
    // renotify + a stable tag makes repeated orders re-alert instead of stacking silently.
    tag: data.tag || 'flashcart-order',
    renotify: true,
    data: { url: data.url || '/orders' },
    actions: [{ action: 'open', title: 'View Order' }],
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

// Focus an existing tab (and navigate it) or open a new one on click.
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data && event.notification.data.url) || '/orders'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) {
          if ('navigate' in client) client.navigate(url)
          return client.focus()
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url)
    })
  )
})

// Allow the page to tell the SW to show a notification (used as a fallback path).
self.addEventListener('message', (event) => {
  const d = event.data || {}
  if (d.type === 'SHOW_NOTIFICATION') {
    self.registration.showNotification(d.title || 'New Order', {
      body: d.body || '',
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      vibrate: [500, 200, 500],
      requireInteraction: true,
      tag: 'flashcart-order',
      renotify: true,
      data: { url: d.url || '/orders' },
    })
  }
})
