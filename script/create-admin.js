import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getDatabase, ref, set } from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCvP2xYmtArCRGYo-5sN3blRZ_f7DChbLA",
  authDomain: "tambola-b13dc.firebaseapp.com",
  databaseURL: "https://tambola-b13dc-default-rtdb.firebaseio.com",
  projectId: "tambola-b13dc",
  storageBucket: "tambola-b13dc.firebasestorage.app",
  messagingSenderId: "368426861678",
  appId: "1:368426861678:web:27d907f113cb4f9f84d27f",
  measurementId: "G-BRPR34NXX5"
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
