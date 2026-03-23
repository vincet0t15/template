import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { DeductionType } from '@/types/deductionType';
import type { Employee } from '@/types/employee';
import type { EmployeeDeduction } from '@/types/employeeDeduction';
import { Pencil, Plus } from 'lucide-react';
import { useState } from 'react';
import { SalaryDialog } from './salaryDialog';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface CompensationSalaryProps {
    employee: Employee;
    deductionTypes: DeductionType[];
}

interface DialogState {
    open: boolean;
    month: string;
    year: string;
    existingDeductions: EmployeeDeduction[];
}

export function CompensationSalary({ employee, deductionTypes }: CompensationSalaryProps) {
    const [dialogState, setDialogState] = useState<DialogState>({
        open: false,
        month: String(new Date().getMonth() + 1),
        year: String(new Date().getFullYear()),
        existingDeductions: [],
    });

    const deductions = employee.deductions ?? [];

    // Group deductions by pay period (month-year)
    const grouped = deductions.reduce<Record<string, typeof deductions>>((acc, d) => {
        const key = `${d.pay_period_year}-${String(d.pay_period_month).padStart(2, '0')}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(d);
        return acc;
    }, {});

    const periods = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

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
            existingDeductions: grouped[periodKey] ?? [],
        });
    };

    const closeDialog = () => setDialogState((prev) => ({ ...prev, open: false }));

    return (
        <div className="space-y-4">
            <div>
                <Button onClick={openNewDialog}>
                    <Plus className="h-4 w-4" />
                    Add Salary Deductions
                </Button>
            </div>

            {periods.length === 0 ? (
                <div className="text-muted-foreground rounded-lg border py-12 text-center text-sm">No salary deductions recorded yet.</div>
            ) : (
                <div className="space-y-4">
                    {periods.map((periodKey) => {
                        const [year, month] = periodKey.split('-');
                        const periodDeductions = grouped[periodKey];
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

            {dialogState.open && (
                <SalaryDialog
                    open={dialogState.open}
                    onClose={closeDialog}
                    employee={employee}
                    deductionTypes={deductionTypes}
                    defaultMonth={dialogState.month}
                    defaultYear={dialogState.year}
                    existingDeductions={dialogState.existingDeductions}
                    takenPeriods={periods}
                />
            )}
        </div>
    );
}
