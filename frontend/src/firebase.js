import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCdfmTy_-M-0jThy3zRLEZYUrJcVjCiaLo",
  authDomain: "iit-bhu-healthcare.firebaseapp.com",
  projectId: "iit-bhu-healthcare",
  storageBucket: "iit-bhu-healthcare.firebasestorage.app",
  messagingSenderId: "778672094077",
  appId: "1:778672094077:web:78eeb0826b97f955272a14"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);