import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getAuth,
  signOut,
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
const db = getFirestore(app); // Firestore initialization

// Function to fetch admin data
async function fetchAdminData(uid) {
  try {
    const adminDocRef = doc(db, "admins", uid); // Reference to Firestore document
    const adminDoc = await getDoc(adminDocRef);

    if (adminDoc.exists()) {
      return adminDoc.data(); // Return admin data
    } else {
      console.error("Admin document not found.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching admin data:", error);
    return null;
  }
}

// Function to display admin info
function displayAdminInfo(adminData) {
  const adminNameElement = document.getElementById("admin-name");
  const adminImageElement = document.getElementById("admin-image");

  if (adminData) {
    const { fullName, imageUrl } = adminData;

    // Update UI with admin data
    adminNameElement.textContent = fullName || "Admin Name";
    adminImageElement.src = imageUrl || "default-profile.png"; // Default image fallback
  } else {
    adminNameElement.textContent = "Unknown Admin";
    adminImageElement.src = "default-profile.png"; // Default image
  }
}

// Check login status and fetch data
function checkLoginStatus() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const adminData = await fetchAdminData(user.uid);
        displayAdminInfo(adminData); // Display admin info
        resolve(true); // User is logged in
      } else {
        resolve(false); // User is not logged in
      }
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
