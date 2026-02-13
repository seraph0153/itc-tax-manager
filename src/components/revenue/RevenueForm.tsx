import { useState, useEffect } from 'react';
import { Revenue } from '@/lib/types';
import { X } from 'lucide-react';

interface RevenueFormProps {
    initialData?: Revenue;
    academyId: string;
    year: number;
    month: number;
    onSave: (data: Omit<Revenue, 'id' | 'created_at'>) => void;
    onClose: () => void;
}

export function RevenueForm({ initialData, academyId, year, month, onSave, onClose }: RevenueFormProps) {
    const [formData, setFormData] = useState({
        day: new Date().getDate(),
        student_count: 0,
        amount_card: 0,
        amount_cash: 0,
        amount_local_currency: 0,
        amount_other: 0,
        note: '',
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                day: initialData.day || 1,
                student_count: initialData.student_count,
                amount_card: initialData.amount_card,
                amount_cash: initialData.amount_cash,
                amount_local_currency: initialData.amount_local_currency,
                amount_other: initialData.amount_other,
                note: initialData.note || '',
            });
        }
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            academy_id: academyId,
            year: initialData ? initialData.year : year,
            month: initialData ? initialData.month : month,
            ...formData,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-bold text-slate-900">
                        {initialData ? '수입 내역 수정' : '새 수입 내역 추가'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
                        <X className="h-5 w-5 text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div className="flex gap-4">
                        <div className="w-1/3">
                            <label className="block text-sm font-medium text-slate-700 mb-1">일자 ({month}월)</label>
                            <input
                                type="number"
                                required
                                min="1"
                                max="31"
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.day}
                                onChange={e => setFormData({ ...formData, day: Number(e.target.value) })}
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-slate-700 mb-1">학생 수</label>
                            <input
                                type="number"
                                required
                                min="0"
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.student_count}
                                onChange={e => setFormData({ ...formData, student_count: Number(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">카드 매출</label>
                            <input
                                type="number"
                                min="0"
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.amount_card}
                                onChange={e => setFormData({ ...formData, amount_card: Number(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">현금 매출</label>
                            <input
                                type="number"
                                min="0"
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.amount_cash}
                                onChange={e => setFormData({ ...formData, amount_cash: Number(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">지역화폐</label>
                            <input
                                type="number"
                                min="0"
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.amount_local_currency}
                                onChange={e => setFormData({ ...formData, amount_local_currency: Number(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">기타</label>
                            <input
                                type="number"
                                min="0"
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.amount_other}
                                onChange={e => setFormData({ ...formData, amount_other: Number(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">비고</label>
                        <textarea
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none"
                            value={formData.note}
                            onChange={e => setFormData({ ...formData, note: e.target.value })}
                        />
                    </div>

                    <div className="pt-2 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-medium"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                        >
                            저장하기
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
