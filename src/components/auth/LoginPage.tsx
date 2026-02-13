import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
    const { signInWithGoogle, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [error, setError] = useState('');

    // Redirect if already logged in
    if (user) {
        const from = (location.state as any)?.from?.pathname || '/';
        navigate(from, { replace: true });
        return null;
    }

    const handleLogin = async () => {
        setIsLoggingIn(true);
        setError('');
        try {
            await signInWithGoogle();
            // Navigation happens automatically via useEffect in AuthContext or above check
        } catch (err: any) {
            console.error(err);
            setError('로그인에 실패했습니다. 다시 시도해주세요.');
            setIsLoggingIn(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center space-y-8 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex justify-center">
                    <div className="bg-blue-100 p-4 rounded-full">
                        <ShieldCheck className="h-12 w-12 text-blue-600" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-slate-900">ITC 세무기장 시스템</h1>
                    <p className="text-slate-500">
                        데이터 보호를 위해 로그인이 필요합니다.<br />
                        구글 계정으로 안전하게 시작하세요.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium">
                        {error}
                    </div>
                )}

                <button
                    onClick={handleLogin}
                    disabled={isLoggingIn}
                    className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium py-3 px-4 rounded-xl transition-all shadow-sm hover:shadow active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLoggingIn ? (
                        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    ) : (
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                    )}
                    <span>
                        {isLoggingIn ? '로그인 중...' : 'Google 계정으로 계속하기'}
                    </span>
                </button>

                <div className="text-xs text-slate-400">
                    &copy; 2026 ITC Academy. All rights reserved.
                </div>
            </div>
        </div>
    );
}
