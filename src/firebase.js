// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";


const firebaseConfig = {
  apiKey: "AIzaSyA-N0OI-Yd_WUdcZoehf6HidZ39Wh1FGTc",
  authDomain: "blackboybrandth.firebaseapp.com",
  projectId: "blackboybrandth",
  storageBucket: "blackboybrandth.firebasestorage.app",
  messagingSenderId: "850838655224",
  appId: "1:850838655224:web:ec30787a6a613ff4196b0d",
  measurementId: "G-9NWHFWS6JC"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
