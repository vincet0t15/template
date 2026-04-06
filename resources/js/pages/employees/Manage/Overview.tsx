import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Claim } from '@/types/claim';
import type { Employee } from '@/types/employee';
import type { EmployeeDeduction } from '@/types/employeeDeduction';
import { Building2, CalendarDays, CoinsIcon, CreditCard, DollarSign, Receipt, TrendingDown, User } from 'lucide-react';

interface OverviewProps {
    employee: Employee;
    deductions: Record<string, EmployeeDeduction[]>;
    claims: Claim[];
    totalDeductionsAllTime: number;
    totalClaimsAllTime: number;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatCurrency(amount: number | undefined | null) {
    if (!amount) return '₱0.00';
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(amount);
}

function formatDate(dateStr: string | undefined) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
}

function Overview({ employee, deductions, claims, totalDeductionsAllTime, totalClaimsAllTime }: OverviewProps) {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const currentPeriodKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
    const currentMonthDeductions = deductions[currentPeriodKey] ?? [];
    const currentMonthDeductionTotal = currentMonthDeductions.reduce((sum, d) => sum + Number(d.amount), 0);

    const currentMonthClaims = claims.filter((c) => {
        const d = new Date(c.claim_date);
        return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear;
    });
    const currentMonthClaimsTotal = currentMonthClaims.reduce((sum, c) => sum + Number(c.amount), 0);

    const grossPay =
        Number(employee.latest_salary?.amount ?? 0) +
        Number(employee.latest_pera?.amount ?? 0) +
        (employee.is_rata_eligible ? Number(employee.latest_rata?.amount ?? 0) : 0);
    const netThisMonth = grossPay - currentMonthDeductionTotal;

    return (
        <div className="space-y-6">
            {/* Compensation Summary Cards */}
            <div>
                <h3 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">Current Compensation</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Basic Salary</CardTitle>
                            <CoinsIcon className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(employee.latest_salary?.amount)}</div>
                            <p className="text-muted-foreground mt-1 text-xs">Effective {formatDate(employee.latest_salary?.effective_date)}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">PERA</CardTitle>
                            <CreditCard className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(employee.latest_pera?.amount)}</div>
                            <p className="text-muted-foreground mt-1 text-xs">Effective {formatDate(employee.latest_pera?.effective_date)}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">RATA</CardTitle>
                            <CreditCard className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            {employee.is_rata_eligible ? (
                                <>
                                    <div className="text-2xl font-bold">{formatCurrency(employee.latest_rata?.amount)}</div>
                                    <p className="text-muted-foreground mt-1 text-xs">Effective {formatDate(employee.latest_rata?.effective_date)}</p>
                                </>
                            ) : (
                                <>
                                    <div className="text-muted-foreground text-2xl font-bold">N/A</div>
                                    <p className="text-muted-foreground mt-1 text-xs">Not RATA eligible</p>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-emerald-200 bg-emerald-50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-emerald-800">Est. Gross Pay</CardTitle>
                            <CoinsIcon className="h-4 w-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-700">{formatCurrency(grossPay)}</div>
                            <p className="mt-1 text-xs text-emerald-600">Salary + PERA{employee.is_rata_eligible ? ' + RATA' : ''}</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* This Month & All-time Stats */}
            <div>
                <h3 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
                    {MONTHS[currentMonth - 1]} {currentYear} Activity
                </h3>
                <div className="grid gap-4 sm:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Deductions This Month</CardTitle>
                            <TrendingDown className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{formatCurrency(currentMonthDeductionTotal)}</div>
                            <p className="text-muted-foreground mt-1 text-xs">
                                {currentMonthDeductions.length} deduction{currentMonthDeductions.length !== 1 ? 's' : ''} recorded
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Claims This Month</CardTitle>
                            <Receipt className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{formatCurrency(currentMonthClaimsTotal)}</div>
                            <p className="text-muted-foreground mt-1 text-xs">
                                {currentMonthClaims.length} claim{currentMonthClaims.length !== 1 ? 's' : ''} recorded
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-blue-200 bg-blue-50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-blue-800">Est. Net This Month</CardTitle>
                            <CoinsIcon className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-700">{formatCurrency(netThisMonth)}</div>
                            <p className="mt-1 text-xs text-blue-600">Gross minus deductions</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* All-time totals & Employment Info */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* All-time totals */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">All-Time Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm">
                                <TrendingDown className="h-4 w-4 text-red-500" />
                                <span className="text-muted-foreground">Total Deductions</span>
                            </div>
                            <span className="font-semibold text-red-600">{formatCurrency(totalDeductionsAllTime)}</span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm">
                                <Receipt className="h-4 w-4 text-green-500" />
                                <span className="text-muted-foreground">Total Claims</span>
                            </div>
                            <span className="font-semibold text-green-600">{formatCurrency(totalClaimsAllTime)}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Employment Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Employment Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm">
                                <User className="text-muted-foreground h-4 w-4" />
                                <span className="text-muted-foreground">Position</span>
                            </div>
                            <span className="text-sm font-medium">{employee.position}</span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm">
                                <Building2 className="text-muted-foreground h-4 w-4" />
                                <span className="text-muted-foreground">Office</span>
                            </div>
                            <span className="text-sm font-medium">{employee.office?.name ?? '—'}</span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm">
                                <CalendarDays className="text-muted-foreground h-4 w-4" />
                                <span className="text-muted-foreground">Status</span>
                            </div>
                            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                                {employee.employment_status?.name ?? '—'}
                            </Badge>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm">
                                <CoinsIcon className="text-muted-foreground h-4 w-4" />
                                <span className="text-muted-foreground">RATA Eligible</span>
                            </div>
                            <Badge variant={employee.is_rata_eligible ? 'default' : 'secondary'}>{employee.is_rata_eligible ? 'Yes' : 'No'}</Badge>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm">
                                <DollarSign className="text-muted-foreground h-4 w-4" />
                                <span className="text-muted-foreground">Source of Fund</span>
                            </div>
                            <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                                {employee.latest_salary?.source_of_fund_code?.code ?? 'Not Assigned'}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Deductions */}
            {Object.keys(deductions).length > 0 && (
                <div>
                    <h3 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">Latest Deductions Period</h3>
                    <Card>
                        <CardContent className="pt-4">
                            {(() => {
                                const latestKey = Object.keys(deductions)[0];
                                const [year, month] = latestKey.split('-');
                                const items = deductions[latestKey];
                                const total = items.reduce((sum, d) => sum + Number(d.amount), 0);
                                return (
                                    <div className="space-y-2">
                                        <p className="mb-3 text-sm font-semibold">
                                            {MONTHS[parseInt(month) - 1]} {year}
                                        </p>
                                        {items.map((d) => (
                                            <div key={d.id} className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">{d.deduction_type?.name ?? '—'}</span>
                                                <span className="font-medium text-red-600">{formatCurrency(Number(d.amount))}</span>
                                            </div>
                                        ))}
                                        <Separator className="my-2" />
                                        <div className="flex items-center justify-between text-sm font-semibold">
                                            <span>Total</span>
                                            <span className="text-red-600">{formatCurrency(total)}</span>
                                        </div>
                                    </div>
                                );
                            })()}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}

export default Overview;
