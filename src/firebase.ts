import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Validate Connection to Firestore
async function testConnection() {
  try {
    // Attempt to read with a timeout-like behavior via getDocFromServer
    await getDocFromServer(doc(db, '_internal_health_', 'check'));
    console.log("Firestore connection verified.");
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorCode = error?.code;
    
    if (errorCode === 'unavailable') {
      console.warn("Firestore backend currently unavailable. The app will work in offline mode and sync when possible.");
    } else if (errorCode === 'permission-denied' || errorMessage.includes('permission-denied') || errorMessage.includes('insufficient permissions')) {
      console.log("Firestore connectivity confirmed (reached server).");
    } else {
      console.log("Firestore connectivity status:", errorCode || errorMessage);
    }
  }
}

testConnection();
