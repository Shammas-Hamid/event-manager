import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyArBpoCrhPmtn_vThPbux5Yu_S1rHWVWMw",
  authDomain: "event-manager-73985.firebaseapp.com",
  projectId: "event-manager-73985",
  storageBucket: "event-manager-73985.firebasestorage.app",
  messagingSenderId: "866351811869",
  appId: "1:866351811869:web:fa50ed09e13e480a9925f4",
  measurementId: "G-TJ32BHK7GJ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);