const CACHE_NAME = 'booking-cache-v3';
const urlsToCache = ['./', 'index.html', 'manifest.json'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  // Hanya proses request yang berasal dari domain GitHub Pages Anda sendiri
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request).catch(() => {
          console.warn('Aset lokal gagal diambil atau offline:', event.request.url);
        });
      })
    );
  } else {
    // Jika request ke luar domain (jsdelivr, google apps script), biarkan browser mengambilnya secara normal tanpa lewat cache worker
    return; 
  }
});
