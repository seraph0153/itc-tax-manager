import { Revenue } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, Users } from 'lucide-react';

interface RevenueSummaryProps {
    revenues: Revenue[];
}

export function RevenueSummary({ revenues }: RevenueSummaryProps) {
    const totalStudents = revenues.reduce((acc, r) => acc + r.student_count, 0);
    const totalAmount = revenues.reduce((acc, r) =>
        acc + r.amount_card + r.amount_cash + r.amount_local_currency + r.amount_other
        , 0);

    const avgTuition = totalStudents > 0 ? Math.round(totalAmount / totalStudents) : 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center justify-between">
                <div>
                    <p className="text-sm text-blue-600 font-medium">이번 달 총 수입</p>
                    <p className="text-2xl font-bold text-blue-900 mt-1">{formatCurrency(totalAmount)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-400 opacity-50" />
            </div>

            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex items-center justify-between">
                <div>
                    <p className="text-sm text-indigo-600 font-medium">총 원생 수</p>
                    <p className="text-2xl font-bold text-indigo-900 mt-1">{totalStudents}명</p>
                </div>
                <Users className="h-8 w-8 text-indigo-400 opacity-50" />
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                    <p className="text-sm text-slate-600 font-medium">1인당 평균 단가</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(avgTuition)}</p>
                </div>
            </div>
        </div>
    );
}
