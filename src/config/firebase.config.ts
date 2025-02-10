import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

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
const firebaseConfig = {
  apiKey: "AIzaSyBPUX2IuH3HyV2QBzZz0G-XbbMRWCbhKGg",
  authDomain: "webapp-610c6.firebaseapp.com",
  databaseURL: "https://webapp-610c6-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "webapp-610c6",
  storageBucket: "webapp-610c6.firebasestorage.app",
  messagingSenderId: "106228192027",
  appId: "1:106228192027:web:e71a69cb2e99052f8879be"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const database = getDatabase(app);

// Custom hook for authentication state
export const useFirebaseAuth = () => {
  const auth = getAuth();
  return auth;
};

// Export the Firebase app instance
export default app;