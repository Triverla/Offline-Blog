
   window.addEventListener('DOMContentLoaded', function () {
    navigator.serviceWorker.register('/sw.js')
    .then(function(registration) {
      console.log('Service Worker registered:', registration);
    })
    .catch(function(error) {
      console.error('Service Worker could not be registered:', error);
    });
              
    var fragmentFromString = function (htmlString) {
        return document.createRange().createContextualFragment(htmlString);
    };

    var getContentUrl = function (contentId) { return '/content/' + contentId; };

    var isContentCached = function (contentId) {
        return caches.open('content').then(function (cache) {
            return cache.match(getContentUrl(contentId)).then(function (response) {
                return !! response;
            });
        });
    };

    var updateContent = function (options) {
        console.log('Render: from ' + options.source);
        var contentElement = document.querySelector('#blog-content');
        contentElement.innerHTML = '';
        contentElement.appendChild(options.fragment);
    };

    function connectionFail() {
        loaderNone();
        document.getElementById('lat').innerHTML = "Bad news! We need the internet";
        document.getElementById('no-connection').style.display = 'block';
      }
      
      function connectionFailNone() {
        document.getElementById('no-connection').style.display = 'none';
      }
      
    var handlePageState = function (contentId, options) {
        var url = getContentUrl(contentId);
        var networkPromise = fetch(url);
        var cachePromise = caches.match(url);

        if (options.shouldCache) {
            console.log('Cache: update');
            networkPromise.then(function (networkResponse) {
                return caches.open('content')
                    .then(function (cache) { return cache.put(url, networkResponse.clone()); });
            });
        }

        // Cache or else network
        var initialRender = function () {
            return cachePromise
                .then(function (cacheResponse) {
                    if (cacheResponse) {
                        return cacheResponse.clone().json()
                            .then(options.render)
                            .then(function (fragment) { return { source: 'cache', fragment: fragment }; });
                    } else {
                        return networkPromise
                            .then(function (networkResponse) {
                                if (networkResponse.ok) {
                                    return networkResponse.clone().json().then(options.render);
                                } else {
                                    return networkResponse.clone().text()
                                        .then(function (text) { return fragmentFromString('<p>' + text + '</p>'); });
                                }
                            }, function (error) { return fragmentFromString('<p>' + error.message + '</p>'); })
                            .then(function (fragment) { return { source: 'network', fragment: fragment }; });
                    }
                })
                .then(updateContent);
        };

        // If previously served from cache, update the content on screen from the
        // network (if response was OK)
        var conditionalNetworkRender = function () {
            return cachePromise.then(function (cacheResponse) {
                networkPromise.then(function (networkResponse) {
                    if (cacheResponse && networkResponse.ok) {
                        return networkResponse.clone().json()
                            .then(options.render)
                            .then(function (fragment) { return { source: 'network', fragment: fragment }; })
                            .then(updateContent);
                    }
                });
            });
        };

        return initialRender().then(conditionalNetworkRender);
    };

    var renderHomePage = function (articles) {
        return Promise.all(articles.map(function (article) {
            return isContentCached('articles/' + article.id).then(function (isCached) {
                return (
                    '<li>' +
                        '<h2><a href="/articles/' + article.id + '">' + article.title + '</a></h2>' +
                        (isCached ? '<p><strong>Available offline</strong></p>' : '') +
                        '<p>' + new Date(article.date).toDateString() + '</p>' +
                        article.body +
                    '</li>'
                );
            });
        })).then(function (articleLiNodes) {
            return fragmentFromString('<ul>' + articleLiNodes.join('') + '</ul>');
        });
    };

    var renderArticlePage = function (article) {
        var contentId = 'articles/' + article.id;
        return isContentCached(contentId).then(function (isCached) {
            var fragment = fragmentFromString(
                '<label class="text-info"><input type="checkbox" ' + (isCached ? 'checked' : '') + '> Read offline</label>' +
                '<h2><a href="/articles/' + article.id + '">' + article.title + '</a></h2>' +
                '<p>' + new Date(article.date).toDateString() + '</p>' +
                article.body
            );

            var cacheCheckboxElement = fragment.querySelector('input');
            cacheCheckboxElement.addEventListener('change', function (event) {
                return caches.open('content').then(function (cache) {
                    var shouldCache = event.target.checked;
                    var contentUrl = getContentUrl(contentId);
                    if (shouldCache) {
                        return cache.add(contentUrl).catch(function () {
                            event.target.checked = false;
                        });
                    } else if (isCached) {
                        cache.delete(contentUrl);
                    }
                });
            });

            return fragment;
        });
    };

    //
    // Routing
    //

    var homeRegExp = /^\/$/;
    var articleRegExp = /^\/articles\/(.*)$/;
    if (homeRegExp.test(location.pathname)) {
        var contentId = 'articles';

        handlePageState(contentId, {
            shouldCache: true,
            render: renderHomePage
        });
    }
    else if (articleRegExp.test(location.pathname)) {
        var contentId = 'articles/' + location.pathname.match(articleRegExp)[1];

        isContentCached(contentId).then(function (isCached) {
            handlePageState(contentId, {
                shouldCache: isCached,
                render: renderArticlePage
            });
        });
    }
});

