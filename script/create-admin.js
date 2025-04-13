import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getDatabase, ref, set } from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCH2WtQ2y3ln8ToHcapIsEMIXJ78Hsg7Bg",
  authDomain: "tambola-74046.firebaseapp.com",
  databaseURL: "https://tambola-74046-default-rtdb.firebaseio.com",
  projectId: "tambola-74046",
  storageBucket: "tambola-74046.firebasestorage.app",
  messagingSenderId: "310265084192",
  appId: "1:310265084192:web:c044bf9b83c444f4a2ff45",
  measurementId: "G-MP72F136BH"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Define known admin UID
const ADMIN_UID = 'LH0I3s7TTSg37G0a9X14NFW8uzF2';

async function createAdminUser(email, password) {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('Created user with UID:', user.uid);
    console.log('Note: This UID is different from your predefined admin UID');

    // Add admin record to database for both the new user and predefined admin
    await set(ref(db, `admins/${user.uid}`), {
      username: email.split('@')[0],
      role: 'admin',
      lastLogin: Date.now()
    });
    
    // Also ensure the predefined admin UID exists
    await set(ref(db, `admins/${ADMIN_UID}`), {
      username: 'admin',
      role: 'admin',
      lastLogin: Date.now()
    });

    console.log('Admin users created successfully');
    return user;
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
}

// Usage:
// Replace with your desired admin credentials
createAdminUser('admin@tambola.com', 'admin123');