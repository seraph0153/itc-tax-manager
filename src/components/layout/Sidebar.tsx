import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    TrendingUp,
    TrendingDown,
    FileText,
    Settings,
    BookOpen,
    LogOut,
    Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
    { href: '/', label: '대시보드', icon: LayoutDashboard },
    { href: '/revenue', label: '수입 관리', icon: TrendingUp },
    { href: '/expenses', label: '지출 관리', icon: TrendingDown },
    { href: '/reports', label: '보고서', icon: FileText },
    { href: '/settings', label: '설정', icon: Settings },
];

export function Sidebar() {
    const { user, userProfile, logout } = useAuth();
    const isMaster = userProfile?.role === 'master';

    return (
        <aside className={cn("w-64 bg-slate-900 text-slate-300 hidden md:flex flex-col h-screen fixed left-0 top-0 z-40")}>
            <div className="p-6 flex items-center gap-3 text-white">
                <div className="bg-blue-600/20 p-2 rounded-lg">
                    <BookOpen className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                    <h1 className="font-bold text-lg leading-tight">ITC 장현 세무기장</h1>
                    <p className="text-xs text-slate-400">학원 관리 시스템 v2</p>
                </div>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.href}
                        to={item.href}
                        className={({ isActive }: { isActive: boolean }) =>
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

                {isMaster && (
                    <NavLink
                        to="/admin"
                        className={({ isActive }: { isActive: boolean }) =>
                            cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mt-4 border-t border-slate-800",
                                isActive
                                    ? "bg-purple-600 text-white"
                                    : "hover:bg-slate-800 hover:text-white"
                            )
                        }
                    >
                        <Shield className="h-5 w-5 text-purple-300" />
                        <span className="font-medium">관리자(Admin)</span>
                    </NavLink>
                )}
            </nav>

            <div className="p-4 border-t border-slate-800 space-y-4">
                <div className="flex items-center gap-3 px-2">
                    {user?.photoURL ? (
                        <img src={user.photoURL} alt="User" className="h-8 w-8 rounded-full border border-slate-600" />
                    ) : (
                        <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                            {user?.email?.[0].toUpperCase()}
                        </div>
                    )}
                    <div className="overflow-hidden flex-1">
                        <p className="text-sm font-medium text-white truncate">{userProfile?.displayName}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>
                </div>

                <button
                    onClick={() => logout()}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <LogOut className="h-4 w-4" />
                    로그아웃
                </button>
            </div>
        </aside>
    );
}
