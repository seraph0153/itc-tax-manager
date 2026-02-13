import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { storage } from '@/lib/storage';
import { Academy } from '@/lib/types';

interface SettingsContextType {
    academyName: string;
    updateAcademyName: (name: string) => void;
    sheetConfig: { spreadsheetId: string; scriptUrl: string };
    updateSheetConfig: (spreadsheetId: string, scriptUrl: string) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}

export function SettingsProvider({ children }: { children: ReactNode }) {
    const academyId = 'demo-academy';
    const [academyName, setAcademyName] = useState('ITC 장현 세무기장');
    const [sheetConfig, setSheetConfig] = useState({ spreadsheetId: '', scriptUrl: '' });

    useEffect(() => {
        const academy = storage.getAcademy(academyId);
        if (academy) {
            setAcademyName(academy.name);
            setSheetConfig({
                spreadsheetId: academy.google_sheet_config?.spreadsheet_id || '',
                scriptUrl: academy.google_sheet_config?.script_url || 'https://script.google.com/macros/s/AKfycbxX6kLCzYwsxAWEM25YM-OBBTIsHOqN/exec'
            });
        }
    }, []);

    const updateAcademyName = (name: string) => {
        setAcademyName(name);
        const current = storage.getAcademy(academyId) || { id: academyId, name, owner_id: 'local', created_at: new Date().toISOString() };
        const updated: Academy = { ...current, name };
        storage.saveAcademy(updated);
    };

    const updateSheetConfig = (spreadsheetId: string, scriptUrl: string) => {
        setSheetConfig({ spreadsheetId, scriptUrl });
        const current = storage.getAcademy(academyId) || { id: academyId, name: academyName, owner_id: 'local', created_at: new Date().toISOString() };
        const updated: Academy = {
            ...current,
            google_sheet_config: { spreadsheet_id: spreadsheetId, script_url: scriptUrl }
        };
        storage.saveAcademy(updated);
    };

    return (
        <SettingsContext.Provider value={{ academyName, updateAcademyName, sheetConfig, updateSheetConfig }}>
            {children}
        </SettingsContext.Provider>
    );
}
