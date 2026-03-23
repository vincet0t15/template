import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Claim } from '@/types/claim';
import type { Employee } from '@/types/employee';
import type { EmployeeDeduction } from '@/types/employeeDeduction';
import { FileText, Receipt, TrendingDown } from 'lucide-react';
import { forwardRef } from 'react';

interface PrintReportProps {
    employee: Employee;
    allDeductions: EmployeeDeduction[];
    allClaims: Claim[];
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

export const PrintReport = forwardRef<HTMLDivElement, PrintReportProps>(({ employee, allDeductions, allClaims }, ref) => {
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

    return (
        <div ref={ref} className="print-container bg-white p-8">
            {/* Print Styles */}
            <style>{`
                    @media print {
                        @page {
                            size: A4 landscape;
                            margin: 15mm;
                        }
                        body {
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }
                        .print-container {
                            padding: 0 !important;
                        }
                        .no-print {
                            display: none !important;
                        }
                        .page-break {
                            page-break-before: always;
                        }
                        .avoid-break {
                            page-break-inside: avoid;
                        }
                    }
                `}</style>

            {/* Header Section */}
            <div className="mb-8 border-b-2 border-slate-800 pb-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 uppercase">Employee Financial Report</h1>
                        <p className="mt-1 text-sm text-slate-600">Official Statement of Deductions and Claims</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900">Report Date:</p>
                        <p className="text-sm text-slate-600">{currentDate}</p>
                    </div>
                </div>
            </div>

            {/* Employee Information */}
            <div className="avoid-break mb-8 rounded-lg border border-slate-200 bg-slate-50 p-6">
                <h2 className="mb-4 text-lg font-bold text-slate-900">Employee Information</h2>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <p className="text-xs tracking-wide text-slate-500 uppercase">Full Name</p>
                        <p className="text-base font-semibold text-slate-900">
                            {employee.last_name}, {employee.first_name} {employee.middle_name} {employee.suffix}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs tracking-wide text-slate-500 uppercase">Position</p>
                        <p className="text-base font-semibold text-slate-900">{employee.position}</p>
                    </div>
                    <div>
                        <p className="text-xs tracking-wide text-slate-500 uppercase">Office</p>
                        <p className="text-base font-semibold text-slate-900">{employee.office?.name || '—'}</p>
                    </div>
                    <div>
                        <p className="text-xs tracking-wide text-slate-500 uppercase">Employment Status</p>
                        <p className="text-base font-semibold text-slate-900">{employee.employment_status?.name || '—'}</p>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="avoid-break mb-8 grid grid-cols-2 gap-6">
                <Card className="border-red-200 bg-red-50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-red-800">Total Deductions (All Time)</CardTitle>
                        <TrendingDown className="h-5 w-5 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-700">{formatCurrency(totalAllDeductions)}</div>
                        <p className="mt-1 text-xs text-red-600">
                            {allDeductions.length} deduction entries across {deductionPeriods.length} period{deductionPeriods.length !== 1 ? 's' : ''}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-green-200 bg-green-50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-green-800">Total Claims (All Time)</CardTitle>
                        <Receipt className="h-5 w-5 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-700">{formatCurrency(totalAllClaims)}</div>
                        <p className="mt-1 text-xs text-green-600">
                            {allClaims.length} claim{allClaims.length !== 1 ? 's' : ''} recorded
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Deductions Section */}
            <div className="mb-8">
                <div className="mb-4 flex items-center gap-2 border-b border-slate-200 pb-2">
                    <FileText className="h-5 w-5 text-slate-700" />
                    <h2 className="text-lg font-bold text-slate-900">Deductions Report</h2>
                </div>

                {deductionPeriods.length === 0 ? (
                    <div className="rounded-md border border-slate-200 py-8 text-center text-sm text-slate-500">No deductions recorded.</div>
                ) : (
                    <div className="space-y-6">
                        {/* Yearly Totals */}
                        <div className="avoid-break">
                            <h3 className="mb-3 text-sm font-semibold tracking-wide text-slate-700 uppercase">Yearly Deduction Totals</h3>
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-100">
                                        <TableHead className="font-semibold text-slate-900">Year</TableHead>
                                        <TableHead className="text-right font-semibold text-slate-900">Total Deducted</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Object.entries(deductionsByYear)
                                        .sort(([a], [b]) => Number(b) - Number(a))
                                        .map(([year, total]) => (
                                            <TableRow key={year}>
                                                <TableCell className="font-medium">{year}</TableCell>
                                                <TableCell className="text-right font-semibold text-red-600">{formatCurrency(total)}</TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Period Breakdown */}
                        <div className="avoid-break">
                            <h3 className="mb-3 text-sm font-semibold tracking-wide text-slate-700 uppercase">Period Breakdown</h3>
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-100">
                                        <TableHead className="font-semibold text-slate-900">Period</TableHead>
                                        <TableHead className="font-semibold text-slate-900">Deduction Type</TableHead>
                                        <TableHead className="text-right font-semibold text-slate-900">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {deductionPeriods.map((period) => (
                                        <>
                                            {period.items.map((d, idx) => (
                                                <TableRow key={d.id}>
                                                    {idx === 0 && (
                                                        <TableCell rowSpan={period.items.length + 1} className="align-top font-semibold">
                                                            {MONTHS[period.month - 1]} {period.year}
                                                        </TableCell>
                                                    )}
                                                    <TableCell>{d.deduction_type?.name ?? '—'}</TableCell>
                                                    <TableCell className="text-right text-red-600">{formatCurrency(Number(d.amount))}</TableCell>
                                                </TableRow>
                                            ))}
                                            <TableRow className="bg-slate-50">
                                                <TableCell className="text-right text-xs font-semibold text-slate-500 italic">Period Total</TableCell>
                                                <TableCell className="text-right font-bold text-red-700">{formatCurrency(period.total)}</TableCell>
                                            </TableRow>
                                        </>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}
            </div>

            {/* Page Break for Claims */}
            {claimYears.length > 0 && deductionPeriods.length > 0 && <div className="page-break" />}

            {/* Claims Section */}
            <div>
                <div className="mb-4 flex items-center gap-2 border-b border-slate-200 pb-2">
                    <Receipt className="h-5 w-5 text-slate-700" />
                    <h2 className="text-lg font-bold text-slate-900">Claims Report</h2>
                </div>

                {claimYears.length === 0 ? (
                    <div className="rounded-md border border-slate-200 py-8 text-center text-sm text-slate-500">No claims recorded.</div>
                ) : (
                    <div className="space-y-6">
                        {claimYears.map((yearRow) => (
                            <div key={yearRow.year} className="avoid-break">
                                <div className="mb-3 flex items-center justify-between">
                                    <h3 className="text-sm font-semibold tracking-wide text-slate-700 uppercase">{yearRow.year}</h3>
                                    <span className="text-sm font-bold text-green-700">Total: {formatCurrency(yearRow.total)}</span>
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-100">
                                            <TableHead className="font-semibold text-slate-900">Date</TableHead>
                                            <TableHead className="font-semibold text-slate-900">Type</TableHead>
                                            <TableHead className="font-semibold text-slate-900">Purpose</TableHead>
                                            <TableHead className="text-right font-semibold text-slate-900">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {yearRow.items
                                            .sort((a, b) => new Date(b.claim_date).getTime() - new Date(a.claim_date).getTime())
                                            .map((c) => (
                                                <TableRow key={c.id}>
                                                    <TableCell className="whitespace-nowrap">{formatDate(c.claim_date)}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="border-slate-300">
                                                            {c.claim_type?.name ?? '—'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="max-w-[250px]">{c.purpose}</TableCell>
                                                    <TableCell className="text-right font-medium text-green-600">
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

            {/* Footer */}
            <div className="mt-12 border-t border-slate-200 pt-6 text-center text-xs text-slate-500">
                <p>This is a computer-generated report. For verification purposes, please contact HR.</p>
                <p className="mt-1">© {new Date().getFullYear()} Employee Compensation Management System</p>
            </div>
        </div>
    );
});

PrintReport.displayName = 'PrintReport';
