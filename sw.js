const version = '20190123105248';
const cacheName = `static::${version}`;


function updateStaticCache() {
    return caches.open(cacheName).then(cache => {
        return cache.addAll([
            
            '/assets/styles-3111ab3f977af8ef7fc40d308f1c3e920a1829c7b48f24f5079fb11740e74bf2.css',
            '/assets/main-058dcf1c5b2815b57e44c7ed387fe85f37926b180e1c41b60110ce86ad4e290d.js',
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

