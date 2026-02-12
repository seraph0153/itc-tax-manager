import { Revenue, Expense, ExpenseCategory, Academy } from './types';

const STORAGE_PREFIX = 'itc_bk_';

// Mock Data Seeding
const DEFAULT_CATEGORIES = [
    { id: 'cat_rent', name: '월임차료', is_default: true, is_fixed_cost: true },
    { id: 'cat_maint', name: '관리비', is_default: true, is_fixed_cost: true },
    { id: 'cat_mat', name: '교재비', is_default: true, is_fixed_cost: false },
    { id: 'cat_ad', name: '광고비', is_default: true, is_fixed_cost: false },
    { id: 'cat_fee', name: '결제수수료', is_default: true, is_fixed_cost: false },
    { id: 'cat_comm', name: '통신비', is_default: true, is_fixed_cost: true },
    { id: 'cat_equip', name: '비품구입', is_default: true, is_fixed_cost: false },
    { id: 'cat_other', name: '기타', is_default: true, is_fixed_cost: false },
];

export const storage = {
    getAcademy: (id: string): Academy | null => {
        const data = localStorage.getItem(`${STORAGE_PREFIX}academy_${id}`);
        return data ? JSON.parse(data) : null;
    },

    saveAcademy: (academy: Academy) => {
        localStorage.setItem(`${STORAGE_PREFIX}academy_${academy.id}`, JSON.stringify(academy));
    },

    // Revenue Methods
    getRevenues: (academyId: string, year: number): Revenue[] => {
        const key = `${STORAGE_PREFIX}rev_${academyId}_${year}`;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    },

    saveRevenue: (revenue: Revenue) => {
        const key = `${STORAGE_PREFIX}rev_${revenue.academy_id}_${revenue.year}`;
        const current = storage.getRevenues(revenue.academy_id, revenue.year);
        const existingIndex = current.findIndex(r => r.id === revenue.id);

        if (existingIndex >= 0) {
            current[existingIndex] = revenue;
        } else {
            current.push(revenue);
        }

        localStorage.setItem(key, JSON.stringify(current));
    },

    deleteRevenue: (academyId: string, year: number, id: string) => {
        const key = `${STORAGE_PREFIX}rev_${academyId}_${year}`;
        const current = storage.getRevenues(academyId, year);
        const filtered = current.filter(r => r.id !== id);
        localStorage.setItem(key, JSON.stringify(filtered));
    },

    // Expense Methods
    getExpenses: (academyId: string, year: number): Expense[] => {
        const key = `${STORAGE_PREFIX}exp_${academyId}_${year}`;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    },

    saveExpense: (expense: Expense) => {
        const key = `${STORAGE_PREFIX}exp_${expense.academy_id}_${expense.year}`;
        const current = storage.getExpenses(expense.academy_id, expense.year);
        const existingIndex = current.findIndex(e => e.id === expense.id);

        if (existingIndex >= 0) {
            current[existingIndex] = expense;
        } else {
            current.push(expense);
        }

        localStorage.setItem(key, JSON.stringify(current));
    },

    deleteExpense: (academyId: string, year: number, id: string) => {
        const key = `${STORAGE_PREFIX}exp_${academyId}_${year}`;
        const current = storage.getExpenses(academyId, year);
        const filtered = current.filter(e => e.id !== id);
        localStorage.setItem(key, JSON.stringify(filtered));
    },

    // Categories
    getCategories: (academyId: string): ExpenseCategory[] => {
        const key = `${STORAGE_PREFIX}cats_${academyId}`;
        const data = localStorage.getItem(key);
        if (data) return JSON.parse(data);

        // Seed defaults
        const defaults = DEFAULT_CATEGORIES.map(c => ({
            ...c,
            academy_id: academyId
        }));
        localStorage.setItem(key, JSON.stringify(defaults));
        return defaults;
    }
};
