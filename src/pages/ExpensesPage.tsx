import { useState } from 'react';
import { useExpenses } from '@/hooks/useExpenses';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';
import { ExpenseList } from '@/components/expenses/ExpenseList';
import { Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Expense } from '@/lib/types';

export default function ExpensesPage() {
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const academyId = 'demo-academy';

    const {
        expenses,
        categories,
        loading,
        addExpense,
        updateExpense,
        deleteExpense,
    } = useExpenses(academyId);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

    const handleEdit = (expense: Expense) => {
        setEditingExpense(expense);
        setIsFormOpen(true);
    };

    const handleSave = (data: any) => {
        if (editingExpense) {
            updateExpense(editingExpense.id, data);
        } else {
            addExpense(data);
        }
    };

    const handleClose = () => {
        setIsFormOpen(false);
        setEditingExpense(null);
    };

    const monthlyExpenses = expenses.filter(e => e.year === year && e.month === month);
    const monthlyTotal = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

    if (loading) return <div className="p-8 text-center text-slate-500">데이터를 불러오는 중...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">지출 관리</h1>
                    <p className="text-slate-500 mt-1">학원 운영에 필요한 지출 내역을 관리합니다.</p>
                </div>
                <div className="flex gap-3">
                    <select
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                            <option key={y} value={y}>{y}년</option>
                        ))}
                    </select>
                    <select
                        value={month}
                        onChange={(e) => setMonth(Number(e.target.value))}
                        className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                            <option key={m} value={m}>{m}월</option>
                        ))}
                    </select>
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm hover:shadow-md"
                    >
                        <Plus className="h-4 w-4" />
                        지출 추가
                    </button>
                </div>
            </div>

            {/* Monthly Summary */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-slate-400 text-sm font-medium mb-1">{year}년 {month}월 총 지출</p>
                        <h2 className="text-3xl font-bold">{formatCurrency(monthlyTotal)}</h2>
                    </div>
                    <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                        <div className="text-center">
                            <span className="block text-xs text-slate-300">지출 건수</span>
                            <span className="block text-xl font-bold">{monthlyExpenses.length}건</span>
                        </div>
                    </div>
                </div>
            </div>

            <ExpenseList
                expenses={monthlyExpenses}
                categories={categories}
                onEdit={handleEdit}
                onDelete={deleteExpense}
            />

            {isFormOpen && (
                <ExpenseForm
                    initialData={editingExpense || undefined}
                    categories={categories}
                    academyId={academyId}
                    year={year}
                    month={month}
                    onSave={handleSave}
                    onClose={handleClose}
                />
            )}
        </div>
    );
}
