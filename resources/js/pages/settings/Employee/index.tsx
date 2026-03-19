
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { PlusIcon, Search } from 'lucide-react';
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
import { useState } from 'react';
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface EmployeeProps {
    employees: PaginatedDataResponse<Employee>
    filters: FilterProps
}
export default function EmployeesIndex({ employees, filters }: EmployeeProps) {
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
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

                    <div className="flex w-full sm:w-auto items-center gap-2">
                        <div className="relative w-full sm:w-[250px]">
                            <Label htmlFor="search" className="sr-only">
                                Search
                            </Label>
                            <Input
                                id="search"
                                placeholder="Search the employee..."
                                className="pl-8 w-full"

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
                                <TableHead className="font-bold text-primary text-right">
                                    Action
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {employees.data.length > 0 ? (
                                employees.data.map((employee) => (
                                    <TableRow
                                        key={employee.id}
                                        className="text-sm hover:bg-muted/30"
                                    >
                                        <TableCell className="text-sm">
                                            {employee.first_name} {employee.middle_name} {employee.last_name} {employee.suffix}
                                        </TableCell>


                                        <TableCell className="text-sm flex items-center gap-2 justify-end">
                                            <span

                                                className="text-teal-600 cursor-pointer hover:underline"
                                            >
                                                Edit
                                            </span>
                                            <span

                                                className="text-orange-600 cursor-pointer hover:underline"
                                            >
                                                Delete
                                            </span>
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


            </div>
        </AppLayout>
    );
}
