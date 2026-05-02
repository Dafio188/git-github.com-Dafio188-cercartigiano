import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from './firebase-config.json';

// Inizializzazione forzata sul progetto dell'utente
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

console.log("CercArtigiano Firebase Ready - Project ID:", firebaseConfig.projectId);
