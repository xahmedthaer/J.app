import { getToken, onMessage, Messaging } from 'firebase/messaging';
import { getMessagingInstance } from '../firebaseConfig';
import { db } from '../firebaseConfig';
import { doc, setDoc, arrayUnion, updateDoc } from 'firebase/firestore';

const VAPID_KEY = "ODJyW4G0JEPXptxB1Ii06veELkvZsbk5SzTAh7kVg-g"; // Key provided by user: ODJyW4G0JEPXptxB1Ii06veELkvZsbk5SzTAh7kVg-g

export const requestNotificationPermission = async (userId: string) => {
  if (typeof window === 'undefined') return null;

  const messaging = await getMessagingInstance();
  if (!messaging) {
    console.warn("Messaging not supported or initialized");
    return null;
  }

  if (!VAPID_KEY) {
      console.warn("FCM VAPID KEY is missing. Push notifications will not work until you provide it in notificationService.ts");
      return null;
  }

  if (!('Notification' in window)) {
    console.warn("This browser does not support notifications.");
    return null;
  }

  try {
    const permission = await window.Notification.requestPermission();
    if (permission === 'granted') {
      // Explicitly register the service worker to avoid MIME type issues with default paths
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration
      });
      
      if (token) {
        // Save token to user profile or a separate collection
        const tokenRef = doc(db, 'fcm_tokens', userId);
        await setDoc(tokenRef, {
          tokens: arrayUnion(token),
          updatedAt: new Date().toISOString()
        }, { merge: true });
        
        return token;
      }
    }
  } catch (error) {
    console.error("An error occurred while retrieving token. ", error);
  }
  return null;
};

export const onMessageListener = async () => {
  const messaging = await getMessagingInstance();
  if (!messaging) return null;
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
};
