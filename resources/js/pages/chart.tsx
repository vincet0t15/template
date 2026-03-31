'use client';

import { TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { type ChartConfig } from '@/components/ui/chart';

export const description = 'Source of Fund Bar Chart';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 0,
    }).format(amount);
};

const chartConfig = {
    total_amount: {
        label: 'Salary Amount',
        color: 'var(--chart-1)',
    },
} satisfies ChartConfig;

export interface ChartBarLabelProps {
    sourceOfFund: {
        code: string;
        description: string | null;
        total_amount: number;
    }[];
}

export function ChartBarLabel({ sourceOfFund }: ChartBarLabelProps) {
    const total = sourceOfFund.reduce((sum, item) => sum + item.total_amount, 0);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Salaries by Source of Fund</CardTitle>
            </CardHeader>
            <CardContent>
                {sourceOfFund.length > 0 ? (
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={sourceOfFund} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="code"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={10}
                                    angle={-45}
                                    textAnchor="end"
                                    interval={0}
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload[0]) {
                                            return (
                                                <div className="rounded-lg border bg-white p-3 shadow-md">
                                                    <p className="font-medium">{payload[0].payload.code}</p>
                                                    {payload[0].payload.description && (
                                                        <p className="text-muted-foreground text-xs">{payload[0].payload.description}</p>
                                                    )}
                                                    <p className="mt-1 font-semibold text-blue-600">{formatCurrency(payload[0].value as number)}</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Legend />
                                <Bar dataKey="total_amount" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]}>
                                    <LabelList
                                        position="top"
                                        offset={12}
                                        className="fill-foreground"
                                        fontSize={12}
                                        formatter={(value) => formatCurrency(Number(value))}
                                    />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="py-8 text-center">
                        <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                            <TrendingUp className="h-6 w-6 text-slate-400" />
                        </div>
                        <p className="text-muted-foreground">No salary records with source of fund for this period</p>
                    </div>
                )}
            </CardContent>
            {sourceOfFund.length > 0 && (
                <CardFooter className="flex-col items-start gap-2 text-sm">
                    <div className="flex gap-2 leading-none font-medium">
                        Total: {formatCurrency(total)} <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="text-muted-foreground leading-none">
                        Showing salary distribution across {sourceOfFund.length} fund{sourceOfFund.length !== 1 ? 's' : ''}
                    </div>
                </CardFooter>
            )}
        </Card>
    );
}
