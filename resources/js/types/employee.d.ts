export interface Employee {
    id: number;
    first_name: string;
    middle_name: string;
    last_name: string;
    suffix: string;
    salary: string;
    rata: string;
    pera: string;
    image_path?: string;
    photo?: File | null;
    position: string;
}

export type EmployeeCreateRequest = Omit<Employee, 'id'> & {
    office_id: string;
    employment_status_id: string;
}
