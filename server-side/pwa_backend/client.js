// Hard-coded, replace with your public key
const publicVapidKey = 'BG-THsg-ZuqK0np-UlWouA7i38Zhee-obwSKH2Dw7HYDwT6lIKi3l2STtz3TgVDvR0SSfSgWyf4QZk_XJVxsTW4';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

var btnSubScribePush = document.getElementById('subscribe_btn_id');
btnSubScribePush.addEventListener("click",function () {	
	/*
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.register('/worker.js', {scope: '/'})
		         .then(()=>{ 
				      console.log('Registered service worker'); */
					  
					  //serviceWorker now already registered
					  subscribePush();
					  
		/*		 }); 
	}	*/
});



function subscribePush() {
//méthode à déclencher via un click sur un bouton 'subscribe_btn_id' par exemple
console.log('Retrieving PushManager for Subscription');

    // retrieve Service Worker 
navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {

    // subscribe Push Server
    let pushManager = serviceWorkerRegistration.pushManager;
    pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
    }).then(function(subscription) {
        console.log('User is subscribed.');
        updateSubscriptionOnServer(subscription); //sous fonction pour initialiser la souscription
    }, function(error) {
        console.error('Failed to subscribe the user', error);
        document.getElementById('subscribe_btn_id').disabled = true; // griser le bouton
    });
}, function(error) {
            console.error('Failed to retrieve PushManager', error);
    });
}

function updateSubscriptionOnServer(subscription){
fetch('/subscribe', {
    method: 'POST',
    body: JSON.stringify(subscription),
    headers: {
      'content-type': 'application/json'
    }
  }).then( () => {   console.log('Sent push subscription');
                     document.getElementById('askPushSubscription').style.display='none';
					 document.getElementById('subscriptionDone').style.display='block';
                  })
     .catch( (e) =>  {   console.log(e); }) ;
}

//************************* for background sync ********************

function registerServiceWorkerSyncOnFormSubmit(registration){
 document.getElementById('btnRegisterUser').addEventListener('click', (event) => {
				event.preventDefault();
				saveFormDataInDbPromise().then(function() {
					if(registration.sync) {
						registration.sync.register('my-registering-sync')
						.catch(function(err) {
							return err;
						});
						console.log('my-registering-sync is register in worker');
					} else {
                        // sync isn't there so fallback:
                        console.log("sync is not supported by this browser");
						document.getElementById("registerMsg").innerHTML="sync is not supported by this browser";
                    }
				});
            })
}		


function initializeDbForBackroungSync() {
    var myRegisteringDB = window.indexedDB.open('my-registering-db');
    myRegisteringDB.onupgradeneeded = function(event) {
        var db = event.target.result;
        var registeringObjStore = db.createObjectStore("registeringObjStore", { autoIncrement: true });
        registeringObjStore.createIndex("username", "username", { unique: true });
        registeringObjStore.createIndex("email", "email", { unique: true });
		console.log('onupgradeneeded ok - registeringObjStore');
    }
	console.log('initializeDB ok - my-registering-db');
}

function saveFormDataInDbPromise() {
    return new Promise(function(resolve, reject) {
        var tmpObj = {
            username: document.getElementById('idUsername').value,
            email: document.getElementById('idEmail').value
        };
    
        var myDB = window.indexedDB.open('my-registering-db');
    
        myDB.onsuccess = function(event) {
          var objStore = this.result.transaction('registeringObjStore', 'readwrite')
		                                .objectStore('registeringObjStore');
          objStore.add(tmpObj);
		  console.log("data saved in indexedDB");
          resolve();
        }

        myDB.onerror = function(err) {
            reject(err);
        }
    })
}


    initializeDbForBackroungSync();

    //nb: la propriété (en readonly) navigator.onLine est tout le temps maintenue à jour par le navigateur
    document.getElementById('onlineOfflineStatus').innerHTML=(navigator.onLine==true)?'online':'offline';

    window.addEventListener('offline', function() {
	  //nb: cet evenement est declenché lors d'un changement (mais pas dès le début)
	  //exemple : coupure connexion wifi ou ...
      document.getElementById('onlineOfflineStatus').innerHTML='offline';
	});
	
	window.addEventListener('online', function() {
	  //nb: cet evenement est declenché lors d'un changement (mais pas dès le début)
	  //exemple : rétablissement connexion wifi ou ...
      document.getElementById('onlineOfflineStatus').innerHTML='online';
	});


//********************* serviceWorker.register() for push and sync *************	
	
if ('serviceWorker' in navigator) {
	window.addEventListener('load', function() {
    navigator.serviceWorker.register('/worker.js', {scope: '/'})
	.then(() => navigator.serviceWorker.ready)
	.then(function(registration) {
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
	  registerServiceWorkerSyncOnFormSubmit(registration);
    }, function(err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}

	
