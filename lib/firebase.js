// Firebase initialization for the LuxuryPhone24 store.
//
// The config below is used directly — no environment variables needed.
// These values are PUBLIC client identifiers (every visitor's browser
// receives them); real security comes from the Firestore/Storage rules.
// If you ever switch to a different Firebase project, update the values
// here and redeploy.
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyDznqlipRcnAuHbjuWGMrW80O-9rWUfpac',
  authDomain: 'luxuryphone24.firebaseapp.com',
  projectId: 'luxuryphone24',
  storageBucket: 'luxuryphone24.firebasestorage.app',
  messagingSenderId: '897121936856',
  appId: '1:897121936856:web:4564abebaa426f0f53fead',
};

export const isFirebaseConfigured = true;

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
