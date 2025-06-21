// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBP2odOAzgOUf7XGWedE28ozrzSw2_n_L4",
  authDomain: "longview-fit.firebaseapp.com",
  projectId: "longview-fit",
  storageBucket: "longview-fit.appspot.com",
  messagingSenderId: "464435702331",
  appId: "1:464435702331:web:2dae89c40b22feb7d10a1e",
  measurementId: "G-E6QNSMHTRN"
};

// Initialize Firebase
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const db = getFirestore(app);

