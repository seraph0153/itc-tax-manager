import { firestoreService } from './firestore';
import { storage } from './storage';
import { User } from 'firebase/auth';

export const migrationService = {
    migrateLocalDataToCloud: async (user: User) => {
        const uid = user.uid;
        const academyId = 'demo-academy'; // Currently we only support one academy ID locally

        try {
            // 1. Migrate Settings (Academy Info)
            const academy = storage.getAcademy(academyId);
            if (academy) {
                await firestoreService.saveAcademy(uid, academy);
            }

            // 2. Migrate Categories
            const categories = storage.getCategories(academyId);
            if (categories.length > 0) {
                await firestoreService.batchSave(uid, 'categories', categories);
            }

            // 3. Migrate Expenses (Iterate through last 5 years to be safe)
            const currentYear = new Date().getFullYear();
            for (let year = currentYear - 2; year <= currentYear + 1; year++) {
                const expenses = storage.getExpenses(academyId, year);
                if (expenses.length > 0) {
                    await firestoreService.batchSave(uid, 'expenses', expenses);
                }
            }

            // 4. Migrate Revenues
            for (let year = currentYear - 2; year <= currentYear + 1; year++) {
                const revenues = storage.getRevenues(academyId, year);
                if (revenues.length > 0) {
                    await firestoreService.batchSave(uid, 'revenues', revenues);
                }
            }

            console.log('Migration completed successfully');
            // Optional: Clear local storage after successful migration?
            // localStorage.clear(); 
            // Better to keep it as backup for now or mark as migrated.
            localStorage.setItem('migration_completed', 'true');

        } catch (error) {
            console.error('Migration failed:', error);
            throw error;
        }
    }
};
