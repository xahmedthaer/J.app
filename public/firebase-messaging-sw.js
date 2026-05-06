importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/cloud-messaging/js/receive#set_up_a_javascript_firebase_cloud_messaging_client_app
firebase.initializeApp({
  apiKey: "AIzaSyBKQb-luxAcSEDE4PmNAVAHKeGYpyI_VtI",
  authDomain: "gen-lang-client-0983250228.firebaseapp.com",
  projectId: "gen-lang-client-0983250228",
  storageBucket: "gen-lang-client-0983250228.firebasestorage.app",
  messagingSenderId: "696823342495",
  appId: "1:696823342495:web:5bbedd545de4f40914c9aa"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon.png', // Fallback icon path
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
