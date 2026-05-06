import { messaging, db, handleFirestoreError, OperationType } from '../firebaseConfig';
import { getToken, onMessage, isSupported } from 'firebase/messaging';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

// To use notifications, you must generate a VAPID key in the Firebase Console:
// Project Settings -> Cloud Messaging -> Web configuration -> Web Push certificates
const VAPID_KEY = (import.meta as any).env.VITE_FIREBASE_VAPID_KEY;

export const saveUserFcmToken = async (userId: string, token: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { 
      fcmTokens: arrayUnion(token)
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
  }
};

export const requestNotificationPermission = async (userId: string) => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('This browser does not support notifications.');
    return null;
  }
  
  try {
    const supported = await isSupported();
    if (!supported || !messaging) {
      console.warn('Firebase Messaging is not supported in this browser/context.');
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      if (!VAPID_KEY) {
        console.warn('VITE_FIREBASE_VAPID_KEY is not set. Notifications will not work.');
        return null;
      }
      
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY
      });
      
      if (token) {
        await saveUserFcmToken(userId, token);
        console.log('FCM Token registered');
        return token;
      }
    }
  } catch (error) {
    console.error('Notification permission error:', error);
  }
  return null;
};

export const setupOnMessageListener = (callback: (payload: any) => void) => {
  if (!messaging) return;
  return onMessage(messaging, (payload) => {
    callback(payload);
  });
};

export const triggerNotification = async (targetUserId: string, title: string, body: string, data?: any) => {
  try {
    // 1. Get user tokens from Firestore (best done on server, but we'll fetch them here to pass to our API)
    // In a more secure setup, the server would fetch the tokens itself.
    // For this app, we'll implement a server-side route that fetches tokens.
    
    // We'll call our server API
    const response = await fetch('/api/send-notification-auto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: targetUserId, title, body, data })
    });
    return await response.json();
  } catch (error) {
    console.error('Failed to trigger notification:', error);
  }
};
