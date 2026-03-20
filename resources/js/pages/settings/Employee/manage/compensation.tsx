import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { PlusCircle } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge";
import { SalaryTable } from "./salary";
const salaries = [
    {
        salary: "20000",
        effectiveDate: "2022-01-01",
        endDate: "2022-12-31",
        remarks: "Initial appointment - Probationary period",
    },
    {
        salary: "22500",
        effectiveDate: "2023-01-01",
        endDate: "2023-12-31",
        remarks: "Regularization increment and performance bonus",
    },
    {
        salary: "25000",
        effectiveDate: "2024-01-01",
        endDate: "2024-06-30",
        remarks: "Annual cost of living adjustment (COLA)",
    },
    {
        salary: "28500",
        effectiveDate: "2024-07-01",
        endDate: "2025-12-31",
        remarks: "Promotion to Senior Associate - Grade 4",
    },
    {
        salary: "31000",
        effectiveDate: "2026-01-01",
        endDate: null, // Current active salary
        remarks: "Market rate adjustment and loyalty increment",
    },
];

export function Compensation() {
    return (
        <div >
            <Tabs defaultValue="salary" orientation="vertical" className="flex flex-col md:flex-row gap-6">

                {/* Left Side: Sidebar Tabs */}
                <TabsList className="flex flex-col h-auto w-full md:w-48 bg-transparent p-0 gap-1 items-stretch">
                    <TabsTrigger
                        value="salary"
                    >
                        Salary
                    </TabsTrigger>
                    <TabsTrigger
                        value="password"

                    >
                        R.A.T.A
                    </TabsTrigger>
                    <TabsTrigger
                        value="notifications"
                    >
                        P.E.R.A
                    </TabsTrigger>
                </TabsList>

                {/* Right Side: Content Area */}
                <div className="flex-1">
                    <TabsContent value="salary" className="mt-0">
                        <SalaryTable />
                    </TabsContent>

                    <TabsContent value="password">
                        {/* Password Content Here */}
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    )
}
