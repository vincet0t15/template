import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Supplier } from '@/types/supplier';

import { Head, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { Edit, Plus, Trash2, Truck } from 'lucide-react';
import { useState } from 'react';

interface Props {
    suppliers: Supplier[];
}

export default function Suppliers({ suppliers }: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);

    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        processing,
        errors,
        reset,
    } = useForm({
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
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('suppliers.store'), {
            onSuccess: () => {
                setIsCreateOpen(false);
                reset();
            },
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingSupplier) {
            put(route('suppliers.update', editingSupplier.id), {
                onSuccess: () => {
                    setEditingSupplier(null);
                    reset();
                },
            });
        }
    };

    const handleDelete = () => {
        if (deletingSupplier) {
            destroy(route('suppliers.destroy', deletingSupplier.id), {
                onSuccess: () => setDeletingSupplier(null),
            });
        }
    };

    const openEditDialog = (supplier: Supplier) => {
        setEditingSupplier(supplier);
        setData({
            pr_date: supplier.pr_date,
            pr_no: supplier.pr_no,
            po_date: supplier.po_date || '',
            po_no: supplier.po_no || '',
            sale_invoice_date: supplier.sale_invoice_date || '',
            sale_invoice_no: supplier.sale_invoice_no || '',
            or_date: supplier.or_date || '',
            or_no: supplier.or_no || '',
            dr_date: supplier.dr_date || '',
            dr_no: supplier.dr_no || '',
            qty_period_covered: supplier.qty_period_covered || '',
            particulars: supplier.particulars,
            gross: String(supplier.gross),
            ewt: String(supplier.ewt),
            vat: String(supplier.vat),
            net_amount: String(supplier.net_amount),
            date_processed: supplier.date_processed || '',
            remarks: supplier.remarks || '',
        });
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(value);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return format(new Date(dateString), 'MM/dd/yyyy');
    };

    const breadcrumbs = [{ title: 'Suppliers', href: '/suppliers' }];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Suppliers" />

            <div className="p-6">
                <Card className="">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Truck className="h-5 w-5" />
                            Suppliers
                        </CardTitle>
                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Supplier Record
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-h-[90vh] min-w-4xl overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Add Supplier Record</DialogTitle>
                                    <DialogDescription>Enter the supplier transaction details below.</DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleCreate} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="pr_date">PR Date *</Label>
                                            <Input
                                                id="pr_date"
                                                type="date"
                                                value={data.pr_date}
                                                onChange={(e) => setData('pr_date', e.target.value)}
                                                required
                                            />
                                            {errors.pr_date && <p className="text-sm text-red-500">{errors.pr_date}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="pr_no">PR No. *</Label>
                                            <Input
                                                id="pr_no"
                                                value={data.pr_no}
                                                onChange={(e) => setData('pr_no', e.target.value)}
                                                placeholder="PR Number"
                                                required
                                            />
                                            {errors.pr_no && <p className="text-sm text-red-500">{errors.pr_no}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="po_date">PO Date</Label>
                                            <Input
                                                id="po_date"
                                                type="date"
                                                value={data.po_date}
                                                onChange={(e) => setData('po_date', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="po_no">PO No.</Label>
                                            <Input
                                                id="po_no"
                                                value={data.po_no}
                                                onChange={(e) => setData('po_no', e.target.value)}
                                                placeholder="PO Number"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="sale_invoice_date">Sale Invoice Date</Label>
                                            <Input
                                                id="sale_invoice_date"
                                                type="date"
                                                value={data.sale_invoice_date}
                                                onChange={(e) => setData('sale_invoice_date', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="sale_invoice_no">Sale Invoice No.</Label>
                                            <Input
                                                id="sale_invoice_no"
                                                value={data.sale_invoice_no}
                                                onChange={(e) => setData('sale_invoice_no', e.target.value)}
                                                placeholder="Invoice Number"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="or_date">OR Date</Label>
                                            <Input
                                                id="or_date"
                                                type="date"
                                                value={data.or_date}
                                                onChange={(e) => setData('or_date', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="or_no">OR No.</Label>
                                            <Input
                                                id="or_no"
                                                value={data.or_no}
                                                onChange={(e) => setData('or_no', e.target.value)}
                                                placeholder="OR Number"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="dr_date">D.R. Date</Label>
                                            <Input
                                                id="dr_date"
                                                type="date"
                                                value={data.dr_date}
                                                onChange={(e) => setData('dr_date', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="dr_no">D.R. No.</Label>
                                            <Input
                                                id="dr_no"
                                                value={data.dr_no}
                                                onChange={(e) => setData('dr_no', e.target.value)}
                                                placeholder="DR Number"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="qty_period_covered">QTY / Period Covered</Label>
                                        <Input
                                            id="qty_period_covered"
                                            value={data.qty_period_covered}
                                            onChange={(e) => setData('qty_period_covered', e.target.value)}
                                            placeholder="Quantity or Period"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="particulars">Particulars *</Label>
                                        <Textarea
                                            id="particulars"
                                            value={data.particulars}
                                            onChange={(e) => setData('particulars', e.target.value)}
                                            placeholder="Description of goods/services"
                                            required
                                        />
                                        {errors.particulars && <p className="text-sm text-red-500">{errors.particulars}</p>}
                                    </div>

                                    <div className="grid grid-cols-4 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="gross">Gross *</Label>
                                            <Input
                                                id="gross"
                                                type="number"
                                                step="0.01"
                                                value={data.gross}
                                                onChange={(e) => setData('gross', e.target.value)}
                                                placeholder="0.00"
                                                required
                                            />
                                            {errors.gross && <p className="text-sm text-red-500">{errors.gross}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="ewt">EWT</Label>
                                            <Input
                                                id="ewt"
                                                type="number"
                                                step="0.01"
                                                value={data.ewt}
                                                onChange={(e) => setData('ewt', e.target.value)}
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="vat">VAT</Label>
                                            <Input
                                                id="vat"
                                                type="number"
                                                step="0.01"
                                                value={data.vat}
                                                onChange={(e) => setData('vat', e.target.value)}
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="net_amount">Net Amount *</Label>
                                            <Input
                                                id="net_amount"
                                                type="number"
                                                step="0.01"
                                                value={data.net_amount}
                                                onChange={(e) => setData('net_amount', e.target.value)}
                                                placeholder="0.00"
                                                required
                                            />
                                            {errors.net_amount && <p className="text-sm text-red-500">{errors.net_amount}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="date_processed">Date Processed</Label>
                                            <Input
                                                id="date_processed"
                                                type="date"
                                                value={data.date_processed}
                                                onChange={(e) => setData('date_processed', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="remarks">Remarks</Label>
                                            <Input
                                                id="remarks"
                                                value={data.remarks}
                                                onChange={(e) => setData('remarks', e.target.value)}
                                                placeholder="Additional notes"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-2">
                                        <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={processing}>
                                            Save Record
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>

                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="whitespace-nowrap">PR Date / PR #</TableHead>
                                        <TableHead className="whitespace-nowrap">PO Date / PO #</TableHead>
                                        <TableHead className="whitespace-nowrap">Sale Inv. Date / #</TableHead>
                                        <TableHead className="whitespace-nowrap">OR Date / OR #</TableHead>
                                        <TableHead className="whitespace-nowrap">D.R. Date / D.R. #</TableHead>
                                        <TableHead className="whitespace-nowrap">QTY/Period</TableHead>
                                        <TableHead>Particulars</TableHead>
                                        <TableHead className="text-right">Gross</TableHead>
                                        <TableHead className="text-right">EWT</TableHead>
                                        <TableHead className="text-right">VAT</TableHead>
                                        <TableHead className="text-right">Net Amount</TableHead>
                                        <TableHead className="whitespace-nowrap">Date Proc. / Remarks</TableHead>
                                        <TableHead className="w-24">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {suppliers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={13} className="text-muted-foreground py-8 text-center">
                                                No supplier records found. Click "Add Supplier Record" to create one.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        suppliers.map((supplier) => (
                                            <TableRow key={supplier.id}>
                                                <TableCell className="whitespace-nowrap">
                                                    <div className="font-medium">{formatDate(supplier.pr_date)}</div>
                                                    <div className="text-muted-foreground text-xs">{supplier.pr_no}</div>
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap">
                                                    <div>{formatDate(supplier.po_date)}</div>
                                                    <div className="text-muted-foreground text-xs">{supplier.po_no || '-'}</div>
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap">
                                                    <div>{formatDate(supplier.sale_invoice_date)}</div>
                                                    <div className="text-muted-foreground text-xs">{supplier.sale_invoice_no || '-'}</div>
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap">
                                                    <div>{formatDate(supplier.or_date)}</div>
                                                    <div className="text-muted-foreground text-xs">{supplier.or_no || '-'}</div>
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap">
                                                    <div>{formatDate(supplier.dr_date)}</div>
                                                    <div className="text-muted-foreground text-xs">{supplier.dr_no || '-'}</div>
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap">{supplier.qty_period_covered || '-'}</TableCell>
                                                <TableCell className="max-w-xs truncate">{supplier.particulars}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(supplier.gross)}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(supplier.ewt)}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(supplier.vat)}</TableCell>
                                                <TableCell className="text-right font-medium">{formatCurrency(supplier.net_amount)}</TableCell>
                                                <TableCell className="whitespace-nowrap">
                                                    <div>{formatDate(supplier.date_processed)}</div>
                                                    <div className="text-muted-foreground text-xs">{supplier.remarks || '-'}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => openEditDialog(supplier)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-red-500 hover:text-red-600"
                                                            onClick={() => setDeletingSupplier(supplier)}
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
                    </CardContent>
                </Card>
            </div>

            {/* Edit Dialog */}
            <Dialog open={!!editingSupplier} onOpenChange={() => setEditingSupplier(null)}>
                <DialogContent className="max-h-[90vh] min-w-[600px] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Supplier Record</DialogTitle>
                        <DialogDescription>Update the supplier transaction details.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit_pr_date">PR Date *</Label>
                                <Input
                                    id="edit_pr_date"
                                    type="date"
                                    value={data.pr_date}
                                    onChange={(e) => setData('pr_date', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit_pr_no">PR No. *</Label>
                                <Input id="edit_pr_no" value={data.pr_no} onChange={(e) => setData('pr_no', e.target.value)} required />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit_po_date">PO Date</Label>
                                <Input id="edit_po_date" type="date" value={data.po_date} onChange={(e) => setData('po_date', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit_po_no">PO No.</Label>
                                <Input id="edit_po_no" value={data.po_no} onChange={(e) => setData('po_no', e.target.value)} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit_sale_invoice_date">Sale Invoice Date</Label>
                                <Input
                                    id="edit_sale_invoice_date"
                                    type="date"
                                    value={data.sale_invoice_date}
                                    onChange={(e) => setData('sale_invoice_date', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit_sale_invoice_no">Sale Invoice No.</Label>
                                <Input
                                    id="edit_sale_invoice_no"
                                    value={data.sale_invoice_no}
                                    onChange={(e) => setData('sale_invoice_no', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit_or_date">OR Date</Label>
                                <Input id="edit_or_date" type="date" value={data.or_date} onChange={(e) => setData('or_date', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit_or_no">OR No.</Label>
                                <Input id="edit_or_no" value={data.or_no} onChange={(e) => setData('or_no', e.target.value)} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit_dr_date">D.R. Date</Label>
                                <Input id="edit_dr_date" type="date" value={data.dr_date} onChange={(e) => setData('dr_date', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit_dr_no">D.R. No.</Label>
                                <Input id="edit_dr_no" value={data.dr_no} onChange={(e) => setData('dr_no', e.target.value)} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit_qty_period_covered">QTY / Period Covered</Label>
                            <Input
                                id="edit_qty_period_covered"
                                value={data.qty_period_covered}
                                onChange={(e) => setData('qty_period_covered', e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit_particulars">Particulars *</Label>
                            <Textarea
                                id="edit_particulars"
                                value={data.particulars}
                                onChange={(e) => setData('particulars', e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit_gross">Gross *</Label>
                                <Input
                                    id="edit_gross"
                                    type="number"
                                    step="0.01"
                                    value={data.gross}
                                    onChange={(e) => setData('gross', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit_ewt">EWT</Label>
                                <Input id="edit_ewt" type="number" step="0.01" value={data.ewt} onChange={(e) => setData('ewt', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit_vat">VAT</Label>
                                <Input id="edit_vat" type="number" step="0.01" value={data.vat} onChange={(e) => setData('vat', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit_net_amount">Net Amount *</Label>
                                <Input
                                    id="edit_net_amount"
                                    type="number"
                                    step="0.01"
                                    value={data.net_amount}
                                    onChange={(e) => setData('net_amount', e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit_date_processed">Date Processed</Label>
                                <Input
                                    id="edit_date_processed"
                                    type="date"
                                    value={data.date_processed}
                                    onChange={(e) => setData('date_processed', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit_remarks">Remarks</Label>
                                <Input id="edit_remarks" value={data.remarks} onChange={(e) => setData('remarks', e.target.value)} />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditingSupplier(null)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                Update Record
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={!!deletingSupplier} onOpenChange={() => setDeletingSupplier(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Supplier Record</DialogTitle>
                        <DialogDescription>Are you sure you want to delete this record? This action cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeletingSupplier(null)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={processing}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
