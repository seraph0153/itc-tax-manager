import { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
import { firestoreService } from '@/lib/firestore'; // Added
import { useAuth } from '@/contexts/AuthContext'; // Added
import { Expense, ExpenseCategory } from '@/lib/types';

export function useExpenses(academyId: string) {
    const { user } = useAuth(); // Add Auth Context
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [categories, setCategories] = useState<ExpenseCategory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [academyId, year, month, user]); // Reload when user changes

    const loadData = async () => { // Make async
        setLoading(true);
        try {
            let allYearExpenses: Expense[] = [];
            let academyCategories: ExpenseCategory[] = [];

            if (user) {
                // Cloud Mode
                const [exp, cats] = await Promise.all([
                    firestoreService.getExpenses(user.uid, year),
                    firestoreService.getCategories(user.uid)
                ]);
                allYearExpenses = exp;
                academyCategories = cats;

                // If cloud categories are empty, seed them? 
                // Migration service should handle this, but fallback:
                if (academyCategories.length === 0) {
                    // Fallback logic could go here or rely on migration
                    // For now, let's assume migration ran or empty state is fine
                    const localCats = storage.getCategories(academyId); // Get defaults
                    academyCategories = localCats; // Use defaults for display if empty
                }

            } else {
                // Local Mode
                allYearExpenses = storage.getExpenses(academyId, year);
                academyCategories = storage.getCategories(academyId);
            }

            const monthExpenses = allYearExpenses.filter(e => e.month === month);
            setExpenses(monthExpenses);
            setCategories(academyCategories);
        } catch (error) {
            console.error("Failed to load expenses:", error);
        } finally {
            setLoading(false);
        }
    };

    const addExpense = async (data: Omit<Expense, 'id' | 'created_at' | 'category_name'>) => {
        const category = categories.find(c => c.id === data.category_id);
        const newExpense: Expense = {
            ...data,
            id: crypto.randomUUID(),
            category_name: category ? category.name : 'Unknown',
            created_at: new Date().toISOString(),
        };

        if (user) {
            await firestoreService.saveExpense(user.uid, newExpense);
        } else {
            storage.saveExpense(newExpense);
        }
        loadData();
    };

    const updateExpense = async (id: string, data: Partial<Expense>) => {
        const current = expenses.find(e => e.id === id);
        if (!current) return;

        let categoryName = current.category_name;
        if (data.category_id) {
            const category = categories.find(c => c.id === data.category_id);
            if (category) categoryName = category.name;
        }

        const updated: Expense = { ...current, ...data, category_name: categoryName };

        if (user) {
            await firestoreService.saveExpense(user.uid, updated);
        } else {
            storage.saveExpense(updated);
        }
        loadData();
    };

    const deleteExpense = async (id: string) => {
        if (user) {
            await firestoreService.deleteExpense(user.uid, id);
        } else {
            storage.deleteExpense(academyId, year, id);
        }
        loadData();
    };

    return {
        year, setYear,
        month, setMonth,
        expenses,
        categories,
        loading,
        addExpense,
        updateExpense,
        deleteExpense,
        refresh: loadData
    };
}
