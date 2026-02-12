import { useState } from 'react';
import { useRevenue } from '@/hooks/useRevenue';
import { RevenueForm } from '@/components/revenue/RevenueForm';
import { RevenueList } from '@/components/revenue/RevenueList';
import { RevenueSummary } from '@/components/revenue/RevenueSummary';
import { Plus } from 'lucide-react';
import { Revenue } from '@/lib/types';

export default function RevenuePage() {
    const academyId = 'demo-academy';
    const {
        year, setYear,
        month, setMonth,
        revenues,
        addRevenue,
        updateRevenue,
        deleteRevenue
    } = useRevenue(academyId);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const handleEdit = (id: string) => {
        setEditingId(id);
        setIsFormOpen(true);
    };

    const handleSave = (data: Omit<Revenue, 'id' | 'created_at'>) => {
        if (editingId) {
            updateRevenue(editingId, data);
        } else {
            addRevenue(data);
        }
        setIsFormOpen(false);
        setEditingId(null);
    };

    const editingRevenue = editingId ? revenues.find(r => r.id === editingId) : undefined;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">수입 관리</h1>
                    <p className="text-slate-500 mt-1">월별 수입 내역을 관리합니다.</p>
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
                        onClick={() => { setEditingId(null); setIsFormOpen(true); }}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                    >
                        <Plus className="h-4 w-4" />
                        수입 추가
                    </button>
                </div>
            </div>

            <RevenueSummary revenues={revenues} />

            <RevenueList
                revenues={revenues}
                onEdit={handleEdit}
                onDelete={deleteRevenue}
            />

            {isFormOpen && (
                <RevenueForm
                    academyId={academyId}
                    year={year}
                    month={month}
                    initialData={editingRevenue}
                    onSave={handleSave}
                    onClose={() => { setIsFormOpen(false); setEditingId(null); }}
                />
            )}
        </div>
    );
}
