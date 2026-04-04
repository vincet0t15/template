import { CustomComboBox } from '@/components/CustomComboBox';
import Heading from '@/components/heading';
import Pagination from '@/components/paginationData';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { PaginatedDataResponse } from '@/types/pagination';
import { SourceOfFundCode } from '@/types/sourceOfFundCOde';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Employee List by Source of Fund',
        href: '/reports/employees-by-source-of-fund',
    },
];

interface Props {
    sourceOfFundCodes: SourceOfFundCode[];
    employees: PaginatedDataResponse<{
        id: number;
        first_name: string;
        middle_name: string | null;
        last_name: string;
        suffix: string | null;
        position: string | null;
        office: { name: string } | null;
        employment_status: { name: string } | null;
    }>;
    filters?: {
        source_of_fund_code_id?: string;
        month?: string;
        year?: string;
    };
    availableYears?: number[];
}

export default function EmployeesBySourceOfFund({ sourceOfFundCodes, employees, filters = {}, availableYears = [] }: Props) {
    const { data, setData } = useForm({
        source_of_fund_code_id: filters.source_of_fund_code_id || '',
        month: filters.month || '',
        year: filters.year || new Date().getFullYear().toString(),
    });

    const [loading, setLoading] = useState(false);

    const applyFilters = (overrides?: Partial<typeof data>) => {
        const merged = { ...data, ...overrides };
        const queryString: Record<string, string> = {};
        if (merged.source_of_fund_code_id) queryString.source_of_fund_code_id = merged.source_of_fund_code_id;
        if (merged.month) queryString.month = merged.month;
        if (merged.year) queryString.year = merged.year;
        router.get(route('reports.employees-by-source-of-fund'), queryString, {
            preserveState: true,
            preserveScroll: true,
        });
    };

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

    // Use available years from backend, or generate default range if none selected
    const years = availableYears.length > 0 ? availableYears : Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

    const handlePrint = () => {
        if (!data.source_of_fund_code_id) {
            alert('Please select a source of fund code');
            return;
        }

        const params: Record<string, string> = {};
        params.source_of_fund_code_id = data.source_of_fund_code_id;
        if (data.month) params.month = data.month;
        if (data.year) params.year = data.year;

        const queryString = new URLSearchParams(params).toString();
        window.open(`/reports/employees-by-source-of-fund/print?${queryString}`, '_blank');
    };
    const handleSourceOfFundChange = (value: string) => {
        const newSourceId = value === '' ? '' : value;
        setData('source_of_fund_code_id', newSourceId);
        applyFilters({ source_of_fund_code_id: newSourceId });
    };

    const handleMonthChange = (value: string) => {
        const newMonth = value === '' ? '' : value;
        setData('month', newMonth);
        applyFilters({ month: newMonth });
    };

    const handleYearChange = (value: string) => {
        const newYear = value === '' ? '' : value;
        setData('year', newYear);
        applyFilters({ year: newYear });
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Employee List by Source of Fund" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <Heading title="Employee List by Source of Fund" description="Filter and print employees by their salary source of fund code" />
                <div className="text-left text-sm">
                    <p className="font-semibold">Instructions:</p>
                    <ul className="text-muted-foreground mt-2 list-inside list-disc space-y-1">
                        <li>Select a source of fund code from the dropdown</li>
                        <li>Optionally select a specific month (leave empty for all months)</li>
                        <li>Select the year</li>
                        <li>Click "Generate Report" to preview or "Print Report" to print directly</li>
                    </ul>
                </div>
                <div className="bg-card rounded-lg border p-6 shadow-sm">
                    <div className="grid gap-4 md:grid-cols-3">
                        {/* Source of Fund */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Source of Fund Code</label>
                            <CustomComboBox
                                items={sourceOfFundCodes.map((fund) => ({
                                    value: fund.id.toString(),
                                    label: `${fund.code} - ${fund.description || ''}`,
                                }))}
                                placeholder="Select source of fund"
                                value={data.source_of_fund_code_id || null}
                                onSelect={(value) => handleSourceOfFundChange(value ?? '')}
                                showClear={true}
                            />
                        </div>

                        {/* Month */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Month (Optional)</label>
                            <CustomComboBox
                                items={months}
                                placeholder="All Months"
                                value={data.month || null}
                                onSelect={(value) => handleMonthChange(value ?? '')}
                                showClear={true}
                            />
                        </div>

                        {/* Year */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Year</label>
                            <CustomComboBox
                                items={years.map((year) => ({
                                    value: year.toString(),
                                    label: year.toString(),
                                }))}
                                placeholder="Select year"
                                value={data.year || null}
                                onSelect={(value) => handleYearChange(value ?? '')}
                                showClear={false}
                            />
                        </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                        <Button type="button" onClick={handlePrint} disabled={!data.source_of_fund_code_id}>
                            Print Report
                        </Button>
                    </div>
                </div>
                {/* Employee List Display */}
                {employees.data.length > 0 && (
                    <div className="bg-card rounded-lg border shadow-sm">
                        <div className="bg-muted/50 border-b px-6 py-4">
                            <h3 className="text-lg font-semibold">Employees - All Employees ({employees.total})</h3>
                            {data.source_of_fund_code_id && (
                                <p className="text-muted-foreground text-sm">
                                    Filtered by: {sourceOfFundCodes.find((f) => f.id.toString() === data.source_of_fund_code_id)?.code}
                                    {data.month && ` • ${months.find((m) => m.value === data.month)?.label}`}
                                    {data.year && ` • ${data.year}`}
                                </p>
                            )}
                        </div>
                        <div className="max-h-[600px] overflow-auto">
                            <table className="w-full">
                                <thead className="bg-muted/50 sticky top-0">
                                    <tr>
                                        <th className="border-b px-4 py-2 text-left text-sm font-medium">#</th>
                                        <th className="border-b px-4 py-2 text-left text-sm font-medium">Employee Name</th>
                                        <th className="border-b px-4 py-2 text-left text-sm font-medium">Position</th>
                                        <th className="border-b px-4 py-2 text-left text-sm font-medium">Office</th>
                                        <th className="border-b px-4 py-2 text-left text-sm font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.data.map((employee, index) => (
                                        <tr key={employee.id} className="hover:bg-muted/30 border-b last:border-0">
                                            <td className="px-4 py-3 text-sm">{index + 1}</td>
                                            <td className="px-4 py-3 text-sm">
                                                {[employee.first_name, employee.middle_name, employee.last_name, employee.suffix]
                                                    .filter(Boolean)
                                                    .join(' ')}
                                            </td>
                                            <td className="px-4 py-3 text-sm">{employee.position || '—'}</td>
                                            <td className="px-4 py-3 text-sm">{employee.office?.name || '—'}</td>
                                            <td className="px-4 py-3 text-sm">{employee.employment_status?.name || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Pagination */}
                {employees.data.length > 0 && (
                    <div>
                        <Pagination data={employees} />
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
