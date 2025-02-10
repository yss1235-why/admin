import { getDatabase, ref, set } from 'firebase/database';
import { auth, database } from '../config/firebase.config';

export async function setupAdminRecord() {
    if (!auth.currentUser) {
        console.error('No authenticated user found');
        return;
    }

    const adminRef = ref(database, `admins/${auth.currentUser.uid}`);
    
    try {
        await set(adminRef, {
            username: auth.currentUser.email?.split('@')[0] || 'admin',
            role: 'admin',
            lastLogin: Date.now()
        });
        console.log('Admin record created successfully');
    } catch (error) {
        console.error('Error creating admin record:', error);
        throw error;
    }
}