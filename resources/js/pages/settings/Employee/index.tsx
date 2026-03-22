import Heading from '@/components/heading';
import Pagination from '@/components/paginationData';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import type { Employee } from '@/types/employee';
import type { FilterProps } from '@/types/filter';
import type { PaginatedDataResponse } from '@/types/pagination';
import { Head, router, useForm } from '@inertiajs/react';
import { PlusIcon, Search, User } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { EmployeeShow } from './show';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Employees',
        href: '/settings/employees',
    },
];

interface EmployeeProps {
    employees: PaginatedDataResponse<Employee>;
    filters: FilterProps;
}

export default function EmployeesIndex({ employees, filters }: EmployeeProps) {
    const { data, setData } = useForm({
        search: filters.search || '',
    });
    const [openShow, setOpenShow] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleClickShow = (employee: Employee) => {
        setSelectedEmployee(employee);
        setOpenShow(true);
    };

    const handleDeleteClick = (employee: Employee) => {
        setEmployeeToDelete(employee);
        setShowDeleteDialog(true);
    };

    const handleDeleteConfirm = () => {
        if (!employeeToDelete) return;

        setIsDeleting(true);
        router.delete(route('employees.destroy', employeeToDelete.id), {
            onSuccess: () => {
                toast.success('Employee deleted successfully');
                setShowDeleteDialog(false);
                setEmployeeToDelete(null);
            },
            onError: () => {
                toast.error('Failed to delete employee');
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const queryString = data.search ? { search: data.search } : {};

            router.get(route('employees.settings.index'), queryString, {
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Employees" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <Heading
                    title="Employee List"
                    description="Manage all employees, with options to view, edit, or delete records and track their employment statuses."
                />
                <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <Button onClick={() => router.get(route('employees.create'))}>
                        <PlusIcon className="h-4 w-4" />
                        Add Employee
                    </Button>

                    <div className="flex w-full items-center gap-2 sm:w-auto">
                        <div className="relative w-full sm:w-[250px]">
                            <Label htmlFor="search" className="sr-only">
                                Search
                            </Label>
                            <Input
                                id="search"
                                placeholder="Search the employee..."
                                className="w-full pl-8"
                                value={data.search}
                                onChange={(e) => setData({ search: e.target.value })}
                                onKeyDown={handleSearchKeyDown}
                            />
                            <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
                        </div>
                    </div>
                </div>

                <div className="w-full overflow-hidden rounded-sm border shadow-sm">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="text-primary font-bold">Name</TableHead>
                                <TableHead className="text-primary font-bold">RATA</TableHead>
                                <TableHead className="text-primary w-[100px] text-center font-bold">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {employees.data.length > 0 ? (
                                employees.data.map((employee) => (
                                    <TableRow key={employee.id} className="hover:bg-muted/30 items-center text-sm">
                                        <TableCell className="cursor-pointer text-sm" onClick={() => handleClickShow(employee)}>
                                            <div className="flex cursor-pointer items-center gap-2">
                                                <Avatar className="h-12 w-12 border-2 border-slate-200 shadow-sm dark:border-slate-700">
                                                    {employee.image_path ? (
                                                        <AvatarImage
                                                            src={employee.image_path ?? undefined}
                                                            alt={`${employee.first_name} ${employee.middle_name} ${employee.last_name}`}
                                                            className="object-cover"
                                                        />
                                                    ) : null}
                                                    <AvatarFallback className="bg-slate-100 dark:bg-slate-800">
                                                        <User className="h-6 w-6 text-slate-400" />
                                                    </AvatarFallback>
                                                </Avatar>

                                                <div className="flex flex-col">
                                                    <span className="font-bold uppercase">
                                                        {employee.last_name}, {employee.first_name} {employee.middle_name} {employee.suffix}
                                                    </span>
                                                    <span className="text-muted-foreground text-xs italic">{employee.office?.name}</span>
                                                    <span className="text-muted-foreground text-xs italic">{employee.employment_status?.name}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={`rounded-full px-2 py-1 text-xs ${employee.is_rata_eligible ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}
                                            >
                                                {employee.is_rata_eligible ? 'Eligible' : 'Not Eligible'}
                                            </span>
                                        </TableCell>

                                        <TableCell className="text-center text-sm">
                                            <div className="flex items-center justify-center gap-2">
                                                <span
                                                    onClick={() => router.get(route('employees.manage.show', employee.id))}
                                                    className="cursor-pointer text-teal-600 hover:underline"
                                                >
                                                    Manage
                                                </span>
                                                <span
                                                    onClick={() => handleDeleteClick(employee)}
                                                    className="cursor-pointer text-red-600 hover:underline"
                                                >
                                                    Delete
                                                </span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="py-3 text-center text-gray-500">
                                        No data available.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div>
                    <Pagination data={employees} />
                </div>
                {openShow && selectedEmployee && <EmployeeShow employee={selectedEmployee} onClose={() => setOpenShow(false)} isOpen={openShow} />}

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Employee</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete{' '}
                                <strong>
                                    {employeeToDelete?.first_name} {employeeToDelete?.last_name}
                                </strong>
                                ? This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDeleteConfirm}
                                disabled={isDeleting}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AppLayout>
    );
}
