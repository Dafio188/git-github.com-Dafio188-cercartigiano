import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configurazione tramite variabili d'ambiente per sicurezza su GitHub
const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "cercartigiano-23140",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:279648223777:web:6421c3a87509703ca0d960",
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "cercartigiano-23140.firebaseapp.com",
  firestoreDatabaseId: "(default)",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "cercartigiano-23140.firebasestorage.app",
  messagingSenderId: "279648223777",
  measurementId: "G-9QXNNWTHNE"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

console.log("CercArtigiano Firebase Active - Project ID:", firebaseConfig.projectId);
