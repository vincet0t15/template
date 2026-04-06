'use client';

import { TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

export interface OfficeClaimsData {
    office_name: string;
    office_code: string;
    overtime_count: number;
    claims_count: number;
}

export interface ChartOfficeClaimsProps {
    data: OfficeClaimsData[];
    title?: string;
    description?: string;
}

const chartConfig = {
    claims: {
        label: 'Claims',
        color: 'hsl(217.2 91.2% 60%)',
    },
    overtime: {
        label: 'Overtime',
        color: 'hsl(142.1 76.2% 36.3%)',
    },
} satisfies ChartConfig;

export function ChartOfficeClaims({ data, title = 'Claims & Overtime by Office', description }: ChartOfficeClaimsProps) {
    const chartData = data.map((item) => ({
        office: item.office_code || item.office_name,
        claims: item.claims_count,
        overtime: item.overtime_count,
        fullName: item.office_name,
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
                                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
                                <Bar dataKey="claims" fill="var(--color-claims)" radius={4} />
                                <Bar dataKey="overtime" fill="var(--color-overtime)" radius={4} />
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
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-[hsl(217.2_91.2%_60%)]" />
                            <span className="text-sm">Claims</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-[hsl(142.1_76.2%_36.3%)]" />
                            <span className="text-sm">Overtime</span>
                        </div>
                    </div>
                </CardFooter>
            )}
        </Card>
    );
}
