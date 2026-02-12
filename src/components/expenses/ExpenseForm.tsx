import { useState, useEffect, useRef } from 'react';
import { Expense, ExpenseCategory } from '@/lib/types';
import { storage } from '@/lib/storage'; // To get academy config
import { X, Upload, Loader2, Image as ImageIcon } from 'lucide-react';

interface ExpenseFormProps {
    initialData?: Expense;
    categories: ExpenseCategory[];
    academyId: string;
    year: number;
    month: number;
    onSave: (data: Omit<Expense, 'id' | 'created_at' | 'category_name'>) => void;
    onClose: () => void;
}

export function ExpenseForm({ initialData, categories, academyId, year, month, onSave, onClose }: ExpenseFormProps) {
    const [formData, setFormData] = useState<{
        category_id: string;
        amount: number | '';
        payment_method: 'card' | 'cash' | 'transfer';
        note: string;
        receipt_url: string;
        is_instructor_fee: boolean;
        instructor_name: string;
    }>({
        category_id: '',
        amount: '',
        payment_method: 'card',
        note: '',
        receipt_url: '',
        is_instructor_fee: false,
        instructor_name: '',
    });

    // Auto-calculate tax values
    const taxRate = 0.033;
    const amountNum = Number(formData.amount) || 0;
    const withholdingTax = Math.floor(amountNum * taxRate);
    const actualPayment = amountNum - withholdingTax;

    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (initialData) {
            setFormData({
                category_id: initialData.category_id,
                amount: initialData.amount,
                payment_method: initialData.payment_method,
                note: initialData.note || '',
                receipt_url: initialData.receipt_url || '',
                is_instructor_fee: initialData.is_instructor_fee || false,
                instructor_name: initialData.instructor_name || '',
            });
        } else if (categories.length > 0) {
            setFormData(prev => ({ ...prev, category_id: categories[0].id }));
        }
    }, [initialData, categories]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check config
        const academy = storage.getAcademy(academyId);
        if (!academy?.google_sheet_config?.script_url) {
            alert('설정에서 Google Apps Script URL을 먼저 등록해주세요.');
            return;
        }

        setIsUploading(true);

        try {
            // Convert to Base64
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64Content = reader.result?.toString().split(',')[1];

                // Upload to GAS
                const payload = {
                    action: 'upload',
                    fileName: `receipt_${year}_${month}_${Date.now()}_${file.name}`,
                    mimeType: file.type,
                    fileData: base64Content
                };

                await fetch(academy.google_sheet_config!.script_url, {
                    method: 'POST',
                    mode: 'no-cors', // Does not allow reading response, but needed for simple GAS request
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                // PROBLEM: 'no-cors' mode returns opaque response, so we cannot get the URL back.
                // SOLUTION: Apps Script must be deployed as "Anyone, even anonymous" and we can use Standard CORS (if GAS supported it well) OR assume JSONP (complicated).
                // WORKAROUND: For this specific "Get URL back" requirement, we MUST use a proxy or 'cors' mode if GAS allows.
                // Actually, GAS Web Apps DO support CORS if `ContentService.createTextOutput(...).setMimeType(...)` is used correctly and request follows redirect.
                // Let's try standard fetch first. If standard fetch fails due to CORS, we have a problem.
                // Most modern GAS deployments support 'cors' if requested correctly. "redirect: 'follow'" is key.

                // RETRY with standard 'cors' (requires "Anyone" access setting in GAS)
                try {
                    const res2 = await fetch(academy.google_sheet_config!.script_url, {
                        method: 'POST',
                        // mode: 'cors', // Default
                        redirect: 'follow',
                        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // 'application/json' triggers Preflight which GAS hates. Use text/plain.
                        body: JSON.stringify(payload)
                    });
                    const json = await res2.json();

                    if (json.status === 'success' && json.fileUrl) {
                        setFormData(prev => ({ ...prev, receipt_url: json.fileUrl }));
                    } else {
                        throw new Error(json.message || 'Upload failed');
                    }
                } catch (innerErr) {
                    console.error("CORS/Network Error:", innerErr);
                    alert("업로드 실패: 스크립트 배포 시 '누구나(Anyone)' 권한으로 설정되었는지 확인해주세요.");
                }
            };
        } catch (error) {
            console.error(error);
            alert('파일 처리 중 오류가 발생했습니다.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const submitData: any = {
            academy_id: academyId,
            year: initialData ? initialData.year : year,
            month: initialData ? initialData.month : month,
            ...formData,
            amount: Number(formData.amount) || 0,
        };

        if (formData.is_instructor_fee) {
            submitData.tax_rate = 3.3;
            submitData.withholding_tax = withholdingTax;
            submitData.actual_payment = actualPayment;
        }

        onSave(submitData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-bold text-slate-900">
                        {initialData ? '지출 내역 수정' : '새 지출 내역 추가'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
                        <X className="h-5 w-5 text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">카테고리</label>
                        <select
                            required
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            value={formData.category_id}
                            onChange={e => {
                                const newData = { ...formData, category_id: e.target.value };
                                // Auto-select instructor fee option if category is '강사료'
                                const selectedCat = categories.find(c => c.id === e.target.value);
                                if (selectedCat?.name === '강사료') {
                                    newData.is_instructor_fee = true;
                                }
                                setFormData(newData);
                            }}
                        >
                            <option value="" disabled>카테고리 선택</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">금액</label>
                        <input
                            type="number"
                            required
                            min="0"
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-lg font-semibold"
                            value={formData.amount}
                            onChange={e => {
                                const val = e.target.value;
                                setFormData({ ...formData, amount: val === '' ? '' : Number(val) });
                            }}
                            placeholder="0"
                        />
                        {formData.is_instructor_fee && amountNum > 0 && (
                            <div className="mt-2 text-xs space-y-1 text-slate-600 bg-blue-50 p-2 rounded border border-blue-100">
                                <div className="flex justify-between">
                                    <span>원천징수세 (3.3%):</span>
                                    <span className="font-medium text-red-600">-{withholdingTax.toLocaleString()}원</span>
                                </div>
                                <div className="flex justify-between border-t border-blue-200 pt-1 mt-1">
                                    <span className="font-bold text-blue-700">실 수령액:</span>
                                    <span className="font-bold text-blue-700">{actualPayment.toLocaleString()}원</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-3">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_instructor_fee"
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                checked={formData.is_instructor_fee}
                                onChange={e => setFormData({ ...formData, is_instructor_fee: e.target.checked })}
                            />
                            <label htmlFor="is_instructor_fee" className="text-sm font-medium text-slate-700 select-none">
                                일일강사 비용 (3.3% 원천징수 대상)
                            </label>
                        </div>

                        {formData.is_instructor_fee && (
                            <div className="animate-in slide-in-from-top-2 duration-200">
                                <label className="block text-xs font-medium text-slate-500 mb-1">강사명</label>
                                <input
                                    type="text"
                                    required={formData.is_instructor_fee}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    placeholder="강사 이름을 입력하세요"
                                    value={formData.instructor_name}
                                    onChange={e => setFormData({ ...formData, instructor_name: e.target.value })}
                                />
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">결제 수단</label>
                        <div className="flex gap-2">
                            {(['card', 'cash', 'transfer'] as const).map(method => (
                                <button
                                    key={method}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, payment_method: method })}
                                    className={`flex-1 py-2 text-sm rounded-lg border ${formData.payment_method === method
                                        ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium ring-1 ring-blue-200'
                                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    {method === 'card' && '카드'}
                                    {method === 'cash' && '현금'}
                                    {method === 'transfer' && '이체'}
                                </button>
                            ))}
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

                    {/* Receipt Upload Section */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">영수증 첨부</label>
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileUpload}
                        />

                        {!formData.receipt_url ? (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="w-full border-2 border-dashed border-slate-200 rounded-lg p-4 flex flex-col items-center gap-2 text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="h-6 w-6 animate-spin" />
                                        <span className="text-sm">Google Drive에 업로드 중...</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-6 w-6" />
                                        <span className="text-sm">이미지 업로드 (Google Drive 연동)</span>
                                    </>
                                )}
                            </button>
                        ) : (
                            <div className="relative border rounded-lg overflow-hidden group">
                                <img
                                    src={formData.receipt_url}
                                    alt="Receipt"
                                    className="w-full h-32 object-cover"
                                    onError={(e) => {
                                        // Fallback if direct link fails (e.g. 403)
                                        e.currentTarget.src = "https://placehold.co/400x300?text=Image+Load+Error";
                                    }}
                                />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        type="button"
                                        onClick={() => window.open(formData.receipt_url, '_blank')}
                                        className="bg-white p-2 rounded-full hover:bg-slate-100"
                                        title="원본 보기"
                                    >
                                        <ImageIcon className="h-4 w-4 text-slate-700" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, receipt_url: '' }))}
                                        className="bg-white p-2 rounded-full hover:bg-red-50"
                                        title="삭제"
                                    >
                                        <X className="h-4 w-4 text-red-600" />
                                    </button>
                                </div>
                            </div>
                        )}

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
                            disabled={isUploading}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
                        >
                            저장하기
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
