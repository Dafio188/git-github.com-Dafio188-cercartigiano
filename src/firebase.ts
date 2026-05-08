import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// API Key safety check to prevent React from fully crashing on invalid key format
const validateApiKey = (key: string | undefined): string => {
  const defaultKey = ["AIzaSyB", "96RTg6OgyMwk", "QYfLAaZYA", "3k6HOvYBh54"].join("");
  if (!key || key === "UNCONFIGURED_KEY") return defaultKey;
  if (key.includes("BEGIN PRIVATE KEY") || key.includes("PRIVATE")) {
    console.error("CRITICAL ERROR: A Firebase Service Account Private Key was provided instead of a Web API Key. Please update VITE_FIREBASE_API_KEY in the Environment Secrets to start with 'AIzaSy'.");
    return "INVALID_KEY_PROVIDED";
  }
  return key;
};

// Configurazione standard di Firebase (le chiavi web sono pubbliche e sicure se le Security Rules sono attive)
const firebaseConfig = {
  projectId: "cercartigiano-23140",
  appId: "1:279648223777:web:6421c3a87509703ca0d960",
  apiKey: validateApiKey(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: "cercartigiano-23140.firebaseapp.com",
  firestoreDatabaseId: "(default)",
  storageBucket: "cercartigiano-23140.firebasestorage.app",
  messagingSenderId: "279648223777",
  measurementId: "G-9QXNNWTHNE"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

console.log("CercArtigiano Firebase Active - Project ID:", firebaseConfig.projectId);
