import { initializeApp } from "https://www.gstatic.com/firebasejs/13.3.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/13.3.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/13.3.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/13.3.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyD39Chgyryxh-wNlIxILVZ2yuXwXDLtJng",
  authDomain: "raina-jewellery.firebaseapp.com",
  projectId: "raina-jewellery",
  storageBucket: "raina-jewellery.firebasestorage.app",
  messagingSenderId: "579845499007",
  appId: "1:579845499007:web:917178c935e300caca774a",
  measurementId: "G-34W4VGGTSE"
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
