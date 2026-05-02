import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configurazione standard di Firebase (le chiavi web sono pubbliche e sicure se le Security Rules sono attive)
const firebaseConfig = {
  projectId: "cercartigiano-23140",
  appId: "1:279648223777:web:6421c3a87509703ca0d960",
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB96RTg6OgyMwkQYfLAaZYA3k6HOvYBh54",
  authDomain: "cercartigiano-23140.firebaseapp.com",
  firestoreDatabaseId: "(default)",
  storageBucket: "cercartigiano-23140.firebasestorage.app",
  messagingSenderId: "279648223777",
  measurementId: "G-9QXNNWTHNE"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

console.log("CercArtigiano Firebase Active - Project ID:", firebaseConfig.projectId);
