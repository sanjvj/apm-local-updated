import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDeT_hOHZt_aM7ap4zHTy_AFE8SY5ImJbA",
  authDomain: "apm-local-delivery.firebaseapp.com",
  projectId: "apm-local-delivery",
  storageBucket: "apm-local-delivery.firebasestorage.app",
  messagingSenderId: "372098485847",
  appId: "1:372098485847:web:a4e093c8484a12a40e5d12",
  measurementId: "G-DZY0TV3GCQ"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
