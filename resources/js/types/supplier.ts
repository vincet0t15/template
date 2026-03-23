export interface Supplier {
    id: number;
    name: string;
    address: string | null;
    contact_number: string | null;
    email: string | null;
    remarks: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}
