// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBj5KoygE8YRW8gflBEFh7Tqu5kwegqt9U",
  authDomain: "comicvault-2854f.firebaseapp.com",
  projectId: "comicvault-2854f",
  storageBucket: "comicvault-2854f.firebasestorage.app",
  messagingSenderId: "701353312079",
  appId: "1:701353312079:web:0f2a1d78824fa7f2888f3a",
  measurementId: "G-SBE1446V9L",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export app, analytics or db as needed
export { app, analytics };
