import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    TrendingUp,
    TrendingDown,
    FileText,
    Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { href: '/', label: '홈', icon: LayoutDashboard },
    { href: '/revenue', label: '수입', icon: TrendingUp },
    { href: '/expenses', label: '지출', icon: TrendingDown },
    { href: '/reports', label: '보고서', icon: FileText },
    { href: '/settings', label: '설정', icon: Settings },
];

export function MobileNav() {
    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2 flex justify-around items-center z-50 safe-area-bottom">
            {navItems.map((item) => (
                <NavLink
                    key={item.href}
                    to={item.href}
                    className={({ isActive }) =>
                        cn(
                            "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors min-w-[60px]",
                            isActive
                                ? "text-blue-600"
                                : "text-slate-500 hover:text-slate-900"
                        )
                    }
                >
                    <item.icon className="h-6 w-6" />
                    <span className="text-[10px] font-medium">{item.label}</span>
                </NavLink>
            ))}
        </nav>
    );
}
