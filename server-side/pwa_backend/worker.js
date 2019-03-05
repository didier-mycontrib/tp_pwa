console.log('Loaded service worker!');

self.addEventListener('push', ev => {
  const payload = ev.data.json();
  console.log('Got push', payload);
  self.registration.showNotification(payload.title, {
    body: payload.message,
    icon: 'pwa-icon_48_48.png'
  });
});


//************


function syncToServer() {
    return getIndexedDB()
    .then(sendToServer)
    .catch(function(err) {
        return err;
    })
}

function getIndexedDB() {
    return new Promise(function(resolve, reject) {
        var db = indexedDB.open('my-registering-db');
        db.onsuccess = function(event) {
            this.result.transaction("registeringObjStore").objectStore("registeringObjStore")
			    .getAll().onsuccess = function(event) {
                resolve(event.target.result);
            }
        }
        db.onerror = function(err) {
            reject(err);
        }
    });
}

function sendToServer(userRegistering) {
    return fetch('/registerUser', {
            method: 'POST',
            body: JSON.stringify(userRegistering),
            headers:{
              'Content-Type': 'application/json'
            }
    }).then(function(servResp) {
        return servResp.text();
    }).catch(function(err) {
        return err;
    })
}

self.addEventListener('sync', function(event) {
	console.log('[ServiceWorker] Sync', event);
	if(event.tag == 'my-registering-sync') {
       event.waitUntil(syncToServer());
    }
});
