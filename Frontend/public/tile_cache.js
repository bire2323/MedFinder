// Service Worker for MedFinder - Offline Map & Route Caching
const TILE_CACHE = "tile-cache-v2";
const ROUTE_CACHE = "route-cache-v1";
const API_CACHE = "api-cache-v1";

// Tile providers to cache (free APIs)
const TILE_PROVIDERS = [
    "tile.openstreetmap.org",           // OpenStreetMap tiles
    "server.arcgisonline.com",          // ArcGIS World Imagery
];

self.addEventListener("fetch", (event) => {
    const url = event.request.url;

    // ========================================================================
    // 1. CACHE MAP TILES (Cache First Strategy)
    // ========================================================================
    // [COMMENTED] Original self-hosted tile caching for /tiles/ path
    // if (event.request.url.includes("/tiles/")) {
    //     event.respondWith(
    //         caches.open(TILE_CACHE).then(async (cache) => {
    //             const cached = await cache.match(event.request);
    //             if (cached) return cached;
    //             try {
    //                 const response = await fetch(event.request);
    //                 cache.put(event.request, response.clone());
    //                 return response;
    //             } catch (err) {
    //                 return Response.error();
    //             }
    //         })
    //     );
    // }

    // Cache free tile provider requests (OpenStreetMap, ArcGIS, etc.)
    const isTileRequest = TILE_PROVIDERS.some(provider => url.includes(provider));

    if (isTileRequest && event.request.method === "GET") {
        event.respondWith(
            caches.open(TILE_CACHE).then(async (cache) => {
                try {
                    // Try cache first for faster offline experience
                    const cached = await cache.match(event.request);
                    if (cached) {
                        return cached;
                    }

                    // If not in cache, fetch from network
                    const response = await fetch(event.request);

                    // Only cache successful responses
                    if (response.ok) {
                        cache.put(event.request, response.clone());
                    }

                    return response;
                } catch (err) {
                    // If offline and no cache, return placeholder error
                    console.warn("[SW] Tile fetch failed, no cache available:", err);
                    return Response.error();
                }
            })
        );
        return;
    }

    // ========================================================================
    // 2. CACHE ROUTE CALCULATIONS (Network First Strategy)
    // ========================================================================
    // Cache route API responses so users can see previously calculated routes offline
    if (url.includes("/api/map/route") || url.includes("/api/smart-pharmacy")) {
        event.respondWith(
            caches.open(ROUTE_CACHE).then(async (cache) => {
                try {
                    // Always fetch latest route if online
                    const response = await fetch(event.request);

                    if (response.ok) {
                        cache.put(event.request, response.clone());
                    }

                    return response;
                } catch (err) {
                    // If offline, return the previously saved route
                    const cached = await cache.match(event.request);
                    if (cached) {
                        console.log("[SW] Serving cached route (offline mode)");
                        return cached;
                    }

                    console.warn("[SW] Route fetch failed and no cache available");
                    return Response.error();
                }
            })
        );
        return;
    }

    // ========================================================================
    // 3. CACHE OTHER API RESPONSES (Network First Strategy)
    // ========================================================================
    // Cache other API calls (facilities, pharmacy search, etc.)
    if (url.includes("/api/") && event.request.method === "GET") {
        event.respondWith(
            caches.open(API_CACHE).then(async (cache) => {
                try {
                    const response = await fetch(event.request);

                    if (response.ok) {
                        cache.put(event.request, response.clone());
                    }

                    return response;
                } catch (err) {
                    // Fallback to cached version if available
                    const cached = await cache.match(event.request);
                    if (cached) {
                        console.log("[SW] Serving cached API response (offline mode)");
                        return cached;
                    }

                    return Response.error();
                }
            })
        );
        return;
    }
});

// ============================================================================
// Cache Cleanup & Versioning
// ============================================================================
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Keep only current cache versions
                    const validCaches = [TILE_CACHE, ROUTE_CACHE, API_CACHE];
                    if (!validCaches.includes(cacheName)) {
                        console.log("[SW] Deleting old cache:", cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});