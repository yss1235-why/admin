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
  apiKey: "AIzaSyCvP2xYmtArCRGYo-5sN3blRZ_f7DChbLA",
  authDomain: "tambola-b13dc.firebaseapp.com",
  databaseURL: "https://tambola-b13dc-default-rtdb.firebaseio.com",
  projectId: "tambola-b13dc",
  storageBucket: "tambola-b13dc.firebasestorage.app",
  messagingSenderId: "368426861678",
  appId: "1:368426861678:web:27d907f113cb4f9f84d27f",
  measurementId: "G-BRPR34NXX5"
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
