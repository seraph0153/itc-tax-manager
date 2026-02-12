import { Revenue } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Edit2, Trash2 } from 'lucide-react';

interface RevenueListProps {
    revenues: Revenue[];
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
}

export function RevenueList({ revenues, onEdit, onDelete }: RevenueListProps) {
    if (revenues.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
                <p className="text-slate-500">등록된 수입 내역이 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                        <th className="px-6 py-4 font-medium text-slate-500">구분</th>
                        <th className="px-6 py-4 font-medium text-slate-500">학생 수</th>
                        <th className="px-6 py-4 font-medium text-slate-500 text-right">카드</th>
                        <th className="px-6 py-4 font-medium text-slate-500 text-right">현금</th>
                        <th className="px-6 py-4 font-medium text-slate-500 text-right">지역화폐</th>
                        <th className="px-6 py-4 font-medium text-slate-500 text-right">기타</th>
                        <th className="px-6 py-4 font-medium text-slate-500 text-right">합계</th>
                        <th className="px-6 py-4 font-medium text-slate-500">비고</th>
                        <th className="px-6 py-4 font-medium text-slate-500 text-right">관리</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {revenues.map((revenue) => {
                        const total = revenue.amount_card + revenue.amount_cash + revenue.amount_local_currency + revenue.amount_other;
                        return (
                            <tr key={revenue.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 text-slate-900 font-medium">
                                    {revenue.year}년 {revenue.month}월
                                </td>
                                <td className="px-6 py-4 text-slate-600">{revenue.student_count}명</td>
                                <td className="px-6 py-4 text-slate-600 text-right">{formatCurrency(revenue.amount_card)}</td>
                                <td className="px-6 py-4 text-slate-600 text-right">{formatCurrency(revenue.amount_cash)}</td>
                                <td className="px-6 py-4 text-slate-600 text-right">{formatCurrency(revenue.amount_local_currency)}</td>
                                <td className="px-6 py-4 text-slate-600 text-right">{formatCurrency(revenue.amount_other)}</td>
                                <td className="px-6 py-4 text-blue-600 font-bold text-right">{formatCurrency(total)}</td>
                                <td className="px-6 py-4 text-slate-500 truncate max-w-[150px]">{revenue.note}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => onEdit(revenue.id)}
                                            className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(revenue.id)}
                                            className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
