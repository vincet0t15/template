import { CustomComboBox } from '@/components/CustomComboBox';
import Heading from '@/components/heading';
import Pagination from '@/components/paginationData';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Employee } from '@/types/employee';
import type { EmploymentStatus } from '@/types/employmentStatuses';
import { FilterProps } from '@/types/filter';
import type { Office } from '@/types/office';
import { PaginatedDataResponse } from '@/types/pagination';
import { Head, router, useForm } from '@inertiajs/react';
import { PlusIcon, Search, User } from 'lucide-react';
import { useState } from 'react';
import { EmployeeShow } from './show';
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface SourceOfFundCode {
    id: number;
    code: string;
    description: string | null;
}

interface Props {
    employees: PaginatedDataResponse<Employee>;
    offices: Office[];
    employmentStatuses: EmploymentStatus[];
    sourceOfFundCodes: SourceOfFundCode[];
    filters: FilterProps & { office_id?: string; employment_status_id?: string; source_of_fund_code_id?: string };
}
export default function Employees({ employees, offices, employmentStatuses, sourceOfFundCodes, filters }: Props) {
    const { data, setData } = useForm({
        search: filters.search || '',
        office_id: filters.office_id || '',
        employment_status_id: filters.employment_status_id || '',
        source_of_fund_code_id: filters.source_of_fund_code_id || '',
    });
    const [openShow, setOpenShow] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

    const applyFilters = (overrides?: Partial<typeof data>) => {
        const merged = { ...data, ...overrides };
        const queryString: Record<string, string> = {};
        if (merged.search) queryString.search = merged.search;
        if (merged.office_id) queryString.office_id = merged.office_id;
        if (merged.employment_status_id) queryString.employment_status_id = merged.employment_status_id;
        if (merged.source_of_fund_code_id) queryString.source_of_fund_code_id = merged.source_of_fund_code_id;
        router.get(route('employees.index'), queryString, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            applyFilters();
        }
    };

    const officeOptions = offices.map((office) => ({
        value: office.id.toString(),
        label: office.name,
    }));

    const handleOfficeChange = (value: string) => {
        const newOfficeId = value === '' ? '' : value;
        setData('office_id', newOfficeId);
        applyFilters({ office_id: newOfficeId });
    };

    const handleEmploymentStatusChange = (value: string) => {
        const newStatusId = value === 'all' ? '' : value;
        setData('employment_status_id', newStatusId);
        applyFilters({ employment_status_id: newStatusId });
    };

    const handleSourceOfFundChange = (value: string) => {
        // Empty string means "All" - clear the filter
        const newSourceOfFundId = value === '' ? '' : value;
        setData('source_of_fund_code_id', newSourceOfFundId);
        applyFilters({ source_of_fund_code_id: newSourceOfFundId });
    };

    const handleClickShow = (employee: Employee) => {
        setSelectedEmployee(employee);
        setOpenShow(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
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
                        <div className="w-full">
                            <CustomComboBox
                                items={[{ value: '', label: 'All Offices' }, ...officeOptions]}
                                placeholder="All Offices"
                                value={data.office_id || null}
                                onSelect={(value) => handleOfficeChange(value ?? '')}
                                showClear={true}
                            />
                        </div>

                        <Select value={data.employment_status_id || 'all'} onValueChange={handleEmploymentStatusChange}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                {employmentStatuses.map((status) => (
                                    <SelectItem key={status.id} value={status.id.toString()}>
                                        {status.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <CustomComboBox
                            items={[
                                { value: '', label: 'All Source of Fund' },
                                ...sourceOfFundCodes.map((fund) => ({
                                    value: fund.id.toString(),
                                    label: `${fund.code} - ${fund.description || ''}`,
                                })),
                            ]}
                            placeholder="All Source of Fund"
                            value={data.source_of_fund_code_id || null}
                            onSelect={(value) => handleSourceOfFundChange(value ?? '')}
                            showClear={true}
                        />

                        <Button
                            variant="outline"
                            onClick={() => {
                                const params = new URLSearchParams();
                                if (data.search) params.set('search', data.search);
                                if (data.office_id) params.set('office_id', data.office_id);
                                if (data.employment_status_id) params.set('employment_status_id', data.employment_status_id);
                                if (data.source_of_fund_code_id) params.set('source_of_fund_code_id', data.source_of_fund_code_id);
                                window.open(`/employees/print?${params.toString()}`, '_blank');
                            }}
                        >
                            Print
                        </Button>

                        <div className="relative w-full sm:w-[250px]">
                            <Label htmlFor="search" className="sr-only">
                                Search
                            </Label>
                            <Input
                                id="search"
                                placeholder="Search the employee..."
                                className="w-full pl-8"
                                value={data.search}
                                onChange={(e) => setData({ ...data, search: e.target.value })}
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
                                                    <span className="text-muted-foreground text-[0.70rem]">{employee.office?.name}</span>
                                                    <span className="text-muted-foreground text-[0.70rem]">{employee.employment_status?.name}</span>
                                                </div>
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
            </div>
        </AppLayout>
    );
}
