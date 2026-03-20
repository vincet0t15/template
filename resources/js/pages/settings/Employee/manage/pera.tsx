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

export function PeraTable() {
    return (
        <div>
            <div className="mb-2">
                <Button>
                    <PlusCircle className=" h-4 w-4" />
                    Add Salary
                </Button>
            </div>
            <div className="w-full overflow-hidden rounded-sm border shadow-sm">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead >Salary</TableHead>
                            <TableHead>Effective Date</TableHead>
                            <TableHead>End Date</TableHead>
                            <TableHead className="text-right">Remarks</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {salaries.map((salary) => (
                            <TableRow key={salary.salary}>
                                <TableCell className="font-medium">{salary.salary}</TableCell>
                                <TableCell className="font-medium">{salary.salary || "N/A"}</TableCell>
                                <TableCell>{salary.effectiveDate || "N/A"}</TableCell>
                                <TableCell className="text-right">{salary.endDate || "N/A"}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
