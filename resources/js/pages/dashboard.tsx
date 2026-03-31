import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import type { Employee } from '@/types/employee';
import type { Office } from '@/types/office';
import { Head, router, useForm } from '@inertiajs/react';
import {
    ArrowUpRight,
    BarChart3,
    Building2,
    Calculator,
    ChevronRight,
    Clock,
    Coins,
    FileText,
    MinusCircle,
    Receipt,
    TrendingDown,
    TrendingUp,
    Users,
    Wallet,
} from 'lucide-react';
import { ChartBarLabel } from './chart';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface DashboardProps {
    stats: {
        totalEmployees: number;
        totalOffices: number;
        totalDeductionTypes: number;
        monthlyDeductionsCount: number;
        monthlyDeductionsTotal: number;
        employeesWithDeductions: number;
        totalClaims: number;
        totalClaimsAmount: number;
        totalSalaries: number;
        totalPera: number;
        totalRata: number;
    };
    salariesBySourceOfFund: {
        code: string;
        description: string | null;
        total_amount: number;
    }[];
    filters: {
        month: number;
        year: number;
    };
    employeesByOffice: (Office & { employees_count: number })[];
    recentEmployeesWithDeductions: (Employee & { total_deductions: number })[];
    topDeductionTypes: {
        deduction_type_id: number;
        total_amount: number;
        count: number;
        deduction_type: { name: string };
    }[];
    currentPeriod: {
        month: number;
        year: number;
        monthName: string;
    };
    recentActivity: {
        type: string;
        description: string;
        amount?: number;
        date: string;
    }[];
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 0,
    }).format(amount);
};

