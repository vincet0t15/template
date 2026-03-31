import { CustomComboBox } from '@/components/CustomComboBox';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { SourceOfFundCode } from '@/types/sourceOfFundCOde';
import { Head, router, useForm } from '@inertiajs/react';
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
}

export default function EmployeesBySourceOfFund({ sourceOfFundCodes }: Props) {
    const { data, setData, get } = useForm({
        source_of_fund_code_id: '',
        month: '',
        year: new Date().getFullYear().toString(),
    });

    const [loading, setLoading] = useState(false);

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

                <div className="bg-card rounded-lg border p-6 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-4">
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
                                <select
                                    className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                                    value={data.month}
                                    onChange={(e) => setData('month', e.target.value)}
                                >
                                    <option value="">All Months</option>
                                    {months.map((month) => (
                                        <option key={month.value} value={month.value}>
                                            {month.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Year */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Year</label>
                                <select
                                    className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                                    value={data.year}
                                    onChange={(e) => setData('year', e.target.value)}
                                >
                                    {years.map((year) => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
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

                <div className="bg-card rounded-lg border p-6 text-center shadow-sm">
                    <div className="bg-muted mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full">
                        <FileText className="text-muted-foreground h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-semibold">Select Filters Above</h3>
                    <p className="text-muted-foreground mt-2">
                        Choose a source of fund code and optionally specify a month and year to generate the employee list report.
                    </p>
                    <div className="mt-4 text-left text-sm">
                        <p className="font-semibold">Instructions:</p>
                        <ul className="text-muted-foreground mt-2 list-inside list-disc space-y-1">
                            <li>Select a source of fund code from the dropdown</li>
                            <li>Optionally select a specific month (leave empty for all months)</li>
                            <li>Select the year</li>
                            <li>Click "Generate Report" to preview or "Print Report" to print directly</li>
                        </ul>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
