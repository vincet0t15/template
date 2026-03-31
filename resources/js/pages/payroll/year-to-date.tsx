import { CustomComboBox } from '@/components/CustomComboBox';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import type { EmploymentStatus } from '@/types/employmentStatuses';
import type { Office } from '@/types/office';
import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Search, TrendingDown, TrendingUp } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Payroll',
        href: '/payroll',
    },
    {
        title: 'Year-to-Date Report',
        href: '/payroll/year-to-date',
    },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface MonthlyData {
    month: number;
    salary: number;
    pera: number;
    rata: number;
    gross_pay: number;
    deductions: number;
    net_pay: number;
}

interface EmployeeYTD {
    id: number;
    name: string;
    position: string;
    office: string;
    employment_status: string;
    is_rata_eligible: boolean;
    monthly_data: MonthlyData[];
    totals: {
        salary: number;
        pera: number;
        rata: number;
        gross_pay: number;
        deductions: number;
        net_pay: number;
    };
}

interface YearToDateProps {
    employees: EmployeeYTD[];
    offices: Office[];
    employmentStatuses: EmploymentStatus[];
    filters: {
        year: number;
        office_id?: number;
        employment_status_id?: number;
        search?: string;
    };
}

export default function YearToDate({ employees, offices, employmentStatuses, filters }: YearToDateProps) {
    const { data: filterData, setData: setFilterData } = useForm({
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
        if (filterData.year) queryString.year = filterData.year;
        if (filterData.office_id) queryString.office_id = filterData.office_id;
        if (filterData.employment_status_id) queryString.employment_status_id = filterData.employment_status_id;
        if (filterData.search) queryString.search = filterData.search;

        router.get(route('payroll.year-to-date'), queryString, {
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

    // Calculate grand totals
    const grandTotals = employees.reduce(
        (acc, emp) => ({
            salary: acc.salary + emp.totals.salary,
            pera: acc.pera + emp.totals.pera,
            rata: acc.rata + emp.totals.rata,
            gross_pay: acc.gross_pay + emp.totals.gross_pay,
            deductions: acc.deductions + emp.totals.deductions,
            net_pay: acc.net_pay + emp.totals.net_pay,
        }),
        { salary: 0, pera: 0, rata: 0, gross_pay: 0, deductions: 0, net_pay: 0 },
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Year-to-Date Report" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <Heading title="Year-to-Date Report" description={`Cumulative payroll totals for ${filters.year}`} />
                    <Button variant="outline" onClick={() => router.get(route('payroll.index'))}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Payroll
                    </Button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Gross Pay</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(grandTotals.gross_pay)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Deductions</CardTitle>
                            <TrendingDown className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(grandTotals.deductions)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Net Pay</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(grandTotals.net_pay)}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="flex flex-wrap items-center gap-2">
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
                </div>

                {/* Employee Table */}
                <div className="w-full overflow-x-auto rounded-sm border shadow-sm">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="text-primary font-bold">Employee</TableHead>

                                {MONTHS.map((month) => (
                                    <TableHead key={month} className="text-primary text-right text-xs font-bold">
                                        {month}
                                    </TableHead>
                                ))}
                                <TableHead className="text-primary text-right font-bold">Total Net Pay</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {employees.length > 0 ? (
                                employees.map((employee) => (
                                    <TableRow key={employee.id} className="hover:bg-muted/30">
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-bold">{employee.name}</span>
                                                <span className="text-muted-foreground text-xs">{employee.position}</span>
                                                <span className="text-muted-foreground text-xs">{employee.office}</span>
                                            </div>
                                        </TableCell>

                                        {employee.monthly_data.map((data, index) => (
                                            <TableCell key={index} className="text-right text-xs">
                                                {data.net_pay > 0 ? (
                                                    <span className="text-green-600">{formatCurrency(data.net_pay)}</span>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </TableCell>
                                        ))}
                                        <TableCell className="text-right font-bold text-green-600">
                                            {formatCurrency(employee.totals.net_pay)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={15} className="py-3 text-center text-gray-500">
                                        No employees found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Detailed Breakdown Table */}
                <Heading title="Detailed Breakdown" description="Year-to-date totals by compensation component" />

                <div className="w-full overflow-x-auto rounded-sm border shadow-sm">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="text-primary font-bold">Employee</TableHead>
                                <TableHead className="text-primary text-right font-bold">Total Salary</TableHead>
                                <TableHead className="text-primary text-right font-bold">Total PERA</TableHead>
                                <TableHead className="text-primary text-right font-bold">Total RATA</TableHead>
                                <TableHead className="text-primary text-right font-bold">Total Gross</TableHead>
                                <TableHead className="text-primary text-right font-bold">Total Deductions</TableHead>
                                <TableHead className="text-primary text-right font-bold">Total Net Pay</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {employees.length > 0 ? (
                                <>
                                    {employees.map((employee) => (
                                        <TableRow key={employee.id} className="hover:bg-muted/30">
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-bold">{employee.name}</span>
                                                    <span className="text-muted-foreground text-xs">{employee.position}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">{formatCurrency(employee.totals.salary)}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(employee.totals.pera)}</TableCell>
                                            <TableCell className="text-right">
                                                {employee.is_rata_eligible ? formatCurrency(employee.totals.rata) : '-'}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">{formatCurrency(employee.totals.gross_pay)}</TableCell>
                                            <TableCell className="text-destructive text-right">
                                                {formatCurrency(employee.totals.deductions)}
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-green-600">
                                                {formatCurrency(employee.totals.net_pay)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {/* Grand Total Row */}
                                    <TableRow className="bg-muted/50 font-bold">
                                        <TableCell>GRAND TOTAL</TableCell>
                                        <TableCell className="text-right">{formatCurrency(grandTotals.salary)}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(grandTotals.pera)}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(grandTotals.rata)}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(grandTotals.gross_pay)}</TableCell>
                                        <TableCell className="text-destructive text-right">{formatCurrency(grandTotals.deductions)}</TableCell>
                                        <TableCell className="text-right text-green-600">{formatCurrency(grandTotals.net_pay)}</TableCell>
                                    </TableRow>
                                </>
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-3 text-center text-gray-500">
                                        No employees found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
