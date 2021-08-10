const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

const FILES_TO_CACHE = [
  '/',
  '/index.html',
  "/public/icons/icon-192x192.png",
  "/public/icons/icon-512x512.png",
  "/public/style.css",
  "/manifest.webmanifest",
  "/db.js"
];

 
 self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  //Ativates service-workers immideiatly 
  self.skipWaiting();
});


// Activates the service worker and removes old data from the cache.
self.addEventListener("activate", function(event) {
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log("Removing old cache data", key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  console.log(event)
  });


self.addEventListener("fetch", function(event) {
  if (event.request.url.includes("/api/")) {
    console.log("[Service Worker] Fetch (data)", event.request.url);

    event.respondWith(
      caches.open(DATA_CACHE_NAME).then(cache => {
        return fetch(event.request)
          .then(response => {
            // Clone and store sucessful response in cache 
            if (response.status === 200) {
              cache.put(event.request.url, response.clone());
            }

            return response;
          })
          .catch(err => {
            // If network request fails, retrieve from cache instead
            return cache.match(event.request);
          });
      })
    );

    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(response => {
        return response || fetch(event.request);
      });
    })
  );
});