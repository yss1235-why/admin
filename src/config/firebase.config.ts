import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getAnalytics } from 'firebase/analytics';

// Types for our application
export interface Admin {
  username: string;
  role: 'admin';
  lastLogin: number;
}

export interface Host {
  username: string;
  status: 'active' | 'inactive';
  subscriptionEnd: number;
  lastLogin: number;
  email: string;
  role: 'host';
}

export interface AuthError {
  code: string;
  message: string;
}

// Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyCH2WtQ2y3ln8ToHcapIsEMIXJ78Hsg7Bg",
  authDomain: "tambola-74046.firebaseapp.com",
  databaseURL: "https://tambola-74046-default-rtdb.firebaseio.com",
  projectId: "tambola-74046",
  storageBucket: "tambola-74046.firebasestorage.app",
  messagingSenderId: "310265084192",
  appId: "1:310265084192:web:c044bf9b83c444f4a2ff45",
  measurementId: "G-MP72F136BH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const database = getDatabase(app);
export const analytics = getAnalytics(app);

// Admin UID constant
export const ADMIN_UID = 'LH0I3s7TTSg37G0a9X14NFW8uzF2';

// Custom hook for authentication state
export const useFirebaseAuth = () => {
  const auth = getAuth();
  return auth;
};

// Export the Firebase app instance
export default app;