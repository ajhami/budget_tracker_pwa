const FILES_TO_CACHE = [
    // "/",
    "./",
    "./index.js",
    "./styles.css",
    "./manifest.webmanifest",
    "./icons/icon-192x192.png",
    "./icons/icon-512x512.png"
];

const PRECACHE = "static-precache-v1";
const DATACACHE = "data-cache-v1";

console.log("Test before installation")

self.addEventListener("install", function (event) {
    console.log("Test during installation")
    event.waitUntil(
        caches.open(PRECACHE)
            .then(cache => {
                console.log("Your files have been pre-cached successfully.");
                return cache.addAll(FILES_TO_CACHE);
            })
            .then(self.skipWaiting())
            .catch(err => {
                console.log("Error while pre-caching files.", err);
            })
    );


    // self.skipWaiting();
});

console.log("Test after installation")

// self.addEventListener("activate", function (event) {
//     // Possible keys
//     const currentCaches = [PRECACHE, DATACACHE];
//     event.waitUntil(
//         caches.keys()
//             .then(cacheKeys => {
//                 return cacheKeys.filter(cacheKey => !currentCaches.includes(cacheKey));
//             })
//             .then(deleteCaches => {
//                 return Promise.all(deleteCaches.map(deleteCache => {
//                     return caches.delete(deleteCache);
//                 }));
//             }).then(() => self.clients.claim())
//             .catch(err => {
//                 console.log("Error while activating service worker.", err);
//             })
//     );
// });

self.addEventListener("activate", function(event) {
    event.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if(key !== PRECACHE && key !== DATACACHE) {
                        console.log("Removing old cache: ", key);
                        return caches.delete(key);
                    }
                })
            )
        })
    )

    self.clients.claim();

});

self.addEventListener("fetch", event => {
    if (event.request.url.includes("/api/")) {
        event.respondWith(
            caches.open(DATACACHE).then(cache => {
                return fetch(event.request)
                    .then(response => {
                        if (response.status === 200) {
                            cache.put(event.request.url, response.clone());
                        }
                        return response;
                    })
                    .catch(err => {
                        return cache.match(event.request);
                    });
            }).catch(err => console.log(err))
        );
        return;
    }

    event.respondWith(
        fetch(event.request).catch(function() {
          return caches.match(event.request).then(function(response) {
            if (response) {
              return response;
            } else if (event.request.headers.get("accept").includes("text/html")) {
              // return the cached home page for all requests for html pages
              return caches.match("/");
            }
          });
        })
      );

    // event.respondWith(
    //     caches.match(event.request)
    //         .then(function (response) {
    //             return response || fetch(event.request);
    //         })
    // );
});

