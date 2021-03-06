   /* eslint-env browser */
  
// This works on all devices/browsers, and uses IndexedDBShim as a final fallback 
var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;

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
        console.log('Posts rendered from ' + options.source);
        var contentElement = document.querySelector('#blog-content');
        contentElement.innerHTML = '';
        contentElement.appendChild(options.fragment);
    };
    var handlePageState = function (contentId, options) {
        var url = getContentUrl(contentId);
        var networkPromise = fetch(url);
        var cachePromise = caches.match(url);

        if (options.shouldCache) {
            console.log('Cache update');
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
                    '<div class="box box-success">' +
                    '<div class="box-body chat" id="chat-box">'+
                   
                    '<h2><a class="lead" href="/articles/' + article.id + '">' + article.title + '</a></h2>' +
                    '<div class="item">'+
                    '<img src="'+article.avatar +'" alt="user image" class="offline">'+
                    '<p class="message"><a href="#" class="name">'+
                    '<small class="text-muted pull-right"><i class="fa fa-clock-o"></i>' + new Date(article.date).toDateString() + '</small>' + article.author +
                    '</a>' +
                    article.body + '</p>' +
                    '</div>'+             
                    '</div>'+
                    '</div>'
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
                '<label class="text-blue"><input type="checkbox" ' + (isCached ? 'checked' : '') + '> Read offline</label>' +
                '<div class="post">'+
                '<h2><a href="/articles/' + article.id + '">' + article.title + '</a></h2>' +
                  '<div class="user-block">'+
                  '<img src="/'+ article.avatar +'" alt="user image" class="offline">'+
                        '<span class="username">'+
                          '<a href="#">'+ article.author +'</a>'+
                          '<a href="#" class="pull-right btn-box-tool"><i class="fa fa-times"></i></a>'+
                        '</span>'+
                    '<span class="description">'+ new Date(article.date).toDateString() + '</span>'+
                  '</div>'+
                  '<p>'+
                  article.body +
                  '</p>' +
                  '<ul class="list-inline">'+
                    '<li><a href="#" class="link-black text-sm"><i class="fa fa-share margin-r-5"></i> Share</a></li>'+
                    '<li><a href="#" class="link-black text-sm"><i class="fa fa-thumbs-o-up margin-r-5"></i> Like</a>'+
                    '</li>'+
                    '<li class="pull-right">' +
                      '<a href="#" class="link-black text-sm"><i class="fa fa-comments-o margin-r-5"></i> Comments'+
                        '(5)</a></li>'+
                  '</ul>'+

                  '<input class="form-control input-sm" type="text" placeholder="Type a comment">'+
                '</div>'
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