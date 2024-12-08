import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBFMiSBy16WC-oNap5CIm9gAinbPdhhMoM",
  authDomain: "elearning-app-a6e15.firebaseapp.com",
  projectId: "elearning-app-a6e15",
  storageBucket: "elearning-app-a6e15.appspot.com",
  messagingSenderId: "958733498686",
  appId: "1:958733498686:web:ddfaf4192c4a5feff0d46f",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
