import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import PendingApproval from '@/components/auth/PendingApproval';

export default function RequireAuth({ children }: { children: JSX.Element }) {
    const { user, userProfile, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (userProfile?.status === 'pending') {
        return <PendingApproval />;
    }

    if (userProfile?.status === 'rejected') {
        alert('승인이 거절되었습니다. 관리자에게 문의하세요.');
        // Potentially force logout or show a rejected screen
        return <Navigate to="/login" replace />;
    }

    return children;
}
