import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Claim } from '@/types/claim';
import type { Employee } from '@/types/employee';
import type { EmployeeDeduction } from '@/types/employeeDeduction';
import { FileText, Receipt, TrendingDown } from 'lucide-react';
import { Fragment } from 'react';

interface ReportsProps {
    employee: Employee;
    allDeductions: EmployeeDeduction[];
    allClaims: Claim[];
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(amount);
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

function Reports({ employee, allDeductions, allClaims }: ReportsProps) {
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

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-2">
                <FileText className="text-muted-foreground h-5 w-5" />
                <div>
                    <h2 className="text-lg font-semibold">Employee Report</h2>
                    <p className="text-muted-foreground text-sm">
                        {employee.last_name}, {employee.first_name} {employee.middle_name} — {employee.position}
                    </p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-2">
                <Card className="border-red-200 bg-red-50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-red-800">Total Deductions (All Time)</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-500" />
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
                        <Receipt className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-700">{formatCurrency(totalAllClaims)}</div>
                        <p className="mt-1 text-xs text-green-600">
                            {allClaims.length} claim{allClaims.length !== 1 ? 's' : ''} recorded
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Deductions Report */}
            <div className="space-y-3">
                <h3 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">Deductions by Period</h3>

                {deductionPeriods.length === 0 ? (
                    <div className="text-muted-foreground rounded-sm border py-10 text-center text-sm">No deductions recorded.</div>
                ) : (
                    <div className="space-y-4">
                        {/* Yearly totals */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Yearly Deduction Totals</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Year</TableHead>
                                            <TableHead className="text-right">Total Deducted</TableHead>
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
                            </CardContent>
                        </Card>

                        {/* Per-period breakdown */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Period Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Period</TableHead>
                                            <TableHead>Deduction Type</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {deductionPeriods.map((period) => (
                                            <Fragment key={`${period.year}-${period.month}`}>
                                                {period.items.map((d, idx) => (
                                                    <TableRow key={d.id}>
                                                        {idx === 0 && (
                                                            <TableCell rowSpan={period.items.length + 1} className="align-top font-medium">
                                                                {MONTHS[period.month - 1]} {period.year}
                                                            </TableCell>
                                                        )}
                                                        <TableCell className="text-muted-foreground">{d.deduction_type?.name ?? '—'}</TableCell>
                                                        <TableCell className="text-right text-red-600">{formatCurrency(Number(d.amount))}</TableCell>
                                                    </TableRow>
                                                ))}
                                                <TableRow key={`total-${period.year}-${period.month}`} className="bg-muted/30">
                                                    <TableCell className="text-right text-xs font-semibold text-slate-500 italic">
                                                        Period Total
                                                    </TableCell>
                                                    <TableCell className="text-right font-bold text-red-600">
                                                        {formatCurrency(period.total)}
                                                    </TableCell>
                                                </TableRow>
                                            </Fragment>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>

            <Separator />

            {/* Claims Report */}
            <div className="space-y-3">
                <h3 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">Claims by Year</h3>

                {claimYears.length === 0 ? (
                    <div className="text-muted-foreground rounded-sm border py-10 text-center text-sm">No claims recorded.</div>
                ) : (
                    <div className="space-y-4">
                        {claimYears.map((yearRow) => (
                            <Card key={yearRow.year}>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm">{yearRow.year}</CardTitle>
                                    <span className="text-sm font-semibold text-green-600">{formatCurrency(yearRow.total)}</span>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Purpose</TableHead>
                                                <TableHead className="text-right">Amount</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {yearRow.items
                                                .sort((a, b) => new Date(b.claim_date).getTime() - new Date(a.claim_date).getTime())
                                                .map((c) => (
                                                    <TableRow key={c.id}>
                                                        <TableCell className="whitespace-nowrap">
                                                            {new Date(c.claim_date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline">{c.claim_type?.name ?? '—'}</Badge>
                                                        </TableCell>
                                                        <TableCell className="text-muted-foreground max-w-[200px] truncate">{c.purpose}</TableCell>
                                                        <TableCell className="text-right font-medium text-green-600">
                                                            {formatCurrency(Number(c.amount))}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Reports;
