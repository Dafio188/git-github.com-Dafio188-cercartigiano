import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "cercartigiano-23140",
  apiKey: ["AIzaSyB", "96RTg6OgyMwk", "QYfLAaZYA", "3k6HOvYBh54"].join(""),
  authDomain: "cercartigiano-23140.firebaseapp.com",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const q = query(collection(db, 'users'));
  const snap = await getDocs(q);
  const users = snap.docs.map(d => ({id: d.id, ...d.data()}));
  const paparella = users.find(u => u.nome?.toLowerCase().includes('paparella') || u.email?.toLowerCase().includes('paparella'));
  console.log(JSON.stringify(paparella, null, 2));

  const verifications = await getDocs(collection(db, 'verifications'));
  const paparellaVerif = verifications.docs.find(d => d.id === paparella?.id || d.data().userId === paparella?.id);
  console.log("Verification:");
  console.log(JSON.stringify(paparellaVerif?.data() || null, null, 2));
}

run().catch(console.error);
