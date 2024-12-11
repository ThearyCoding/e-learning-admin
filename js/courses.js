import { db } from "./firebase-config.js";
import {
  getDocs,
  collectionGroup,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

export async function loadCourses() {
  const courseListDiv = $("#course-list");
  const coursesRef = collectionGroup(db, "courses");
  const coursesSnapshot = await getDocs(coursesRef);
  const courses = coursesSnapshot.docs.map((doc) => doc.data());

  // Clear the loading spinner
  $("#loading-spinner").hide();
  console.table(courses);

  // Create a table for displaying courses
  if (courses.length > 0) {
    let courseTable = `
      <div class="table-container">
        <table class="table table-striped table-hover">
          <thead class="thead-dark">
            <tr>
              <th scope="col">#</th>
              <th scope="col">Course Title</th>
              <th scope="col">Description</th>
              <th scope="col">Price</th>
              <th scope="col">Registrations</th>
              <th scope="col">Category</th>
              <th scope="col">Image</th>
            </tr>
          </thead>
          <tbody>
    `;

    // Populate the table rows with course data
    courses.forEach((course, index) => {
      // Truncate description to first 200 characters
      let truncatedDescription = course.description.slice(0, 200);

      courseTable += `
        <tr>
          <th scope="row">${index + 1}</th>
          <td>${course.title}</td>
          <td class="description">
            <span class="description-text">${truncatedDescription}...</span>
            <span class="full-description" style="display: none;">${course.description}</span>
            <a href="javascript:void(0);" class="read-more">Read More</a>
          </td>
          <td>${course.price ? "$" + course.price : "Free"}</td>
          <td>${course.registerCounts || 0}</td>
          <td>${course.categoryId || "N/A"}</td>
          <td>
            <img src="${course.imageUrl}" alt="Course Image" />
          </td>
        </tr>
      `;
    });

    courseTable += "</tbody></table>"; // Close the table tags
    courseListDiv.html(courseTable); // Insert the table into the page
  } else {
    courseListDiv.html("<p>No courses available.</p>");
  }
}

// Toggle description on "Read More" click
$(document).on("click", ".read-more", function () {
  const $descriptionCell = $(this).closest("td");
  const $shortDescription = $descriptionCell.find(".description-text");
  const $fullDescription = $descriptionCell.find(".full-description");

  // Toggle description visibility
  if ($fullDescription.is(":visible")) {
    $fullDescription.hide();
    $shortDescription.show();
    $(this).text("Read More");
  } else {
    $shortDescription.hide();
    $fullDescription.show();
    $(this).text("Show Less");
  }
});

// Add course button functionality
$("#add-course-btn").on("click", () => {
  // Redirect to add course form or open modal
  window.location.href = "add-course.html"; // Example redirect
});

// Load courses when the page loads
$(document).ready(function () {
   // Call loadUsers when the page is initialized or when the "Manage Users" link is clicked
   if (window.location.hash === "#courses") {
    loadCourses(); // Load users on initialization if "Manage Users" is in the URL hash
  }

  $("#courses-link").on("click", function () {
    if (window.location.hash !== "#courses") {
      window.location.hash = "courses"; // Update URL hash
      loadCourses(); // Load users when the link is clicked
    }
  });
});
