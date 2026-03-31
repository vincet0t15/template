'use client';

import { TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from 'recharts';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

export const description = 'A bar chart with a label';

const chartConfig = {
    desktop: {
        label: 'Salary',
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
    return (
        <Card>
            <CardContent>
                <ChartContainer config={chartConfig}>
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
                        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={8}>
                            <LabelList position="top" offset={12} className="fill-foreground" fontSize={12} />
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 leading-none font-medium">
                    Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-muted-foreground leading-none">Showing total visitors for the last 6 months</div>
            </CardFooter>
        </Card>
    );
}
