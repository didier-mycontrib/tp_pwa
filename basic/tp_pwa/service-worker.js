
var CURRENT_CACHE_NAME = 'my-site-cache-v2';
var urlsToCache = [
  '/css/styles.css',
  '/js/main.js',
  '/json/sampleData.json'
];
 

// events listener
self.addEventListener('install', function(event) {
	console.log('[ServiceWorker] install', event);
	// Perform install steps
    event.waitUntil(
    caches.open(CURRENT_CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache before addAll urlsToCache');
        return cache.addAll(urlsToCache);
      })
  );
});


self.addEventListener('activate', function(event) {
	console.log('[ServiceWorker] Activate', event );
	
  var cacheWhitelist = [CURRENT_CACHE_NAME];
  // delete all existing caches that are not in  cacheWhitelist :
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

});

//var arrayOfMessageChannels = [];
var mainMessageChannelPort;

function sendBackMessageToClient(backMsg){
	mainMessageChannelPort.postMessage(backMsg);
}

self.addEventListener('message', function(event) {
	 if(event.ports !=null && event.ports[0]!=null){
		 console.log("SW Received message in twoWay channel : " + event.data);
		 mainMessageChannelPort = event.ports[0];
		 sendBackMessageToClient("SW Says a reply message back!");
		 //another sending after 10s = 10000ms :
         setTimeout(()=>{sendBackMessageToClient("other reply message after 10s")} , 10000);	 
	 }else{
	     console.log("SW Received oneWay Message: " + event.data);
	 }
});
self.addEventListener('fetch', function(event) {
	console.log('[ServiceWorker] Fetch', event ); 
	event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response from cache
		console.log("cache hit for fetch request " + JSON.stringify(event.request));
        if (response) {
          return response;
        }
		//else standard (network) http request/fetch .
		
		// IMPORTANT: Clone the request. A request is a stream and
        // can only be consumed once. Since we are consuming this
        // once by cache and once by the browser for fetch, we need
        // to clone the request.
        var fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          function(response) {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            /*
            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
				console.log("put request response in cache " + JSON.stringify(event.request));
                cache.put(event.request, responseToCache);
              });
            */
            return response;
          }
        );//end of fetch(...).then(
      }
    ) //end of caches.matches(...).then(
  ); //end of event.respondWith
});

/*
We're also using event.waitUntil. 
Because a service worker isn't continually running -- 
it "wakes up" to do a task and then "goes back to sleep" --
 we want to use event.waitUntil to keep the service worker active. 
 This function accepts a function parameter. 
 The function we pass in will return a promise, and event.waitUntil 
 will keep the service worker "awake" until that function resolves.
 If we didn't use event.waitUntil the request might never make it 
 to the server because the service worker would run the onsync function 
 and then immediately go back to sleep.
*/