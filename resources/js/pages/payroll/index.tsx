import { CustomComboBox } from '@/components/CustomComboBox';
import Heading from '@/components/heading';
import Pagination from '@/components/paginationData';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import type { EmploymentStatus } from '@/types/employmentStatuses';
import type { Office } from '@/types/office';
import type { PaginatedDataResponse } from '@/types/pagination';
import type { PayrollEmployee } from '@/types/payroll';
import { Head, router, useForm } from '@inertiajs/react';
import { BarChart3, Download, Eye, FileSpreadsheet, Search, User } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Payroll',
        href: '/payroll',
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

interface PayrollIndexProps {
    employees: PaginatedDataResponse<PayrollEmployee>;
    offices: Office[];
    employmentStatuses: EmploymentStatus[];
    filters: {
        month: number;
        year: number;
        office_id?: number;
        employment_status_id?: number;
        search?: string;
    };
}

export default function PayrollIndex({ employees, offices, employmentStatuses, filters }: PayrollIndexProps) {
    const { data: filterData, setData: setFilterData } = useForm({
        month: filters.month,
        year: filters.year,
        office_id: filters.office_id?.toString() || '',
        employment_status_id: filters.employment_status_id?.toString() || '',
        search: filters.search || '',
    });

    const officeOptions = offices.map((office) => ({
        value: office.id.toString(),
        label: office.name,
    }));

    const employmentStatusOptions = employmentStatuses.map((s) => ({
        value: s.id.toString(),
        label: s.name,
    }));

    const handleFilterChange = () => {
        const queryString: Record<string, string | number> = {};
        if (filterData.month) queryString.month = filterData.month;
        if (filterData.year) queryString.year = filterData.year;
        if (filterData.office_id) queryString.office_id = filterData.office_id;
        if (filterData.employment_status_id) queryString.employment_status_id = filterData.employment_status_id;
        if (filterData.search) queryString.search = filterData.search;

        router.get(route('payroll.index'), queryString, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    const getMonthName = (month: number) => {
        return MONTHS.find((m) => m.value === month)?.label || '';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payroll Summary" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <Heading title="Payroll Summary" description={`View payroll summary for ${getMonthName(filters.month)} ${filters.year}`} />

                <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Month */}
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

                        {/* Year */}
                        <Input
                            type="number"
                            className="w-[100px]"
                            value={filterData.year}
                            onChange={(e) => setFilterData('year', parseInt(e.target.value))}
                            placeholder="Year"
                        />

                        {/* Office */}
                        <div className="w-[220px]">
                            <CustomComboBox
                                items={officeOptions}
                                placeholder="All Offices"
                                value={filterData.office_id || null}
                                onSelect={(value) => setFilterData('office_id', value ?? '')}
                            />
                        </div>

                        {/* Employment Status */}
                        <div className="w-[200px]">
                            <CustomComboBox
                                items={employmentStatusOptions}
                                placeholder="All Status"
                                value={filterData.employment_status_id || null}
                                onSelect={(value) => setFilterData('employment_status_id', value ?? '')}
                            />
                        </div>

                        {/* Search */}
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

                    {/* Export and Reports */}
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                const query = new URLSearchParams();
                                if (filterData.month) query.append('month', filterData.month.toString());
                                if (filterData.year) query.append('year', filterData.year.toString());
                                if (filterData.office_id) query.append('office_id', filterData.office_id);
                                if (filterData.employment_status_id) query.append('employment_status_id', filterData.employment_status_id);
                                if (filterData.search) query.append('search', filterData.search);
                                window.open(route('payroll.export') + '?' + query.toString(), '_blank');
                            }}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Export CSV
                        </Button>
                        <Button variant="outline" onClick={() => router.get(route('payroll.year-to-date'), { year: filterData.year })}>
                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                            Year-to-Date
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() =>
                                router.get(route('payroll.comparison'), { period1_month: filterData.month, period1_year: filterData.year })
                            }
                        >
                            <BarChart3 className="mr-2 h-4 w-4" />
                            Comparison
                        </Button>
                    </div>
                </div>

                <div className="w-full overflow-x-auto rounded-sm border shadow-sm">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="text-primary font-bold">Employee</TableHead>
                                <TableHead className="text-primary text-right font-bold">Salary</TableHead>
                                <TableHead className="text-primary text-right font-bold">PERA</TableHead>
                                <TableHead className="text-primary text-right font-bold">RATA</TableHead>
                                <TableHead className="text-primary text-right font-bold">Gross Pay</TableHead>
                                <TableHead className="text-primary text-right font-bold">Deductions</TableHead>
                                <TableHead className="text-primary text-right font-bold">Net Pay</TableHead>
                                <TableHead className="text-primary w-[80px] text-center font-bold">Action</TableHead>
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
                                                    <span className="text-muted-foreground text-xs">{employee.office?.name}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">{formatCurrency(employee.current_salary)}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(employee.current_pera)}</TableCell>
                                        <TableCell className="text-right">
                                            {employee.is_rata_eligible ? formatCurrency(employee.current_rata) : '-'}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">{formatCurrency(employee.gross_pay)}</TableCell>
                                        <TableCell className="text-destructive text-right">{formatCurrency(employee.total_deductions)}</TableCell>
                                        <TableCell className="text-right font-bold text-green-600 dark:text-green-400">
                                            {formatCurrency(employee.net_pay)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    router.get(route('payroll.show', employee.id) + `?month=${filters.month}&year=${filters.year}`)
                                                }
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="py-3 text-center text-gray-500">
                                        No employees found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <Pagination data={employees} />
            </div>
        </AppLayout>
    );
}
