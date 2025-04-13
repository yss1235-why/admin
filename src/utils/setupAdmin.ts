import { getDatabase, ref, set, get } from 'firebase/database';
import { auth, database } from '../config/firebase.config';

// Define known admin UID
const ADMIN_UID = 'LH0I3s7TTSg37G0a9X14NFW8uzF2';

export async function setupAdminRecord() {
    // First, setup for current user if authenticated
    if (auth.currentUser) {
        const adminRef = ref(database, `admins/${auth.currentUser.uid}`);
        
        try {
            await set(adminRef, {
                username: auth.currentUser.email?.split('@')[0] || 'admin',
                role: 'admin',
                lastLogin: Date.now()
            });
            console.log('Admin record created for current user');
        } catch (error) {
            console.error('Error creating admin record for current user:', error);
        }
    }
    
    // Ensure our known admin UID exists
    const knownAdminRef = ref(database, `admins/${ADMIN_UID}`);
    
    try {
        // Check if admin record exists
        const snapshot = await get(knownAdminRef);
        
        if (!snapshot.exists()) {
            // Create admin record if it doesn't exist
            await set(knownAdminRef, {
                username: 'admin',
                role: 'admin',
                lastLogin: Date.now()
            });
            console.log('Predefined admin record created successfully');
        }
    } catch (error) {
        console.error('Error ensuring predefined admin record exists:', error);
        throw error;
    }
}