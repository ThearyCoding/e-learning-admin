import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBFMiSBy16WC-oNap5CIm9gAinbPdhhMoM",
    authDomain: "elearning-app-a6e15.firebaseapp.com",
    projectId: "elearning-app-a6e15",
    storageBucket: "elearning-app-a6e15.appspot.com",
    messagingSenderId: "958733498686",
    appId: "1:958733498686:web:ddfaf4192c4a5feff0d46f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const usersCollectionRef = collection(db, "users");

// Show and hide the loading spinner
function showLoadingSpinner(show) {
    if (show) {
        $("#loading-spinner").show(); // Show spinner
    } else {
        $("#loading-spinner").hide(); // Hide spinner
    }
}

// Load users from Firestore and display them in a Bootstrap table
async function loadUsers() {
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
                    <td>${data.gender === 1 ? "Male" : "Female" || "No gender provided"}</td>
                </tr>
            `;
            $("#user-table-body").append(userRow); // Append each row to the table body
        });
    } catch (error) {
        console.error("Error fetching users: ", error);
    } finally {
        showLoadingSpinner(false); // Ensure the spinner is hidden after data is loaded
    }
}

// Event listener for "Manage Users" link click
$(document).ready(function() {
    // Call loadUsers when the page is initialized or when the "Manage Users" link is clicked
    if (window.location.hash === "#manage-users") {
        loadUsers(); // Load users on initialization if "Manage Users" is in the URL hash
    }

    $("#manage-users-link").on("click", function() {
        window.location.hash = "manage-users"; // Update URL hash when "Manage Users" link is clicked
        loadUsers(); // Load users when the link is clicked
    });
});
