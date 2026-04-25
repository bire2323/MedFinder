// sw.js
const TILE_CACHE = "tile-cache-v1";

self.addEventListener("fetch", (event) => {
    if (event.request.url.includes("/tiles/")) {
        event.respondWith(
            caches.open(TILE_CACHE).then(async (cache) => {
                const cached = await cache.match(event.request);
                if (cached) return cached;

                try {
                    const response = await fetch(event.request);
                    cache.put(event.request, response.clone());
                    return response;
                } catch (err) {
                    // offline fallback
                    return cached || Response.error();
                }
            })
        );
    }
});