import { useState } from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { KPICard } from '@/components/dashboard/KPICard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { LayoutDashboard, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
    const [year, setYear] = useState(new Date().getFullYear());
    const academyId = 'demo-academy'; // TODO: Get from context/auth
    const { totalRevenue, totalExpense, netIncome, monthlyData, loading } = useDashboardData(academyId, year);

    if (loading) {
        return <div className="p-8 text-center text-slate-500">데이터를 불러오는 중...</div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">대시보드</h1>
                    <p className="text-slate-500 mt-1">{year}년 재정 현황 요약</p>
                </div>
                <select
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                        <option key={y} value={y}>{y}년</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPICard
                    title="총 수입"
                    amount={totalRevenue}
                    icon={TrendingUp}
                    className="border-l-4 border-l-blue-500"
                    iconClassName="text-blue-600 bg-blue-50"
                />
                <KPICard
                    title="총 지출"
                    amount={totalExpense}
                    icon={TrendingDown}
                    className="border-l-4 border-l-red-500"
                    iconClassName="text-red-600 bg-red-50"
                />
                <KPICard
                    title="순수익"
                    amount={netIncome}
                    icon={Wallet}
                    className={cn("border-l-4", netIncome >= 0 ? "border-l-emerald-500" : "border-l-orange-500")}
                    iconClassName={cn(netIncome >= 0 ? "text-emerald-600 bg-emerald-50" : "text-orange-600 bg-orange-50")}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <LayoutDashboard className="h-5 w-5 text-slate-400" />
                            월별 매출 추이
                        </h3>
                    </div>
                    <RevenueChart data={monthlyData} />
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-900">지출 분석 (준비중)</h3>
                    </div>
                    <div className="h-[300px] flex items-center justify-center text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                        차트 준비중
                    </div>
                </div>
            </div>
        </div>
    );
}
