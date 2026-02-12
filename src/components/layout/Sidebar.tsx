import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    TrendingUp,
    TrendingDown,
    FileText,
    Settings,
    BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { href: '/', label: '대시보드', icon: LayoutDashboard },
    { href: '/revenue', label: '수입 관리', icon: TrendingUp },
    { href: '/expenses', label: '지출 관리', icon: TrendingDown },
    { href: '/reports', label: '보고서', icon: FileText },
    { href: '/settings', label: '설정', icon: Settings },
];

export function Sidebar() {
    return (
        <aside className="w-64 bg-slate-900 text-slate-300 hidden md:flex flex-col h-screen fixed left-0 top-0">
            <div className="p-6 flex items-center gap-3 text-white">
                <BookOpen className="h-8 w-8 text-blue-400" />
                <div>
                    <h1 className="font-bold text-lg leading-tight">ITC 장현 세무기장</h1>
                    <p className="text-xs text-slate-400">학원 관리 시스템</p>
                </div>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.href}
                        to={item.href}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                                isActive
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                                    : "hover:bg-slate-800 hover:text-white"
                            )
                        }
                    >
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <div className="flex items-center gap-3 px-4 py-2">
                    <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                        ITC
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-medium text-white truncate">관리자</p>
                        <p className="text-xs text-slate-500 truncate">admin@itc.com</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
