import Heading from '@/components/heading';
import Pagination from '@/components/paginationData';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import type { DeductionType } from '@/types/deductionType';
import type { Employee } from '@/types/employee';
import type { EmployeeDeduction } from '@/types/employeeDeduction';
import type { FilterProps } from '@/types/filter';
import type { PaginatedDataResponse } from '@/types/pagination';
import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, PlusIcon, Search, Trash2, User } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Employee Deductions',
        href: '/employee-deductions',
    },
];

const MONTHS = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
];

interface EmployeeDeductionsProps {
    employees: PaginatedDataResponse<Employee>;
    deductionTypes: DeductionType[];
    filters: FilterProps & {
        month: number;
        year: number;
        office_id?: number;
    };
}

export default function EmployeeDeductionsIndex({ employees, deductionTypes, filters }: EmployeeDeductionsProps) {
    const [openAdd, setOpenAdd] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [selectedDeduction, setSelectedDeduction] = useState<EmployeeDeduction | null>(null);

    const { data: filterData, setData: setFilterData } = useForm({
        month: filters.month,
        year: filters.year,
        search: filters.search || '',
    });

    const {
        data: addData,
        setData: setAddData,
        post,
        reset,
        errors,
    } = useForm({
        employee_id: 0,
        deduction_type_id: 0,
        amount: '',
        pay_period_month: filters.month,
        pay_period_year: filters.year,
        notes: '',
    });

    const {
        data: editData,
        setData: setEditData,
        put,
        reset: resetEdit,
        errors: editErrors,
    } = useForm({
        amount: '',
        notes: '',
    });

    const handleFilterChange = () => {
        const queryString: Record<string, string | number> = {};
        if (filterData.month) queryString.month = filterData.month;
        if (filterData.year) queryString.year = filterData.year;
        if (filterData.search) queryString.search = filterData.search;

        router.get(route('employee-deductions.index'), queryString, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleOpenAdd = (employee: Employee) => {
        setSelectedEmployee(employee);
        setAddData('employee_id', employee.id);
        setOpenAdd(true);
    };

    const handleAddDeduction = () => {
        post(route('employee-deductions.store'), {
            onSuccess: () => {
                reset();
                setOpenAdd(false);
                setSelectedEmployee(null);
            },
        });
    };

    const handleOpenEdit = (deduction: EmployeeDeduction, employee: Employee) => {
        setSelectedEmployee(employee);
        setSelectedDeduction(deduction);
        setEditData({
            amount: deduction.amount.toString(),
            notes: deduction.notes || '',
        });
        setOpenEdit(true);
    };

    const handleEditDeduction = () => {
        if (!selectedDeduction) return;
        put(route('employee-deductions.update', selectedDeduction.id), {
            onSuccess: () => {
                resetEdit();
                setOpenEdit(false);
                setSelectedDeduction(null);
            },
        });
    };

    const handleDelete = (deduction: EmployeeDeduction) => {
        if (confirm('Are you sure you want to delete this deduction?')) {
            router.delete(route('employee-deductions.destroy', deduction.id));
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Employee Deductions" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <Heading title="Employee Deductions" description="Record and manage employee deductions per pay period." />

                <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                        <Select value={filterData.month.toString()} onValueChange={(value) => setFilterData('month', parseInt(value))}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Month" />
                            </SelectTrigger>
                            <SelectContent>
                                {MONTHS.map((month) => (
                                    <SelectItem key={month.value} value={month.value.toString()}>
                                        {month.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Input
                            type="number"
                            className="w-[100px]"
                            value={filterData.year}
                            onChange={(e) => setFilterData('year', parseInt(e.target.value))}
                            placeholder="Year"
                        />

                        <div className="relative w-full sm:w-[200px]">
                            <Input
                                placeholder="Search employee..."
                                className="pl-8"
                                value={filterData.search}
                                onChange={(e) => setFilterData('search', e.target.value)}
                            />
                            <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
                        </div>

                        <Button onClick={handleFilterChange}>Filter</Button>
                    </div>
                </div>

                <div className="w-full overflow-hidden rounded-sm border shadow-sm">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="text-primary font-bold">Employee</TableHead>
                                <TableHead className="text-primary font-bold">Office</TableHead>
                                <TableHead className="text-primary font-bold">Deductions</TableHead>
                                <TableHead className="text-primary text-right font-bold">Total Deductions</TableHead>
                                <TableHead className="text-primary w-[100px] text-center font-bold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {employees.data.length > 0 ? (
                                employees.data.map((employee) => (
                                    <TableRow key={employee.id} className="hover:bg-muted/30">
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-10 w-10 border-2 border-slate-200 shadow-sm dark:border-slate-700">
                                                    {employee.image_path ? (
                                                        <AvatarImage
                                                            src={employee.image_path ?? undefined}
                                                            alt={`${employee.first_name} ${employee.last_name}`}
                                                            className="object-cover"
                                                        />
                                                    ) : null}
                                                    <AvatarFallback className="bg-slate-100 dark:bg-slate-800">
                                                        <User className="h-5 w-5 text-slate-400" />
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="font-bold uppercase">
                                                        {employee.last_name}, {employee.first_name} {employee.middle_name}
                                                    </span>
                                                    <span className="text-muted-foreground text-xs">{employee.position}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{employee.office?.name}</TableCell>
                                        <TableCell>
                                            {employee.deductions && employee.deductions.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {employee.deductions.map((deduction) => (
                                                        <span
                                                            key={deduction.id}
                                                            className="bg-muted flex items-center gap-1 rounded px-2 py-1 text-xs"
                                                        >
                                                            {deduction.deduction_type?.name}: {formatCurrency(deduction.amount)}
                                                            <button
                                                                onClick={() => handleOpenEdit(deduction, employee)}
                                                                className="text-primary hover:underline"
                                                            >
                                                                <Pencil className="h-3 w-3" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(deduction)}
                                                                className="text-destructive hover:underline"
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground italic">No deductions</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {employee.deductions ? formatCurrency(employee.deductions.reduce((sum, d) => sum + d.amount, 0)) : '-'}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Button variant="default" size="sm" onClick={() => handleOpenAdd(employee)}>
                                                <PlusIcon className="mr-1 h-4 w-4" />
                                                Add
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-3 text-center text-gray-500">
                                        No employees found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <Pagination data={employees} />

                {/* Add Deduction Dialog */}
                <Dialog open={openAdd} onOpenChange={setOpenAdd}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Deduction</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Employee</Label>
                                <div className="text-lg font-medium">
                                    {selectedEmployee?.last_name}, {selectedEmployee?.first_name} {selectedEmployee?.middle_name}
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Pay Period</Label>
                                <div className="text-lg font-medium">
                                    {MONTHS.find((m) => m.value === addData.pay_period_month)?.label} {addData.pay_period_year}
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="deduction_type">Deduction Type</Label>
                                <Select
                                    value={addData.deduction_type_id.toString()}
                                    onValueChange={(value) => setAddData('deduction_type_id', parseInt(value))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select deduction type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {deductionTypes.map((type) => (
                                            <SelectItem key={type.id} value={type.id.toString()}>
                                                {type.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.deduction_type_id && <p className="text-destructive text-sm">{errors.deduction_type_id}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="amount">Amount (PHP)</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    value={addData.amount}
                                    onChange={(e) => setAddData('amount', e.target.value)}
                                    placeholder="0.00"
                                />
                                {errors.amount && <p className="text-destructive text-sm">{errors.amount}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="notes">Notes (Optional)</Label>
                                <Textarea
                                    id="notes"
                                    value={addData.notes}
                                    onChange={(e) => setAddData('notes', e.target.value)}
                                    placeholder="Additional notes..."
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setOpenAdd(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleAddDeduction}>Add Deduction</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit Deduction Dialog */}
                <Dialog open={openEdit} onOpenChange={setOpenEdit}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Deduction</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Employee</Label>
                                <div className="text-lg font-medium">
                                    {selectedEmployee?.last_name}, {selectedEmployee?.first_name} {selectedEmployee?.middle_name}
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Deduction Type</Label>
                                <div className="text-lg font-medium">{selectedDeduction?.deduction_type?.name}</div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-amount">Amount (PHP)</Label>
                                <Input
                                    id="edit-amount"
                                    type="number"
                                    step="0.01"
                                    value={editData.amount}
                                    onChange={(e) => setEditData('amount', e.target.value)}
                                />
                                {editErrors.amount && <p className="text-destructive text-sm">{editErrors.amount}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-notes">Notes</Label>
                                <Textarea id="edit-notes" value={editData.notes} onChange={(e) => setEditData('notes', e.target.value)} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setOpenEdit(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleEditDeduction}>Update</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
