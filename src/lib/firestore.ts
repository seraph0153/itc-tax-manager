import { db } from './firebase';
import {
    collection,
    doc,
    getDocs,
    setDoc,
    deleteDoc,
    query,
    where,
    writeBatch
} from 'firebase/firestore';
import { Revenue, Expense, ExpenseCategory, Academy } from './types';

// Collection References
// Structure: users/{uid}/revenues/{revenueId}
// Structure: users/{uid}/expenses/{expenseId}
// Structure: users/{uid}/settings/academy

export const firestoreService = {
    // Academy Settings
    // Academy Settings
    getAcademy: async (_uid: string): Promise<Academy | null> => {
        // We might use getDoc here, but for now assuming direct access
        // Implementation detail: Firestore SDK needs to be imported for getDoc if not already.
        // Let's stick to simple patterns.
        return null; // Placeholder: To be fully implemented with getDoc
    },

    saveAcademy: async (uid: string, academy: Academy) => {
        await setDoc(doc(db, 'users', uid, 'settings', 'academy'), academy);
    },

    // Expenses
    getExpenses: async (uid: string, year: number): Promise<Expense[]> => {
        const q = query(
            collection(db, 'users', uid, 'expenses'),
            where('year', '==', year)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data() as Expense);
    },

    saveExpense: async (uid: string, expense: Expense) => {
        await setDoc(doc(db, 'users', uid, 'expenses', expense.id), expense);
    },

    deleteExpense: async (uid: string, id: string) => {
        await deleteDoc(doc(db, 'users', uid, 'expenses', id));
    },

    // Revenue
    getRevenues: async (uid: string, year: number): Promise<Revenue[]> => {
        const q = query(
            collection(db, 'users', uid, 'revenues'),
            where('year', '==', year)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data() as Revenue);
    },

    saveRevenue: async (uid: string, revenue: Revenue) => {
        await setDoc(doc(db, 'users', uid, 'revenues', revenue.id), revenue);
    },

    deleteRevenue: async (uid: string, id: string) => {
        await deleteDoc(doc(db, 'users', uid, 'revenues', id));
    },

    // Categories
    getCategories: async (uid: string): Promise<ExpenseCategory[]> => {
        const q = query(collection(db, 'users', uid, 'categories'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data() as ExpenseCategory);
    },

    saveCategory: async (uid: string, category: ExpenseCategory) => {
        await setDoc(doc(db, 'users', uid, 'categories', category.id), category);
    },

    // Batch Operations for Migration
    batchSave: async (uid: string, collectionName: string, items: any[]) => {
        const batch = writeBatch(db);
        items.forEach(item => {
            const ref = doc(db, 'users', uid, collectionName, item.id);
            batch.set(ref, item);
        });
        await batch.commit();
    },

    // User Management
    getUserProfile: async (uid: string): Promise<any> => {
        // Implementation detail: need to check valid ref
        const sn = await getDocs(query(collection(db, 'user_profiles'), where('uid', '==', uid)));
        if (!sn.empty) return sn.docs[0].data();
        return null;
    },

    saveUserProfile: async (profile: any) => {
        await setDoc(doc(db, 'user_profiles', profile.uid), profile);
    },

    getPendingUsers: async (): Promise<any[]> => {
        const q = query(collection(db, 'user_profiles'), where('status', '==', 'pending'));
        const sn = await getDocs(q);
        return sn.docs.map(d => d.data());
    },

    updateUserStatus: async (uid: string, status: string) => {
        await setDoc(doc(db, 'user_profiles', uid), {
            status,
            approvedAt: new Date().toISOString()
        }, { merge: true });
    }
};
