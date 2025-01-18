import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBV4jo0KYUMHuS4ZcharvN0b_ha9yV8X-U",
  authDomain: "laundry-management-e2955.firebaseapp.com",
  projectId: "laundry-management-e2955",
  storageBucket: "laundry-management-e2955.firebasestorage.app",
  messagingSenderId: "501221279116",
  appId: "1:501221279116:web:51438e8f078826e0f582a9",
  measurementId: "G-T5MHN0C9S3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
