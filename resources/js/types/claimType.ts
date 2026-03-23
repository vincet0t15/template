export interface ClaimType {
    id: number;
    name: string;
    code: string;
    description: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}
