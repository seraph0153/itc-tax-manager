import { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
import { firestoreService } from '@/lib/firestore'; // Added
import { useAuth } from '@/contexts/AuthContext'; // Added
import { MonthlySummary } from '@/lib/types';

export function useDashboardData(academyId: string, year: number) {
    const { user } = useAuth(); // Add Auth Context
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<{
        totalRevenue: number;
        totalExpense: number;
        netIncome: number;
        monthlyData: MonthlySummary[];
    }>({
        totalRevenue: 0,
        totalExpense: 0,
        netIncome: 0,
        monthlyData: [],
    });

    useEffect(() => {
        loadData();
    }, [academyId, year, user]); // Reload when user changes

    const loadData = async () => { // Make async
        setLoading(true);
        try {
            let revenues: any[] = [];
            let expenses: any[] = [];

            if (user) {
                // Cloud Mode
                const [rev, exp] = await Promise.all([
                    firestoreService.getRevenues(user.uid, year),
                    firestoreService.getExpenses(user.uid, year)
                ]);
                revenues = rev;
                expenses = exp;
            } else {
                // Local Mode
                revenues = storage.getRevenues(academyId, year);
                expenses = storage.getExpenses(academyId, year);
            }

            // Initialize 12 months
            const monthlyData: MonthlySummary[] = Array.from({ length: 12 }, (_, i) => ({
                year,
                month: i + 1,
                total_revenue: 0,
                total_expense: 0,
                net_income: 0,
            }));

            let totalRev = 0;
            let totalExp = 0;

            // Aggregate Revenue
            revenues.forEach(r => {
                const monthIdx = r.month - 1;
                if (monthlyData[monthIdx]) {
                    const amount = r.amount_card + r.amount_cash + r.amount_local_currency + r.amount_other;
                    monthlyData[monthIdx].total_revenue += amount;
                    totalRev += amount;
                }
            });

            // Aggregate Expenses
            expenses.forEach(e => {
                const monthIdx = e.month - 1;
                if (monthlyData[monthIdx]) {
                    monthlyData[monthIdx].total_expense += e.amount;
                    totalExp += e.amount;
                }
            });

            // Calculate Net Income
            monthlyData.forEach(m => {
                m.net_income = m.total_revenue - m.total_expense;
            });

            setSummary({
                totalRevenue: totalRev,
                totalExpense: totalExp,
                netIncome: totalRev - totalExp,
                monthlyData,
            });
        } catch (error) {
            console.error("Failed to load dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    return { ...summary, loading, refresh: loadData };
}
