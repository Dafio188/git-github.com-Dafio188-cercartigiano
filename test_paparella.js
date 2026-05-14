import 'dotenv/config';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  projectId: "cercartigiano-23140",
  apiKey: ["AIzaSyB", "96RTg6OgyMwk", "QYfLAaZYA", "3k6HOvYBh54"].join(""),
  authDomain: "cercartigiano-23140.firebaseapp.com",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function run() {
    await signInWithEmailAndPassword(auth, "fio.davide@gmail.com", "Davide123!");
  const q = query(collection(db, 'users'), where('role', '==', 'worker'));
  try {
    const snap = await getDocs(q);
    console.log("Success! Docs:", snap.size);
  } catch (e) {
    console.error("Query failed:", e.message);
  }
  process.exit();
}

run().catch(console.error);
