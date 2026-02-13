export type UserRole = 'admin' | 'user' | 'master';
export type UserStatus = 'pending' | 'approved' | 'rejected';

export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    role: UserRole;
    status: UserStatus;
    requestedAt: string;
    approvedAt?: string;
}

export interface User { // Legacy, keeping for strict compat if needed, but UserProfile is main
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'viewer'; // old
    academy_id: string;
}

export interface Academy {
    id: string;
    name: string;
    owner_id: string;
    fiscal_year_start_month: number; // usually 1 for Jan
    financial_manager_name?: string;
    google_sheet_config?: {
        spreadsheet_id: string;
        script_url: string;
    };
    created_at: string;
}

export interface Revenue {
    id: string;
    academy_id: string;
    year: number;
    month: number;
    day: number;

    student_count: number;

    amount_card: number;
    amount_cash: number;
    amount_local_currency: number; // 지역화폐
    amount_other: number;

    note?: string;
    created_at: string;
}

// Derived/Computed Revenue totals
export interface RevenueSummary extends Revenue {
    total_amount: number;
    average_tuition: number;
}

export interface ExpenseCategory {
    id: string;
    academy_id: string;
    name: string;
    is_default: boolean; // e.g., Rent, Maintenance
    is_fixed_cost: boolean; // For Fixed vs Variable analysis
}

export interface Expense {
    id: string;
    academy_id: string;
    year: number;

    month: number;
    day: number;

    category_id: string;
    category_name: string; // De-normalized for easier display/export

    amount: number;
    payment_method: 'card' | 'transfer' | 'cash';
    receipt_url?: string;
    note?: string;

    // Daily Instructor Fee
    is_instructor_fee?: boolean;
    instructor_name?: string;
    tax_rate?: number; // 3.3
    withholding_tax?: number;
    actual_payment?: number;

    created_at: string;
}

export interface MonthlySummary {
    year: number;
    month: number;
    total_revenue: number;
    total_expense: number;
    net_income: number;
}
