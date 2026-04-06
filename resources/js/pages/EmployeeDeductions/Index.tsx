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
import { Printer, Search, User, Users } from 'lucide-react';
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

                {/* Instruction Note */}
                <div className="rounded-lg border border-teal-200 bg-teal-50 p-4 text-teal-800 dark:border-teal-800 dark:bg-teal-900/20 dark:text-teal-300">
                    <div className="flex items-start gap-3">
                        <svg className="mt-0.5 h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <div className="text-sm">
                            <p className="mb-1 font-semibold">How to manage deductions:</p>
                            <p className="text-teal-700 dark:text-teal-400">
                                Click on an employee's avatar to view their complete details and manage deductions.
                                <span className="font-medium"> Hover over the avatar</span> to see the view icon.
                            </p>
                        </div>
                    </div>
                </div>

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
                        <Button
                            variant="outline"
                            onClick={() => {
                                const params = new URLSearchParams();
                                if (selectedMonth) params.append('month', selectedMonth);
                                if (selectedYear) params.append('year', selectedYear);
                                if (selectedOffice !== 'all') params.append('office_id', selectedOffice);
                                if (selectedEmploymentStatus !== 'all') params.append('employment_status_id', selectedEmploymentStatus);
                                window.open(route('employee-deductions.print') + '?' + params.toString(), '_blank');
                            }}
                        >
                            <Printer className="mr-2 h-4 w-4" />
                            Print
                        </Button>
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
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {employees.length > 0 ? (
                                employees.map((employee) => (
                                    <TableRow key={employee.id} className="hover:bg-muted/30">
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={route('manage.employees.index', employee.id)}
                                                    className="group relative cursor-pointer"
                                                    title={`View details of ${employee.first_name} ${employee.last_name}`}
                                                >
                                                    <Avatar className="h-10 w-10 border-2 border-slate-200 shadow-sm transition-all hover:border-blue-400 hover:shadow-md dark:border-slate-700 dark:hover:border-blue-500">
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
                                                    <div className="absolute -right-1 -bottom-1 rounded-full bg-blue-500 p-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                                                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                            />
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                            />
                                                        </svg>
                                                    </div>
                                                </Link>
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
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-3 text-center text-gray-500">
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
