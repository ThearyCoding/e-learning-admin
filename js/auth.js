import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const showLoading = () => {
  document.getElementById("loading-indicator").style.display = "flex";
  document.getElementById("main-content").style.display = "none";
};

const hideLoading = () => {
  document.getElementById("loading-indicator").style.display = "none";
  document.getElementById("main-content").style.display = "block";
};

// Toggle between Login and Sign-Up sections
$("#show-signup").click(() => {
  $("#login-section").addClass("d-none");
  $("#signup-section").removeClass("d-none");
});

$("#show-login").click(() => {
  $("#signup-section").addClass("d-none");
  $("#login-section").removeClass("d-none");
});

// Sign-Up Form Submission
$("#signup-form").submit(async (e) => {
  e.preventDefault();
  const email = $("#signup-email").val();
  const password = $("#signup-password").val();
  showLoading();

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("Sign-Up Successful! You can now log in.");
    $("#show-login").click(); // Switch to login section
  } catch (error) {
    alert(`Error: ${error.message}`);
  } finally {
    hideLoading();
  }
});

// Login Form Submission
$("#login-form").submit(async (e) => {
  e.preventDefault();
  const email = $("#login-email").val();
  const password = $("#login-password").val();
  showLoading();

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userId = userCredential.user.uid;

    // Check if user is already registered
    const userDocRef = doc(db, "admins", userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      alert("Welcome back! Redirecting to Admin Panel...");
      const currentHash = window.location.hash || "#dashboard";
      window.location.href = `admin-panel.html${currentHash}`;
    } else {
      alert("Please complete your registration.");
      window.location.href = "registration-form.html";
    }
  } catch (error) {
    alert(`Error: ${error.message}`);
  } finally {
    hideLoading();
  }
});

// Redirect logged-in users while preserving the current hash
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const currentHash = window.location.hash || "#dashboard"; // Preserve the current hash
    try {
      const userDocRef = doc(db, "admins", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        window.location.href = `admin-panel.html${currentHash}`; // Redirect but keep the hash
      } else {
        window.location.href = "registration-form.html"; // Registration required
      }
    } catch (error) {
      console.error("Error checking user registration status:", error);
    }
  }
});
