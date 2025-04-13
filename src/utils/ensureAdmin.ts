import { ref, set, get } from 'firebase/database';
import { database, ADMIN_UID } from '../config/firebase.config';

export async function ensureAdminExists() {
    const adminRef = ref(database, `admins/${ADMIN_UID}`);
    
    try {
        // Check if admin record exists
        const snapshot = await get(adminRef);
        
        if (!snapshot.exists()) {
            // Create admin record if it doesn't exist
            await set(adminRef, {
                username: 'admin',
                role: 'admin',
                lastLogin: Date.now()
            });
            console.log('Admin record created successfully');
        } else {
            console.log('Admin record already exists');
        }
    } catch (error) {
        console.error('Error ensuring admin record exists:', error);
        throw error;
    }
}