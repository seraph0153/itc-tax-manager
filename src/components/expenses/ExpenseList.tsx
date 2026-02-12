import { Expense, ExpenseCategory } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Edit2, Trash2, CreditCard, Banknote, ArrowRightLeft, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';

interface ExpenseListProps {
    expenses: Expense[];
    categories: ExpenseCategory[];
    onEdit: (expense: Expense) => void;
    onDelete: (id: string) => void;
}

export function ExpenseList({ expenses, categories, onEdit, onDelete }: ExpenseListProps) {
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const getCategoryName = (id: string) => {
        return categories.find(c => c.id === id)?.name || '기타';
    };

    const getPaymentIcon = (method: string) => {
        switch (method) {
            case 'card': return <CreditCard className="h-4 w-4 text-blue-500" />;
            case 'cash': return <Banknote className="h-4 w-4 text-green-500" />;
            case 'transfer': return <ArrowRightLeft className="h-4 w-4 text-slate-500" />;
            default: return <CreditCard className="h-4 w-4 text-slate-400" />;
        }
    };

    const getPaymentLabel = (method: string) => {
        switch (method) {
            case 'card': return '카드';
            case 'cash': return '현금';
            case 'transfer': return '이체';
            default: return method;
        }
    };

    if (expenses.length === 0) {
        return (
            <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                지출 내역이 없습니다.
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500">
                        <tr>
                            <th className="px-6 py-3 font-medium">날짜</th>
                            <th className="px-6 py-3 font-medium">카테고리</th>
                            <th className="px-6 py-3 font-medium">내역</th>
                            <th className="px-6 py-3 font-medium text-right">금액</th>
                            <th className="px-6 py-3 font-medium text-center">결제</th>
                            <th className="px-6 py-3 font-medium text-center">증빙</th>
                            <th className="px-6 py-3 font-medium text-right">관리</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {expenses.map((expense) => (
                            <tr key={expense.id} className="hover:bg-slate-50 group">
                                <td className="px-6 py-3 text-slate-500">
                                    {expense.month}월 {new Date(expense.created_at).getDate()}일
                                </td>
                                <td className="px-6 py-3 font-medium text-slate-900">
                                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs">
                                        {getCategoryName(expense.category_id)}
                                    </span>
                                    {expense.is_instructor_fee && (
                                        <span className="ml-1 bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                            강사료
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-3 text-slate-600">
                                    {expense.note || '-'}
                                    {expense.is_instructor_fee && (
                                        <div className="text-xs text-slate-400 mt-0.5">
                                            {expense.instructor_name} (실지급: {formatCurrency(expense.actual_payment || 0)})
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-3 text-right font-medium text-slate-900">
                                    {formatCurrency(expense.amount)}
                                    {expense.is_instructor_fee && (
                                        <div className="text-xs text-red-400 font-normal">
                                            (세금: {formatCurrency(expense.withholding_tax || 0)})
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-3 text-center">
                                    <div className="flex items-center justify-center gap-1.5 text-slate-600" title={getPaymentLabel(expense.payment_method)}>
                                        {getPaymentIcon(expense.payment_method)}
                                        <span className="text-xs">{getPaymentLabel(expense.payment_method)}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-3 text-center">
                                    {expense.receipt_url && (
                                        <button
                                            onClick={() => setPreviewImage(expense.receipt_url!)}
                                            className="bg-blue-50 p-1.5 rounded-md text-blue-600 hover:bg-blue-100 transition-colors"
                                        >
                                            <ImageIcon className="h-4 w-4" />
                                        </button>
                                    )}
                                </td>
                                <td className="px-6 py-3 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => onEdit(expense)}
                                            className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(expense.id)}
                                            className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Image Preview Modal */}
            {previewImage && (
                <div
                    className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[60] backdrop-blur-sm"
                    onClick={() => setPreviewImage(null)}
                >
                    <div className="relative max-w-3xl w-full max-h-[90vh] flex items-center justify-center">
                        <img
                            src={previewImage}
                            alt="Receipt Preview"
                            className="max-w-full max-h-[85vh] rounded-lg shadow-2xl bg-white"
                        />
                        <button
                            onClick={() => setPreviewImage(null)}
                            className="absolute -top-10 right-0 text-white hover:text-slate-300"
                        >
                            <Trash2 className="h-6 w-6 rotate-45" /> {/* Use X icon ideally, specifically imported */}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
