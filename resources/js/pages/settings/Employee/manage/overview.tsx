import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Employee } from '@/types/employee';
import { Banknote, Calendar, FileText, Info, Wallet } from 'lucide-react';

interface OverviewProps {
    employee: Employee;
}

export default function Overview({ employee }: OverviewProps) {
    const formatCurrency = (amount: number | undefined) => {
        if (!amount) return '₱0.00';
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    return (
        <div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Total Earnings this Year */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Monthly Salary</CardTitle>
                        <Banknote className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(employee.latest_salary?.amount)}</div>
                        <p className="text-muted-foreground text-xs">Current salary rate</p>
                    </CardContent>
                </Card>

                {/* Active Allowance Count */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Allowances</CardTitle>
                        <Wallet className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold">{employee.is_rata_eligible ? 'RATA | PERA' : 'PERA'}</div>
                        <p className="text-muted-foreground text-xs">
                            {employee.is_rata_eligible
                                ? `${formatCurrency(employee.latest_rata?.amount)} | ${formatCurrency(employee.latest_pera?.amount)}`
                                : formatCurrency(employee.latest_pera?.amount)}
                        </p>
                    </CardContent>
                </Card>

                {/* RATA Status */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">RATA Status</CardTitle>
                        <FileText className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{employee.is_rata_eligible ? 'Eligible' : 'Not Eligible'}</div>
                        <p className="text-muted-foreground text-xs">{employee.is_rata_eligible ? 'Receives RATA allowance' : 'No RATA allowance'}</p>
                    </CardContent>
                </Card>

                {/* Employment Status */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Employment</CardTitle>
                        <Calendar className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{employee.employment_status?.name}</div>
                        <p className="text-muted-foreground text-xs">{employee.office?.name}</p>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base">Compensation Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-medium">
                                <span>Gross Salary</span>
                                <span>{formatCurrency(employee.latest_salary?.amount)}</span>
                            </div>
                            {employee.is_rata_eligible && (
                                <div className="flex justify-between text-xs font-medium">
                                    <span>RATA</span>
                                    <span>{formatCurrency(employee.latest_rata?.amount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-xs font-medium">
                                <span>PERA</span>
                                <span>{formatCurrency(employee.latest_pera?.amount)}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                            <Info className="h-4 w-4 text-blue-500" />
                            <p className="text-xs text-slate-600">
                                Total monthly compensation:{' '}
                                <strong>
                                    {formatCurrency(
                                        (employee.latest_salary?.amount || 0) +
                                            (employee.latest_pera?.amount || 0) +
                                            (employee.is_rata_eligible ? employee.latest_rata?.amount || 0 : 0),
                                    )}
                                </strong>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
