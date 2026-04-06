import { CustomComboBox } from '@/components/CustomComboBox';
import Heading from '@/components/heading';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { DeductionType } from '@/types/deductionType';
import type { Employee } from '@/types/employee';
import type { EmploymentStatus } from '@/types/employmentStatuses';
import type { Office } from '@/types/office';
import { Head, Link, router } from '@inertiajs/react';
import { Search, User, Users } from 'lucide-react';
import { useState } from 'react';

const MONTHS = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
];

const YEARS = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() - 5 + i;
    return { value: String(year), label: String(year) };
});

interface IndexProps {
    employees: (Employee & {
        employment_status: EmploymentStatus | null;
        office: Office | null;
        salaries: any[];
        peras: any[];
        ratas: any[];
    })[];
    deductionTypes: DeductionType[];
    offices: Office[];
    employmentStatuses: EmploymentStatus[];
    filters: {
        month: number;
        year: number;
        office_id: number | null;
        employment_status_id: number | null;
        search: string | null;
    };
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Employee Deductions', href: '/employee-deductions' }];

export default function Index({ employees, deductionTypes, offices, employmentStatuses, filters }: IndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedMonth, setSelectedMonth] = useState(String(filters.month));
    const [selectedYear, setSelectedYear] = useState(String(filters.year));
    const [selectedOffice, setSelectedOffice] = useState(filters.office_id ? String(filters.office_id) : 'all');
    const [selectedEmploymentStatus, setSelectedEmploymentStatus] = useState(
        filters.employment_status_id ? String(filters.employment_status_id) : 'all',
    );

    const handleFilter = () => {
        router.get(
            route('employee-deductions.index'),
            {
                search,
                month: selectedMonth,
                year: selectedYear,
                office_id: selectedOffice === 'all' ? null : selectedOffice,
                employment_status_id: selectedEmploymentStatus === 'all' ? null : selectedEmploymentStatus,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleReset = () => {
        setSearch('');
        setSelectedMonth(String(new Date().getMonth() + 1));
        setSelectedYear(String(new Date().getFullYear()));
        setSelectedOffice('all');
        setSelectedEmploymentStatus('all');
        router.get(route('employee-deductions.index'), {}, { preserveState: true });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleFilter();
        }
    };

    const getLatestSalary = (employee: any) => {
        const salary = employee.salaries?.[0];
        return salary?.basic_salary || employee.monthly_salary || 0;
    };

    const getTotalDeductions = (employee: any) => {
        return 0;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Employee Deductions" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <Heading title="Employee Deductions" description="Manage employee deductions for payroll processing." />

                <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="w-[220px]">
                            <CustomComboBox
                                items={[
                                    { value: 'all', label: 'All Offices' },
                                    ...offices.map((office) => ({ value: office.id.toString(), label: office.name })),
                                ]}
                                placeholder="All Offices"
                                value={selectedOffice}
                                onSelect={(value) => setSelectedOffice(value || 'all')}
                            />
                        </div>

                        <div className="w-[200px]">
                            <CustomComboBox
                                items={[
                                    { value: 'all', label: 'All Statuses' },
                                    ...employmentStatuses.map((status) => ({ value: status.id.toString(), label: status.name })),
                                ]}
                                placeholder="All Statuses"
                                value={selectedEmploymentStatus}
                                onSelect={(value) => setSelectedEmploymentStatus(value || 'all')}
                            />
                        </div>

                        <div className="w-[150px]">
                            <CustomComboBox
                                items={MONTHS}
                                placeholder="Month"
                                value={selectedMonth}
                                onSelect={(value) => setSelectedMonth(value || '')}
                            />
                        </div>

                        <div className="w-[120px]">
                            <CustomComboBox
                                items={YEARS}
                                placeholder="Year"
                                value={selectedYear}
                                onSelect={(value) => setSelectedYear(value || '')}
                            />
                        </div>

                        <div className="relative w-full sm:w-[250px]">
                            <Label htmlFor="search" className="sr-only">
                                Search
                            </Label>
                            <Input
                                id="search"
                                placeholder="Search employee..."
                                className="w-full pl-8"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleReset}>
                            Reset
                        </Button>
                        <Button onClick={handleFilter}>Apply Filters</Button>
                        <Link href={route('employee-deductions.bulk-add-page')}>
                            <Button>
                                <Users className="mr-2 h-4 w-4" />
                                Bulk Add
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="w-full overflow-hidden rounded-sm border shadow-sm">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="text-primary font-bold">Employee</TableHead>
                                <TableHead className="text-primary font-bold">Office</TableHead>
                                <TableHead className="text-primary font-bold">Status</TableHead>
                                <TableHead className="text-primary text-right font-bold">Monthly Salary</TableHead>
                                <TableHead className="text-primary text-right font-bold">Total Deductions</TableHead>
                                <TableHead className="text-primary w-[150px] text-center font-bold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {employees.length > 0 ? (
                                employees.map((employee) => (
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
                                        <TableCell>{employee.office?.name || 'N/A'}</TableCell>
                                        <TableCell>{employee.employment_status?.name || 'N/A'}</TableCell>
                                        <TableCell className="text-right font-medium">
                                            ₱{getLatestSalary(employee).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            ₱{getTotalDeductions(employee).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Link href={route('manage.employees.index', employee.id)}>
                                                <Button variant="outline">
                                                    <User className="mr-1 h-4 w-4" />
                                                    View Details
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-3 text-center text-gray-500">
                                        No employees found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="text-muted-foreground text-sm">
                    Showing {employees.length} employee{employees.length !== 1 ? 's' : ''}
                </div>
            </div>
        </AppLayout>
    );
}
