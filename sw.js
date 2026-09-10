const CACHE_NAME = 'ffxiv-map-tracker-v2';

// Lista zasobów do zapisania w pamięci podręcznej (offline)
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './styles.css',
    './manifest.json',
    './js/app.js',
    './js/mapsData.js',
    './js/storage.js',
    './js/calculations.js',
    // Biblioteki zewnętrzne z CDN
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.16.9/xlsx.full.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js'
];

// Instalacja Service Workera i cache'owanie plików
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        }).then(() => self.skipWaiting())
    );
});

// Aktywacja i czyszczenie starych wersji cache
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Obsługa zapytań sieciowych (Cache First, potem sieciowe)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});