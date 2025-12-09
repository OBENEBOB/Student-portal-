import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyB375LVewbh0oMrpz8zceQtdVN6FM8KzAg",
    authDomain: "formlogin-6d888.firebaseapp.com",
    projectId: "formlogin-6d888",
    storageBucket: "formlogin-6d888.appspot.com",
    messagingSenderId: "418842419948",
    appId: "1:418842419948:web:a5c5d87f8a8d364b7afbc9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore();

const loggedInUserId = localStorage.getItem('loggedInUserId');

if (!loggedInUserId) {
    alert("You are not logged in!");
    window.location.href = "index.html";
}

// Load user data into form
if (loggedInUserId) {
    const docRef = doc(db, "users", loggedInUserId);
    getDoc(docRef).then(docSnap => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            document.getElementById('fNameProfile').value = data.firstName;
            document.getElementById('lNameProfile').value = data.lastName;
            document.getElementById('schoolIdProfile').value = data.schoolId || '';
            document.getElementById('programProfile').value = data.program || '';

            // Load avatar from Firestore
            document.getElementById('avatarPreviewProfile').src = data.avatarURL || 'default-avatar.png';
        }
    }).catch(console.error);
}

// Preview avatar before saving
let selectedAvatarData = null;
document.getElementById('avatarProfile').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
            selectedAvatarData = evt.target.result; // save for upload
            document.getElementById('avatarPreviewProfile').src = selectedAvatarData;
        }
        reader.readAsDataURL(file);
    }
});

// Save changes
document.getElementById('profileForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const fName = document.getElementById('fNameProfile').value;
    const lName = document.getElementById('lNameProfile').value;
    const schoolId = document.getElementById('schoolIdProfile').value;
    const program = document.getElementById('programProfile').value;

    const docRef = doc(db, "users", loggedInUserId);

    try {
        const updateData = {
            firstName: fName,
            lastName: lName,
            schoolId: schoolId,
            program: program
        };

        // If a new avatar is selected, add avatarURL to update
        if (selectedAvatarData) {
            updateData.avatarURL = selectedAvatarData;
        }

        await updateDoc(docRef, updateData);

        alert("Profile updated successfully!");
        window.location.href = "homepage.html";
    } catch (err) {
        console.error(err);
        alert("Error updating profile!");
    }
});
