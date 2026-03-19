import type { EmploymentStatus } from "./employmentStatuses";
import type { Office } from "./office";

export interface Employee {
    id: number;
    first_name: string;
    middle_name: string;
    last_name: string;
    suffix: string;
    image_path?: string;
    photo?: File | null;
    position: string;
    office_id: number;
    employment_status_id: number;
    employment_status: EmploymentStatus;
    office: Office;
}

export type EmployeeCreateRequest = Omit<Employee, 'id', 'employment_status', 'office'> & {
    office_id: string;
    employment_status_id: string;
}
