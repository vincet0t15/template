import Heading from '@/components/heading';
import Pagination from '@/components/paginationData';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { FilterProps } from '@/types/filter';
import { PaginatedDataResponse } from '@/types/pagination';
import type { SourceOfFundCode as SourceOfFundCodeType } from '@/types/sourceOfFundCOde';
import { Head, router, useForm } from '@inertiajs/react';
import { Loader2, Pencil, PlusIcon, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { CreateSourceOfFundCode } from './create';
import { DeleteSourceOfFundCode } from './delete';
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Source of Fund Code',
        href: '/source-of-fund-code',
    },
];

interface SourceOfFundCodePageProps {
    sourceOfFundCodes: PaginatedDataResponse<SourceOfFundCodeType>;
    filters: FilterProps;
}

export default function SourceOfFundCode({ sourceOfFundCodes, filters }: SourceOfFundCodePageProps) {
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [selectedSource, setSelectedSource] = useState<SourceOfFundCodeType | null>(null);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const {
        data: editData,
        setData: setEditData,
        put,
        reset: resetEdit,
        errors: editErrors,
        processing: editProcessing,
    } = useForm({
        code: '',
        description: '',
        status: true as boolean,
    });

    const handleEdit = (source: SourceOfFundCodeType) => {
        setSelectedSource(source);
        setEditData({
            code: source.code,
            description: source.description || '',
            status: source.status,
        });
        setOpenEditDialog(true);
    };

    const handleUpdate = () => {
        if (!selectedSource) return;
        put(route('source-of-fund-codes.update', selectedSource.id), {
            onSuccess: (response: { props: FilterProps }) => {
                toast.success(response.props.flash?.success);
                resetEdit();
                setOpenEditDialog(false);
                setSelectedSource(null);
            },
        });
    };

    const handleDelete = (source: SourceOfFundCodeType) => {
        setSelectedSource(source);
        setOpenDeleteDialog(true);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('source-of-fund-codes.index'),
            { search: searchTerm },
            {
                preserveState: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Source of Fund Code" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <Heading title="Source of Fund Code" description="Overview and maintenance of all source of fund code entries." />
                <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <Button onClick={() => setOpenCreateDialog(true)}>
                        <PlusIcon className="h-4 w-4" />
                        Add Source of Fund Code
                    </Button>

                    <form onSubmit={handleSearch} className="flex w-full items-center gap-2 sm:w-auto">
                        <div className="relative w-full sm:w-[280px]">
                            <Label htmlFor="search" className="sr-only">
                                Search
                            </Label>
                            <Input
                                id="search"
                                placeholder="Search source of fund code..."
                                className="w-full pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
                        </div>
                        <Button type="submit" variant="secondary" size="sm">
                            Search
                        </Button>
                    </form>
                </div>

                <div className="w-full overflow-hidden rounded-sm border shadow-sm">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="text-primary font-bold">Code</TableHead>
                                <TableHead className="text-primary font-bold">Description</TableHead>
                                <TableHead className="text-primary font-bold">Status</TableHead>
                                <TableHead className="text-primary w-[100px] text-center font-bold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {sourceOfFundCodes.data.length > 0 ? (
                                sourceOfFundCodes.data.map((source) => (
                                    <TableRow key={source.id} className="hover:bg-muted/30">
                                        <TableCell className="font-medium">
                                            <code className="bg-muted rounded px-2 py-1 text-sm">{source.code}</code>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{source.description || '-'}</TableCell>
                                        <TableCell>
                                            <span
                                                className={`rounded-full px-2 py-1 text-xs ${
                                                    source.status
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                                        : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                                }`}
                                            >
                                                {source.status ? 'Active' : 'Inactive'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(source)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(source)}>
                                                    <Trash2 className="text-destructive h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="py-3 text-center text-gray-500">
                                        No source of fund codes found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div>
                    <Pagination data={sourceOfFundCodes} />
                </div>

                {openCreateDialog && <CreateSourceOfFundCode open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} />}

                {/* Edit Dialog */}
                <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
                    <DialogContent className="sm:max-w-sm">
                        <form>
                            <DialogHeader>
                                <DialogTitle>Edit Source of Fund Code</DialogTitle>
                                <DialogDescription>
                                    Make changes to your source of fund code here. Click save when you&apos;re done.
                                </DialogDescription>
                            </DialogHeader>
                            <FieldGroup>
                                <Field>
                                    <Label htmlFor="edit-code">Code</Label>
                                    <Input
                                        id="edit-code"
                                        value={editData.code}
                                        onChange={(e) => setEditData('code', e.target.value.toUpperCase())}
                                        placeholder="Enter code"
                                    />
                                    {editErrors.code && <p className="text-destructive text-sm">{editErrors.code}</p>}
                                </Field>
                                <Field>
                                    <Label htmlFor="edit-description">Description</Label>
                                    <Input
                                        id="edit-description"
                                        value={editData.description}
                                        onChange={(e) => setEditData('description', e.target.value)}
                                        placeholder="Enter description"
                                    />
                                </Field>
                                <Field orientation="horizontal" className="mb-4">
                                    <Label htmlFor="edit-status">Status</Label>
                                    <Checkbox checked={editData.status} onCheckedChange={(checked) => setEditData('status', Boolean(checked))} />
                                </Field>
                            </FieldGroup>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button type="submit" onClick={handleUpdate} disabled={editProcessing}>
                                    {editProcessing ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Updating...
                                        </span>
                                    ) : (
                                        'Update'
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* DELETE DIALOG */}
                {openDeleteDialog && selectedSource && (
                    <DeleteSourceOfFundCode isOpen={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} sourceOfFundCode={selectedSource} />
                )}
            </div>
        </AppLayout>
    );
}
