import { db } from "./firebase-config.js";
import {
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const usersCollectionRef = collection(db, "users");
let isLoading = false; // Flag to track loading state

// Show and hide the loading spinner
function showLoadingSpinner(show) {
  const spinner = $("#loading-spinner");
  if (show) {
    spinner.show(); // Show spinner
  } else {
    spinner.hide(); // Hide spinner
  }
}



// Load users from Firestore and display them in a Bootstrap table
export async function loadUsers() {
  if (isLoading) {
    // Prevent multiple calls while loading
    console.log("Loading in progress. Skipping duplicate call.");
    return;
  }

  isLoading = true; // Set loading flag to true
  showLoadingSpinner(true); // Show spinner when fetching data

  try {
    const querySnapshot = await getDocs(usersCollectionRef);
    const userList = $("#user-list");
    userList.empty(); // Clear existing table content

    // Create table structure
    const table = `
            <table class="table table-bordered">
                <thead>
                    <tr>
                        <th>Full Name</th>
                        <th>Email</th>
                        <th>Gender</th>
                    </tr>
                </thead>
                <tbody id="user-table-body">
                </tbody>
            </table>
        `;
    userList.append(table); // Append the table to the user list container

    // Populate table with user data
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const userRow = `
                <tr>
                    <td>${data.fullName}</td>
                    <td>${data.email || "No email provided"}</td>
                    <td>${
                      data.gender === 1
                        ? "Male"
                        : "Female" || "No gender provided"
                    }</td>
                </tr>
            `;
      $("#user-table-body").append(userRow); // Append each row to the table body
    });
  } catch (error) {
    console.error("Error fetching users: ", error);
  } finally {
    showLoadingSpinner(false); // Ensure the spinner is hidden after data is loaded
    isLoading = false; // Reset loading flag
  }
}

// Event listener for "Manage Users" link click
$(document).ready(function () {
  // Call loadUsers when the page is initialized or when the "Manage Users" link is clicked
  if (window.location.hash === "#manage-users") {
    loadUsers(); // Load users on initialization if "Manage Users" is in the URL hash
  }

  $("#manage-users-link").on("click", function () {
    if (window.location.hash !== "#manage-users") {
      window.location.hash = "manage-users"; // Update URL hash
      loadUsers(); // Load users when the link is clicked
    }
  });
});
