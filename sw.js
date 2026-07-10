const CACHE_NAME = 'booking-cache-v4'; 

// 1. TAMBAHKAN QUERY STRING (?v=4) untuk memaksa bypass HTTP Cache browser saat install
const urlsToCache = [
  './?v=4', 
  'index.html?v=4', 
  'manifest.json?v=4'
];

self.addEventListener('install', event => {
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Menggunakan request objek agar disimpan di cache tanpa query string di key-nya
      return Promise.all(
        urlsToCache.map(url => {
          return fetch(url).then(response => {
            if (!response.ok) {
              throw new TypeError('Request failed for: ' + url);
            }
            // Simpan ke cache menggunakan nama file bersih (tanpa ?v=4) sebagai key
            const cleanUrl = url.split('?')[0];
            return cache.put(cleanUrl, response);
          });
        })
      );
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME) 
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim()) 
  );
});

// 2. PERBARUI STRATEGI FETCH
self.addEventListener('fetch', event => {
  if (event.request.url.startsWith(self.location.origin)) {
    const url = new URL(event.request.url);
    
    // Strategi Network-First khusus untuk index.html dan manifest.json
    // Supaya setiap kali user online, mereka SELALU dapat kode HTML terbaru dari server
    if (url.pathname === '/' || url.pathname.endsWith('index.html') || url.pathname.endsWith('manifest.json')) {
      event.respondWith(
        fetch(event.request)
          .then(response => {
            // Jika berhasil mengambil yang baru dari server, update cache-nya
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
            return response;
          })
          .catch(() => {
            // Jika offline, baru ambil dari cache
            return caches.match(event.request);
          })
      );
    } else {
      // Strategi Cache-First untuk aset statis lainnya (gambar, css, js pendukung)
      event.respondWith(
        caches.match(event.request).then(response => {
          return response || fetch(event.request).catch(() => {
            console.warn('Aset lokal gagal diambil atau offline:', event.request.url);
          });
        })
      );
    }
  }
});
