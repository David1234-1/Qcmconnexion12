import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCqGSBrsJ-7PIpfjAM58gD8h4VcY793rWQ",
  authDomain: "studyhub-proje.firebaseapp.com",
  projectId: "studyhub-proje",
  storageBucket: "studyhub-proje.appspot.com",
  messagingSenderId: "359347355393",
  appId: "1:359347355393:web:8c05ede417c10c272d6500",
  measurementId: "G-DMQJNJW9S0"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Elements
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");
const forgotBtn = document.getElementById("forgot-btn");
const googleBtn = document.getElementById("google-btn");
const messageDiv = document.getElementById("message");

const resetPopup = document.getElementById("reset-popup");
const resetEmailInput = document.getElementById("reset-email");
const resetSendBtn = document.getElementById("reset-send-btn");
const resetCancelBtn = document.getElementById("reset-cancel-btn");
const overlay = document.getElementById("overlay");

// Functions
function showMessage(msg, success = false) {
  messageDiv.textContent = msg;
  messageDiv.style.color = success ? "green" : "red";
}

// Auth logic
loginBtn.onclick = () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) return showMessage("Remplis tous les champs");

  signInWithEmailAndPassword(auth, email, password)
    .then(() => showMessage("Connexion réussie ✅", true))
    .catch(err => showMessage("❌ " + err.message));
};

registerBtn.onclick = () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) return showMessage("Remplis tous les champs");

  createUserWithEmailAndPassword(auth, email, password)
    .then(() => showMessage("Compte créé avec succès ✅", true))
    .catch(err => showMessage("❌ " + err.message));
};

forgotBtn.onclick = () => {
  resetPopup.style.display = "block";
  overlay.style.display = "block";
};

resetSendBtn.onclick = () => {
  const email = resetEmailInput.value.trim();
  if (!email) return showMessage("Saisis ton e-mail");

  sendPasswordResetEmail(auth, email)
    .then(() => {
      showMessage("✉️ Lien envoyé. Vérifie tes mails et tes spams ✅", true);
      resetPopup.style.display = "none";
      overlay.style.display = "none";
      resetEmailInput.value = "";
    })
    .catch(err => showMessage("❌ " + err.message));
};

resetCancelBtn.onclick = () => {
  resetPopup.style.display = "none";
  overlay.style.display = "none";
  resetEmailInput.value = "";
};

googleBtn.onclick = () => {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then(() => showMessage("Connecté avec Google ✅", true))
    .catch(err => showMessage("❌ " + err.message));
};
