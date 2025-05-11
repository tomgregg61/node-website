// Directives
"use strict";
// Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// Consts
const domEmail = document.getElementById("user-form").elements["email"];
const domError = document.getElementById("error");
const domForm = document.getElementById("user-form");
const domPassword = document.getElementById("user-form").elements["password"];
const domSubmit = document.getElementById("submit-button");
const firebaseCfg = {
  apiKey: "AIzaSyD20UqeEYBt1jffb7jE86D1wMsZCnT7mRs",
  authDomain: "sspa2-a7104.firebaseapp.com",
  projectId: "sspa2-a7104",
  storageBucket: "sspa2-a7104.firebasestorage.app",
  messagingSenderId: "41367424570",
  appId: "1:41367424570:web:585a2c959615f38128ef03",
  measurementId: "G-KD5292LXQ5",
};
// Objects
const firebaseApp = initializeApp(firebaseCfg);
const firebaseAuth = getAuth();

async function sign_in() {
  try {
    const userCredential = await signInWithEmailAndPassword(
      firebaseAuth,
      domEmail.value,
      domPassword.value
    );
    const token = await userCredential.user.getIdToken(true);
    const jsonBody = JSON.stringify({ idToken: token });
    try {
      await fetch("/users/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: jsonBody,
      });
      window.location.replace("/users/welcome");
    } catch (error) {
      console.error(error);
    }
  } catch (error) {
    // Local Variables
    let errMsg;
    switch (error.code) {
      case "auth/user-disabled":
        errMsg = "This account has been disabled";
        break;
      case "auth/wrong-password":
        errMsg = "Email or password is not valid";
        break;
      default:
        errMsg = "Oops! Something went wrong..." + error.code;
        break;
    }
    domError.innerHTML = errMsg;
  }
}

// Listeners
domForm.addEventListener("change", () => {
  domSubmit.disabled = !domForm.checkValidity();
});
domForm.addEventListener("submit", (event) => {
  event.preventDefault();
  sign_in();
});
