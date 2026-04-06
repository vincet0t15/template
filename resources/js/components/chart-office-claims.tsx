'use client';

import { TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

export interface OfficeClaimsData {
    office_name: string;
    office_code: string;
    travel_count: number;
    travel_total: number;
    travel_breakdown: {
        meals: number;
        transportation: number;
        reimbursement: number;
        others: number;
    };
    overtime_count: number;
    overtime_total: number;
}

export interface ChartOfficeClaimsProps {
    data: OfficeClaimsData[];
    title?: string;
    description?: string;
}

const chartConfig = {
    meals: {
        label: 'Meals',
        color: 'hsl(38 92% 50%)', // Amber
    },
    transportation: {
        label: 'Transportation',
        color: 'hsl(217.2 91.2% 60%)', // Blue
    },
    reimbursement: {
        label: 'Reimbursement',
        color: 'hsl(142.1 76.2% 36.3%)', // Green
    },
    others: {
        label: 'Others',
        color: 'hsl(280 70% 50%)', // Purple
    },
} satisfies ChartConfig;

export function ChartOfficeClaims({ data, title = 'Travel Claims by Office', description }: ChartOfficeClaimsProps) {
    const chartData = data.map((item) => ({
        office: item.office_code || item.office_name,
        fullName: item.office_name,
        meals: item.travel_breakdown.meals,
        transportation: item.travel_breakdown.transportation,
        reimbursement: item.travel_breakdown.reimbursement,
        others: item.travel_breakdown.others,
        total: item.travel_total,
    }));

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    {title}
                </CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                {chartData.length > 0 ? (
                    <div className="w-full overflow-x-auto">
                        <ChartContainer config={chartConfig} className="min-h-[350px] w-full min-w-[500px]">
                            <BarChart accessibilityLayer data={chartData}>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="office"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                    tickFormatter={(value) => value.slice(0, 3)}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={
                                        <ChartTooltipContent
                                            indicator="dashed"
                                            formatter={(value, name, item) => {
                                                if (typeof value === 'number') {
                                                    return new Intl.NumberFormat('en-PH', {
                                                        style: 'currency',
                                                        currency: 'PHP',
                                                        minimumFractionDigits: 0,
                                                    }).format(value);
                                                }
                                                return value;
                                            }}
                                        />
                                    }
                                />
                                <Bar dataKey="meals" fill="var(--color-meals)" radius={4} stackId="a" />
                                <Bar dataKey="transportation" fill="var(--color-transportation)" radius={4} stackId="a" />
                                <Bar dataKey="reimbursement" fill="var(--color-reimbursement)" radius={4} stackId="a" />
                                <Bar dataKey="others" fill="var(--color-others)" radius={4} stackId="a" />
                            </BarChart>
                        </ChartContainer>
                    </div>
                ) : (
                    <div className="flex min-h-[350px] items-center justify-center">
                        <div className="text-center">
                            <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                                <TrendingUp className="h-6 w-6 text-slate-400" />
                            </div>
                            <p className="text-muted-foreground">No claims data available</p>
                        </div>
                    </div>
                )}
            </CardContent>
            {chartData.length > 0 && (
                <CardFooter className="flex-col items-start gap-2 text-sm">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-[hsl(38_92%_50%)]" />
                            <span className="text-xs">Meals</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-[hsl(217.2_91.2%_60%)]" />
                            <span className="text-xs">Transportation</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-[hsl(142.1_76.2%_36.3%)]" />
                            <span className="text-xs">Reimbursement</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-[hsl(280_70%_50%)]" />
                            <span className="text-xs">Others</span>
                        </div>
                    </div>
                    <div className="text-muted-foreground mt-2 text-xs">Showing stacked travel claim amounts by category</div>
                </CardFooter>
            )}
        </Card>
    );
}
