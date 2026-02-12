import { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
import { MonthlySummary } from '@/lib/types';

export function useDashboardData(academyId: string, year: number) {
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
    }, [academyId, year]);

    const loadData = () => {
        setLoading(true);
        const revenues = storage.getRevenues(academyId, year);
        const expenses = storage.getExpenses(academyId, year);

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
        setLoading(false);
    };

    return { ...summary, loading, refresh: loadData };
}
