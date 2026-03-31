import { Head } from '@inertiajs/react';

interface Employee {
    id: number;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    suffix: string | null;
    position: string | null;
    office: { name: string } | null;
    employment_status: { name: string } | null;
}

interface SourceOfFundCode {
    id: number;
    code: string;
    description: string | null;
}

interface Props {
    employees: Employee[];
    sourceOfFundCode: SourceOfFundCode | null;
}

export default function Print({ employees, sourceOfFundCode }: Props) {
    const getFullName = (employee: Employee) => {
        const parts = [employee.first_name, employee.middle_name, employee.last_name, employee.suffix].filter(Boolean);
        return parts.join(' ');
    };

    return (
        <div className="p-8">
            <Head title="Employee List - Print" />

            <div className="mb-8 text-center">
                <h1 className="text-2xl font-bold">Employee List</h1>
                {sourceOfFundCode && (
                    <div className="mt-2">
                        <p className="text-lg font-semibold">Source of Fund: {sourceOfFundCode.code}</p>
                        {sourceOfFundCode.description && <p className="text-muted-foreground">{sourceOfFundCode.description}</p>}
                    </div>
                )}
            </div>

            <table className="w-full border-collapse">
                <thead>
                    <tr className="border-b-2 border-black">
                        <th className="py-2 text-left font-bold">#</th>
                        <th className="py-2 text-left font-bold">Employee Name</th>
                        <th className="py-2 text-left font-bold">Position</th>
                        <th className="py-2 text-left font-bold">Office</th>
                        <th className="py-2 text-left font-bold">Employment Status</th>
                    </tr>
                </thead>
                <tbody>
                    {employees.length > 0 ? (
                        employees.map((employee, index) => (
                            <tr key={employee.id} className="border-b border-gray-300">
                                <td className="py-2">{index + 1}</td>
                                <td className="py-2">{getFullName(employee)}</td>
                                <td className="py-2">{employee.position || '-'}</td>
                                <td className="py-2">{employee.office?.name || '-'}</td>
                                <td className="py-2">{employee.employment_status?.name || '-'}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5} className="text-muted-foreground py-4 text-center">
                                No employees found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div className="mt-8 flex justify-between">
                <div>
                    <p className="font-semibold">Total Employees: {employees.length}</p>
                </div>
                <div className="text-right">
                    <p className="text-muted-foreground text-sm">Printed on: {new Date().toLocaleString()}</p>
                </div>
            </div>

            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .p-8, .p-8 * {
                        visibility: visible;
                    }
                    .p-8 {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        padding: 20px;
                    }
                }
            `}</style>
        </div>
    );
}
