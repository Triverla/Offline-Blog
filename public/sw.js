var urlsToCache_ = [
    '/',
    '/stylesheets/style.css',
    '/stylesheets/app.min.css',
    '/stylesheets/jquery.min.js',
    '/javascripts/main.js',
    '/images/avatar.png'
  ];
  
  var version = 'v2.0';
  
  self.addEventListener('install', function(event) {
    console.log('ServiceWorker Installed: version', version);
    event.waitUntil(
      caches.open(version)
        .then(function(cache) {
        console.log("cache opened");
        return cache.addAll(urlsToCache_);
      })
    );
  });
  
  self.addEventListener('fetch', function(event) {
    event.respondWith(
      caches.match(event.request).then(function(response) {
        return response || fetch(event.request);
      })
    );
  });
  
  
  self.addEventListener('activate', function(event) {
  
    var cacheWhitelist = [version];
  
    event.waitUntil(
      caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames.map(function(cacheName) {
            if (version && cacheWhitelist.indexOf(cacheName) === -1) {
              console.log('Deleted old cache');
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
  });
  self.addEventListener('message', function(event) {
    if (event.data.action === 'skipWaiting') {
      self.skipWaiting();
    }
  });///