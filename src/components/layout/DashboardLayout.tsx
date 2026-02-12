import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';

export function DashboardLayout() {
    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar />
            <main className="md:pl-64 min-h-screen pb-20 md:pb-0">
                <div className="max-w-7xl mx-auto p-4 md:p-8">
                    <Outlet />
                </div>
            </main>
            <MobileNav />
        </div>
    );
}
