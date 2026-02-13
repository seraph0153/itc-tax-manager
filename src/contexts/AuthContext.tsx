import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { firestoreService } from '@/lib/firestore';
import { UserProfile } from '@/lib/types';

interface AuthContextType {
    user: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const MASTER_EMAIL = 'rahangel77@gmail.com';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                try {
                    // Fetch or Create Profile
                    let profile = await firestoreService.getUserProfile(currentUser.uid);

                    if (!profile) {
                        const isMaster = currentUser.email === MASTER_EMAIL;
                        const newProfile: UserProfile = {
                            uid: currentUser.uid,
                            email: currentUser.email || '',
                            displayName: currentUser.displayName || 'No Name',
                            photoURL: currentUser.photoURL || undefined,
                            role: isMaster ? 'master' : 'user',
                            status: isMaster ? 'approved' : 'pending',
                            requestedAt: new Date().toISOString(),
                        };
                        await firestoreService.saveUserProfile(newProfile);
                        profile = newProfile;
                    }
                    setUserProfile(profile);
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                    // Handle error appropriately, maybe set user to null or show error
                    setUserProfile(null);
                }
            } else {
                setUserProfile(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Error signing in with Google", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
            setUserProfile(null);
        } catch (error) {
            console.error("Error signing out", error);
            throw error;
        }
    };

    if (loading) {
        return <div className="h-screen w-full flex items-center justify-center bg-slate-50">Loading...</div>;
    }

    return (
        <AuthContext.Provider value={{ user, userProfile, loading, signInWithGoogle, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
