const version = '20190129092359';
const cacheName = `static::${version}`;


function updateStaticCache() {
    return caches.open(cacheName).then(cache => {
        return cache.addAll([
            
            '/assets/styles-5ea44c50f63519ccd193789a1a964cabf42ac3c2a2e13e10ef154f302e4c0769.css',
            '/assets/main-8953d8211a0059ca572b24de6b51b5e8bb959db4b1644b747fdb1ee2f7daa73e.js',
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

