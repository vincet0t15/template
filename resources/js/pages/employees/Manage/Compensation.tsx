import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { DeductionType } from '@/types/deductionType';
import type { Employee } from '@/types/employee';
import { CompensationDeductions } from './compensation/deductions';
import CompensationPera from './compensation/pera';
import CompensationRata from './compensation/rata';
import { CompensationSalary } from './compensation/salary';

interface EmployeeCompensationProps {
    employee: Employee;
    deductionTypes: DeductionType[];
}

function EmployeeCompensation({ employee, deductionTypes }: EmployeeCompensationProps) {
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
                    <CompensationDeductions employee={employee} deductionTypes={deductionTypes} />
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default EmployeeCompensation;
