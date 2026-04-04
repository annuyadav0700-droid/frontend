import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; 

const firebaseConfig = {
  apiKey: "AIzaSyBC24HeIyB9dLGUCK6PemTzN4Jeu22AGWU",
  authDomain: "a4station-20b54.firebaseapp.com",
  projectId: "a4station-20b54",
  storageBucket: "a4station-20b54.firebasestorage.app",
  messagingSenderId: "426677450769",
  appId: "1:426677450769:web:799be3af7aeeeef6af59b0",
  measurementId: "G-X31ZG8DZHZ"
  
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);