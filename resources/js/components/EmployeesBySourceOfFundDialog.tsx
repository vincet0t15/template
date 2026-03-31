'use client';

import axios from 'axios';
import { X } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Employee {
    id: number;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    suffix: string | null;
    position: string | null;
    office: { name: string } | null;
    employment_status: { name: string } | null;
    latest_salary: { amount: number } | null;
}

interface SourceOfFundCode {
    code: string;
    description: string | null;
}

interface EmployeesBySourceOfFundDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sourceOfFundCodeId: number | null;
    sourceOfFundCode?: SourceOfFundCode;
    month?: number;
    year?: number;
}

export function EmployeesBySourceOfFundDialog({
    open,
    onOpenChange,
    sourceOfFundCodeId,
    sourceOfFundCode,
    month,
    year,
}: EmployeesBySourceOfFundDialogProps) {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const getFullName = (employee: Employee) => {
        const parts = [employee.first_name, employee.middle_name, employee.last_name, employee.suffix].filter(Boolean);
        return parts.join(' ');
    };

    const fetchEmployees = async () => {
        if (!sourceOfFundCodeId) return;

        setLoading(true);
        try {
            const response = await axios.get(`/dashboard/employees-by-source-of-fund/${sourceOfFundCodeId}`, {
                params: { month, year },
            });
            setEmployees(response.data.employees);
            setTotalCount(response.data.total_count);
        } catch (error) {
            console.error('Error fetching employees:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (newOpen && sourceOfFundCodeId) {
            fetchEmployees();
        } else {
            setEmployees([]);
            setTotalCount(0);
        }
        onOpenChange(newOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-h-[80vh] max-w-4xl">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <DialogTitle>Employees - {sourceOfFundCode?.code || 'Source of Fund'}</DialogTitle>
                            <DialogDescription>
                                {sourceOfFundCode?.description && <span className="text-sm">{sourceOfFundCode.description}</span>}
                                {month && year && (
                                    <span className="ml-2 text-sm">
                                        ({new Date(year, month - 1).toLocaleString('default', { month: 'long' })} {year})
                                    </span>
                                )}
                            </DialogDescription>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </DialogHeader>

                {loading ? (
                    <div className="py-8 text-center">
                        <div className="mb-3 inline-flex h-12 w-12 animate-pulse items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                            <div className="h-6 w-6 text-slate-400" />
                        </div>
                        <p className="text-muted-foreground">Loading employees...</p>
                    </div>
                ) : employees.length > 0 ? (
                    <>
                        <div className="mb-4 flex items-center gap-2 text-sm">
                            <Badge variant="secondary">{totalCount} employees</Badge>
                        </div>
                        <div className="max-h-[60vh] overflow-y-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee Name</TableHead>
                                        <TableHead>Position</TableHead>
                                        <TableHead>Office</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Salary Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {employees.map((employee) => (
                                        <TableRow key={employee.id}>
                                            <TableCell className="font-medium">{getFullName(employee)}</TableCell>
                                            <TableCell>{employee.position || '-'}</TableCell>
                                            <TableCell>{employee.office?.name || '-'}</TableCell>
                                            <TableCell>{employee.employment_status?.name || '-'}</TableCell>
                                            <TableCell className="text-right font-medium">
                                                {employee.latest_salary?.amount ? (
                                                    formatCurrency(employee.latest_salary.amount)
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </>
                ) : (
                    <div className="py-8 text-center">
                        <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                            <X className="h-6 w-6 text-slate-400" />
                        </div>
                        <p className="text-muted-foreground">No employees found for this source of fund in the selected period</p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
