import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Supplier } from '@/types/supplier';
import { Head } from '@inertiajs/react';
import { PrinterIcon } from 'lucide-react';

interface Props {
    suppliers: Supplier[];
}

export default function SupplierPrint({ suppliers }: Props) {
    const breadcrumbs = [
        { title: 'Suppliers', href: '/suppliers' },
        { title: 'Print', href: '/suppliers/print' },
    ];

    const handlePrint = () => {
        window.print();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Print Suppliers" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <Heading title="Supplier List" description={`Total: ${suppliers.length} supplier${suppliers.length !== 1 ? 's' : ''}`} />
                    <Button onClick={handlePrint} className="print:hidden">
                        <PrinterIcon className="mr-2 h-4 w-4" />
                        Print
                    </Button>
                </div>

                <div className="w-full overflow-hidden rounded-sm border shadow-sm print:border-0 print:shadow-none">
                    <Table>
                        <TableHeader className="bg-muted/50 print:bg-gray-100">
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>Supplier Name</TableHead>
                                <TableHead>Address</TableHead>
                                <TableHead>Contact Number</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Remarks</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {suppliers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-muted-foreground py-8 text-center">
                                        No suppliers found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                suppliers.map((supplier, index) => (
                                    <TableRow key={supplier.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell className="font-medium">{supplier.name}</TableCell>
                                        <TableCell className="text-muted-foreground">{supplier.address || '-'}</TableCell>
                                        <TableCell>{supplier.contact_number || '-'}</TableCell>
                                        <TableCell>{supplier.email || '-'}</TableCell>
                                        <TableCell>
                                            <Badge variant={supplier.is_active ? 'secondary' : 'destructive'} className="rounded-sm">
                                                {supplier.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{supplier.remarks || '-'}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
