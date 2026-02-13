import { Revenue, Expense } from './types';

export function downloadSimpleLedgerCSV(year: number, revenues: Revenue[], expenses: Expense[], academyName: string) {
    // 1. Combine and Sort Data
    const allTransactions = [
        ...revenues.map(r => ({
            date: `${r.year}-${String(r.month).padStart(2, '0')}-${String(r.day || 1).padStart(2, '0')}`,
            type: '수입',
            category: '매출', // Simplified for revenue
            note: r.note || '', // 'card' | 'cash' etc or custom note?
            revenue: (r.amount_card + r.amount_cash + r.amount_local_currency + r.amount_other),
            expense: 0,
            remark: `카드:${r.amount_card}/현금:${r.amount_cash}/기타:${r.amount_other}`
        })),
        ...expenses.map(e => ({
            date: `${e.year}-${String(e.month).padStart(2, '0')}-${String(e.day || 1).padStart(2, '0')}`,
            type: '지출',
            category: e.category_name,
            note: e.note || '',
            revenue: 0,
            expense: e.amount,
            remark: e.payment_method === 'card' ? '카드' : e.payment_method === 'transfer' ? '이체' : '현금'
        }))
    ].sort((a, b) => a.date.localeCompare(b.date));

    // 2. CSV Header
    const headers = ['날짜', '구분', '계정과목', '적요', '수입금액', '지출금액', '비고'];

    // 3. Generate CSV Rows
    const rows = allTransactions.map(t => [
        t.date,
        t.type,
        t.category,
        `"${t.note.replace(/"/g, '""')}"`, // Escape quotes
        t.revenue,
        t.expense,
        t.remark
    ]);

    // 4. BOM for Excel (Korean encoding fix)
    const BOM = '\uFEFF';
    const csvContent = BOM + [
        headers.join(','),
        ...rows.map(r => r.join(','))
    ].join('\n');

    // 5. Trigger Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${academyName}_${year}년_간편장부.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
