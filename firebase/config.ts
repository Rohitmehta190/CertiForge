// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCDu_wGX--VXuMRSqC0-X_H625IEW5Gdx0",
  authDomain: "certiforge.firebaseapp.com",
  projectId: "certiforge",
  storageBucket: "certiforge.firebasestorage.app",
  messagingSenderId: "25540571601",
  appId: "1:25540571601:web:2e4d5b7a341a4bd655f0f0",
  measurementId: "G-LDB89E4899"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;