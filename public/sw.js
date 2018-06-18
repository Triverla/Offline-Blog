var urlsToCache_ = [
    '/',
    '/about',
    '/contactus',
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
    var requestUrl = new URL(event.request.url);

  if (requestUrl.origin === location.origin) {
    if (requestUrl.pathname === '/') {
      event.respondWith(caches.match('/'));
      return;
    }
    if (requestUrl.pathname.startsWith('/photos/')) {
      event.respondWith(servePhoto(event.request));
      return;
    }
    // TODO: respond to avatar urls by responding with
    // the return value of serveAvatar(event.request)
    if (requestUrl.pathname.startsWith('/images/')) {
      event.respondWith(serveAvatar(event.request));
      return;
    }
  }

    event.respondWith(
      caches.match(event.request).then(function(response) {
        return response || fetch(event.request);
      })
    );
  });

  function serveAvatar(request) {
    // Avatar urls look like:
    // avatars/sam-2x.jpg
    // But storageUrl has the -2x.jpg bit missing.
    // Use this url to store & match the image in the cache.
    // This means you only store one copy of each avatar.
    var storageUrl = request.url.replace(/-\dx\.jpg$/, '');
  
    // TODO: return images from the "wittr-content-imgs" cache
    // if they're in there. But afterwards, go to the network
    // to update the entry in the cache.
    //
    // Note that this is slightly different to servePhoto!
    return caches.open('images').then(function(cache) {
      return cache.match(storageUrl).then(function(response) {
        var fetchPromise = fetch(request).then(function(networkResponse) {
          cache.put(storageUrl, networkResponse.clone());
          return networkResponse;
        });
        return response || fetchPromise;
      });
    });
  }
  
  function servePhoto(request) {
    var storageUrl = request.url.replace(/-\d+px\.jpg$/, '');
  
    return caches.open('images').then(function(cache) {
      return cache.match(storageUrl).then(function(response) {
        if (response) return response;
  
        return fetch(request).then(function(networkResponse) {
          cache.put(storageUrl, networkResponse.clone());
          return networkResponse;
        });
      });
    });
  }
  
  
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
  //skipWaiting
  self.addEventListener('message', function(event) {
    if (event.data.action === 'skipWaiting') {
      self.skipWaiting();
    }
  });
   // Ensure refresh is only called once.
  // This works around a bug in "force update on reload".
  var refreshing;
  self.addEventListener('controllerchange', function() {
    if (refreshing) return;
    window.location.reload();
    refreshing = true;
  });