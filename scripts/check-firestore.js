// scripts/check-firestore.js
// Simple connectivity check: lists classes, customers, and staff counts from Firestore.

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
} from 'firebase/firestore';

const {
  VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_STORAGE_BUCKET,
  VITE_FIREBASE_MESSAGING_SENDER_ID,
  VITE_FIREBASE_APP_ID,
  VITE_FIREBASE_MEASUREMENT_ID,
} = process.env;

if (!VITE_FIREBASE_PROJECT_ID || !VITE_FIREBASE_API_KEY) {
  console.error('Missing required env vars for Firestore check.');
  process.exit(1);
}

const firebaseConfig = {
  apiKey: VITE_FIREBASE_API_KEY,
  authDomain: VITE_FIREBASE_AUTH_DOMAIN,
  projectId: VITE_FIREBASE_PROJECT_ID,
  storageBucket: VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: VITE_FIREBASE_APP_ID,
  measurementId: VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function main() {
  try {
    const classesSnap = await getDocs(collection(db, 'classes'));
    const customersSnap = await getDocs(collection(db, 'customers'));
    const staffSnap = await getDocs(collection(db, 'staff'));

    console.log('Firestore connectivity OK.');
    console.log(`classes:   ${classesSnap.size} documents`);
    console.log(`customers: ${customersSnap.size} documents`);
    console.log(`staff:     ${staffSnap.size} documents`);
  } catch (err) {
    console.error('Firestore check failed:', err);
    process.exit(1);
  }
}

main();

