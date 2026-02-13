import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext'; // Import AuthProvider
import RequireAuth from '@/components/auth/RequireAuth'; // Import RequireAuth
import LoginPage from '@/components/auth/LoginPage'; // Import LoginPage
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import DashboardPage from '@/pages/DashboardPage';
import RevenuePage from '@/pages/RevenuePage';
import ExpensesPage from '@/pages/ExpensesPage';
import ReportsPage from '@/pages/ReportsPage';
import SettingsPage from '@/pages/SettingsPage';

function App() {
    return (
        <HashRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />

                    <Route path="/" element={
                        <RequireAuth>
                            <DashboardLayout />
                        </RequireAuth>
                    }>
                        <Route index element={<DashboardPage />} />
                        <Route path="revenue" element={<RevenuePage />} />
                        <Route path="expenses" element={<ExpensesPage />} />
                        <Route path="reports" element={<ReportsPage />} />
                        <Route path="settings" element={<SettingsPage />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </HashRouter>
    );
}

export default App;
