import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Supplier } from '@/types/supplier';
import { Head } from '@inertiajs/react';
import { Edit, Plus, Trash2, Truck } from 'lucide-react';
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

            <div className="p-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Truck className="h-5 w-5" />
                            Suppliers
                        </CardTitle>
                        <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Supplier
                        </Button>
                    </CardHeader>

                    <CardContent>
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
                                                <TableCell className="font-medium">{supplier.name}</TableCell>
                                                <TableCell className="text-muted-foreground max-w-xs truncate">{supplier.address || '-'}</TableCell>
                                                <TableCell>{supplier.contact_number || '-'}</TableCell>
                                                <TableCell>{supplier.email || '-'}</TableCell>
                                                <TableCell>
                                                    <span
                                                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                                            supplier.is_active
                                                                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                                                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                                        }`}
                                                    >
                                                        {supplier.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground max-w-xs truncate">{supplier.remarks || '-'}</TableCell>
                                                <TableCell>
                                                    <div className="flex gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => setEditingSupplier(supplier)}
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

            <CreateSupplierDialog open={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
            <EditSupplierDialog supplier={editingSupplier} onClose={() => setEditingSupplier(null)} />
            <DeleteSupplierDialog supplier={deletingSupplier} onClose={() => setDeletingSupplier(null)} />
        </AppLayout>
    );
}
