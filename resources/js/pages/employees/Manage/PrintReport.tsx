import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Claim } from '@/types/claim';
import type { Employee } from '@/types/employee';
import type { EmployeeDeduction } from '@/types/employeeDeduction';
import { forwardRef } from 'react';

interface PrintReportProps {
    employee: Employee;
    allDeductions: EmployeeDeduction[];
    allClaims: Claim[];
    filterMonth?: string | null;
    filterYear?: string | null;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(amount);
}

function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
}

interface MonthlyDeductionRow {
    year: number;
    month: number;
    items: EmployeeDeduction[];
    total: number;
}

interface YearlyClaimRow {
    year: number;
    items: Claim[];
    total: number;
}

export const PrintReport = forwardRef<HTMLDivElement, PrintReportProps>(({ employee, allDeductions, allClaims, filterMonth, filterYear }, ref) => {
    // Group deductions by year-month
    const deductionsByPeriod: Record<string, MonthlyDeductionRow> = {};
    for (const d of allDeductions) {
        const key = `${d.pay_period_year}-${String(d.pay_period_month).padStart(2, '0')}`;
        if (!deductionsByPeriod[key]) {
            deductionsByPeriod[key] = { year: d.pay_period_year, month: d.pay_period_month, items: [], total: 0 };
        }
        deductionsByPeriod[key].items.push(d);
        deductionsByPeriod[key].total += Number(d.amount);
    }
    const deductionPeriods = Object.values(deductionsByPeriod).sort((a, b) => b.year - a.year || b.month - a.month);

    // Group deductions by year for yearly totals
    const deductionsByYear: Record<number, number> = {};
    for (const d of allDeductions) {
        deductionsByYear[d.pay_period_year] = (deductionsByYear[d.pay_period_year] ?? 0) + Number(d.amount);
    }

    // Group claims by year
    const claimsByYearMap: Record<number, YearlyClaimRow> = {};
    for (const c of allClaims) {
        const year = new Date(c.claim_date).getFullYear();
        if (!claimsByYearMap[year]) {
            claimsByYearMap[year] = { year, items: [], total: 0 };
        }
        claimsByYearMap[year].items.push(c);
        claimsByYearMap[year].total += Number(c.amount);
    }
    const claimYears = Object.values(claimsByYearMap).sort((a, b) => b.year - a.year);

    const totalAllDeductions = allDeductions.reduce((sum, d) => sum + Number(d.amount), 0);
    const totalAllClaims = allClaims.reduce((sum, c) => sum + Number(c.amount), 0);

    const currentDate = new Date().toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    // Generate filter description
    const getFilterDescription = () => {
        if (filterMonth && filterYear) {
            return `${MONTHS[parseInt(filterMonth) - 1]} ${filterYear}`;
        } else if (filterMonth) {
            return `${MONTHS[parseInt(filterMonth) - 1]} (All Years)`;
        } else if (filterYear) {
            return `Year ${filterYear}`;
        }
        return 'All Records';
    };

    return (
        <div ref={ref} className="print-container bg-white p-6">
            {/* Print Styles */}
            <style>{`
                @media print {
                    @page {
                        size: A4 landscape;
                        margin: 10mm;
                    }
                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                        font-size: 10pt;
                    }
                    .print-container {
                        padding: 0 !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .print-section {
                        page-break-inside: avoid;
                    }
                    table {
                        font-size: 9pt;
                    }
                    th, td {
                        padding: 4px 8px !important;
                    }
                }
            `}</style>

            {/* Compact Header */}
            <div className="mb-4 flex items-center justify-between border-b-2 border-slate-800 pb-3">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 uppercase">Employee Financial Report</h1>
                    <p className="text-xs text-slate-600">Official Statement of Deductions and Claims — {getFilterDescription()}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs font-semibold text-slate-900">Report Date: {currentDate}</p>
                </div>
            </div>

            {/* Compact Employee Info */}
            <div className="print-section mb-4 rounded border border-slate-200 bg-slate-50 p-3">
                <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                        <span className="text-xs text-slate-500 uppercase">Name:</span>
                        <p className="font-semibold">
                            {employee.last_name}, {employee.first_name}
                        </p>
                    </div>
                    <div>
                        <span className="text-xs text-slate-500 uppercase">Position:</span>
                        <p className="font-semibold">{employee.position}</p>
                    </div>
                    <div>
                        <span className="text-xs text-slate-500 uppercase">Office:</span>
                        <p className="font-semibold">{employee.office?.name || '—'}</p>
                    </div>
                    <div>
                        <span className="text-xs text-slate-500 uppercase">Status:</span>
                        <p className="font-semibold">{employee.employment_status?.name || '—'}</p>
                    </div>
                </div>
            </div>

            {/* Compact Summary */}
            <div className="print-section mb-4 grid grid-cols-2 gap-4">
                <div className="rounded border border-red-200 bg-red-50 p-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-red-800">Total Deductions</span>
                        <span className="text-lg font-bold text-red-700">{formatCurrency(totalAllDeductions)}</span>
                    </div>
                    <p className="text-xs text-red-600">
                        {allDeductions.length} entries • {deductionPeriods.length} period{deductionPeriods.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <div className="rounded border border-green-200 bg-green-50 p-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-green-800">Total Claims</span>
                        <span className="text-lg font-bold text-green-700">{formatCurrency(totalAllClaims)}</span>
                    </div>
                    <p className="text-xs text-green-600">
                        {allClaims.length} claim{allClaims.length !== 1 ? 's' : ''} recorded
                    </p>
                </div>
            </div>

            {/* Two Column Layout for Deductions and Claims */}
            <div className="grid grid-cols-2 gap-6">
                {/* Deductions Column */}
                <div className="print-section">
                    <h2 className="mb-2 border-b border-slate-200 pb-1 text-sm font-bold text-slate-900">Deductions Report</h2>

                    {deductionPeriods.length === 0 ? (
                        <p className="py-4 text-center text-xs text-slate-500">No deductions recorded.</p>
                    ) : (
                        <div className="space-y-3">
                            {/* Yearly Totals */}
                            <div>
                                <h3 className="mb-1 text-xs font-semibold text-slate-600 uppercase">Yearly Totals</h3>
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-100">
                                            <TableHead className="h-7 text-xs font-semibold">Year</TableHead>
                                            <TableHead className="h-7 text-right text-xs font-semibold">Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {Object.entries(deductionsByYear)
                                            .sort(([a], [b]) => Number(b) - Number(a))
                                            .map(([year, total]) => (
                                                <TableRow key={year}>
                                                    <TableCell className="py-1 text-xs">{year}</TableCell>
                                                    <TableCell className="py-1 text-right text-xs font-semibold text-red-600">
                                                        {formatCurrency(total)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Period Breakdown */}
                            <div>
                                <h3 className="mb-1 text-xs font-semibold text-slate-600 uppercase">Period Breakdown</h3>
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-100">
                                            <TableHead className="h-7 text-xs font-semibold">Period</TableHead>
                                            <TableHead className="h-7 text-xs font-semibold">Type</TableHead>
                                            <TableHead className="h-7 text-right text-xs font-semibold">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {deductionPeriods.map((period) => (
                                            <>
                                                {period.items.map((d, idx) => (
                                                    <TableRow key={d.id}>
                                                        {idx === 0 && (
                                                            <TableCell
                                                                rowSpan={period.items.length + 1}
                                                                className="py-1 align-top text-xs font-semibold"
                                                            >
                                                                {MONTHS[period.month - 1]} {period.year}
                                                            </TableCell>
                                                        )}
                                                        <TableCell className="py-1 text-xs">{d.deduction_type?.name ?? '—'}</TableCell>
                                                        <TableCell className="py-1 text-right text-xs text-red-600">
                                                            {formatCurrency(Number(d.amount))}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                <TableRow className="bg-slate-50">
                                                    <TableCell className="py-1 text-right text-xs font-semibold text-slate-500">
                                                        Period Total
                                                    </TableCell>
                                                    <TableCell className="py-1 text-right text-xs font-bold text-red-700">
                                                        {formatCurrency(period.total)}
                                                    </TableCell>
                                                </TableRow>
                                            </>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Claims Column */}
                <div className="print-section">
                    <h2 className="mb-2 border-b border-slate-200 pb-1 text-sm font-bold text-slate-900">Claims Report</h2>

                    {claimYears.length === 0 ? (
                        <p className="py-4 text-center text-xs text-slate-500">No claims recorded.</p>
                    ) : (
                        <div className="space-y-3">
                            {claimYears.map((yearRow) => (
                                <div key={yearRow.year}>
                                    <div className="mb-1 flex items-center justify-between">
                                        <h3 className="text-xs font-semibold text-slate-600 uppercase">{yearRow.year}</h3>
                                        <span className="text-xs font-bold text-green-700">{formatCurrency(yearRow.total)}</span>
                                    </div>
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-100">
                                                <TableHead className="h-7 text-xs font-semibold">Date</TableHead>
                                                <TableHead className="h-7 text-xs font-semibold">Type</TableHead>
                                                <TableHead className="h-7 text-xs font-semibold">Purpose</TableHead>
                                                <TableHead className="h-7 text-right text-xs font-semibold">Amount</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {yearRow.items
                                                .sort((a, b) => new Date(b.claim_date).getTime() - new Date(a.claim_date).getTime())
                                                .map((c) => (
                                                    <TableRow key={c.id}>
                                                        <TableCell className="py-1 text-xs whitespace-nowrap">
                                                            {new Date(c.claim_date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                                                        </TableCell>
                                                        <TableCell className="py-1 text-xs">{c.claim_type?.name ?? '—'}</TableCell>
                                                        <TableCell className="max-w-[150px] truncate py-1 text-xs">{c.purpose}</TableCell>
                                                        <TableCell className="py-1 text-right text-xs font-medium text-green-600">
                                                            {formatCurrency(Number(c.amount))}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="mt-6 border-t border-slate-200 pt-3 text-center text-xs text-slate-500">
                <p>This is a computer-generated report. For verification purposes, please contact HR.</p>
                <p>© {new Date().getFullYear()} Employee Compensation Management System</p>
            </div>
        </div>
    );
});

PrintReport.displayName = 'PrintReport';
