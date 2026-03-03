const CACHE_NAME = "devquiz-cache-v1";

const urlsToCache = [
  "/",
  "/index.html",
  "/style.css",
  "/script.js",
  "/questions.js",
  "/css.js",
  "/html5.js",
  "/js.js",
  "/python.js",
  "/manifest.json",
  "/icon.jpeg",
  "/Screenshot_20260303_024334.jpeg"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
