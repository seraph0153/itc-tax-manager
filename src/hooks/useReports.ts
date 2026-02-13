import { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
import { firestoreService } from '@/lib/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { MonthlySummary } from '@/lib/types';

export interface CategorySummary {
    id: string;
    name: string;
    amount: number;
}

export function useReports(academyId: string, year: number) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [monthlyData, setMonthlyData] = useState<MonthlySummary[]>([]);
    const [categorySummaries, setCategorySummaries] = useState<CategorySummary[]>([]);
    const [rawRevenues, setRawRevenues] = useState<any[]>([]);
    const [rawExpenses, setRawExpenses] = useState<any[]>([]);
    const [totals, setTotals] = useState({
        totalRevenue: 0,
        totalExpense: 0,
        netIncome: 0,
    });

    useEffect(() => {
        calculateReports();
    }, [academyId, year, user]);

    const calculateReports = async () => {
        setLoading(true);
        try {
            let revenues: any[] = [];
            let expenses: any[] = [];
            let categories: any[] = [];

            if (user) {
                // Cloud Mode
                const [rev, exp, cats] = await Promise.all([
                    firestoreService.getRevenues(user.uid, year),
                    firestoreService.getExpenses(user.uid, year),
                    firestoreService.getCategories(user.uid)
                ]);
                revenues = rev;
                expenses = exp;
                categories = cats;

                if (categories.length === 0) {
                    const localCats = storage.getCategories(academyId);
                    categories = localCats;
                }
            } else {
                // Local Mode
                revenues = storage.getRevenues(academyId, year);
                expenses = storage.getExpenses(academyId, year);
                categories = storage.getCategories(academyId);
            }

            // 1. Monthly Data
            const months: MonthlySummary[] = Array.from({ length: 12 }, (_, i) => ({
                year,
                month: i + 1,
                total_revenue: 0,
                total_expense: 0,
                net_income: 0,
            }));

            revenues.forEach(r => {
                const idx = r.month - 1;
                const amount = r.amount_card + r.amount_cash + r.amount_local_currency + r.amount_other;
                months[idx].total_revenue += amount;
            });

            expenses.forEach(e => {
                const idx = e.month - 1;
                months[idx].total_expense += e.amount;
            });

            months.forEach(m => {
                m.net_income = m.total_revenue - m.total_expense;
            });

            // 2. Category Summaries
            const catMap = new Map<string, number>();
            categories.forEach(c => catMap.set(c.id, 0));

            expenses.forEach(e => {
                const current = catMap.get(e.category_id) || 0;
                catMap.set(e.category_id, current + e.amount);
            });

            const catSummaries: CategorySummary[] = categories.map(c => ({
                id: c.id,
                name: c.name,
                amount: catMap.get(c.id) || 0,
            })).sort((a, b) => b.amount - a.amount);

            // 3. Totals
            const totalRevenue = months.reduce((acc, m) => acc + m.total_revenue, 0);
            const totalExpense = months.reduce((acc, m) => acc + m.total_expense, 0);

            setRawRevenues(revenues);
            setRawExpenses(expenses);
            setMonthlyData(months);
            setCategorySummaries(catSummaries);
            setTotals({
                totalRevenue,
                totalExpense,
                netIncome: totalRevenue - totalExpense,
            });
        } catch (error) {
            console.error("Failed to calculate reports:", error);
        } finally {
            setLoading(false);
        }
    };

    return { monthlyData, categorySummaries, totals, loading, revenues: rawRevenues, expenses: rawExpenses };
}
