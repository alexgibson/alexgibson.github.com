const version = '20190110085938';
const cacheName = `static::${version}`;


function updateStaticCache() {
    return caches.open(cacheName).then(cache => {
        return cache.addAll([
            
            '/assets/styles-17f0398aa7a29e015f557ad72cfee874f2f5b7f3c1a68ed08861281e3e08b08a.css',
            '/assets/main-7fde6c85d9901972362b6794d34921bb0f4cca13d845a8378d3358f037ce2144.js',
            '/assets/avatar-180-a1b105f177ccb815e56ac246a8958ead865bf75115d4e851fab3172195d9e903.png',
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

