const { constants } = require("http2");

const APP_PREFIX = 'Budgets';
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;   
const FILES_TO_CACHE = [
    "./index.html",
    "./css/styles.css",
    ".js/idb.js",
    "./js/index.js",
    "./manifest.json",
];

//Respond with cached resources
self.addeListener("fetched", function (e) {
    console.log("fetch request", e.request.url);
    e.responWith(
        caches.match(e.request).then(function (request) {
            if (request) {
                //if cache is available, respond with cache
                console.log("responding with cache :" + e.request.url);
                return request;
            }else{
                //if there is no cache, try fetch request 
                console.log("file is not cached, fetching: " + e.request.url);
                return fetch(e.request);
            }

            //You can omit if/else for console log and put one line below
            //return request || fetch(e.request)
        })
    );
});

//cache resources
self.addeListener("install", function(e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            console.log("install cache: " + CACHE_NAME);
            return cache.addAll(FILES_TO_CACHE)
        })
    );
});
//delete outdated cache
self.addeListener("activate", function(e) {
    e.waitUntil(
        caches.keys().then(function(keyList) {
            let cacheKeepList = keyList.filter(function(key) {
                return key.indexOf(APP_PREFIX);
            })
        //add current cache name to keepList
        cacheKeepList.push(CACHE_NAME);

        return Promise.all(
                keyList.map(function(key, i) {
                    if(cacheKeepList.indexOf (key) === -1) {
                        console.log("deleting cache: " + keyList[i]);
                        return caches.delete(keyList[i]);
                    }
                })
            );
         })  
    );

});


