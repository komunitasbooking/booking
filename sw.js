const CACHE_NAME = 'booking-cache-v1';
// Menggunakan relative path yang aman untuk GitHub Pages
const urlsToCache = ['./', 'index.html', 'manifest.json'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // 1. Jika ada di dalam cache, langsung gunakan cache
      if (response) {
        return response;
      }
      
      // 2. Jika tidak ada di cache, minta ke server/internet
      return fetch(event.request).catch(error => {
        // 3. Penangkap eror: Cegah crash jika jaringan mati atau diblokir
        console.warn('Service Worker gagal mengambil aset (offline/terblokir):', event.request.url);
        
        // Opsional: Anda bisa mengembalikan fallback halaman offline kustom di sini
        // return caches.match('offline.html');
      });
    })
  );
});
