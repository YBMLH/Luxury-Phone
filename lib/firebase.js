// Firebase initialization. All configuration comes from environment
// variables so no secrets ever live in the code.
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// True once the .env.local file has been filled in.
export const isFirebaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
);

// The Luxury Phone project config is used directly as the default, so
// the site works even without environment variables. These values are
// PUBLIC client identifiers (every visitor's browser receives them) —
// security comes from the Firestore/Storage rules, not from hiding these.
// Environment variables still override them if you ever switch projects.
const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    'AIzaSyDznqlipRcnAuHbjuWGMrW80O-9rWUfpac',
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    'luxuryphone24.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'luxuryphone24',
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    'luxuryphone24.firebasestorage.app',
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '897121936856',
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    '1:897121936856:web:4564abebaa426f0f53fead',
};

if (!isFirebaseConfigured && typeof window !== 'undefined') {
  console.warn(
    'Firebase is not configured yet — copy .env.local.example to .env.local and fill in your Firebase keys (see README step 2).'
  );
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
