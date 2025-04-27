// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBrNfBr1BPUwloxN9RXXuGNftjyoXECHNY",
  authDomain: "myapplication-93b38.firebaseapp.com",
  projectId: "myapplication-93b38",
  storageBucket: "myapplication-93b38.firebasestorage.app",
  messagingSenderId: "440623361038",
  appId: "1:440623361038:web:eb34e2db71c5987b07605f",
  measurementId: "G-LFWK0BGHX5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
let analytics;

// Only initialize analytics in browser environment
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged };
export default app;