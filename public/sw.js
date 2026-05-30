// sw.js — Custom service worker for FlashCart Partner PWA.
// Handles: install/activate lifecycle, push events (background notifications),
// and notification clicks (open the relevant order). OneSignal uses its own worker.

const CACHE = 'flashcart-partner-v1'

// Take control immediately on install/activate.
self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

// Show a system notification when a push arrives (works when tab is closed).
self.addEventListener('push', (event) => {
  let data = {}
  try { data = event.data ? event.data.json() : {} } catch (e) { data = {} }
  const title = data.title || 'New Order Received!'
  const options = {
    body: data.body || 'You have a new order on FlashCart.',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/orders' },
    requireInteraction: true,
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

// Focus or open the partner portal at the order URL when a notification is clicked.
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data && event.notification.data.url) || '/orders'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url)
    })
  )
})
