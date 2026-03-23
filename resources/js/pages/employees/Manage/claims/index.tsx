import Pagination from '@/components/paginationData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Claim, ClaimFilters } from '@/types/claim';
import type { ClaimType } from '@/types/claimType';
import type { Employee } from '@/types/employee';
import { PaginatedDataResponse } from '@/types/pagination';
import { router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { CreateClaimDialog } from './create';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface ClaimsProps {
    employee: Employee;
    claims?: PaginatedDataResponse<Claim>;
    claimTypes: ClaimType[];
    availableYears: number[];
    filters: ClaimFilters;
}

interface DialogState {
    open: boolean;
    claim: Claim | null;
}

export function EmployeeClaims({ employee, claims, claimTypes, availableYears, filters }: ClaimsProps) {
    const [dialogState, setDialogState] = useState<DialogState>({ open: false, claim: null });
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const claimsData = claims || {
        data: [],
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 20,
        from: 0,
        to: 0,
        path: '',
        links: [],
    };

    const { data, setData, post, put, reset, errors } = useForm({
        claim_type_id: '',
        claim_date: '',
        amount: '',
        purpose: '',
        remarks: '',
    });

    const applyFilter = (newFilters: Partial<ClaimFilters>) => {
        router.get(route('manage.employees.claims.index', employee.id), { ...filters, ...newFilters }, { preserveState: true, preserveScroll: true });
    };

    const clearFilters = () => {
        router.get(route('manage.employees.claims.index', employee.id), {}, { preserveState: true, preserveScroll: true });
    };

    // const openCreateDialog = () => {
    //     reset();
    //     setData('claim_date', new Date().toISOString().split('T')[0]);
    //     setDialogState({ open: true, claim: null });
    // };

    const openEditDialog = (claim: Claim) => {
        setData({
            claim_type_id: String(claim.claim_type_id),
            claim_date: claim.claim_date,
            amount: String(claim.amount),
            purpose: claim.purpose,
            remarks: claim.remarks || '',
        });
        setDialogState({ open: true, claim });
    };

    const closeDialog = () => {
        setDialogState({ open: false, claim: null });
        reset();
    };

    const handleSubmit = () => {
        if (dialogState.claim) {
            put(route('manage.employees.claims.update', [employee.id, dialogState.claim.id]), {
                onSuccess: closeDialog,
            });
        } else {
            post(route('manage.employees.claims.store', employee.id), {
                onSuccess: closeDialog,
            });
        }
    };

    const handleDelete = (claim: Claim) => {
        if (confirm('Are you sure you want to delete this claim?')) {
            router.delete(route('manage.employees.claims.destroy', [employee.id, claim.id]));
        }
    };

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(amount);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const hasActiveFilters = filters.claim_month || filters.claim_year || filters.claim_type_id;

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <Select
                    value={filters.claim_month || 'all'}
                    onValueChange={(value) => applyFilter({ claim_month: value === 'all' ? undefined : value })}
                >
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Months</SelectItem>
                        {MONTHS.map((month, index) => (
                            <SelectItem key={month} value={String(index + 1)}>
                                {month}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={filters.claim_year || 'all'}
                    onValueChange={(value) => applyFilter({ claim_year: value === 'all' ? undefined : value })}
                >
                    <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Years</SelectItem>
                        {availableYears.map((year) => (
                            <SelectItem key={year} value={String(year)}>
                                {year}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={filters.claim_type_id || 'all'}
                    onValueChange={(value) => applyFilter({ claim_type_id: value === 'all' ? undefined : value })}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Claim Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {claimTypes.map((type) => (
                            <SelectItem key={type.id} value={String(type.id)}>
                                {type.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                        <X className="mr-1 h-4 w-4" />
                        Clear
                    </Button>
                )}

                <div className="flex-1"></div>

                <Button onClick={() => setOpenCreateDialog(true)}>
                    <Plus className="h-4 w-4" />
                    Add Claim
                </Button>
            </div>

            {/* Claims Table */}
            {claimsData.data.length === 0 ? (
                <div className="text-muted-foreground rounded-sm border py-12 text-center text-sm">No claims recorded yet.</div>
            ) : (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Purpose</TableHead>
                                <TableHead>Remarks</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {claimsData.data.map((claim) => (
                                <TableRow key={claim.id}>
                                    <TableCell>{formatDate(claim.claim_date)}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{claim.claim_type?.name || '—'}</Badge>
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate">{claim.purpose}</TableCell>
                                    <TableCell className="text-muted-foreground max-w-[150px] truncate">{claim.remarks || '—'}</TableCell>
                                    <TableCell className="text-right font-medium text-green-600">{formatCurrency(Number(claim.amount))}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(claim)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(claim)}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Pagination */}
            <Pagination data={claimsData} />

            {openCreateDialog && (
                <CreateClaimDialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} employee={employee} claimTypes={claimTypes} />
            )}
        </div>
    );
}
