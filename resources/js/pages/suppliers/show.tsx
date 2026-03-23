import PaginationData from '@/components/paginationData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { PaginatedDataResponse } from '@/types/pagination';
import { Supplier, SupplierTransaction } from '@/types/supplier';
import { Head, Link, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { ArrowLeft, Edit, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

type PaginatedTransactions = PaginatedDataResponse<SupplierTransaction>;

interface Props {
    supplier: Supplier;
    transactions: PaginatedTransactions;
}

type TransactionForm = {
    pr_date: string;
    pr_no: string;
    po_date: string;
    po_no: string;
    sale_invoice_date: string;
    sale_invoice_no: string;
    or_date: string;
    or_no: string;
    dr_date: string;
    dr_no: string;
    qty_period_covered: string;
    particulars: string;
    gross: string;
    ewt: string;
    vat: string;
    net_amount: string;
    date_processed: string;
    remarks: string;
};

const emptyForm: TransactionForm = {
    pr_date: '',
    pr_no: '',
    po_date: '',
    po_no: '',
    sale_invoice_date: '',
    sale_invoice_no: '',
    or_date: '',
    or_no: '',
    dr_date: '',
    dr_no: '',
    qty_period_covered: '',
    particulars: '',
    gross: '',
    ewt: '',
    vat: '',
    net_amount: '',
    date_processed: '',
    remarks: '',
};

const formatDate = (d: string | null) => (d ? format(new Date(d), 'MM/dd/yyyy') : '-');
const formatCurrency = (v: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(v);

export default function SupplierShow({ supplier, transactions }: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<SupplierTransaction | null>(null);
    const [deletingTransaction, setDeletingTransaction] = useState<SupplierTransaction | null>(null);

    const createForm = useForm<TransactionForm>(emptyForm);
    const editForm = useForm<TransactionForm>(emptyForm);
    const deleteForm = useForm({});

    useEffect(() => {
        if (!isCreateOpen) createForm.reset();
    }, [isCreateOpen]);

    useEffect(() => {
        if (editingTransaction) {
            editForm.setData({
                pr_date: editingTransaction.pr_date,
                pr_no: editingTransaction.pr_no,
                po_date: editingTransaction.po_date || '',
                po_no: editingTransaction.po_no || '',
                sale_invoice_date: editingTransaction.sale_invoice_date || '',
                sale_invoice_no: editingTransaction.sale_invoice_no || '',
                or_date: editingTransaction.or_date || '',
                or_no: editingTransaction.or_no || '',
                dr_date: editingTransaction.dr_date || '',
                dr_no: editingTransaction.dr_no || '',
                qty_period_covered: editingTransaction.qty_period_covered || '',
                particulars: editingTransaction.particulars,
                gross: String(editingTransaction.gross),
                ewt: String(editingTransaction.ewt),
                vat: String(editingTransaction.vat),
                net_amount: String(editingTransaction.net_amount),
                date_processed: editingTransaction.date_processed || '',
                remarks: editingTransaction.remarks || '',
            });
        }
    }, [editingTransaction]);

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('suppliers.transactions.store', supplier.id), {
            onSuccess: () => setIsCreateOpen(false),
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingTransaction) {
            editForm.put(route('suppliers.transactions.update', [supplier.id, editingTransaction.id]), {
                onSuccess: () => setEditingTransaction(null),
            });
        }
    };

    const handleDelete = () => {
        if (deletingTransaction) {
            deleteForm.delete(route('suppliers.transactions.destroy', [supplier.id, deletingTransaction.id]), {
                onSuccess: () => setDeletingTransaction(null),
            });
        }
    };

    const breadcrumbs = [
        { title: 'Suppliers', href: '/suppliers' },
        { title: supplier.name, href: route('suppliers.transactions.show', supplier.id) },
    ];

    const TransactionFields = ({ prefix, form }: { prefix: string; form: ReturnType<typeof useForm<TransactionForm>> }) => (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor={`${prefix}_pr_date`}>PR Date *</Label>
                    <Input
                        id={`${prefix}_pr_date`}
                        type="date"
                        value={form.data.pr_date}
                        onChange={(e) => form.setData('pr_date', e.target.value)}
                        required
                    />
                    {form.errors.pr_date && <p className="text-xs text-red-500">{form.errors.pr_date}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`${prefix}_pr_no`}>PR No. *</Label>
                    <Input
                        id={`${prefix}_pr_no`}
                        value={form.data.pr_no}
                        onChange={(e) => form.setData('pr_no', e.target.value)}
                        placeholder="PR Number"
                        required
                    />
                    {form.errors.pr_no && <p className="text-xs text-red-500">{form.errors.pr_no}</p>}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor={`${prefix}_po_date`}>PO Date</Label>
                    <Input id={`${prefix}_po_date`} type="date" value={form.data.po_date} onChange={(e) => form.setData('po_date', e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`${prefix}_po_no`}>PO No.</Label>
                    <Input
                        id={`${prefix}_po_no`}
                        value={form.data.po_no}
                        onChange={(e) => form.setData('po_no', e.target.value)}
                        placeholder="PO Number"
                    />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor={`${prefix}_si_date`}>Sale Invoice Date</Label>
                    <Input
                        id={`${prefix}_si_date`}
                        type="date"
                        value={form.data.sale_invoice_date}
                        onChange={(e) => form.setData('sale_invoice_date', e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`${prefix}_si_no`}>Sale Invoice No.</Label>
                    <Input
                        id={`${prefix}_si_no`}
                        value={form.data.sale_invoice_no}
                        onChange={(e) => form.setData('sale_invoice_no', e.target.value)}
                        placeholder="Invoice Number"
                    />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor={`${prefix}_or_date`}>OR Date</Label>
                    <Input id={`${prefix}_or_date`} type="date" value={form.data.or_date} onChange={(e) => form.setData('or_date', e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`${prefix}_or_no`}>OR No.</Label>
                    <Input
                        id={`${prefix}_or_no`}
                        value={form.data.or_no}
                        onChange={(e) => form.setData('or_no', e.target.value)}
                        placeholder="OR Number"
                    />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor={`${prefix}_dr_date`}>D.R. Date</Label>
                    <Input id={`${prefix}_dr_date`} type="date" value={form.data.dr_date} onChange={(e) => form.setData('dr_date', e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`${prefix}_dr_no`}>D.R. No.</Label>
                    <Input
                        id={`${prefix}_dr_no`}
                        value={form.data.dr_no}
                        onChange={(e) => form.setData('dr_no', e.target.value)}
                        placeholder="DR Number"
                    />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor={`${prefix}_qty`}>QTY / Period Covered</Label>
                <Input
                    id={`${prefix}_qty`}
                    value={form.data.qty_period_covered}
                    onChange={(e) => form.setData('qty_period_covered', e.target.value)}
                    placeholder="Quantity or period"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor={`${prefix}_particulars`}>Particulars *</Label>
                <Textarea
                    id={`${prefix}_particulars`}
                    value={form.data.particulars}
                    onChange={(e) => form.setData('particulars', e.target.value)}
                    rows={2}
                    required
                />
                {form.errors.particulars && <p className="text-xs text-red-500">{form.errors.particulars}</p>}
            </div>
            <div className="grid grid-cols-4 gap-3">
                <div className="space-y-2">
                    <Label htmlFor={`${prefix}_gross`}>Gross *</Label>
                    <Input
                        id={`${prefix}_gross`}
                        type="number"
                        step="0.01"
                        value={form.data.gross}
                        onChange={(e) => form.setData('gross', e.target.value)}
                        placeholder="0.00"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`${prefix}_ewt`}>EWT</Label>
                    <Input
                        id={`${prefix}_ewt`}
                        type="number"
                        step="0.01"
                        value={form.data.ewt}
                        onChange={(e) => form.setData('ewt', e.target.value)}
                        placeholder="0.00"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`${prefix}_vat`}>VAT</Label>
                    <Input
                        id={`${prefix}_vat`}
                        type="number"
                        step="0.01"
                        value={form.data.vat}
                        onChange={(e) => form.setData('vat', e.target.value)}
                        placeholder="0.00"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`${prefix}_net`}>Net Amount *</Label>
                    <Input
                        id={`${prefix}_net`}
                        type="number"
                        step="0.01"
                        value={form.data.net_amount}
                        onChange={(e) => form.setData('net_amount', e.target.value)}
                        placeholder="0.00"
                        required
                    />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor={`${prefix}_date_processed`}>Date Processed</Label>
                    <Input
                        id={`${prefix}_date_processed`}
                        type="date"
                        value={form.data.date_processed}
                        onChange={(e) => form.setData('date_processed', e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`${prefix}_remarks`}>Remarks</Label>
                    <Input
                        id={`${prefix}_remarks`}
                        value={form.data.remarks}
                        onChange={(e) => form.setData('remarks', e.target.value)}
                        placeholder="Notes"
                    />
                </div>
            </div>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${supplier.name} — Transactions`} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                {/* Supplier Info Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                        <Link href={route('suppliers.index')}>
                            <Button variant="outline" size="icon" className="h-8 w-8 shrink-0">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-semibold">{supplier.name}</h1>
                                <Badge variant={supplier.is_active ? 'secondary' : 'destructive'} className="rounded-sm text-xs">
                                    {supplier.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                            {supplier.address && <p className="text-muted-foreground mt-0.5 flex items-center gap-1 text-sm">{supplier.address}</p>}
                            {supplier.contact_number && (
                                <p className="text-muted-foreground flex items-center gap-1 text-sm">{supplier.contact_number}</p>
                            )}
                        </div>
                    </div>
                    <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Transaction
                    </Button>
                </div>

                {/* Transactions Table */}
                <div className="w-full overflow-hidden rounded-sm border shadow-sm">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="whitespace-nowrap">PR Date / PR #</TableHead>
                                    <TableHead className="whitespace-nowrap">PO Date / PO #</TableHead>
                                    <TableHead className="whitespace-nowrap">Sale Inv. / #</TableHead>
                                    <TableHead className="whitespace-nowrap">OR Date / OR #</TableHead>
                                    <TableHead className="whitespace-nowrap">D.R. Date / D.R. #</TableHead>
                                    <TableHead className="whitespace-nowrap">QTY/Period</TableHead>
                                    <TableHead>Particulars</TableHead>
                                    <TableHead className="text-right">Gross</TableHead>
                                    <TableHead className="text-right">EWT</TableHead>
                                    <TableHead className="text-right">VAT</TableHead>
                                    <TableHead className="text-right">Net Amount</TableHead>
                                    <TableHead className="whitespace-nowrap">Date Proc. / Remarks</TableHead>
                                    <TableHead className="w-20">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={13} className="text-muted-foreground py-8 text-center">
                                            No transactions yet. Click "Add Transaction" to create one.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    transactions.data.map((txn) => (
                                        <TableRow key={txn.id}>
                                            <TableCell className="whitespace-nowrap">
                                                <div className="font-medium">{formatDate(txn.pr_date)}</div>
                                                <div className="text-muted-foreground text-xs">{txn.pr_no}</div>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                <div>{formatDate(txn.po_date)}</div>
                                                <div className="text-muted-foreground text-xs">{txn.po_no || '-'}</div>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                <div>{formatDate(txn.sale_invoice_date)}</div>
                                                <div className="text-muted-foreground text-xs">{txn.sale_invoice_no || '-'}</div>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                <div>{formatDate(txn.or_date)}</div>
                                                <div className="text-muted-foreground text-xs">{txn.or_no || '-'}</div>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                <div>{formatDate(txn.dr_date)}</div>
                                                <div className="text-muted-foreground text-xs">{txn.dr_no || '-'}</div>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">{txn.qty_period_covered || '-'}</TableCell>
                                            <TableCell className="max-w-[200px] truncate">{txn.particulars}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(txn.gross)}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(txn.ewt)}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(txn.vat)}</TableCell>
                                            <TableCell className="text-right font-medium">{formatCurrency(txn.net_amount)}</TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                <div>{formatDate(txn.date_processed)}</div>
                                                <div className="text-muted-foreground text-xs">{txn.remarks || '-'}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => setEditingTransaction(txn)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-red-500 hover:text-red-600"
                                                        onClick={() => setDeletingTransaction(txn)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Pagination */}

                <div className="mt-4">
                    <PaginationData data={transactions} />
                </div>
            </div>

            {/* Create Transaction Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-h-[90vh] min-w-3xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add Transaction</DialogTitle>
                        <DialogDescription>Add a new transaction record for {supplier.name}.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreate}>
                        <TransactionFields prefix="create" form={createForm} />
                        <div className="mt-4 flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createForm.processing}>
                                Save Transaction
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Transaction Dialog */}
            <Dialog open={!!editingTransaction} onOpenChange={() => setEditingTransaction(null)}>
                <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Transaction</DialogTitle>
                        <DialogDescription>Update the transaction record.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdate}>
                        <TransactionFields prefix="edit" form={editForm} />
                        <DialogFooter className="mt-4">
                            <Button type="button" variant="outline" onClick={() => setEditingTransaction(null)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={editForm.processing}>
                                Update Transaction
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deletingTransaction} onOpenChange={() => setDeletingTransaction(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Transaction</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the transaction <strong>PR #{deletingTransaction?.pr_no}</strong>? This action cannot be
                            undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setDeletingTransaction(null)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={deleteForm.processing}>
                            Delete
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
