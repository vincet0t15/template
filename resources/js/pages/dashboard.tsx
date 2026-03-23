import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import type { Employee } from '@/types/employee';
import type { Office } from '@/types/office';
import { Head, router } from '@inertiajs/react';
import { Building2, Calculator, Clock, DollarSign, TrendingUp, UserRound, Users } from 'lucide-react';

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
        monthlyDeductions: number;
        employeesWithDeductions: number;
        rataEligibleCount: number;
    };
    employeesByOffice: (Office & { employees_count: number })[];
    recentEmployees: Employee[];
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 0,
    }).format(amount);
};

export default function Dashboard({ stats, employeesByOffice, recentEmployees }: DashboardProps) {
    const statCards = [
        {
            title: 'Total Employees',
            value: stats.totalEmployees,
            description: 'Active workforce',
            icon: Users,
            trend: '+12%',
            trendUp: true,
            color: 'bg-blue-500',
        },
        {
            title: 'Total Offices',
            value: stats.totalOffices,
            description: 'Department count',
            icon: Building2,
            trend: 'Stable',
            trendUp: null,
            color: 'bg-emerald-500',
        },
        {
            title: 'Monthly Deductions',
            value: formatCurrency(stats.monthlyDeductions),
            description: `${stats.employeesWithDeductions} employees with deductions`,
            icon: DollarSign,
            trend: 'This month',
            trendUp: null,
            color: 'bg-amber-500',
        },
        {
            title: 'RATA Eligible',
            value: stats.rataEligibleCount,
            description: 'Department heads & eligible staff',
            icon: Calculator,
            trend: 'Eligible',
            trendUp: null,
            color: 'bg-purple-500',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">Welcome back! Here's an overview of your LGU payroll system.</p>
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
                                {card.trend && (
                                    <div className="mt-2 flex items-center text-xs">
                                        {card.trendUp === true && <TrendingUp className="mr-1 h-3 w-3 text-green-500" />}
                                        {card.trendUp === false && <TrendingUp className="mr-1 h-3 w-3 rotate-180 text-red-500" />}
                                        {card.trendUp === null && <Clock className="mr-1 h-3 w-3 text-gray-500" />}
                                        <span
                                            className={
                                                card.trendUp === true ? 'text-green-600' : card.trendUp === false ? 'text-red-600' : 'text-gray-600'
                                            }
                                        >
                                            {card.trend}
                                        </span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-6 lg:grid-cols-7">
                    {/* Employees by Office */}
                    <Card className="lg:col-span-4">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Employees by Office
                            </CardTitle>
                            <CardDescription>Top 5 offices by employee count</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {employeesByOffice.map((office) => (
                                    <div key={office.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                                                <Building2 className="text-primary h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{office.name}</p>
                                                <p className="text-muted-foreground text-sm">{office.code}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                                                <div
                                                    className="bg-primary h-full rounded-full transition-all"
                                                    style={{
                                                        width: `${Math.min((office.employees_count / stats.totalEmployees) * 100 * 5, 100)}%`,
                                                    }}
                                                />
                                            </div>
                                            <span className="w-8 text-right font-semibold">{office.employees_count}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Employees */}
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserRound className="h-5 w-5" />
                                Recent Employees
                            </CardTitle>
                            <CardDescription>Latest additions to the system</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentEmployees.map((employee) => (
                                    <div
                                        key={employee.id}
                                        className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                                        onClick={() => router.get(route('manage.employees.index', employee.id))}
                                    >
                                        <Avatar className="h-10 w-10 border">
                                            {employee.image_path ? (
                                                <AvatarImage src={employee.image_path} alt={`${employee.first_name} ${employee.last_name}`} />
                                            ) : null}
                                            <AvatarFallback className="bg-gray-100">
                                                <UserRound className="h-5 w-5 text-gray-400" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-medium">
                                                {employee.last_name}, {employee.first_name}
                                            </p>
                                            <p className="text-muted-foreground truncate text-sm">{employee.position}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="bg-secondary inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium">
                                                {employee.employment_status?.name}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Common tasks and navigation</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <button
                                onClick={() => router.get(route('employees.index'))}
                                className="flex items-center gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                                </div>
                                <div>
                                    <p className="font-medium">Employees</p>
                                    <p className="text-muted-foreground text-sm">Manage staff</p>
                                </div>
                            </button>

                            <button
                                onClick={() => router.get(route('payroll.index'))}
                                className="flex items-center gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                                    <DollarSign className="h-5 w-5 text-green-600 dark:text-green-300" />
                                </div>
                                <div>
                                    <p className="font-medium">Payroll</p>
                                    <p className="text-muted-foreground text-sm">View summaries</p>
                                </div>
                            </button>

                            <button
                                onClick={() => router.get(route('employee-deductions.index'))}
                                className="flex items-center gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900">
                                    <Calculator className="h-5 w-5 text-amber-600 dark:text-amber-300" />
                                </div>
                                <div>
                                    <p className="font-medium">Deductions</p>
                                    <p className="text-muted-foreground text-sm">Manage deductions</p>
                                </div>
                            </button>

                            <button
                                onClick={() => router.get(route('employees.create'))}
                                className="flex items-center gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                                    <UserRound className="h-5 w-5 text-purple-600 dark:text-purple-300" />
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
