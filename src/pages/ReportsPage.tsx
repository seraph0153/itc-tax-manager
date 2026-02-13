import { useState, useRef } from 'react';
import { useReports } from '@/hooks/useReports';
import { AnnualReport } from '@/components/reports/AnnualReport';
import { TaxReport } from '@/components/reports/TaxReport';
import { Printer, FileSpreadsheet } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { downloadSimpleLedgerCSV } from '@/lib/export';

export default function ReportsPage() {
    const [year, setYear] = useState(new Date().getFullYear());
    const [viewMode, setViewMode] = useState<'annual' | 'tax'>('annual');
    const academyId = 'demo-academy';
    const { monthlyData, categorySummaries, totals, loading, revenues, expenses } = useReports(academyId, year);

    const componentRef = useRef(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `${year}년_간편장부_소득신고참고용`,
    });

    if (loading) {
        return <div className="p-8 text-center text-slate-500">데이터를 분석 중...</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center print:hidden">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">보고서</h1>
                    <p className="text-slate-500 mt-1">
                        {viewMode === 'annual' ? '연간 재정 현황을 분석합니다.' : '종합소득세 신고를 위한 요약 자료입니다.'}
                    </p>
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

                    <div className="bg-slate-100 p-1 rounded-lg flex">
                        <button
                            onClick={() => setViewMode('annual')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'annual' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            연간 보고서
                        </button>
                        <button
                            onClick={() => setViewMode('tax')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'tax' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            세무 신고용
                        </button>
                    </div>

                    {viewMode === 'tax' && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => downloadSimpleLedgerCSV(year, revenues, expenses, 'ITC 영어학원')}
                                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                            >
                                <FileSpreadsheet className="h-4 w-4" />
                                간편장부 엑셀저장
                            </button>
                            <button
                                onClick={() => handlePrint()}
                                className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors font-medium text-sm"
                            >
                                <Printer className="h-4 w-4" />
                                인쇄하기
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="print:block">
                {viewMode === 'annual' ? (
                    <AnnualReport
                        monthlyData={monthlyData}
                        categorySummaries={categorySummaries}
                        totals={totals}
                    />
                ) : (
                    <div ref={componentRef} className="print:p-0">
                        <TaxReport
                            year={year}
                            academyName="ITC 영어학원 (데모)"
                            totals={totals}
                            categorySummaries={categorySummaries}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
