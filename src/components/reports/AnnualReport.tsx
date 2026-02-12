import { CategorySummary } from '@/hooks/useReports';
import { MonthlySummary } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface AnnualReportProps {
    monthlyData: MonthlySummary[];
    categorySummaries: CategorySummary[];
    totals: {
        totalRevenue: number;
        totalExpense: number;
        netIncome: number;
    };
}

export function AnnualReport({ monthlyData, categorySummaries, totals }: AnnualReportProps) {
    return (
        <div className="space-y-8">
            {/* Annual Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                    <h3 className="text-sm font-medium text-blue-600">연간 총 수입</h3>
                    <p className="text-3xl font-bold text-blue-900 mt-2">{formatCurrency(totals.totalRevenue)}</p>
                </div>
                <div className="bg-red-50 p-6 rounded-xl border border-red-100">
                    <h3 className="text-sm font-medium text-red-600">연간 총 지출</h3>
                    <p className="text-3xl font-bold text-red-900 mt-2">{formatCurrency(totals.totalExpense)}</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                    <h3 className="text-sm font-medium text-slate-600">연간 순수익</h3>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{formatCurrency(totals.netIncome)}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Monthly Breakdown Table */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <h3 className="font-bold text-slate-900">월별 상세 내역</h3>
                    </div>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500">
                            <tr>
                                <th className="px-6 py-3 font-medium">월</th>
                                <th className="px-6 py-3 font-medium text-right">수입</th>
                                <th className="px-6 py-3 font-medium text-right">지출</th>
                                <th className="px-6 py-3 font-medium text-right">순수익</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {monthlyData.map((m) => (
                                <tr key={m.month} className="hover:bg-slate-50">
                                    <td className="px-6 py-3 font-medium text-slate-900">{m.month}월</td>
                                    <td className="px-6 py-3 text-right text-blue-600">{formatCurrency(m.total_revenue)}</td>
                                    <td className="px-6 py-3 text-right text-red-600">{formatCurrency(m.total_expense)}</td>
                                    <td className="px-6 py-3 text-right font-bold text-slate-900">{formatCurrency(m.net_income)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Expense Category Breakdown */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden h-fit">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <h3 className="font-bold text-slate-900">지출 항목별 분석</h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {categorySummaries.map((cat) => (
                            <div key={cat.id} className="px-6 py-3 flex justify-between items-center hover:bg-slate-50">
                                <span className="text-sm text-slate-600 font-medium">{cat.name}</span>
                                <span className="text-sm font-bold text-slate-900">{formatCurrency(cat.amount)}</span>
                            </div>
                        ))}
                        <div className="px-6 py-3 flex justify-between items-center bg-slate-50">
                            <span className="text-sm text-slate-900 font-bold">합계</span>
                            <span className="text-sm font-bold text-red-600">{formatCurrency(totals.totalExpense)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
