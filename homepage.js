// homepage.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB375LVewbh0oMrpz8zceQtdVN6FM8KzAg",
  authDomain: "formlogin-6d888.firebaseapp.com",
  projectId: "formlogin-6d888",
  storageBucket: "formlogin-6d888.appspot.com",
  messagingSenderId: "418842419948",
  appId: "1:418842419948:web:a5c5d87f8a8d364b7afbc9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

// Get the logged-in user ID
const loggedInUserId = localStorage.getItem("loggedInUserId");

if (!loggedInUserId) {
  window.location.href = "index.html";
} else {
  const docRef = doc(db, "users", loggedInUserId);

  getDoc(docRef)
    .then((docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();

        // Fill user info
        document.getElementById("loggedUserFullName").innerText = 
          `${data.firstName || ""} ${data.lastName || ""}`;

        document.getElementById("loggedUserSchoolId").innerText = data.schoolId || "";
        document.getElementById("loggedUserProgram").innerText = data.program || "";
        document.getElementById("loggedUserEmail").innerText = data.email || "";

        // ----------- AVATAR FIXED ✔ -----------
        // Load avatar from Firestore OR localStorage OR default
        const storedLocalAvatar = localStorage.getItem(`avatar_${loggedInUserId}`);
        const finalAvatar = data.avatarURL || storedLocalAvatar || "default-avatar.png";

        document.getElementById("avatarPreviewHomepage").src = finalAvatar;

        // Save latest avatar to localStorage
        if (data.avatarURL) {
          localStorage.setItem(`avatar_${loggedInUserId}`, data.avatarURL);
        }
      } else {
        console.log("User document not found!");
      }
    })
    .catch((err) => console.error("Error getting document:", err));
}

// ---------------- LOGOUT ----------------
document.getElementById("logout").addEventListener("click", () => {
  localStorage.removeItem("loggedInUserId");
  signOut(auth)
    .then(() => (window.location.href = "index.html"))
    .catch((error) => console.error("Error signing out:", error));
});
