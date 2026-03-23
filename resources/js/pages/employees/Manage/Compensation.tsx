import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { DeductionType } from '@/types/deductionType';
import type { Employee } from '@/types/employee';
import type { EmployeeDeduction } from '@/types/employeeDeduction';
import { CompensationDeductions } from './compensation/deductions';
import CompensationPera from './compensation/pera';
import CompensationRata from './compensation/rata';
import { CompensationSalary } from './compensation/salary';

interface EmployeeCompensationProps {
    employee: Employee;
    deductionTypes: DeductionType[];
    deductions?: Record<string, EmployeeDeduction[]>;
    periodsList?: string[];
    takenPeriods?: string[];
    deductionPagination?: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

function EmployeeCompensation({
    employee,
    deductionTypes,
    deductions = {},
    periodsList = [],
    takenPeriods = [],
    deductionPagination,
}: EmployeeCompensationProps) {
    return (
        <div>
            <Tabs defaultValue="deductions" orientation="vertical">
                <TabsList className="flex w-[150px] flex-col gap-3 bg-transparent">
                    <TabsTrigger value="salary">Salary</TabsTrigger>
                    <TabsTrigger value="pera">PERA</TabsTrigger>
                    <TabsTrigger value="rata">RATA</TabsTrigger>
                    <TabsTrigger value="deductions">Deductions</TabsTrigger>
                </TabsList>

                <TabsContent value="salary">
                    <CompensationSalary employee={employee} />
                </TabsContent>

                <TabsContent value="pera">
                    <CompensationPera employee={employee} />
                </TabsContent>

                <TabsContent value="rata">
                    <CompensationRata employee={employee} />
                </TabsContent>

                <TabsContent value="deductions">
                    <CompensationDeductions
                        employee={employee}
                        deductionTypes={deductionTypes}
                        deductions={deductions}
                        periodsList={periodsList}
                        takenPeriods={takenPeriods}
                        pagination={deductionPagination}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default EmployeeCompensation;
