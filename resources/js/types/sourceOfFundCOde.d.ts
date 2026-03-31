export interface SourceOfFundCode {
    id: number;
    code: string;
    description: string;
    status: boolean;
}

export interface SourceOfFundCodeCreate {
    code: string;
    description: string;
    status: boolean;
}
