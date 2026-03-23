import { CustomComboBox } from '@/components/CustomComboBox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Claim } from '@/types/claim';
import type { Employee } from '@/types/employee';
import type { EmployeeDeduction } from '@/types/employeeDeduction';
import { FileText, Printer, Receipt, TrendingDown, X } from 'lucide-react';
import { Fragment, useMemo, useRef, useState } from 'react';
import { PrintReport } from './PrintReport';

interface ReportsProps {
    employee: Employee;
    allDeductions: EmployeeDeduction[];
    allClaims: Claim[];
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(amount);
}

// Helper function to get the effective amount for a specific period
function getEffectiveAmount(history: { amount: number; effective_date: string }[] | undefined, periodYear: number, periodMonth: number): number {
    if (!history || history.length === 0) return 0;

    // Create a date for the end of the period (last day of the month)
    const periodEndDate = new Date(periodYear, periodMonth, 0);

    // Sort history by effective_date descending (newest first)
    const sortedHistory = [...history].sort((a, b) => new Date(b.effective_date).getTime() - new Date(a.effective_date).getTime());

    // Find the most recent record that was effective before or during this period
    for (const record of sortedHistory) {
        const effectiveDate = new Date(record.effective_date);
        if (effectiveDate <= periodEndDate) {
            return Number(record.amount);
        }
    }

    // If no record found, return the oldest one (fallback)
    return Number(sortedHistory[sortedHistory.length - 1]?.amount ?? 0);
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
    const [showPrintPreview, setShowPrintPreview] = useState(false);
    const [filterMonth, setFilterMonth] = useState<string | null>(null);
    const [filterYear, setFilterYear] = useState<string | null>(null);
    const printRef = useRef<HTMLDivElement>(null);

    // Extract available years from data
    const availableYears = useMemo(() => {
        const years = new Set<number>();
        allDeductions.forEach((d) => years.add(d.pay_period_year));
        allClaims.forEach((c) => years.add(new Date(c.claim_date).getFullYear()));
        return Array.from(years).sort((a, b) => b - a);
    }, [allDeductions, allClaims]);

    // Filter deductions based on selected month/year
    const filteredDeductions = useMemo(() => {
        return allDeductions.filter((d) => {
            const monthMatch = !filterMonth || d.pay_period_month === parseInt(filterMonth);
            const yearMatch = !filterYear || d.pay_period_year === parseInt(filterYear);
            return monthMatch && yearMatch;
        });
    }, [allDeductions, filterMonth, filterYear]);

    // Filter claims based on selected month/year
    const filteredClaims = useMemo(() => {
        return allClaims.filter((c) => {
            const claimDate = new Date(c.claim_date);
            const monthMatch = !filterMonth || claimDate.getMonth() + 1 === parseInt(filterMonth);
            const yearMatch = !filterYear || claimDate.getFullYear() === parseInt(filterYear);
            return monthMatch && yearMatch;
        });
    }, [allClaims, filterMonth, filterYear]);

    // Group deductions by year-month
    const deductionsByPeriod: Record<string, MonthlyDeductionRow> = {};
    for (const d of filteredDeductions) {
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
    for (const d of filteredDeductions) {
        deductionsByYear[d.pay_period_year] = (deductionsByYear[d.pay_period_year] ?? 0) + Number(d.amount);
    }

    // Group claims by year
    const claimsByYearMap: Record<number, YearlyClaimRow> = {};
    for (const c of filteredClaims) {
        const year = new Date(c.claim_date).getFullYear();
        if (!claimsByYearMap[year]) {
            claimsByYearMap[year] = { year, items: [], total: 0 };
        }
        claimsByYearMap[year].items.push(c);
        claimsByYearMap[year].total += Number(c.amount);
    }
    const claimYears = Object.values(claimsByYearMap).sort((a, b) => b.year - a.year);

    const totalAllDeductions = filteredDeductions.reduce((sum, d) => sum + Number(d.amount), 0);
    const totalAllClaims = filteredClaims.reduce((sum, c) => sum + Number(c.amount), 0);

    // Determine which compensation values to show based on filters
    // If a specific month/year is filtered, use historical data for that period
    // Otherwise use the latest values
    let salary: number;
    let pera: number;
    let rata: number;

    if (filterMonth && filterYear) {
        // Use historical data for the specific filtered period
        salary = getEffectiveAmount(employee.salaries, parseInt(filterYear), parseInt(filterMonth));
        pera = getEffectiveAmount(employee.peras, parseInt(filterYear), parseInt(filterMonth));
        rata = employee.is_rata_eligible ? getEffectiveAmount(employee.ratas, parseInt(filterYear), parseInt(filterMonth)) : 0;
    } else if (filterYear) {
        // For year-only filter, use the value at the end of that year (December)
        salary = getEffectiveAmount(employee.salaries, parseInt(filterYear), 12);
        pera = getEffectiveAmount(employee.peras, parseInt(filterYear), 12);
        rata = employee.is_rata_eligible ? getEffectiveAmount(employee.ratas, parseInt(filterYear), 12) : 0;
    } else {
        // No filters - use latest values
        salary = Number(employee.latest_salary?.amount ?? 0);
        pera = Number(employee.latest_pera?.amount ?? 0);
        rata = employee.is_rata_eligible ? Number(employee.latest_rata?.amount ?? 0) : 0;
    }

    const grossPay = salary + pera + rata;
    const netPay = grossPay - totalAllDeductions;

    const hasActiveFilters = filterMonth || filterYear;

    const clearFilters = () => {
        setFilterMonth(null);
        setFilterYear(null);
    };

    const handlePrint = () => {
        const printContent = printRef.current;
        if (!printContent) return;

        const originalContents = document.body.innerHTML;
        const printContents = printContent.innerHTML;

        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload();
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FileText className="text-muted-foreground h-5 w-5" />
                    <div>
                        <h2 className="text-lg font-semibold">Employee Report</h2>
                        <p className="text-muted-foreground text-sm">
                            {employee.last_name}, {employee.first_name} {employee.middle_name} — {employee.position}
                        </p>
                    </div>
                </div>
                <Button onClick={() => setShowPrintPreview(true)}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print Report
                </Button>
            </div>

            {/* Date Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <CustomComboBox
                    items={MONTHS.map((month, index) => ({ value: String(index + 1), label: month }))}
                    placeholder="All Months"
                    value={filterMonth}
                    onSelect={(value) => setFilterMonth(value)}
                />
                <CustomComboBox
                    items={availableYears.map((year) => ({ value: String(year), label: String(year) }))}
                    placeholder="All Years"
                    value={filterYear}
                    onSelect={(value) => setFilterYear(value)}
                />
                {hasActiveFilters && (
                    <Button variant="ghost" onClick={clearFilters}>
                        <X className="mr-1 h-4 w-4" />
                        Clear Filters
                    </Button>
                )}
            </div>

            {/* Print Preview Dialog */}
            <Dialog open={showPrintPreview} onOpenChange={setShowPrintPreview}>
                <DialogContent className="max-h-[90vh] min-w-[90vw] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                            <span>Print Preview</span>
                            <Button onClick={handlePrint} size="sm">
                                <Printer className="mr-2 h-4 w-4" />
                                Print Now
                            </Button>
                        </DialogTitle>
                    </DialogHeader>
                    <PrintReport
                        ref={printRef}
                        employee={employee}
                        allDeductions={filteredDeductions}
                        allClaims={filteredClaims}
                        filterMonth={filterMonth}
                        filterYear={filterYear}
                    />
                </DialogContent>
            </Dialog>

            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Basic Salary</CardTitle>
                        <TrendingDown className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(salary)}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">PERA</CardTitle>
                        <Receipt className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(pera)}</div>
                    </CardContent>
                </Card>

                {employee.is_rata_eligible && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">RATA</CardTitle>
                            <Receipt className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(rata)}</div>
                        </CardContent>
                    </Card>
                )}

                <Card className="border-slate-200 bg-slate-50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-800">Gross Pay</CardTitle>
                        <TrendingDown className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{formatCurrency(grossPay)}</div>
                    </CardContent>
                </Card>

                <Card className="border-red-200 bg-red-50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-red-800">Total Deductions</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-700">{formatCurrency(totalAllDeductions)}</div>
                        <p className="mt-1 text-xs text-red-600">{filteredDeductions.length} deduction entries</p>
                    </CardContent>
                </Card>

                <Card className="border-green-200 bg-green-50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-green-800">Net Pay</CardTitle>
                        <Receipt className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-700">{formatCurrency(netPay)}</div>
                        <p className="mt-1 text-xs text-green-600">Gross Pay - Deductions</p>
                    </CardContent>
                </Card>

                <Card className="border-blue-200 bg-blue-50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-blue-800">Total Claims</CardTitle>
                        <Receipt className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-700">{formatCurrency(totalAllClaims)}</div>
                        <p className="mt-1 text-xs text-blue-600">
                            {filteredClaims.length} claim{filteredClaims.length !== 1 ? 's' : ''} recorded
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
                                <div className="w-full overflow-hidden rounded-sm border shadow-sm">
                                    <Table className="">
                                        <TableHeader className="bg-muted/90 rounded-sm">
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
                                                        <TableCell className="text-right font-semibold text-red-600">
                                                            {formatCurrency(total)}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Per-period breakdown */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Period Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="w-full overflow-hidden rounded-sm border shadow-sm">
                                    <Table>
                                        <TableHeader className="bg-muted/90 rounded-sm">
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
                                                            <TableCell className="text-right text-red-600">
                                                                {formatCurrency(Number(d.amount))}
                                                            </TableCell>
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
                                </div>
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
                                <CardContent>
                                    <div className="w-full overflow-hidden rounded-sm border shadow-sm">
                                        <Table>
                                            <TableHeader className="bg-muted/90">
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
                                                                {new Date(c.claim_date).toLocaleDateString('en-PH', {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                })}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant="default">{c.claim_type?.name ?? '—'}</Badge>
                                                            </TableCell>
                                                            <TableCell className="text-muted-foreground max-w-[200px] truncate">
                                                                {c.purpose}
                                                            </TableCell>
                                                            <TableCell className="text-right font-medium text-green-600">
                                                                {formatCurrency(Number(c.amount))}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                            </TableBody>
                                        </Table>
                                    </div>
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
