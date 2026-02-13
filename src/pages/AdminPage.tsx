import { useState, useEffect } from 'react';
import { firestoreService } from '@/lib/firestore';
import { UserProfile } from '@/lib/types';
import { Check, X, Shield, Loader2 } from 'lucide-react';

export default function AdminPage() {
    const [pendingUsers, setPendingUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPendingUsers();
    }, []);

    const loadPendingUsers = async () => {
        setLoading(true);
        try {
            const users = await firestoreService.getPendingUsers();
            setPendingUsers(users);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (uid: string) => {
        if (!confirm('이 사용자를 승인하시겠습니까?')) return;
        try {
            await firestoreService.updateUserStatus(uid, 'approved');
            setPendingUsers(prev => prev.filter(u => u.uid !== uid));
            alert('승인되었습니다.');
        } catch (error) {
            console.error(error);
            alert('처리 중 오류가 발생했습니다.');
        }
    };

    const handleReject = async (uid: string) => {
        if (!confirm('이 사용자를 거절하시겠습니까?')) return;
        try {
            await firestoreService.updateUserStatus(uid, 'rejected');
            setPendingUsers(prev => prev.filter(u => u.uid !== uid));
            alert('거절되었습니다.');
        } catch (error) {
            console.error(error);
            alert('처리 중 오류가 발생했습니다.');
        }
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Shield className="h-6 w-6 text-blue-600" />
                    관리자 페이지
                </h1>
                <p className="text-slate-500">사용자 승인 요청을 관리합니다.</p>
            </header>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50">
                    <h2 className="font-semibold text-slate-700">승인 대기 목록 ({pendingUsers.length})</h2>
                </div>

                {pendingUsers.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">대기 중인 요청이 없습니다.</div>
                ) : (
                    <ul className="divide-y divide-slate-100">
                        {pendingUsers.map(user => (
                            <li key={user.uid} className="p-4 flex items-center justify-between hover:bg-slate-50">
                                <div>
                                    <p className="font-medium text-slate-900">{user.displayName}</p>
                                    <p className="text-sm text-slate-500">{user.email}</p>
                                    <p className="text-xs text-slate-400 mt-1">요청일: {new Date(user.requestedAt).toLocaleDateString()}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleApprove(user.uid)}
                                        className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                                        title="승인"
                                    >
                                        <Check className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleReject(user.uid)}
                                        className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                        title="거절"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
