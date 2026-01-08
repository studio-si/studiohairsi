// Modular Firebase v9+ configuration for hair salon app
// Fixed: Using double quotes for module imports to resolve potential environment resolution issues
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCLX9AolA0lByIMrtZ1Lb5nP76sTW-8y2Q",
  authDomain: "studiohair-simone.firebaseapp.com",
  projectId: "studiohair-simone",
  storageBucket: "studiohair-simone.firebasestorage.app",
  messagingSenderId: "138220385140",
  appId: "1:138220385140:web:e7900dd12d957d3777f221"
};

// Initialize Firebase using the modular SDK
const app = initializeApp(firebaseConfig);

// Export modular Firestore instance for use throughout the application
export const db = getFirestore(app);