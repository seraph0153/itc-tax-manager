import { useState, useEffect } from 'react';
import { firestoreService } from '@/lib/firestore';
import { UserProfile } from '@/lib/types';
import { Check, Shield, Loader2 } from 'lucide-react';

export default function AdminPage() {
    const [pendingUsers, setPendingUsers] = useState<UserProfile[]>([]);
    const [approvedUsers, setApprovedUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const [pending, approved] = await Promise.all([
                firestoreService.getPendingUsers(),
                firestoreService.getApprovedUsers()
            ]);
            setPendingUsers(pending);
            setApprovedUsers(approved);
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
            await loadUsers(); // Reload to refresh lists
            alert('승인되었습니다.');
        } catch (error) {
            console.error(error);
            alert('처리 중 오류가 발생했습니다.');
        }
    };

    const handleReject = async (uid: string) => {
        if (!confirm('이 사용자의 승인을 거절/취소하시겠습니까?')) return;
        try {
            await firestoreService.updateUserStatus(uid, 'rejected');
            await loadUsers(); // Reload to refresh lists
            alert('거절/중지되었습니다.');
        } catch (error) {
            console.error(error);
            alert('처리 중 오류가 발생했습니다.');
        }
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Shield className="h-6 w-6 text-blue-600" />
                    관리자 페이지
                </h1>
                <p className="text-slate-500">사용자 권한을 통합 관리합니다.</p>
            </header>

            {/* Pending Users Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-yellow-50">
                    <h2 className="font-semibold text-yellow-800 flex items-center gap-2">
                        <Loader2 className="h-4 w-4" /> 승인 대기 목록 ({pendingUsers.length})
                    </h2>
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
                                        className="px-3 py-1.5 bg-green-100 text-green-700 text-sm font-medium rounded-lg hover:bg-green-200 transition-colors"
                                    >
                                        승인
                                    </button>
                                    <button
                                        onClick={() => handleReject(user.uid)}
                                        className="px-3 py-1.5 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors"
                                    >
                                        거절
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Active Users Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-blue-50">
                    <h2 className="font-semibold text-blue-800 flex items-center gap-2">
                        <Check className="h-4 w-4" /> 활성 사용자 목록 ({approvedUsers.length})
                    </h2>
                </div>

                {approvedUsers.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">활성 사용자가 없습니다.</div>
                ) : (
                    <ul className="divide-y divide-slate-100">
                        {approvedUsers.map(user => (
                            <li key={user.uid} className="p-4 flex items-center justify-between hover:bg-slate-50">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-slate-900">{user.displayName}</p>
                                        {user.role === 'master' && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">MASTER</span>}
                                    </div>
                                    <p className="text-sm text-slate-500">{user.email}</p>
                                    <p className="text-xs text-slate-400 mt-1">승인일: {user.approvedAt ? new Date(user.approvedAt).toLocaleDateString() : '-'}</p>
                                </div>
                                {user.role !== 'master' && (
                                    <button
                                        onClick={() => handleReject(user.uid)}
                                        className="px-3 py-1.5 border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors"
                                    >
                                        이용 중지
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
