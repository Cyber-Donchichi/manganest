import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.2.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDMs_QBPLVwlASvATiwRK-Qd9SuqiEPqDc",
  authDomain: "manganest343632.firebaseapp.com",
  projectId: "manganest343632",
  storageBucket: "manganest343632.firebasestorage.app",
  messagingSenderId: "973182891353",
  appId: "1:973182891353:web:b061877af98ee34220c848",
  measurementId: "G-M7EGCX0BNH"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", () => {
  const profileImage = document.getElementById("profile-image");
  const userName = document.getElementById("user-name");
  const userEmail = document.getElementById("user-email");
  const logoutBtn = document.getElementById("logout-btn");

  onAuthStateChanged(auth, (user) => {
    if (user) {
      const name = user.displayName || "Guest";
      const email = user.email || "No Email";

      userName.textContent = name;
      userEmail.textContent = email;

      if (user.photoURL) {
        profileImage.innerHTML = `<img src="${user.photoURL}" alt="${name}">`;
      } else {
        // Default avatar with first letter
        profileImage.textContent = name.charAt(0).toUpperCase();
      }
    } else {
      userName.textContent = "Guest";
      userEmail.textContent = "Not logged in";
      profileImage.textContent = "G";
    }
  });

  logoutBtn.addEventListener("click", () => {
    signOut(auth).then(() => {
      window.location.href = "signup.html";
    });
  });
});