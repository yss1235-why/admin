import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { ref, get, set } from 'firebase/database';
import { auth, database, ADMIN_UID } from '../config/firebase.config';

interface AuthContextType {
  currentUser: User | null;
  adminData: any | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

interface AdminData {
  email: string;
  lastLogin: number;
  role: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const verifyAdminAccess = async (user: User) => {
    try {
      // First, check if this is the predefined admin UID
      if (user.uid === ADMIN_UID) {
        // For the predefined admin UID, create or update admin record directly
        const adminRecord = {
          username: user.email?.split('@')[0] || 'admin',
          role: 'admin',
          lastLogin: Date.now()
        };
        
        // Write admin record to database
        await set(ref(database, `admins/${user.uid}`), adminRecord);
        console.log('Admin verification successful for predefined admin:', adminRecord);
        return adminRecord;
      }
      
      // For other users, check admin status
      const adminsRef = ref(database, `admins/${user.uid}`);
      const snapshot = await get(adminsRef);

      if (!snapshot.exists()) {
        console.error('No admin record found for user:', user.uid);
        throw new Error('No admin record found');
      }

      const adminRecord = snapshot.val();
      if (adminRecord.role !== 'admin') {
        console.error('Invalid admin role for user:', user.uid);
        throw new Error('Invalid admin role');
      }

      // Update lastLogin timestamp
      await set(ref(database, `admins/${user.uid}`), {
        ...adminRecord,
        lastLogin: Date.now()
      });

      console.log('Admin verification successful:', adminRecord);
      return adminRecord;
    } catch (error) {
      console.error('Admin verification failed:', error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      setError(null);
      
      try {
        if (user) {
          console.log('User authenticated:', user.uid);
          const adminData = await verifyAdminAccess(user);
          setCurrentUser(user);
          setAdminData(adminData);
        } else {
          console.log('No authenticated user');
          setCurrentUser(null);
          setAdminData(null);
        }
      } catch (err: any) {
        console.error('Auth state change error:', err);
        setCurrentUser(null);
        setAdminData(null);
        setError('Insufficient permissions to access admin panel');
        await signOut(auth);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      
      console.log('Attempting login for:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('User authenticated successfully:', userCredential.user.uid);
      
      const adminData = await verifyAdminAccess(userCredential.user);
      console.log('Admin access verified:', adminData);
      
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to sign in');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setAdminData(null);
    } catch (err: any) {
      setError(err.message || 'Failed to sign out');
      throw err;
    }
  };

  const value = {
    currentUser,
    adminData,
    login,
    logout,
    loading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;