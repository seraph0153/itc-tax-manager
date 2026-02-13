import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { migrationService } from '@/lib/migration';
import { firestoreService } from '@/lib/firestore';

export function DashboardLayout() {
    const { user } = useAuth();

    useEffect(() => {
        const checkMigration = async () => {
            if (user) {
                // Check if cloud data exists (e.g., check categories)
                const categories = await firestoreService.getCategories(user.uid);
                const isMigrated = localStorage.getItem('migration_completed');

                if (categories.length === 0 && !isMigrated) {
                    console.log("No cloud data found. Starting migration...");
                    try {
                        await migrationService.migrateLocalDataToCloud(user);
                        alert("기존 데이터가 클라우드로 안전하게 이전되었습니다!");
                    } catch (error) {
                        console.error("Migration failed:", error);
                        alert("데이터 이전 중 오류가 발생했습니다.");
                    }
                }
            }
        };

        checkMigration();
    }, [user]);

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar />
            <main className={cn("min-h-screen pb-20 transition-all duration-300", "md:pl-64 md:pb-0")}>
                <div className="max-w-7xl mx-auto p-4 md:p-8">
                    <Outlet />
                </div>
            </main>
            <MobileNav />
        </div>
    );
}
