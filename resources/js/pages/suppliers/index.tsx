import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Supplier } from '@/types/supplier';
import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { CreateSupplierDialog } from './create-dialog';
import { DeleteSupplierDialog } from './delete-dialog';
import { EditSupplierDialog } from './edit-dialog';

interface Props {
    suppliers: Supplier[];
}

export default function Suppliers({ suppliers }: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);

    const breadcrumbs = [{ title: 'Suppliers', href: '/suppliers' }];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Suppliers" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <Heading
                    title="Supplier List"
                    description="Manage all suppliers, with options to view, edit, or delete records and track their supplier statuses."
                />
                <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <Button onClick={() => setIsCreateOpen(true)}>
                        <Plus className="h-4 w-4" />
                        Add Supplier
                    </Button>
                </div>

                <div className="w-full overflow-hidden rounded-sm border shadow-sm">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead>Supplier Name</TableHead>
                                <TableHead>Address</TableHead>
                                <TableHead>Contact Number</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Remarks</TableHead>
                                <TableHead className="w-24">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {suppliers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-muted-foreground py-8 text-center">
                                        No suppliers found. Click "Add Supplier" to create one.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                suppliers.map((supplier) => (
                                    <TableRow key={supplier.id}>
                                        <TableCell className="font-medium">
                                            <Link
                                                href={route('suppliers.transactions.show', supplier.id)}
                                                className="hover:text-primary hover:underline"
                                            >
                                                {supplier.name}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground max-w-xs truncate">{supplier.address || '-'}</TableCell>
                                        <TableCell>{supplier.contact_number || '-'}</TableCell>
                                        <TableCell>{supplier.email || '-'}</TableCell>
                                        <TableCell>
                                            <Badge variant={supplier.is_active ? 'secondary' : 'destructive'} className="rounded-sm">
                                                {supplier.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground max-w-xs truncate">{supplier.remarks || '-'}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="cursor-pointer text-teal-800 hover:underline"
                                                    onClick={() => setEditingSupplier(supplier)}
                                                >
                                                    Edit
                                                </span>

                                                <span
                                                    className="cursor-pointer text-red-500 hover:underline"
                                                    onClick={() => setDeletingSupplier(supplier)}
                                                >
                                                    Delete
                                                </span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <CreateSupplierDialog open={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
            <EditSupplierDialog supplier={editingSupplier} onClose={() => setEditingSupplier(null)} />
            <DeleteSupplierDialog supplier={deletingSupplier} onClose={() => setDeletingSupplier(null)} />
        </AppLayout>
    );
}
