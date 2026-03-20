import { Badge } from "@/components/ui/badge";
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

export function SalaryTable() {
    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Compensation History</h3>
                <Button size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Salary
                </Button>
            </div>

            <div className="overflow-hidden rounded-md border border-slate-200 shadow-sm">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow>
                            <TableHead className="w-[150px]">Salary</TableHead>
                            <TableHead>Effective Date</TableHead>
                            <TableHead>End Date</TableHead>
                            <TableHead className="text-right">Remarks</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {salaries.map((s, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-bold text-slate-900">
                                    ₱{Number(s.salary).toLocaleString()}
                                </TableCell>
                                <TableCell>{s.effectiveDate}</TableCell>
                                <TableCell>{s.endDate || <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">Present</Badge>}</TableCell>
                                <TableCell className="text-right text-slate-500 italic text-xs">{s.remarks}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
