import { LucideIcon } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

interface KPICardProps {
    title: string;
    amount: number;
    icon: LucideIcon;
    trend?: number; // percentage
    className?: string;
    iconClassName?: string;
}

export function KPICard({ title, amount, icon: Icon, trend, className, iconClassName }: KPICardProps) {
    return (
        <div className={cn("bg-white p-6 rounded-xl shadow-sm border border-slate-100", className)}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <h3 className="text-2xl font-bold text-slate-900 mt-2">{formatCurrency(amount)}</h3>
                </div>
                <div className={cn("p-2 rounded-lg bg-slate-50", iconClassName)}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>
            {trend !== undefined && (
                <div className="mt-4 flex items-center text-sm">
                    <span className={cn("font-medium", trend >= 0 ? "text-green-600" : "text-red-600")}>
                        {trend > 0 ? '+' : ''}{trend}%
                    </span>
                    <span className="text-slate-400 ml-2">지난 달 대비</span>
                </div>
            )}
        </div>
    );
}
