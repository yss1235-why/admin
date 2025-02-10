import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getDatabase, ref, set } from 'firebase/database';
import { firebaseConfig } from '../src/config/firebase.config';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

async function createAdminUser(email, password) {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Add admin record to database
    await set(ref(db, `admins/${user.uid}`), {
      username: email.split('@')[0],
      role: 'admin',
      lastLogin: Date.now()
    });

    console.log('Admin user created successfully');
    return user;
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
}

// Usage:
// Replace with your desired admin credentials
createAdminUser('yurs123@gmail.com', '123456');