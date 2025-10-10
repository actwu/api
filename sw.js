const genCacheName = () => 'site-cache-' + Math.random().toString(36).slice(2, 9)
const CACHE_NAME_KEY = 'current-cache-name'

let CACHE_NAME

// open a small “meta” cache to remember the last name
const getCacheName = async () => {
const meta = await caches.open('meta-cache')
const saved = await meta.match(CACHE_NAME_KEY)
if (saved) {
return await saved.text()
}
const fresh = genCacheName()
await meta.put(CACHE_NAME_KEY, new Response(fresh))
return fresh
}

self.addEventListener('install', e => {
e.waitUntil(
(async () => {
CACHE_NAME = await getCacheName()
self.skipWaiting()
})()
)
})

self.addEventListener('activate', e => {
e.waitUntil(
(async () => {
CACHE_NAME = await getCacheName()
const keys = await caches.keys()
await Promise.all(
keys.map(k => {
if (k !== CACHE_NAME && k !== 'meta-cache') return caches.delete(k)
})
)
self.clients.claim()
})()
)
})

self.addEventListener('fetch', e => {
e.respondWith(
(async () => {
if (!CACHE_NAME) CACHE_NAME = await getCacheName()
const cache = await caches.open(CACHE_NAME)
const req = e.request

if (!req.url.startsWith(self.location.origin) && !/^https?:/.test(req.url)) return fetch(req)

const cached = await cache.match(req)
if (cached) return cached

try {
const fresh = await fetch(req)
if (fresh.ok) cache.put(req, fresh.clone())
return fresh
} catch {
return cached || Response.error()
}
})()
)
})
