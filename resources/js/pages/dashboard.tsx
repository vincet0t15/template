import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import type { EmployeeDeduction } from '@/types/employeeDeduction';
import type { Office } from '@/types/office';
import { Head, router } from '@inertiajs/react';
import { Building2, Calculator, Clock, FileText, MinusCircle, TrendingUp, Users } from 'lucide-react';

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
    };
    employeesByOffice: (Office & { employees_count: number })[];
    recentDeductions: EmployeeDeduction[];
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
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 0,
    }).format(amount);
};

export default function Dashboard({ stats, employeesByOffice, recentDeductions, topDeductionTypes, currentPeriod }: DashboardProps) {
    const statCards = [
        {
            title: 'Total Employees',
            value: stats.totalEmployees,
            description: 'Registered employees',
            icon: Users,
            color: 'bg-blue-500',
        },
        {
            title: 'Total Offices',
            value: stats.totalOffices,
            description: 'Department count',
            icon: Building2,
            color: 'bg-emerald-500',
        },
        {
            title: 'Deduction Types',
            value: stats.totalDeductionTypes,
            description: 'Active deduction categories',
            icon: FileText,
            color: 'bg-purple-500',
        },
        {
            title: `${currentPeriod.monthName} Deductions`,
            value: stats.monthlyDeductionsCount,
            description: `${formatCurrency(stats.monthlyDeductionsTotal)} total • ${stats.employeesWithDeductions} employees`,
            icon: MinusCircle,
            color: 'bg-amber-500',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Employee Deductions Dashboard</h1>
                    <p className="text-muted-foreground">Track and manage employee deductions for {currentPeriod.monthName} {currentPeriod.year}</p>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((card, index) => (
                        <Card key={index} className="relative overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                                <div className={`${card.color} rounded-lg p-2`}>
                                    <card.icon className="h-4 w-4 text-white" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{card.value}</div>
                                <p className="text-muted-foreground text-xs">{card.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-6 lg:grid-cols-7">
                    {/* Top Deduction Types */}
                    <Card className="lg:col-span-4">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Top Deduction Types - {currentPeriod.monthName}
                            </CardTitle>
                            <CardDescription>Highest deduction categories by amount</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {topDeductionTypes.length > 0 ? (
                                    topDeductionTypes.map((item) => (
                                        <div key={item.deduction_type_id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                                                    <MinusCircle className="text-primary h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{item.deduction_type.name}</p>
                                                    <p className="text-muted-foreground text-sm">{item.count} entries</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-semibold">{formatCurrency(item.total_amount)}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-muted-foreground py-4 text-center">No deductions recorded for this month</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Deductions */}
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Recent Deductions
                            </CardTitle>
                            <CardDescription>Latest deduction entries</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentDeductions.map((deduction) => (
                                    <div
                                        key={deduction.id}
                                        className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                                        onClick={() => router.get(route('employee-deductions.index'))}
                                    >
                                        <Avatar className="h-10 w-10 border">
                                            {deduction.employee?.image_path ? (
                                                <AvatarImage src={deduction.employee.image_path} alt={`${deduction.employee?.first_name} ${deduction.employee?.last_name}`} />
                                            ) : null}
                                            <AvatarFallback className="bg-gray-100">
                                                <Users className="h-5 w-5 text-gray-400" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-medium">
                                                {deduction.employee?.last_name}, {deduction.employee?.first_name}
                                            </p>
                                            <p className="text-muted-foreground truncate text-sm">{deduction.deduction_type?.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-semibold">{formatCurrency(Number(deduction.amount))}</span>
                                        </div>
                                    </div>
                                ))}
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
                        <CardDescription>Distribution of employees across departments</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                            {employeesByOffice.map((office) => (
                                <div key={office.id} className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                                            <Building2 className="text-primary h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{office.name}</p>
                                            <p className="text-muted-foreground text-xs">{office.code}</p>
                                        </div>
                                    </div>
                                    <span className="bg-secondary rounded-full px-3 py-1 text-sm font-semibold">
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
                        <CardDescription>Common tasks for managing deductions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <button
                                onClick={() => router.get(route('employee-deductions.index'))}
                                className="flex items-center gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900">
                                    <MinusCircle className="h-5 w-5 text-amber-600 dark:text-amber-300" />
                                </div>
                                <div>
                                    <p className="font-medium">View Deductions</p>
                                    <p className="text-muted-foreground text-sm">Manage all deductions</p>
                                </div>
                            </button>

                            <button
                                onClick={() => router.get(route('employees.index'))}
                                className="flex items-center gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                                </div>
                                <div>
                                    <p className="font-medium">Employees</p>
                                    <p className="text-muted-foreground text-sm">View employee list</p>
                                </div>
                            </button>

                            <button
                                onClick={() => router.get(route('deduction-types.index'))}
                                className="flex items-center gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                                    <FileText className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                                </div>
                                <div>
                                    <p className="font-medium">Deduction Types</p>
                                    <p className="text-muted-foreground text-sm">Manage categories</p>
                                </div>
                            </button>

                            <button
                                onClick={() => router.get(route('employees.create'))}
                                className="flex items-center gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900">
                                    <Calculator className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
                                </div>
                                <div>
                                    <p className="font-medium">Add Employee</p>
                                    <p className="text-muted-foreground text-sm">Create new record</p>
                                </div>
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
