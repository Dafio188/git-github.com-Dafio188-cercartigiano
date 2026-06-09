import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  ignoreUndefinedProperties: true
}, firebaseConfig.firestoreDatabaseId === '(default)' ? undefined : firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Validate Connection to Firestore
async function testConnection() {
  try {
    // Attempt to read a non-existent document to test connectivity
    // We use a specific path that is allowed in firestore.rules
    await getDocFromServer(doc(db, '_internal_', 'connection_test'));
    console.log("Firestore connection verified.");
  } catch (error) {
    // If we get "Missing or insufficient permissions", it means we successfully
    // reached the Firestore servers, but the rules blocked the read (which is expected if not logged in).
    // This still confirms the configuration is valid.
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes('permission-denied') || errorMessage.includes('Missing or insufficient permissions')) {
      console.log("Firestore connectivity confirmed (reached server).");
    } else if (errorMessage.includes('offline')) {
      console.error("Firestore connectivity failed: Client is offline or project ID is incorrect.");
    } else {
      // For other errors, we log them but don't stop the app
      console.log("Firestore connectivity status:", errorMessage);
    }
  }
}

testConnection();
