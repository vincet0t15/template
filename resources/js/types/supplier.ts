export interface Supplier {
    id: number;
    pr_date: string;
    pr_no: string;
    po_date: string | null;
    po_no: string | null;
    sale_invoice_date: string | null;
    sale_invoice_no: string | null;
    or_date: string | null;
    or_no: string | null;
    dr_date: string | null;
    dr_no: string | null;
    qty_period_covered: string | null;
    particulars: string;
    gross: number;
    ewt: number;
    vat: number;
    net_amount: number;
    date_processed: string | null;
    remarks: string | null;
    created_at: string;
    updated_at: string;
}
