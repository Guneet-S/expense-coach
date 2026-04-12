import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Replace with your Firebase project config
const firebaseConfig = {
  apiKey: "REDACTED_ROTATE_THIS_KEY",
  authDomain: "player-4d1be.firebaseapp.com",
  projectId: "player-4d1be",
  storageBucket: "player-4d1be.firebasestorage.app",
  messagingSenderId: "22783710565",
  appId: "1:22783710565:web:296bf1a1e73883238bbd8c",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
