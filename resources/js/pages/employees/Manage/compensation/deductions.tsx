import { CustomComboBox } from '@/components/CustomComboBox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { DeductionType } from '@/types/deductionType';
import type { Employee } from '@/types/employee';
import type { EmployeeDeduction } from '@/types/employeeDeduction';
import { router } from '@inertiajs/react';
import { Pencil, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { SalaryDialog } from './salaryDialog';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface CompensationDeductionsProps {
    employee: Employee;
    deductionTypes: DeductionType[];
    deductions?: Record<string, EmployeeDeduction[]>;
    periodsList?: string[];
    takenPeriods?: string[];
    availableYears?: number[];
    filters?: {
        deduction_month?: string;
        deduction_year?: string;
    };
    pagination?: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

interface DialogState {
    open: boolean;
    month: string;
    year: string;
    existingDeductions: EmployeeDeduction[];
}

export function CompensationDeductions({
    employee,
    deductionTypes,
    deductions = {},
    periodsList = [],
    takenPeriods = [],
    availableYears = [],
    filters = {},
    pagination,
}: CompensationDeductionsProps) {
    const [dialogState, setDialogState] = useState<DialogState>({
        open: false,
        month: String(new Date().getMonth() + 1),
        year: String(new Date().getFullYear()),
        existingDeductions: [],
    });

    const goToPage = (page: number) => {
        router.get(
            route('manage.employees.index', employee.id),
            { deduction_page: page, deduction_month: filters.deduction_month, deduction_year: filters.deduction_year },
            { preserveState: true, preserveScroll: true },
        );
    };

    const applyFilter = (month: string | undefined, year: string | undefined) => {
        router.get(
            route('manage.employees.index', employee.id),
            { deduction_month: month, deduction_year: year },
            { preserveState: true, preserveScroll: true },
        );
    };

    const clearFilters = () => {
        router.get(route('manage.employees.index', employee.id), {}, { preserveState: true, preserveScroll: true });
    };

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(amount);

    const openNewDialog = () => {
        setDialogState({
            open: true,
            month: String(new Date().getMonth() + 1),
            year: String(new Date().getFullYear()),
            existingDeductions: [],
        });
    };

    const openEditDialog = (periodKey: string) => {
        const [year, month] = periodKey.split('-');
        setDialogState({
            open: true,
            month: String(parseInt(month)),
            year,
            existingDeductions: deductions[periodKey] ?? [],
        });
    };

    const closeDialog = () => setDialogState((prev) => ({ ...prev, open: false }));

    const periods = periodsList;
    const currentPage = pagination?.current_page ?? 1;
    const lastPage = pagination?.last_page ?? 1;

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <CustomComboBox
                    items={MONTHS.map((month, index) => ({ value: String(index + 1), label: month }))}
                    placeholder="All Months"
                    value={filters.deduction_month ?? null}
                    onSelect={(value) => applyFilter(value ?? undefined, filters.deduction_year)}
                />

                <CustomComboBox
                    items={availableYears.map((year) => ({ value: String(year), label: String(year) }))}
                    placeholder="All Years"
                    value={filters.deduction_year ?? null}
                    onSelect={(value) => applyFilter(filters.deduction_month, value ?? undefined)}
                />

                {(filters.deduction_month || filters.deduction_year) && (
                    <Button variant="ghost" onClick={clearFilters}>
                        <X className="mr-1 h-4 w-4" />
                        Clear
                    </Button>
                )}

                <div className="flex-1"></div>

                <Button onClick={openNewDialog}>
                    <Plus className="h-4 w-4" />
                    Add Deductions
                </Button>
            </div>

            {periods.length === 0 ? (
                <div className="text-muted-foreground rounded-sm border py-12 text-center text-sm">No deductions recorded yet.</div>
            ) : (
                <div className="space-y-4">
                    {periods.map((periodKey) => {
                        const [year, month] = periodKey.split('-');
                        const periodDeductions = deductions[periodKey] ?? [];
                        const total = periodDeductions.reduce((sum, d) => sum + Number(d.amount), 0);

                        return (
                            <div key={periodKey} className="overflow-hidden rounded-lg border shadow-sm">
                                <div className="bg-muted/50 flex items-center justify-between px-4 py-2">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="font-semibold">
                                            {MONTHS[parseInt(month) - 1]} {year}
                                        </Badge>
                                        <span className="text-muted-foreground text-xs">{periodDeductions.length} deduction(s)</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-semibold text-red-600">- {formatCurrency(total)}</span>
                                        <Button variant="outline" onClick={() => openEditDialog(periodKey)}>
                                            <Pencil className="h-3 w-3" />
                                            Edit
                                        </Button>
                                    </div>
                                </div>
                                <Table>
                                    <TableHeader className="bg-muted/20">
                                        <TableRow>
                                            <TableHead>Deduction Type</TableHead>
                                            <TableHead>Code</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {periodDeductions.map((d) => (
                                            <TableRow key={d.id}>
                                                <TableCell className="font-medium">{d.deduction_type?.name ?? '—'}</TableCell>
                                                <TableCell className="text-muted-foreground text-xs">{d.deduction_type?.code ?? '—'}</TableCell>
                                                <TableCell className="text-right text-red-600">- {formatCurrency(Number(d.amount))}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        );
                    })}
                </div>
            )}
            {pagination && (
                <div className="flex items-center justify-between border-t pt-4">
                    <div className="text-muted-foreground text-sm">
                        Page {currentPage} of {lastPage} ({pagination.total} periods)
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
                            Previous
                        </Button>
                        <Button variant="outline" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === lastPage}>
                            Next
                        </Button>
                    </div>
                </div>
            )}
            {dialogState.open && (
                <SalaryDialog
                    open={dialogState.open}
                    onClose={closeDialog}
                    employee={employee}
                    deductionTypes={deductionTypes}
                    defaultMonth={dialogState.month}
                    defaultYear={dialogState.year}
                    existingDeductions={dialogState.existingDeductions}
                    takenPeriods={takenPeriods}
                />
            )}
        </div>
    );
}
