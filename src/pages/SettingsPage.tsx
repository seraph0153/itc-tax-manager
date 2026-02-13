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
