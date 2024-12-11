import { db } from "./firebase-config.js";
import {
  getDocs,
  collectionGroup,
  query,
  limit,
  startAfter,
  endBefore,
  orderBy
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Set initial page and limit
let currentPage = 1; // Current page
const coursesPerPage = 2; // Number of courses per page
let lastVisible = null; // Keep track of the last document from the next page
let firstVisible = null; // Keep track of the first document from the previous page
let totalPages = 0; // Total number of pages

// Function to load courses from Firestore with pagination
export async function loadCourses() {
  const courseListDiv = $("#course-list");

  // Show loading spinner
  $("#loading-spinner").show();

  // Fetch the total number of courses for pagination
  const totalCoursesSnapshot = await getDocs(collectionGroup(db, "courses"));
  const totalCourses = totalCoursesSnapshot.size;
  totalPages = Math.ceil(totalCourses / coursesPerPage); // Calculate total pages

  // Create the query for pagination: limit number of results
  let coursesQuery = query(collectionGroup(db, "courses"), orderBy("title"), limit(coursesPerPage));

  // If we are not on the first page, use startAfter to set the starting point from the last document
  if (currentPage > 1 && lastVisible) {
    coursesQuery = query(coursesQuery, startAfter(lastVisible));
  } else if (currentPage < 1 && firstVisible) {
    coursesQuery = query(coursesQuery, endBefore(firstVisible));
  }

  // Fetch the documents using the query
  const coursesSnapshot = await getDocs(coursesQuery);
  const courses = coursesSnapshot.docs.map((doc) => doc.data());

  // Update the last visible document
  if (coursesSnapshot.docs.length > 0) {
    lastVisible = coursesSnapshot.docs[coursesSnapshot.docs.length - 1]; // Update the last visible document
    firstVisible = coursesSnapshot.docs[0]; // Update the first visible document
  }

  // Hide the loading spinner after data is fetched
  $("#loading-spinner").hide();

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
      let truncatedDescription = course.description.slice(0, 200);

      courseTable += `
        <tr>
          <th scope="row">${(currentPage - 1) * coursesPerPage + index + 1}</th>
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

  // Pagination controls
  let paginationControls = `<nav aria-label="Page navigation"><ul class="pagination">`;

  // Previous button
  paginationControls += `
    <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
      <button class="page-link" id="prev-page">Previous</button>
    </li>
  `;

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    paginationControls += `
      <li class="page-item ${currentPage === i ? 'active' : ''}">
        <button class="page-link" data-page="${i}">${i}</button>
      </li>
    `;
  }

  // Next button
  paginationControls += `
    <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
      <button class="page-link" id="next-page">Next</button>
    </li>
  `;

  paginationControls += `</ul></nav>`;

  // Append pagination controls
  courseListDiv.append(paginationControls);
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

// Handle pagination button clicks
$(document).on("click", ".page-link", function () {
  const page = $(this).data("page");

  if (page) {
    currentPage = page;
  } else if ($(this).attr("id") === "prev-page" && currentPage > 1) {
    currentPage--;
  } else if ($(this).attr("id") === "next-page" && currentPage < totalPages) {
    currentPage++;
  }

  loadCourses();
});

// Add course button functionality
$("#add-course-btn").on("click", () => {
  // Redirect to add course form or open modal
  window.location.href = "add-course.html"; // Example redirect
});

// Load courses when the page loads
$(document).ready(function () {
  loadCourses(); // Load courses when the page is initialized
});
