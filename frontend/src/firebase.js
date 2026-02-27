import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCdfmTy_-M-0jTHy3zRLEZYUrJcVjCiaLo",
  authDomain: "iit-bhu-healthcare.firebaseapp.com",
  projectId: "iit-bhu-healthcare",
  storageBucket: "iit-bhu-healthcare.firebasestorage.app",
  messagingSenderId: "778672094077",
  appId: "1:778672094077:web:78eeb0826b97f955272a14",
  measurementId: "G-WEV7QN0ZGM"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);