'use client';

import { TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

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
                <CardDescription>Source of fund breakdown for selected period</CardDescription>
            </CardHeader>
            <CardContent>
                {sourceOfFund.length > 0 ? (
                    <ChartContainer config={chartConfig} className="h-[250px]">
                        <BarChart
                            accessibilityLayer
                            data={sourceOfFund}
                            margin={{
                                top: 20,
                            }}
                        >
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="code" tickLine={false} tickMargin={10} axisLine={false} />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                            <Bar dataKey="total_amount" fill="var(--color-total_amount)" radius={8}>
                                <LabelList
                                    position="top"
                                    offset={10}
                                    className="fill-foreground"
                                    fontSize={12}
                                    formatter={(value) => formatCurrency(Number(value))}
                                />
                            </Bar>
                        </BarChart>
                    </ChartContainer>
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
