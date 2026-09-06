// Firebase project config for "Mandarmani Vacation Qualifier"
// This same file is shared by index.html (public form) and admin.html.

const firebaseConfig = {
  apiKey: "AIzaSyCukTpSG0yAie17knrPfrpcLjeCQ4bGQg0",
  authDomain: "vacations-b8cd4.firebaseapp.com",
  projectId: "vacations-b8cd4",
  storageBucket: "vacations-b8cd4.firebasestorage.app",
  messagingSenderId: "459203776954",
  appId: "1:459203776954:web:542e13ec9bc0f2055a0d83"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
// index.html doesn't load the Auth SDK (it doesn't need sign-in), so only
// set up auth when that script is actually present — avoids crashing the
// public registration page.
const auth = (typeof firebase.auth === "function") ? firebase.auth() : null;
