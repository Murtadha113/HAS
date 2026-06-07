import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAhI_KxRvP0E2ImnTYoT8OHPTlWlzreY7Y",
  authDomain: "snjami-abaf1.firebaseapp.com",
  projectId: "snjami-abaf1",
  storageBucket: "snjami-abaf1.firebasestorage.app",
  messagingSenderId: "558962944319",
  appId: "1:558962944319:web:04e90d187f59bc4f744b8a",
  measurementId: "G-F5BH8BXG72",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const ADMIN_UID = "mmQUKnpy8tWCatnZKRz947vbiAK2";
