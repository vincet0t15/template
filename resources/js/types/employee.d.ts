export interface Employee {
    id: number;
    first_name: string;
    middle_name: string;
    last_name: string;
    suffix: string;
    contact_number: string;
    image_path?: string;
    photo?: File | null;
}

export type EmployeeCreateRequest = Omit<Employee, 'id'>
