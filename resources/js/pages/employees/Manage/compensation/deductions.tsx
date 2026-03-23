import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { DeductionType } from '@/types/deductionType';
import type { Employee } from '@/types/employee';
import type { EmployeeDeduction } from '@/types/employeeDeduction';
import { router } from '@inertiajs/react';
import { Pencil, Plus } from 'lucide-react';
import { useState } from 'react';
import { SalaryDialog } from './salaryDialog';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface CompensationDeductionsProps {
    employee: Employee;
    deductionTypes: DeductionType[];
    deductions?: Record<string, EmployeeDeduction[]>;
    periodsList?: string[];
    takenPeriods?: string[];
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
    pagination,
}: CompensationDeductionsProps) {
    const [dialogState, setDialogState] = useState<DialogState>({
        open: false,
        month: String(new Date().getMonth() + 1),
        year: String(new Date().getFullYear()),
        existingDeductions: [],
    });

    const goToPage = (page: number) => {
        router.get(route('manage.employees.index', employee.id), { deduction_page: page }, { preserveState: true, preserveScroll: true });
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
            <div>
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
                                        <Button size="sm" variant="outline" onClick={() => openEditDialog(periodKey)}>
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
            {lastPage > 1 && (
                <div className="flex items-center justify-between border-t pt-4">
                    <div className="text-muted-foreground text-sm">
                        Page {currentPage} of {lastPage}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
                            Previous
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === lastPage}>
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
