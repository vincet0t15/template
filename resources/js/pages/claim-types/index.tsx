import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import type { ClaimType } from '@/types/claimType';
import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, PlusIcon, Trash2 } from 'lucide-react';
import { useState } from 'react';

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
    const [selectedType, setSelectedType] = useState<ClaimType | null>(null);

    const {
        data: createData,
        setData: setCreateData,
        post,
        reset: resetCreate,
        errors: createErrors,
    } = useForm({
        name: '',
        code: '',
        description: '',
        is_active: true as boolean,
    });

    const {
        data: editData,
        setData: setEditData,
        put,
        reset: resetEdit,
        errors: editErrors,
    } = useForm({
        name: '',
        code: '',
        description: '',
        is_active: true as boolean,
    });

    const handleCreate = () => {
        post(route('claim-types.store'), {
            onSuccess: () => {
                resetCreate();
                setOpenCreate(false);
            },
        });
    };

    const handleEdit = (type: ClaimType) => {
        setSelectedType(type);
        setEditData({
            name: type.name,
            code: type.code,
            description: type.description || '',
            is_active: type.is_active,
        });
        setOpenEdit(true);
    };

    const handleUpdate = () => {
        if (!selectedType) return;
        put(route('claim-types.update', selectedType.id), {
            onSuccess: () => {
                resetEdit();
                setOpenEdit(false);
                setSelectedType(null);
            },
        });
    };

    const handleDelete = (type: ClaimType) => {
        if (confirm('Are you sure you want to delete this claim type?')) {
            router.delete(route('claim-types.destroy', type.id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Claim Types" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <Heading title="Claim Types" description="Manage claim types for employee reimbursements and claims." />

                <div className="flex justify-end">
                    <Button onClick={() => setOpenCreate(true)}>
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Add Claim Type
                    </Button>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
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
                                        <TableCell className="font-medium">{type.name}</TableCell>
                                        <TableCell>{type.code}</TableCell>
                                        <TableCell className="text-muted-foreground">{type.description || '—'}</TableCell>
                                        <TableCell>
                                            <span
                                                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                                    type.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                                }`}
                                            >
                                                {type.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(type)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(type)}>
                                                    <Trash2 className="h-4 w-4 text-red-500" />
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

            {/* Create Dialog */}
            <Dialog open={openCreate} onOpenChange={setOpenCreate}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Claim Type</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={createData.name}
                                onChange={(e) => setCreateData('name', e.target.value)}
                                placeholder="e.g., Medical Reimbursement"
                            />
                            {createErrors.name && <p className="text-sm text-red-500">{createErrors.name}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="code">Code</Label>
                            <Input
                                id="code"
                                value={createData.code}
                                onChange={(e) => setCreateData('code', e.target.value)}
                                placeholder="e.g., MEDICAL"
                            />
                            {createErrors.code && <p className="text-sm text-red-500">{createErrors.code}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                value={createData.description}
                                onChange={(e) => setCreateData('description', e.target.value)}
                                placeholder="Optional description"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                id="is_active"
                                checked={createData.is_active}
                                onCheckedChange={(checked) => setCreateData('is_active', checked)}
                            />
                            <Label htmlFor="is_active">Active</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpenCreate(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreate}>Create</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={openEdit} onOpenChange={setOpenEdit}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Claim Type</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Name</Label>
                            <Input id="edit-name" value={editData.name} onChange={(e) => setEditData('name', e.target.value)} />
                            {editErrors.name && <p className="text-sm text-red-500">{editErrors.name}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-code">Code</Label>
                            <Input id="edit-code" value={editData.code} onChange={(e) => setEditData('code', e.target.value)} />
                            {editErrors.code && <p className="text-sm text-red-500">{editErrors.code}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Input id="edit-description" value={editData.description} onChange={(e) => setEditData('description', e.target.value)} />
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                id="edit-is_active"
                                checked={editData.is_active}
                                onCheckedChange={(checked) => setEditData('is_active', checked)}
                            />
                            <Label htmlFor="edit-is_active">Active</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpenEdit(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdate}>Update</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
