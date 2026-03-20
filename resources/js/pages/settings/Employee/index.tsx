
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { PlusIcon, Search, User } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import type { PaginatedDataResponse } from '@/types/pagination';
import type { Employee } from '@/types/employee';
import type { FilterProps } from '@/types/filter';
import Pagination from '@/components/paginationData';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState } from 'react';
import { EmployeeShow } from './show';
import EditEmployee from './edit';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateEmployeeDialog } from './createv1';
import type { EmploymentStatus } from '@/types/employmentStatuses';
import type { Office } from '@/types/office';
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface EmployeeProps {
    employees: PaginatedDataResponse<Employee>
    filters: FilterProps
    employmentStatuses: EmploymentStatus[]
    offices: Office[]
}
export default function EmployeesIndex({ employees, filters, employmentStatuses, offices }: EmployeeProps) {
    const { data, setData } = useForm({
        search: filters.search || "",
    })
    const [openCreate, setOpenCreate] = useState(false)
    const [openShow, setOpenShow] = useState(false)
    const [openEdit, setOpenEdit] = useState(false)
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)

    const handleClickShow = (employee: Employee) => {
        setSelectedEmployee(employee)
        setOpenShow(true)
    }

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const queryString = data.search ? { search: data.search } : {};

            router.get(route('employees.index'), queryString, {
                preserveState: true,
                preserveScroll: true,
            });
        }
    }

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
                        Employee
                    </Button>
                    <Button onClick={() => setOpenCreate(true)}>
                        <PlusIcon className="h-4 w-4" />
                        Employee
                    </Button>

                    <div className="flex w-full sm:w-auto items-center gap-2">
                        <div className="relative w-full sm:w-[250px]">
                            <Label htmlFor="search" className="sr-only">
                                Search
                            </Label>
                            <Input
                                id="search"
                                placeholder="Search the employee..."
                                className="pl-8 w-full"
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
                                <TableHead className="font-bold text-primary">
                                    Name
                                </TableHead>

                                <TableHead className="font-bold text-primary w-[100px] text-center">
                                    Action
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {employees.data.length > 0 ? (
                                employees.data.map((employee) => (
                                    <TableRow
                                        key={employee.id}
                                        className="text-sm hover:bg-muted/30 items-center"
                                    >
                                        <TableCell className="text-sm cursor-pointer" onClick={() => handleClickShow(employee)}>
                                            <div className="flex items-center gap-2 cursor-pointer">
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
                                                        {employee.last_name},  {employee.first_name} {employee.middle_name} {employee.suffix}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground italic">
                                                        {employee.office?.name}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground italic">
                                                        {employee.employment_status?.name}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell className="text-sm text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <span onClick={() => router.get(route('employees.show', employee.id))} className="text-teal-600 cursor-pointer hover:underline">
                                                    Edit
                                                </span>
                                                <span className="text-orange-600 cursor-pointer hover:underline">
                                                    Delete
                                                </span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        className="py-3 text-center text-gray-500"
                                    >
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
                {openShow && selectedEmployee && (
                    <EmployeeShow
                        employee={selectedEmployee}
                        onClose={() => setOpenShow(false)}
                        isOpen={openShow}
                    />
                )}


                {openCreate && (
                    <CreateEmployeeDialog
                        employmentStatuses={employmentStatuses}
                        offices={offices}
                        isOpen={openCreate}
                        onOpenChange={setOpenCreate}
                    />
                )}
            </div>
        </AppLayout>
    );
}
