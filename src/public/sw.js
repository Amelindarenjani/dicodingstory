// sw.js
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

// Set workbox config
workbox.setConfig({
  debug: false
});

const manifest = self.__WB_MANIFEST;
precacheAndRoute(manifest);

// Precaching
workbox.precaching.precacheAndRoute([
  {url: '#/', revision: '1'},
  {url: '#/index.html', revision: '1'},
  {url: '#/favicon.png', revision: '1'},
  {
    url: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    revision: '1.9.4'
  }
]);

// Tangani route aplikasi dengan NetworkFirst strategy
workbox.routing.registerRoute(
  ({url}) => ['/', '/bookmarks', '/stories/add', '/about', '/login', '/register'].includes(url.pathname),
  new workbox.strategies.NetworkFirst({
    cacheName: 'app-routes'
  })
);

// Tangani CSS secara khusus
workbox.routing.registerRoute(
  ({url}) => url.pathname.endsWith('.css'),
  new workbox.strategies.CacheFirst({
    cacheName: 'css-cache',
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200]
      }),
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 hari
      })
    ]
  })
);

// Cache strategies aset eksternal
workbox.routing.registerRoute(
  ({url}) => url.origin === 'https://fonts.googleapis.com',
  new workbox.strategies.CacheFirst({
    cacheName: 'google-fonts'
  })
);

workbox.routing.registerRoute(
  ({url}) => url.origin === 'https://cdnjs.cloudflare.com',
  new workbox.strategies.CacheFirst({
    cacheName: 'font-awesome'
  })
);

workbox.routing.registerRoute(
  ({url}) => url.origin === 'https://story-api.dicoding.dev',
  new workbox.strategies.NetworkFirst({
    cacheName: 'api-cache'
  })
);

// untuk leaflet
workbox.routing.registerRoute(
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'leaflet-css',
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
        headers: {
          'Content-Type': 'text/css',
          'Access-Control-Allow-Origin': '*'
        }
      })
    ]
  }),
);

// Fallback untuk offline
workbox.routing.setCatchHandler(({event}) => {
  return caches.match('/index.html');
});

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: 'Anda memiliki notifikasi baru',
    icon: '/favicon.png'
  };
  event.waitUntil(self.registration.showNotification('Dicoding Story', options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({type: 'window'}).then((clientList) => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return clients.openWindow('/');
    })
  );
});

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('css-assets').then(cache => {
      return cache.addAll([
        '/app.css',
        'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    ]).catch(err => {
      console.error('Failed to cache CSS:', err);
    });
  }).then(() => self.skipWaiting())
  ); // Memaksa aktivasi segera
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim()); // Mengontrol semua tab segera
});
