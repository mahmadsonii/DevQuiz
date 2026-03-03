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
  "/icon.png",
  "/Screenshot_20260302_024334.png",
  "/Screenshot_20260303_024334.png"
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
