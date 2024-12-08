import { auth, db, storage } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  doc,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";

// Ensure user is logged in
onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("You must be logged in to complete the registration.");
    window.location.href = "auth-panel.html";
  }
});

// Form submission
document
  .getElementById("registration-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const fullName = document.getElementById("full-name").value;
    const phoneNumber = document.getElementById("phone-number").value;
    const profileImage = document.getElementById("profile-image").files[0];

    if (!profileImage) {
      alert("Please upload a profile image.");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        alert("User is not logged in!");
        return;
      }

      const userDocRef = doc(db, "admins", user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        alert("User is already registered. Redirecting to admin panel...");
        window.location.href = "admin-panel.html";
        return;
      }

      // Progress Bar UI
      let progressBar = document.createElement("div");
      progressBar.classList.add("progress", "mt-3");
      progressBar.innerHTML = `<div class="progress-bar" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>`;
      document.querySelector(".form-container").appendChild(progressBar);
      const progressBarElement = progressBar.querySelector(".progress-bar");

      // Upload profile image
      const storageRef = ref(storage, `admin-images/${user.uid}`);
      const uploadTask = uploadBytesResumable(storageRef, profileImage);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          progressBarElement.style.width = `${progress}%`;
          progressBarElement.setAttribute("aria-valuenow", progress.toFixed(0));
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          console.error("Upload failed:", error);
          alert(
            "An error occurred while uploading the image. Please try again."
          );
          progressBar.remove();
        },
        async () => {
          // Upload complete
          const imageUrl = await getDownloadURL(storageRef);

          // Save user data to Firestore
          await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            firstName: fullName.split(" ")[0],
            lastName: fullName.split(" ").slice(1).join(" "),
            fullName,
            phoneNumber,
            imageUrl,
            role: "regular_admin",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            approved: false,
          });

          alert("Registration complete! Redirecting to admin panel...");
          window.location.href = "admin-panel.html";
          progressBar.remove();
        }
      );
    } catch (error) {
      console.error("Error during registration:", error);
      alert("An error occurred. Please try again.");
    }
  });
