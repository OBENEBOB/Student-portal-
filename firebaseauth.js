// firebaseauth.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { 
  getFirestore, 
  setDoc, 
  doc, 
  getDoc 
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// ---------------------
// Firebase config
// ---------------------
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

// ---------------------
// Show messages helper
// ---------------------
function showMessage(message, divId) {
  const messageDiv = document.getElementById(divId);
  messageDiv.style.display = "block";
  messageDiv.innerText = message;
  messageDiv.style.opacity = 1;
  setTimeout(() => {
    messageDiv.style.opacity = 0;
  }, 5000);
}

// ---------------------
// Convert file to Base64
// ---------------------
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

// ---------------------
// SIGNUP
// ---------------------
const signUpBtn = document.getElementById('submitSignUp');
signUpBtn.addEventListener('click', async (event) => {
  event.preventDefault();

  const email = document.getElementById('rEmail').value.trim();
  const password = document.getElementById('rPassword').value.trim();
  const firstName = document.getElementById('fName').value.trim();
  const lastName = document.getElementById('lName').value.trim();
  const schoolId = document.getElementById('schoolId').value.trim();
  const program = document.getElementById('program').value.trim();

  const avatarFile = document.getElementById('avatarProfile')?.files[0];
  let avatarData = "";

  if (avatarFile) {
    avatarData = await fileToBase64(avatarFile);
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userData = {
      email,
      firstName,
      lastName,
      schoolId,
      program,
      role: "student",
      avatarURL: avatarData || "default-avatar.png",
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, "users", user.uid), userData);

    localStorage.setItem(`avatar_${user.uid}`, userData.avatarURL);

    showMessage("Account Created Successfully", "signUpMessage");
    setTimeout(() => { window.location.href = "index.html"; }, 1000);

  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      showMessage('Email Already Exists', 'signUpMessage');
    } else {
      showMessage('Unable to create account', 'signUpMessage');
    }
    console.error(error);
  }
});

// ---------------------
// LOGIN
// ---------------------
const signInBtn = document.getElementById('submitSignIn');
signInBtn.addEventListener('click', async (event) => {
  event.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get Firestore user data
    const userDocRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) {
      showMessage('User data not found', 'signInMessage');
      return;
    }

    const userData = userSnap.data();
    localStorage.setItem('loggedInUserId', user.uid);

    showMessage("Login Successful", "signInMessage");

    // Redirect based on role
    if (userData.role === "admin") {
      setTimeout(() => { window.location.href = "admin.html"; }, 800);
    } else {
      setTimeout(() => { window.location.href = "homepage.html"; }, 800);
    }

  } catch (error) {
    console.error(error);
    if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
      showMessage('Incorrect Email or Password', 'signInMessage');
    } else {
      showMessage('Login failed: ' + error.message, 'signInMessage');
    }
  }
});

// ---------------------
// LOGOUT
// ---------------------
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    localStorage.removeItem('loggedInUserId');
    await signOut(auth);
    window.location.href = "index.html";
  });
}
