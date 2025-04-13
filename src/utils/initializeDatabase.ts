import { ref, set, get } from 'firebase/database';
import { database, ADMIN_UID } from '../config/firebase.config';

/**
 * Initializes essential database structures and admin rights
 * Should be called at application startup
 */
export async function initializeDatabase() {
  try {
    console.log('Initializing database structures...');
    
    // Ensure admin record exists
    const adminRef = ref(database, `admins/${ADMIN_UID}`);
    
    try {
      const snapshot = await get(adminRef);
      
      if (!snapshot.exists()) {
        // Create admin record
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
      console.warn('Failed to check/create admin record:', error);
      // Continue anyway - we'll retry on login
    }
    
    // Initialize other required database structures
    const systemConfigRef = ref(database, 'systemConfig');
    try {
      const configSnapshot = await get(systemConfigRef);
      
      if (!configSnapshot.exists()) {
        await set(systemConfigRef, {
          backupFrequency: 'daily',
          retentionPeriod: '30',
          maintenanceMode: false,
          lastBackup: 0,
          lastMaintenance: 0
        });
        console.log('System configuration initialized');
      }
    } catch (error) {
      console.warn('Failed to initialize system config:', error);
    }
    
    console.log('Database initialization complete');
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
}