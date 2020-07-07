const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/index.js",
    "/style.css",
    "/manifest.webmanifest",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png"
];

const PRECACHE = "precache-v1";
const RUNTIME = "runtime";

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(PRECACHE)
            .then(cache => cache.addAll(FILES_TO_CACHE))
            .then(self.skipWaiting())
    );
});