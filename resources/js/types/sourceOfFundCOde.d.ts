export interface SourceOfFundCode {
    id: number;
    code: string;
    description: string;
    status: boolean;
}

export interface SourceOfFundCodeCreate {
    [key: string]: any;
    code: string;
    description: string;
    status: boolean;
}
