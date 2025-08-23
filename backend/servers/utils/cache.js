// Simple in-memory TTL cache (key -> { value, expiry })
// Can be swapped with Redis easily.
const store = new Map();

export function setCache(key, value, ttlMs = 10 * 60 * 1000) {
    store.set(key, { value, expiry: Date.now() + ttlMs });
}

export function getCache(key) {
    const hit = store.get(key);
    if (!hit) return null;
    if (hit.expiry < Date.now()) {
        store.delete(key);
        return null;
    }
    return hit.value;
}

export function cacheWrap(key, ttl, fn) {
    const cached = getCache(key);
    if (cached) return cached;
    return fn().then(val => {
        setCache(key, val, ttl);
        return val;
    });
}