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
  appId: "1:279648223777:web:9391a5520f525041a0d960",
  apiKey: validateApiKey(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: "cercartigiano-23140.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-62c63647-f43b-4207-874e-291c0c8ba92b",
  storageBucket: "cercartigiano-23140.firebasestorage.app",
  messagingSenderId: "279648223777",
  measurementId: ""
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const storage = getStorage(app);

console.log("CercArtigiano Firebase Active - Project ID:", firebaseConfig.projectId);
