import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getAuth,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

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

// Function to check login status
function checkLoginStatus() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      resolve(!!user); // Resolve true if user is logged in, else false
    });
  });
}

// Logout functionality
const logoutLink = document.getElementById("logout-link");
if (logoutLink) {
  logoutLink.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      await signOut(auth);
      alert("You have been logged out successfully.");
      window.location.href = "index.html"; // Redirect to login
    } catch (error) {
      console.error("Error during logout:", error);
      alert("An error occurred while logging out. Please try again.");
    }
  });
}

// Dynamically load HTML content for each section
async function loadContent(section) {
  const isLoggedIn = await checkLoginStatus();
  if (!isLoggedIn) {
    alert("You need to log in to access this section.");
    window.location.href = "index.html"; // Redirect unauthorized user to login
    return;
  }

  const contentArea = $("#content-area");
  contentArea.html(
    '<div class="spinner-border text-primary" role="status"></div>'
  ); // Show loading spinner

  // Load the appropriate section file
  $.ajax(`html/${section}.html`)
    .done(function (data) {
      contentArea.html(data); // Insert the loaded content into the main container
      if (section === "dashboard") {
        renderDashboardChart();
      } else if (section === "manage-users") {
        loadUsers();
      }
    })
    .fail(function () {
      contentArea.html(
        '<p class="text-danger">Failed to load content. Please try again later.</p>'
      );
    });
}

// Initialize the page based on the hash
async function handleRoute() {
  const isLoggedIn = await checkLoginStatus();
  if (!isLoggedIn) {
    alert("You need to log in to access this section.");
    window.location.href = "index.html"; // Redirect unauthorized user to login
    return;
  }

  const hash = window.location.hash.replace("#", "") || "dashboard"; // Default to dashboard
  loadContent(hash);
  setActiveLink(hash + "-link"); // Update the active link
}

// Function to set the active link in the sidebar
function setActiveLink(id) {
  $("#sidebar a").removeClass("active");
  $("#" + id).addClass("active");
}

// Load the appropriate content when the hash changes
$(window).on("hashchange", handleRoute);

// Initial setup on page load
$(document).ready(function () {
  handleRoute();
});
