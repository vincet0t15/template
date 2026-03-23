import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import type { ClaimType } from '@/types/claimType';
import { Head } from '@inertiajs/react';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { CreateClaimType } from './create';
import { DeleteClaimTypeDialog } from './delete';
import { EditClaimType } from './edit';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Claim Types',
        href: '/settings/claim-types',
    },
];

interface ClaimTypesProps {
    claimTypes: ClaimType[];
}

export default function ClaimTypesIndex({ claimTypes }: ClaimTypesProps) {
    const [openCreate, setOpenCreate] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [selectedType, setSelectedType] = useState<ClaimType | null>(null);

    const handleEdit = (type: ClaimType) => {
        setSelectedType(type);
        setOpenEdit(true);
    };

    const handleDelete = (type: ClaimType) => {
        setSelectedType(type);
        setOpenDelete(true);
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Claim Types" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <Heading title="Claim Types" description="Manage claim types for employee reimbursements and claims." />

                <div className="flex justify-end">
                    <Button onClick={() => setOpenCreate(true)}>
                        <PlusIcon className="h-4 w-4" />
                        Add Claim Type
                    </Button>
                </div>

                <div className="w-full overflow-hidden rounded-sm border shadow-sm">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Code</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {claimTypes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-muted-foreground text-center">
                                        No claim types found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                claimTypes.map((type) => (
                                    <TableRow key={type.id}>
                                        <TableCell className="text-sm">{type.name}</TableCell>
                                        <TableCell className="text-sm">{type.code}</TableCell>
                                        <TableCell className="text-muted-foreground text-sm">{type.description || '—'}</TableCell>
                                        <TableCell>
                                            <Badge variant={type.is_active ? 'default' : 'destructive'} className="rounded-sm">
                                                {type.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <span
                                                    className="cursor-pointer text-sm text-teal-500 hover:underline"
                                                    onClick={() => handleEdit(type)}
                                                >
                                                    Edit
                                                </span>

                                                <span
                                                    className="cursor-pointer text-sm text-red-500 hover:underline"
                                                    onClick={() => handleDelete(type)}
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

            {openCreate && <CreateClaimType open={openCreate} isOpen={setOpenCreate} />}
            {openEdit && selectedType && <EditClaimType open={openEdit} isOpen={setOpenEdit} selectedType={selectedType} />}
            {openDelete && selectedType && <DeleteClaimTypeDialog open={openDelete} onClose={() => setOpenDelete(false)} claimType={selectedType} />}
        </AppLayout>
    );
}
