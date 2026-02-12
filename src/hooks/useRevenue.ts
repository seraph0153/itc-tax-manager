import { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
import { Revenue } from '@/lib/types';

export function useRevenue(academyId: string) {
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [revenues, setRevenues] = useState<Revenue[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRevenues();
    }, [academyId, year, month]);

    const loadRevenues = () => {
        setLoading(true);
        // Storage stores by year, so we fetch year and filter by month
        const allYearRevenues = storage.getRevenues(academyId, year);
        const monthRevenues = allYearRevenues.filter(r => r.month === month);
        setRevenues(monthRevenues);
        setLoading(false);
    };

    const addRevenue = (data: Omit<Revenue, 'id' | 'created_at'>) => {
        const newRevenue: Revenue = {
            ...data,
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
        };
        storage.saveRevenue(newRevenue);
        loadRevenues();
    };

    const updateRevenue = (id: string, data: Partial<Revenue>) => {
        const current = revenues.find(r => r.id === id);
        if (!current) return;

        const updated: Revenue = { ...current, ...data };
        storage.saveRevenue(updated);
        loadRevenues();
    };

    const deleteRevenue = (id: string) => {
        storage.deleteRevenue(academyId, year, id);
        loadRevenues();
    };

    return {
        year, setYear,
        month, setMonth,
        revenues,
        loading,
        addRevenue,
        updateRevenue,
        deleteRevenue,
        refresh: loadRevenues
    };
}
