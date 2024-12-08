import { auth } from "./firebase-config.js";
import {
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

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

// Function to refresh or reload the page on sidebar link click
function setupSidebarLinks() {
  const sidebarLinks = document.querySelectorAll("#sidebar a");

  sidebarLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault(); // Prevent default anchor behavior

      const section = link.getAttribute("href").replace("#", "");
      // Set the hash in the URL and reload the page
      window.location.hash = section;
      window.location.reload(); // Reload the entire page
    });
  });
}

// Load the appropriate content when the hash changes
$(window).on("hashchange", handleRoute);

// Initial setup on page load
$(document).ready(function () {
  handleRoute(); // Handle routing logic
  setupSidebarLinks(); // Setup sidebar link reloading
});
