const version = '20190125150314';
const cacheName = `static::${version}`;


function updateStaticCache() {
    return caches.open(cacheName).then(cache => {
        return cache.addAll([
            
            '/assets/styles-d1f2c4e4f67ab4bb99cc15cf93d4e71407839c34ea014f7f6292be48b9e62820.css',
            '/assets/main-e57640e3fe16911cb2c5d6e0efa76bd3296a7d30118d61f903b6ad3369352e1f.js',
            '/assets/avatar-180-b1f192dbbe4ceec9c13c327fb0908af5ddbf621002116885f0cc2e8d8b6787c8.jpg',
            '/offline/'
            
        ]);
    });
}



function clearOldCache() {
    return caches.keys().then(keys => {
        // Remove caches whose name is no longer valid.
        return Promise.all(keys
            .filter(key => {
                return key !== cacheName;
            })
            .map(key => {
                console.log(`Service Worker: removing cache ${key}`);
                return caches.delete(key);
            })
        );
    });
}

self.addEventListener('install', event => {
    event.waitUntil(updateStaticCache().then(() => {
        console.log(`Service Worker: cache updated to version: ${cacheName}`);
    }));
});

self.addEventListener('activate', event => {
    event.waitUntil(clearOldCache());
});

self.addEventListener('fetch', event => {
    let request = event.request;
    let url = new URL(request.url);

    // Only deal with requests from the same domain.
    if (url.origin !== location.origin) {
        return;
    }

    // Always fetch non-GET requests from the network.
    if (request.method !== 'GET') {
        event.respondWith(fetch(request));
        return;
    }

    // For HTML requests, try the network first else fall back to the offline page.
    if (request.headers.get('Accept').indexOf('text/html') !== -1) {
        event.respondWith(
            fetch(request).catch(() => caches.match('/offline/'))
        );
        return;
    }

    // For non-HTML requests, look in the cache first else fall back to the network.
    event.respondWith(
        caches.match(request)
            .then(response => {
                if (response) {
                    console.log('Serving cached: ', event.request.url);
                    return response;
                }
                console.log('Fetching: ', event.request.url);
                return fetch(request)
            })
    );
});

