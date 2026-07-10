const CACHE_NAME = 'booking-cache-v4'; // 🔥 WAJIB dinaikkan setiap kali ada perubahan index.html/manifest
const urlsToCache = ['./', 'index.html', 'manifest.json'];

self.addEventListener('install', event => {
  self.skipWaiting(); // Paksa Service Worker baru langsung aktif, tidak menunggu tab lama ditutup
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME) // Hapus semua cache versi lama
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim()) // Ambil alih kontrol tab yang sudah terbuka
  );
});

self.addEventListener('fetch', event => {
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request).catch(() => {
          console.warn('Aset lokal gagal diambil atau offline:', event.request.url);
        });
      })
    );
  } else {
    return;
  }
});
