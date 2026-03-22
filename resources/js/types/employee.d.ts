import type { EmploymentStatus } from "./employmentStatuses";
import type { Office } from "./office";
import type { Salary } from "./salary";
import type { Pera } from "./pera";
import type { Rata } from "./rata";
import type { EmployeeDeduction } from "./employeeDeduction";

export interface Employee {
    id: number;
    first_name: string;
    middle_name: string;
    last_name: string;
    suffix: string;
    image_path?: string;
    photo?: File | null;
    position: string;
    is_rata_eligible: boolean;
    office_id: number;
    employment_status_id: number;
    employment_status: EmploymentStatus;
    office: Office;
    salaries?: Salary[];
    peras?: Pera[];
    ratas?: Rata[];
    deductions?: EmployeeDeduction[];
    latest_salary?: Salary;
    latest_pera?: Pera;
    latest_rata?: Rata;
}

export type EmployeeCreateRequest = Omit<Employee, 'id', 'employment_status', 'office'> & {
    office_id: string;
    employment_status_id: string;
}
