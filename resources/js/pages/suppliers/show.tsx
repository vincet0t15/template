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
                    <Button onClick={() => setIsCreateOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Transaction
                    </Button>
                </div>

                {/* Transactions Table */}
                <div className="w-full overflow-hidden rounded-md border shadow-sm">
                    <div className="overflow-x-auto">
                        <Table className="text-sm">
                            <TableHeader>
                                <TableRow className="bg-muted hover:bg-muted">
                                    <TableHead className="min-w-[110px] px-3 py-2 text-xs font-semibold tracking-wide whitespace-nowrap uppercase">
                                        PR Date / PR #
                                    </TableHead>
                                    <TableHead className="min-w-[110px] px-3 py-2 text-xs font-semibold tracking-wide whitespace-nowrap uppercase">
                                        PO Date / PO #
                                    </TableHead>
                                    <TableHead className="min-w-[120px] px-3 py-2 text-xs font-semibold tracking-wide whitespace-nowrap uppercase">
                                        Sale Inv. / #
                                    </TableHead>
                                    <TableHead className="min-w-[110px] px-3 py-2 text-xs font-semibold tracking-wide whitespace-nowrap uppercase">
                                        OR Date / OR #
                                    </TableHead>
                                    <TableHead className="min-w-[110px] px-3 py-2 text-xs font-semibold tracking-wide whitespace-nowrap uppercase">
                                        D.R. Date / D.R. #
                                    </TableHead>
                                    <TableHead className="min-w-[90px] px-3 py-2 text-xs font-semibold tracking-wide uppercase">
                                        QTY / Period
                                    </TableHead>
                                    <TableHead className="min-w-[150px] px-3 py-2 text-xs font-semibold tracking-wide uppercase">
                                        Particulars
                                    </TableHead>
                                    <TableHead className="min-w-[100px] px-3 py-2 text-right text-xs font-semibold tracking-wide uppercase">
                                        Gross
                                    </TableHead>
                                    <TableHead className="min-w-[95px] px-3 py-2 text-right text-xs font-semibold tracking-wide uppercase">
                                        EWT
                                    </TableHead>
                                    <TableHead className="min-w-[95px] px-3 py-2 text-right text-xs font-semibold tracking-wide uppercase">
                                        VAT
                                    </TableHead>
                                    <TableHead className="min-w-[110px] px-3 py-2 text-right text-xs font-semibold tracking-wide uppercase">
                                        Net Amount
                                    </TableHead>

                                    <TableHead className="min-w-[120px] px-3 py-2 text-xs font-semibold tracking-wide whitespace-nowrap uppercase">
                                        Date Procure
                                    </TableHead>
                                    <TableHead className="text-right text-xs font-semibold tracking-wide uppercase">Remarks</TableHead>
                                    <TableHead className="text-xs font-semibold tracking-wide uppercase">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={13} className="text-muted-foreground py-10 text-center">
                                            No transactions yet. Click "Add Transaction" to create one.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    transactions.data.map((txn) => (
                                        <TableRow key={txn.id} className="hover:bg-muted/30">
                                            <TableCell className="px-3 py-2 whitespace-nowrap">
                                                <div className="font-medium">{formatDate(txn.pr_date)}</div>
                                                <div className="text-muted-foreground text-xs">{txn.pr_no}</div>
                                            </TableCell>
                                            <TableCell className="px-3 py-2 whitespace-nowrap">
                                                <div>{formatDate(txn.po_date)}</div>
                                                <div className="text-muted-foreground text-xs">{txn.po_no || '-'}</div>
                                            </TableCell>
                                            <TableCell className="px-3 py-2 whitespace-nowrap">
                                                <div>{formatDate(txn.sale_invoice_date)}</div>
                                                <div className="text-muted-foreground text-xs">{txn.sale_invoice_no || '-'}</div>
                                            </TableCell>
                                            <TableCell className="px-3 py-2 whitespace-nowrap">
                                                <div>{formatDate(txn.or_date)}</div>
                                                <div className="text-muted-foreground text-xs">{txn.or_no || '-'}</div>
                                            </TableCell>
                                            <TableCell className="px-3 py-2 whitespace-nowrap">
                                                <div>{formatDate(txn.dr_date)}</div>
                                                <div className="text-muted-foreground text-xs">{txn.dr_no || '-'}</div>
                                            </TableCell>
                                            <TableCell className="px-3 py-2 whitespace-nowrap">{txn.qty_period_covered || '-'}</TableCell>
                                            <TableCell className="max-w-[180px] truncate px-3 py-2" title={txn.particulars}>
                                                {txn.particulars}
                                            </TableCell>
                                            <TableCell className="px-3 py-2 text-right tabular-nums">{formatCurrency(txn.gross)}</TableCell>
                                            <TableCell className="text-muted-foreground px-3 py-2 text-right tabular-nums">
                                                {formatCurrency(txn.ewt)}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground px-3 py-2 text-right tabular-nums">
                                                {formatCurrency(txn.vat)}
                                            </TableCell>
                                            <TableCell className="px-3 py-2 text-right font-semibold tabular-nums">
                                                {formatCurrency(txn.net_amount)}
                                            </TableCell>
                                            <TableCell className="px-3 py-2 whitespace-nowrap">
                                                <div>{formatDate(txn.date_processed)}</div>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                <div className="text-muted-foreground text-xs">{txn.remarks || '-'}</div>
                                            </TableCell>
                                            <TableCell className="px-3 py-2">
                                                <div className="flex items-center gap-0.5">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-blue-500 hover:text-blue-600"
                                                        onClick={() => setEditingTransaction(txn)}
                                                    >
                                                        <Edit className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-red-500 hover:text-red-600"
                                                        onClick={() => setDeletingTransaction(txn)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
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
                <div className="mt-2">
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
