// -------------------------------
// ADMIN PAGE – FULL BASE64 AVATAR SUPPORT
// -------------------------------

import { 
  getFirestore, collection, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where 
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { 
  getAuth, signOut, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";

// -------------------------------
// FIREBASE CONFIG
// -------------------------------
const firebaseConfig = {
    apiKey: "AIzaSyB375LVewbh0oMrpz8zceQtdVN6FM8KzAg",
    authDomain: "formlogin-6d888.firebaseapp.com",
    projectId: "formlogin-6d888",
    storageBucket: "formlogin-6d888.appspot.com",
    messagingSenderId: "418842419948",
    appId: "1:418842419948:web:a5c5d87f8a8d364b7afbc9"
};

initializeApp(firebaseConfig);

const db = getFirestore();
const auth = getAuth();

// -------------------------------
// DOM ELEMENTS
// -------------------------------
const tableBody = document.getElementById("studentsTableBody");
const modal = document.getElementById("modalBackdrop");
const closeModalBtn = document.getElementById("closeModal");
const cancelEditBtn = document.getElementById("cancelEdit");
const editForm = document.getElementById("editStudentForm");
const adminEmailSpan = document.getElementById("adminEmail");

let currentEditingId = null;

// -------------------------------
// CHECK LOGGED-IN ADMIN
// -------------------------------
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  try {
    const userDocRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists() || userSnap.data().role !== "admin") {
      window.location.href = "homepage.html";
      return;
    }

    adminEmailSpan.innerText = user.email;
    loadStudents();

  } catch (error) {
    console.error("Error checking admin:", error);
    window.location.href = "index.html";
  }
});

// -------------------------------
// LOAD STUDENTS
// -------------------------------
async function loadStudents() {
  tableBody.innerHTML = "";

  try {
    const studentsQuery = query(collection(db, "users"), where("role", "==", "student"));
    const querySnapshot = await getDocs(studentsQuery);

    if (querySnapshot.empty) {
      tableBody.innerHTML = "<tr><td colspan='7'>No students found.</td></tr>";
      document.getElementById("totalStudents").innerText = "0";
      return;
    }

    querySnapshot.forEach((studentDoc) => {
      const data = studentDoc.data();
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td><img src="${data.avatarURL || 'default-avatar.png'}" width="50" height="50" style="border-radius:50%;"></td>
        <td>${data.firstName || ""} ${data.lastName || ""}</td>
        <td>${data.email || ""}</td>
        <td>${data.schoolId || ""}</td>
        <td>${data.program || ""}</td>
        <td>${data.role || "student"}</td>
        <td>
          <button class="edit-btn" data-id="${studentDoc.id}">Edit</button>
          <button class="delete-btn" data-id="${studentDoc.id}">Delete</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });

    attachButtons();
    document.getElementById("totalStudents").innerText = querySnapshot.size;

  } catch (err) {
    console.error(err);
    alert("Error loading students!");
  }
}

// -------------------------------
// ATTACH EDIT + DELETE BUTTONS
// -------------------------------
function attachButtons() {
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", () => deleteStudent(btn.dataset.id));
  });

  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.addEventListener("click", () => openEditModal(btn.dataset.id));
  });
}

// -------------------------------
// DELETE STUDENT
// -------------------------------
async function deleteStudent(studentId) {
  if (!confirm("Are you sure you want to delete this student?")) return;

  try {
    await deleteDoc(doc(db, "users", studentId));
    alert("Student deleted successfully.");
    loadStudents();
  } catch (err) {
    console.error(err);
    alert("Error deleting student!");
  }
}

// -------------------------------
// OPEN EDIT MODAL
// -------------------------------
async function openEditModal(studentId) {
  currentEditingId = studentId;
  modal.style.display = "flex";

  const studentDocRef = doc(db, "users", studentId);
  const studentSnap = await getDoc(studentDocRef);

  if (studentSnap.exists()) {
    const data = studentSnap.data();
    document.getElementById("editFirstName").value = data.firstName || "";
    document.getElementById("editLastName").value = data.lastName || "";
    document.getElementById("editEmail").value = data.email || "";
    document.getElementById("editSchoolId").value = data.schoolId || "";
    document.getElementById("editProgram").value = data.program || "";
    document.getElementById("editRole").value = data.role || "student";
    document.getElementById("editAvatarPreview").src = data.avatarURL || "default-avatar.png";
  }
}

// -------------------------------
// CLOSE MODAL
// -------------------------------
closeModalBtn.addEventListener("click", () => { modal.style.display = "none"; });
cancelEditBtn.addEventListener("click", () => { modal.style.display = "none"; });
modal.addEventListener("click", (e) => { if (e.target === modal) modal.style.display = "none"; });

// -------------------------------
// AVATAR PREVIEW (BASE64)
// -------------------------------
document.getElementById("editAvatar").addEventListener("change", function(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(evt) {
      document.getElementById("editAvatarPreview").src = evt.target.result;
    };
    reader.readAsDataURL(file);
  }
});

// -------------------------------
// SAVE EDITED STUDENT
// -------------------------------
editForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!currentEditingId) return;

  try {
    const avatarURL = document.getElementById("editAvatarPreview").src;

    const updatedData = {
      firstName: document.getElementById("editFirstName").value,
      lastName: document.getElementById("editLastName").value,
      schoolId: document.getElementById("editSchoolId").value,
      program: document.getElementById("editProgram").value,
      role: document.getElementById("editRole").value,
      avatarURL: avatarURL // save base64 directly
    };

    await updateDoc(doc(db, "users", currentEditingId), updatedData);

    modal.style.display = "none";
    loadStudents();

  } catch (err) {
    console.error("Update error:", err);
    alert("Error updating student! See console for details.");
  }
});

// -------------------------------
// LOGOUT
// -------------------------------
document.getElementById("logoutBtn").addEventListener("click", () => {
  signOut(auth).then(() => {
    localStorage.removeItem("loggedInUserId");
    window.location.href = "index.html";
  });
});

// Make loadStudents accessible for search script
window.loadStudents = loadStudents;