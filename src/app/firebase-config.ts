import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyC6jW6S7T7NEocu4KVuyjJTJIOVE5fYONM",
  authDomain: "artor56-b5fc9.firebaseapp.com",
  projectId: "artor56-b5fc9",
  storageBucket: "artor56-b5fc9.firebasestorage.app",
  messagingSenderId: "477054233586",
  appId: "1:477054233586:web:c6691d2bf405cb8c86196b",
  measurementId: "G-S6RCW5KX38",
  databaseURL: "https://artor56-b5fc9.firebaseio.com"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const database = getDatabase(app);
