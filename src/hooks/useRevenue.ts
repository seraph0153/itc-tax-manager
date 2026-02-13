import { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
import { firestoreService } from '@/lib/firestore'; // Added
import { useAuth } from '@/contexts/AuthContext'; // Added
import { Revenue } from '@/lib/types';

export function useRevenue(academyId: string) {
    const { user } = useAuth(); // Add Auth Context
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [revenues, setRevenues] = useState<Revenue[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRevenues();
    }, [academyId, year, month, user]); // Reload when user changes

    const loadRevenues = async () => { // Make async
        setLoading(true);
        try {
            let allYearRevenues: Revenue[] = [];

            if (user) {
                // Cloud Mode
                allYearRevenues = await firestoreService.getRevenues(user.uid, year);
            } else {
                // Local Mode
                allYearRevenues = storage.getRevenues(academyId, year);
            }

            const monthRevenues = allYearRevenues.filter(r => r.month === month);
            setRevenues(monthRevenues);
        } catch (error) {
            console.error("Failed to load revenues:", error);
        } finally {
            setLoading(false);
        }
    };

    const addRevenue = async (data: Omit<Revenue, 'id' | 'created_at'>) => {
        const newRevenue: Revenue = {
            ...data,
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
        };

        if (user) {
            await firestoreService.saveRevenue(user.uid, newRevenue);
        } else {
            storage.saveRevenue(newRevenue);
        }
        loadRevenues();
    };

    const updateRevenue = async (id: string, data: Partial<Revenue>) => {
        const current = revenues.find(r => r.id === id);
        if (!current) return;

        const updated: Revenue = { ...current, ...data };

        if (user) {
            await firestoreService.saveRevenue(user.uid, updated);
        } else {
            storage.saveRevenue(updated);
        }
        loadRevenues();
    };

    const deleteRevenue = async (id: string) => {
        if (user) {
            await firestoreService.deleteRevenue(user.uid, id);
        } else {
            storage.deleteRevenue(academyId, year, id);
        }
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
