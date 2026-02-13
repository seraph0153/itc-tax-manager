import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function RequireAdmin({ children }: { children: JSX.Element }) {
    const { userProfile, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
        );
    }

    if (!userProfile) {
        return <Navigate to="/login" replace />;
    }

    if (userProfile.role !== 'master') {
        // If user is not master, redirect to dashboard or show unauthorized
        // Redirecting to dashboard is safer/cleaner
        return <Navigate to="/" replace />;
    }

    return children;
}