export default function Dashboard({
    stats,
    salariesBySourceOfFund,
    filters,
    employeesByOffice,
    recentEmployeesWithDeductions,
    topDeductionTypes,
    currentPeriod,
    recentActivity,
}: DashboardProps) {
    const {
        data: filterData,
        setData: setFilterData,
        get,
    } = useForm({
        month: filters.month.toString(),
        year: filters.year.toString(),
    });

    const months = [
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

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

    const handleFilterChange = (field: string, value: string) => {
        setFilterData(field as keyof typeof filterData, value);
        setTimeout(() => {
            get(route('dashboard'), {
                preserveState: true,
                preserveScroll: true,
            });
        }, 300);
    };
    const statCards = [
        {
            title: 'Total Employees',
            value: stats.totalEmployees,
            description: 'Active workforce',
            icon: Users,
            color: 'bg-blue-500',
            trend: '+12%',
        },
        {
            title: 'Total Offices',
            value: stats.totalOffices,
            description: 'Departments',
            icon: Building2,
            color: 'bg-emerald-500',
            trend: '+2',
        },
        {
            title: `${currentPeriod.monthName} Deductions`,
            value: formatCurrency(stats.monthlyDeductionsTotal),
            description: `${stats.monthlyDeductionsCount} entries • ${stats.employeesWithDeductions} employees`,
            icon: MinusCircle,
            color: 'bg-amber-500',
            trend: 'This month',
        },
        {
            title: 'Total Claims',
            value: formatCurrency(stats.totalClaimsAmount),
            description: `${stats.totalClaims} pending claims`,
            icon: Receipt,
            color: 'bg-violet-500',
            trend: '+5',
        },
    ];

    const compensationStats = [
        { label: 'Total Salaries', value: stats.totalSalaries, icon: Wallet, color: 'text-blue-600' },
        { label: 'PERA Allowances', value: stats.totalPera, icon: Coins, color: 'text-emerald-600' },
        { label: 'RATA Benefits', value: stats.totalRata, icon: TrendingUp, color: 'text-amber-600' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* Header */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>
                        <p className="text-muted-foreground">
                            Welcome back! Here's what's happening with your payroll for{' '}
                            <span className="font-medium text-slate-900 dark:text-white">
                                {months.find((m) => m.value === filterData.month)?.label || currentPeriod.monthName} {filterData.year}
                            </span>
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={filterData.month} onValueChange={(value) => handleFilterChange('month', value)}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Month" />
                            </SelectTrigger>
                            <SelectContent>
                                {months.map((m) => (
                                    <SelectItem key={m.value} value={m.value}>
                                        {m.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={filterData.year} onValueChange={(value) => handleFilterChange('year', value)}>
                            <SelectTrigger className="w-[100px]">
                                <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map((y) => (
                                    <SelectItem key={y} value={y.toString()}>
                                        {y}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button onClick={() => router.get(route('payroll.index'))}>
                            View Payroll
                            <ArrowUpRight />
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((card, index) => (
                        <Card key={index} className="relative overflow-hidden transition-shadow hover:shadow-md">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                                <div className={`${card.color} rounded-lg p-2`}>
                                    <card.icon className="h-4 w-4 text-white" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{card.value}</div>
                                <div className="mt-1 flex items-center gap-2">
                                    <p className="text-muted-foreground text-xs">{card.description}</p>
                                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                        {card.trend}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Compensation Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Compensation Overview
                        </CardTitle>
                        <CardDescription>Total compensation breakdown across all employees</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 sm:grid-cols-3">
                            {compensationStats.map((stat) => (
                                <div key={stat.label} className="flex items-center gap-4">
                                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800`}>
                                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                                        <p className="text-xl font-bold">{stat.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Source of Fund Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Salaries by Source of Fund
                        </CardTitle>
                        <CardDescription>
                            Total salary amounts grouped by fund code for {months.find((m) => m.value === filterData.month)?.label || 'Current'}{' '}
                            {filterData.year}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartBarLabel
                            sourceOfFund={salariesBySourceOfFund}
                            month={filterData.month ? parseInt(filterData.month.toString()) : undefined}
                            year={filterData.year ? parseInt(filterData.year.toString()) : undefined}
                        />
                    </CardContent>
                </Card>

                {/* Main Content Grid */}
                <div className="grid gap-6 lg:grid-cols-7">
                    {/* Top Deduction Types */}
                    <Card className="lg:col-span-4">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingDown className="h-5 w-5" />
                                Top Deduction Types
                            </CardTitle>
                            <CardDescription>Highest deduction categories for {currentPeriod.monthName}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {topDeductionTypes.length > 0 ? (
                                    topDeductionTypes.map((item, index) => {
                                        const maxAmount = topDeductionTypes[0]?.total_amount || 1;
                                        const percentage = (item.total_amount / maxAmount) * 100;
                                        return (
                                            <div key={item.deduction_type_id} className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                                                            <span className="text-primary text-sm font-bold">{index + 1}</span>
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{item.deduction_type.name}</p>
                                                            <p className="text-muted-foreground text-xs">{item.count} entries</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="font-semibold">{formatCurrency(item.total_amount)}</span>
                                                    </div>
                                                </div>
                                                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                                    <div
                                                        className="bg-primary h-full rounded-full transition-all"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="py-8 text-center">
                                        <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                                            <FileText className="h-6 w-6 text-slate-400" />
                                        </div>
                                        <p className="text-muted-foreground">No deductions recorded for this month</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Employees with Deductions */}
                    <Card className="lg:col-span-3">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    Recent Deductions
                                </CardTitle>
                                <CardDescription>Employees with deductions this month</CardDescription>
                            </div>
                            <button
                                onClick={() => router.get(route('employee-deductions.index'))}
                                className="text-primary text-sm font-medium hover:underline"
                            >
                                View All
                            </button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {recentEmployeesWithDeductions.length > 0 ? (
                                    recentEmployeesWithDeductions.map((employee) => (
                                        <div
                                            key={employee.id}
                                            className="group flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                                            onClick={() => router.get(route('manage.employees.show', employee.id))}
                                        >
                                            <Avatar className="h-10 w-10 border">
                                                {employee.image_path ? (
                                                    <AvatarImage src={employee.image_path} alt={`${employee.first_name} ${employee.last_name}`} />
                                                ) : null}
                                                <AvatarFallback className="bg-slate-100">
                                                    <Users className="h-5 w-5 text-slate-400" />
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate font-medium">
                                                    {employee.last_name}, {employee.first_name}
                                                </p>
                                                <p className="text-muted-foreground truncate text-xs">{employee.office?.name}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold">{formatCurrency(Number(employee.total_deductions))}</span>
                                                <ChevronRight className="h-4 w-4 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100" />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-8 text-center">
                                        <p className="text-muted-foreground text-sm">No employees with deductions this month</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Employees by Office */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            Employees by Office
                        </CardTitle>
                        <CardDescription>Workforce distribution across departments</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {employeesByOffice.slice(0, 8).map((office) => (
                                <div
                                    key={office.id}
                                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                                            <Building2 className="h-4 w-4 text-slate-500" />
                                        </div>
                                        <span className="text-sm font-medium">{office.name}</span>
                                    </div>
                                    <span className="bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs font-semibold">
                                        {office.employees_count}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Common tasks for managing your payroll system</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {[
                                {
                                    icon: MinusCircle,
                                    title: 'View Deductions',
                                    desc: 'Manage all deductions',
                                    route: 'employee-deductions.index',
                                    color: 'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300',
                                },
                                {
                                    icon: Users,
                                    title: 'Employees',
                                    desc: 'View employee list',
                                    route: 'employees.index',
                                    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
                                },
                                {
                                    icon: FileText,
                                    title: 'Deduction Types',
                                    desc: 'Manage categories',
                                    route: 'deduction-types.index',
                                    color: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300',
                                },
                                {
                                    icon: Calculator,
                                    title: 'Add Employee',
                                    desc: 'Create new record',
                                    route: 'employees.create',
                                    color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300',
                                },
                            ].map((action) => (
                                <button
                                    key={action.title}
                                    onClick={() => router.get(route(action.route))}
                                    className="group hover:border-primary/50 flex items-center gap-3 rounded-lg border p-4 text-left transition-all hover:bg-slate-50 dark:hover:bg-slate-800"
                                >
                                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${action.color}`}>
                                        <action.icon className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium">{action.title}</p>
                                        <p className="text-muted-foreground text-xs">{action.desc}</p>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100" />
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
