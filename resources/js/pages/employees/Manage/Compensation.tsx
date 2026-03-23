import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { DeductionType } from '@/types/deductionType';
import type { Employee } from '@/types/employee';
import CompensationRata from './compensation/rata';
import { CompensationSalary } from './compensation/salary';

interface EmployeeCompensationProps {
    employee: Employee;
    deductionTypes: DeductionType[];
}

function EmployeeCompensation({ employee, deductionTypes }: EmployeeCompensationProps) {
    return (
        <div>
            <Tabs defaultValue="salary" orientation="vertical">
                <TabsList className="flex w-[150px] flex-col gap-3 bg-transparent">
                    <TabsTrigger value="salary">Salary</TabsTrigger>
                    <TabsTrigger value="pera">PERA</TabsTrigger>
                    <TabsTrigger value="rata">RATA</TabsTrigger>
                </TabsList>

                <TabsContent value="salary">
                    <CompensationSalary employee={employee} deductionTypes={deductionTypes} />
                </TabsContent>
                <TabsContent value="pera"></TabsContent>

                <TabsContent value="rata">
                    <CompensationRata />
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default EmployeeCompensation;
