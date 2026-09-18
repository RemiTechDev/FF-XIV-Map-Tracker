// ============================================================================
// Cache configuration
// ============================================================================
const CACHE_NAME = "ffxiv-map-tracker-v4.0.0-friendly-export-copy-1";

const LOCAL_ASSETS = [
    "./",
    "./index.html",
    "./styles.css",
    "./manifest.json",
    "./assets/icons/icon-192.png",
    "./assets/icons/icon-512.png",
    "./js/app.js",
    "./js/mapsData.js",
    "./js/storage.js",
    "./js/calculations.js",
    "./js/i18n.js",
    "./js/statistics/charts.js",
    "./js/export/download.js",
    "./js/export/csvExport.js",
    "./js/export/jsonExport.js",
    "./js/export/odsExport.js",
    "./js/export/excelExport.js",
    "./js/export/bundleExport.js"
];


// ============================================================================
// Install: pre-cache application shell
// ============================================================================
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(LOCAL_ASSETS))
            .then(() => self.skipWaiting())
    );
});


// ============================================================================
// Activate: remove old caches
// ============================================================================
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key =>
                caches.delete(key))))
            .then(() => self.clients.claim())
    );
});


// ============================================================================
// Fetch strategy
// ============================================================================
self.addEventListener("fetch", event => {
    if (event.request.method !== "GET") return;

    const requestUrl = new URL(event.request.url);
    const isNavigation = event.request.mode === "navigate";
    const isSameOrigin = requestUrl.origin === self.location.origin;

    if (isNavigation) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put("./index.html", copy));
                    return response;
                })
                .catch(() => caches.match("./index.html"))
        );
        return;
    }

    if (isSameOrigin) {
        event.respondWith(
            caches.match(event.request).then(cached => cached ||
                fetch(event.request).then(response => {
                const copy = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
                return response;
            }))
        );
        return;
    }

    // Runtime-cache external libraries after the first successful load.
    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) return cached;
            return fetch(event.request).then(response => {
                const copy = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
                return response;
            });
        })
    );
});
