// This is a basic service worker for PWA support
self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  clients.claim();
});

// Optional: Cache static assets for offline
self.addEventListener('fetch', event => {
  // You can add caching logic here if needed
});
