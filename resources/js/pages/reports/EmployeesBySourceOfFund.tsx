import { CustomComboBox } from '@/components/CustomComboBox';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { SourceOfFundCode } from '@/types/sourceOfFundCOde';
import { Head, router, useForm } from '@inertiajs/react';
import axios from 'axios';
import { FileText } from 'lucide-react';
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
    employees?: {
        id: number;
        first_name: string;
        middle_name: string | null;
        last_name: string;
        suffix: string | null;
        position: string | null;
        office: { name: string } | null;
        employment_status: { name: string } | null;
    }[];
}

export default function EmployeesBySourceOfFund({ sourceOfFundCodes, employees = [] }: Props) {
    const { data, setData } = useForm({
        source_of_fund_code_id: '',
        month: '',
        year: new Date().getFullYear().toString(),
    });

    const [loading, setLoading] = useState(false);
    const [filteredEmployees, setFilteredEmployees] = useState<typeof employees>([]);

    const handleGenerate = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.source_of_fund_code_id) {
            return;
        }

        setLoading(true);

        const params: Record<string, string> = {
            source_of_fund_code_id: data.source_of_fund_code_id,
        };

        if (data.month) params.month = data.month;
        if (data.year) params.year = data.year;

        // Fetch updated employee list based on filters using axios POST
        axios
            .post(route('reports.employees-by-source-of-fund.filter'), params)
            .then((response) => {
                setFilteredEmployees(response.data.employees);
            })
            .catch((error) => {
                console.error('Error fetching employees:', error);
            })
            .finally(() => setLoading(false));
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

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const params: Record<string, string> = {};
        if (data.source_of_fund_code_id) params.source_of_fund_code_id = data.source_of_fund_code_id;
        if (data.month) params.month = data.month;
        if (data.year) params.year = data.year;

        router.get(route('reports.employees-by-source-of-fund.print'), params, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setLoading(false),
        });
    };

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
                    <form onSubmit={handleGenerate} className="space-y-4">
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
                                    onSelect={(value) => setData('source_of_fund_code_id', value ?? '')}
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
                                    onSelect={(value) => setData('month', value ?? '')}
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
                                    onSelect={(value) => setData('year', value ?? '')}
                                    showClear={false}
                                />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={loading || !data.source_of_fund_code_id}
                                className="bg-primary text-primary-foreground ring-offset-background hover:bg-primary/90 focus-visible:ring-ring inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                            >
                                <FileText className="mr-2 h-4 w-4" />
                                {loading ? 'Loading...' : 'Generate Report'}
                            </button>

                            <button
                                type="button"
                                onClick={handlePrint}
                                disabled={!data.source_of_fund_code_id}
                                className="border-input bg-background ring-offset-background hover:bg-accent focus-visible:ring-ring inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                            >
                                Print Report
                            </button>
                        </div>
                    </form>
                </div>

                {/* Employee List Display */}
                {(filteredEmployees.length > 0 || employees.length > 0) && (
                    <div className="bg-card rounded-lg border shadow-sm">
                        <div className="bg-muted/50 border-b px-6 py-4">
                            <h3 className="text-lg font-semibold">
                                Employees {data.source_of_fund_code_id ? `(${filteredEmployees.length})` : `- All Employees (${employees.length})`}
                            </h3>
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
                                    {(data.source_of_fund_code_id ? filteredEmployees : employees).map((employee, index) => (
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
            </div>
        </AppLayout>
    );
}
