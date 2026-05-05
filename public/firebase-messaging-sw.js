importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBKQb-luxAcSEDE4PmNAVAHKeGYpyI_VtI",
  authDomain: "gen-lang-client-0983250228.firebaseapp.com",
  projectId: "gen-lang-client-0983250228",
  storageBucket: "gen-lang-client-0983250228.firebasestorage.app",
  messagingSenderId: "696823342495",
  appId: "1:696823342495:web:5bbedd545de4f40914c9aa"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/vite.svg'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
