import { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
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
  }, [academyName]);

  useEffect(() => {
    setIdInput(sheetConfig.spreadsheetId);
    setUrlInput(sheetConfig.scriptUrl);
  }, [sheetConfig]);

  const handleSaveSettings = async () => {
    try {
      await updateAcademyName(nameInput);
      await updateSheetConfig({ spreadsheetId: idInput, scriptUrl: urlInput });
      setMessage({ type: 'success', text: '설정이 저장되었습니다.' });
    } catch (error) {
      setMessage({ type: 'error', text: '저장 중 오류가 발생했습니다.' });
    }
  };

  const handleGoogleSheetBackup = async () => {
    if (!urlInput) {
      setMessage({ type: 'error', text: '구글 시트 스크립트 URL이 설정되어 있지 않습니다.' });
      return;
    }

    setIsBackingUp(true);
    try {
      const response = await fetch(urlInput, {
        method: 'POST',
        mode: 'no-cors'
      });
      setMessage({ type: 'success', text: '구글 시트 백업 요청이 전송되었습니다.' });
    } catch (error) {
      setMessage({ type: 'error', text: '백업 요청 중 오류가 발생했습니다.' });
    } finally {
      setIsBackingUp(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">시스템 설정</h1>
        <p className="text-gray-600">학원 정보 및 시스템 설정을 관리합니다.</p>
      </div>

      <div className="space-y-6">
        {/* 학원 정보 설정 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            시스템 기본 정보
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                학원명
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="학원 이름을 입력하세요"
              />
            </div>
          </div>
        </div>

        {/* 구글 시트 연동 설정 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            구글 시트 연동 설정
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                구글 시트 ID
              </label>
              <input
                type="text"
                value={idInput}
                onChange={(e) => setIdInput(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Spreadsheet ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                구글 앱스 스크립트 URL
              </label>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Google Apps Script Web App URL"
              />
            </div>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-md flex items-center gap-2 ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message.type === 'error' && <AlertCircle size={20} />}
            {message.text}
          </div>
        )}

        <div className="flex justify-between items-center">
          <button
            onClick={handleGoogleSheetBackup}
            disabled={isBackingUp}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 disabled:opacity-50"
          >
            <FileSpreadsheet size={18} />
            {isBackingUp ? '백업 중...' : '구글 시트 백업 실행'}
          </button>
          
          <button
            onClick={handleSaveSettings}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Save size={18} />
            설정 저장하기
          </button>
        </div>
      </div>
    </div>
  );
}
