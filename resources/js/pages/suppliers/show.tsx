import PaginationData from '@/components/paginationData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { PaginatedDataResponse } from '@/types/pagination';
import { Supplier, SupplierTransaction } from '@/types/supplier';
import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { ArrowLeft, Edit, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { CreateTransactionDialog } from './create-transaction-dialog';
import { DeleteTransactionDialog } from './delete-transaction-dialog';
import { EditTransactionDialog } from './edit-transaction-dialog';

type PaginatedTransactions = PaginatedDataResponse<SupplierTransaction>;

interface Props {
    supplier: Supplier;
    transactions: PaginatedTransactions;
}

const formatDate = (d: string | null) => (d ? format(new Date(d), 'MM/dd/yyyy') : '-');
const formatCurrency = (v: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(v);

export default function SupplierShow({ supplier, transactions }: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<SupplierTransaction | null>(null);
    const [deletingTransaction, setDeletingTransaction] = useState<SupplierTransaction | null>(null);

    const breadcrumbs = [
        { title: 'Suppliers', href: '/suppliers' },
        { title: supplier.name, href: route('suppliers.transactions.show', supplier.id) },
    ];

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
                            {supplier.address && <p className="text-muted-foreground mt-0.5 text-sm">{supplier.address}</p>}
                            {supplier.contact_number && <p className="text-muted-foreground text-sm">{supplier.contact_number}</p>}
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

            <CreateTransactionDialog
                open={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                supplierId={supplier.id}
                supplierName={supplier.name}
            />
            <EditTransactionDialog transaction={editingTransaction} onClose={() => setEditingTransaction(null)} supplierId={supplier.id} />
            <DeleteTransactionDialog transaction={deletingTransaction} onClose={() => setDeletingTransaction(null)} supplierId={supplier.id} />
        </AppLayout>
    );
}
