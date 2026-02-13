import { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
import { Academy } from '@/lib/types';
import { Save, Download, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

export default function SettingsPage() {
    const academyId = 'demo-academy';
    const { academyName, updateAcademyName, sheetConfig, updateSheetConfig } = useSettings();

    // Local state for form inputs
    const [nameInput, setNameInput] = useState(academyName);
    const [idInput, setIdInput] = useState(sheetConfig.spreadsheetId);
    const [urlInput, setUrlInput] = useState(sheetConfig.scriptUrl);

    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isBackingUp, setIsBackingUp] = useState(false);

    // Sync local input state when context changes (e.g. initial load)
    useEffect(() => {
        setNameInput(academyName);
        setIdInput(sheetConfig.spreadsheetId);
        setUrlInput(sheetConfig.scriptUrl);
    }, [academyName, sheetConfig]);

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        updateAcademyName(nameInput);
        updateSheetConfig(idInput, urlInput);
        showMessage('success', '설정이 저장되었습니다.');
    };

    const handleGoogleSheetBackup = async () => {
        if (!urlInput) {
            showMessage('error', 'Google Apps Script URL을 먼저 설정해주세요.');
            return;
        }

        setIsBackingUp(true);
        try {
            // Gather all data
            // For this demo, let's just get 2024-2026 data or all data if possible.
            // Since our storage is by (academyId, year), we iterate a range or get all from localStorage keys again.
            // Better approach: Use the getRevenues/getExpenses logic but for all years.
            // For simplicity/safety, let's iterate reasonable years 2024-2030 or regex match localStorage.

            const revenues = [];
            const expenses = [];

            // Iterate local storage to find all data keys for this academy
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.startsWith(`itc_bk_rev_${academyId}_`)) {
                    const year = parseInt(key.split('_').pop() || '0');
                    revenues.push(...storage.getRevenues(academyId, year));
                }
                if (key?.startsWith(`itc_bk_exp_${academyId}_`)) {
                    const year = parseInt(key.split('_').pop() || '0');
                    const exps = storage.getExpenses(academyId, year);
                    // Enrich with category name
                    const cats = storage.getCategories(academyId);
                    const enriched = exps.map(e => ({
                        ...e,
                        category_name: cats.find(c => c.id === e.category_id)?.name || 'Unknown'
                    }));
                    expenses.push(...enriched);
                }
            }

            const payload = {
                spreadsheetId: idInput,
                academyName: nameInput,
                revenues,
                expenses
            };

            // Since we are calling a GAS Web App, we often need 'no-cors' for opaque response or handle CORS if GAS setup allows.
            // GAS usually doesn't support CORS OPTIONS preflight well.
            // Best practice: Use 'no-cors' mode, but we can't read the response. 
            // OR use a proxy. But for simple client-side, we try standard fetch.
            // NOTE: 'no-cors' means we can't see if it succeeded or failed based on response body.
            // We will assume success if no network error.

            await fetch(urlInput, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            showMessage('success', 'Google Sheet로 백업을 요청했습니다. (잠시 후 시트를 확인하세요)');

        } catch (error) {
            console.error(error);
            showMessage('error', '백업 중 오류가 발생했습니다.');
        } finally {
            setIsBackingUp(false);
        }
    };

    const handleJsonBackup = () => {
        const data = {
            academy: storage.getAcademy(academyId),
            store: {},
            timestamp: new Date().toISOString(),
        };

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('itc_bk_')) {
                // @ts-ignore
                data.store[key] = localStorage.getItem(key);
            }
        }

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `itc_backup_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showMessage('success', '데이터 백업 파일이 다운로드되었습니다.');
    };

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-2xl">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">설정</h1>
                <p className="text-slate-500 mt-1">학원 정보 및 데이터를 관리합니다.</p>
            </div>

            {message && (
                <div className={`p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                    <AlertCircle className="h-5 w-5" />
                    {message.text}
                </div>
            )}

            {/* Profile Settings */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h2 className="text-lg font-bold text-slate-900 mb-4 border-b pb-2">학원 정보 및 연동</h2>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">학원명</label>
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                        />
                    </div>

                    <div className="pt-4 border-t border-slate-50">
                        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                            <FileSpreadsheet className="h-4 w-4 text-green-600" />
                            Google Sheets 연동 설정
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Spreadsheet ID</label>
                                <input
                                    type="text"
                                    placeholder="예: 1m5fzLJb6VnGlBUpcniF11nnO7jznV8e_75aVJezFQmQ"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm font-mono"
                                    value={idInput}
                                    onChange={(e) => setIdInput(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Apps Script Web App URL</label>
                                <input
                                    type="url"
                                    placeholder="https://script.google.com/macros/s/..."
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm font-mono"
                                    value={urlInput}
                                    onChange={(e) => setUrlInput(e.target.value)}
                                />
                                <p className="text-xs text-slate-400 mt-1">
                                    * 배포된 Apps Script의 '웹 앱 URL'을 입력하세요.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                        >
                            <Save className="h-4 w-4" />
                            설정 저장하기
                        </button>
                    </div>
                </form>
            </section>

            {/* Data Management */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h2 className="text-lg font-bold text-slate-900 mb-4 border-b pb-2">데이터 백업</h2>
                <div className="space-y-4">
                    {/* Google Sheets Backup Button */}
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100">
                        <div>
                            <h3 className="font-medium text-green-900 flex items-center gap-2">
                                <FileSpreadsheet className="h-4 w-4" />
                                Google Sheets로 내보내기
                            </h3>
                            <p className="text-sm text-green-700 mt-1">
                                현재 저장된 모든 데이터를 설정된 구글 시트로 전송합니다.
                            </p>
                        </div>
                        <button
                            onClick={handleGoogleSheetBackup}
                            disabled={isBackingUp || !urlInput}
                            className={`flex items-center gap-2 bg-white border border-green-200 text-green-700 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium ${(isBackingUp || !urlInput) ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            {isBackingUp ? '전송 중...' : '시트로 전송'}
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                            <h3 className="font-medium text-slate-900">JSON 파일 백업</h3>
                            <p className="text-sm text-slate-500">모든 데이터를 파일로 다운로드합니다.</p>
                        </div>
                        <button
                            onClick={handleJsonBackup}
                            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
                        >
                            <Download className="h-4 w-4" />
                            백업 다운로드
                        </button>
                    </div>
                </div>
            </section>

            <div className="text-center text-xs text-slate-400 mt-8">
                ITC Bookkeeping App v1.1.0 (Google Sheets Integration)
            </div>
        </div>
    );
}
