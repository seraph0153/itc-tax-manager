import { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
import { Expense, ExpenseCategory } from '@/lib/types';

export function useExpenses(academyId: string) {
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [categories, setCategories] = useState<ExpenseCategory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [academyId, year, month]);

    const loadData = () => {
        setLoading(true);
        const allYearExpenses = storage.getExpenses(academyId, year);
        const monthExpenses = allYearExpenses.filter(e => e.month === month);
        const academyCategories = storage.getCategories(academyId);

        setExpenses(monthExpenses);
        setCategories(academyCategories);
        setLoading(false);
    };

    const addExpense = (data: Omit<Expense, 'id' | 'created_at' | 'category_name'>) => {
        const category = categories.find(c => c.id === data.category_id);
        const newExpense: Expense = {
            ...data,
            id: crypto.randomUUID(),
            category_name: category ? category.name : 'Unknown',
            created_at: new Date().toISOString(),
        };
        storage.saveExpense(newExpense);
        loadData();
    };

    const updateExpense = (id: string, data: Partial<Expense>) => {
        const current = expenses.find(e => e.id === id);
        if (!current) return;

        // Update category name if category_id changed
        let categoryName = current.category_name;
        if (data.category_id) {
            const category = categories.find(c => c.id === data.category_id);
            if (category) categoryName = category.name;
        }

        const updated: Expense = { ...current, ...data, category_name: categoryName };
        storage.saveExpense(updated);
        loadData();
    };

    const deleteExpense = (id: string) => {
        storage.deleteExpense(academyId, year, id);
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
