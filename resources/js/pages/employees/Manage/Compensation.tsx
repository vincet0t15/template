import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CompensationRata from './compensation/rata';
import { CompensationSalary } from './compensation/salary';

function EmployeeCompensation() {
    return (
        <div>
            <Tabs defaultValue="salary" orientation="vertical">
                <TabsList className="flex w-[150px] flex-col gap-3 bg-transparent">
                    <TabsTrigger value="salary">Salary</TabsTrigger>
                    <TabsTrigger value="pera">PERA</TabsTrigger>
                    <TabsTrigger value="rata">RATA</TabsTrigger>
                </TabsList>

                <TabsContent value="salary">
                    <CompensationSalary />
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
