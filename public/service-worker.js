// This is a service worker for PWA support + background notifications
self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  clients.claim();
});

// Handle push notifications from server
self.addEventListener('push', event => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body || 'Notifikasi baru',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    // Strong vibration pattern for driver (on motorcycle/phone)
    vibrate: [500, 200, 500, 200, 1000, 500, 500, 200, 1000],
    data: data,
    actions: [
      { action: 'open', title: 'Buka' },
      { action: 'dismiss', title: 'Tutup' }
    ],
    // Persist notification even when device is locked
    requireInteraction: true,
    // Not silent - use system notification sound
    silent: false,
    // Tag to prevent duplicate notifications
    tag: data.tag || 'zadapps-notification',
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Zad Apps', options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  // Focus/open app window
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      // Try to focus existing window
      for (const client of clients) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});

// Optional: Cache static assets for offline
self.addEventListener('fetch', event => {
  // Let the workbox service worker handle caching
});
