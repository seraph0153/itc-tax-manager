import { useAuth } from '@/contexts/AuthContext';
import { Lock, LogOut } from 'lucide-react';

export default function PendingApproval() {
    const { logout, user } = useAuth();

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center space-y-6">
                <div className="flex justify-center">
                    <div className="bg-yellow-100 p-4 rounded-full">
                        <Lock className="h-10 w-10 text-yellow-600" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-slate-900">승인 대기 중</h1>
                    <p className="text-slate-500">
                        회원님의 계정({user?.email})은 현재 승인 대기 중입니다.<br />
                        관리자(rahangel77@gmail.com)의 승인 후 서비스를 이용하실 수 있습니다.
                    </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-600">
                    요청이 접수되었습니다. 승인이 완료되면 다시 로그인해주세요.
                </div>

                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium py-3 px-4 rounded-xl transition-all"
                >
                    <LogOut className="h-4 w-4" />
                    다른 계정으로 로그인
                </button>
            </div>
        </div>
    );
}
