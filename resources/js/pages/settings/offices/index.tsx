
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { PlusIcon, Search } from 'lucide-react';
import Heading from '@/components/heading';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { PaginatedDataResponse } from '@/types/pagination';
import type { Office } from '@/types/office';
import type { FilterProps } from '@/types/filter';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useState } from 'react';
import { CreateOfficeDialog } from './create';
import { EditOfficeDialog } from './edit';
import { DeleteOfficeDialog } from './delete';
import Pagination from '@/components/paginationData';
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface IndexProps {
    offices: PaginatedDataResponse<Office>;
    filters: FilterProps;
}
export default function Dashboard({ offices, filters }: IndexProps) {
    const { data, setData } = useForm({
        search: filters.search || '',
    });

    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [selectedOffice, setSelectedOffice] = useState<Office | null>(null);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const handleEditClick = (office: Office) => {
        setSelectedOffice(office);
        setOpenEditDialog(true);
    };
    const handleDeleteClick = (office: Office) => {
        setSelectedOffice(office);
        setOpenDeleteDialog(true);
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();

            const queryString = data.search ? { search: data.search } : undefined;

            router.get(route('offices.index'), queryString, {
                preserveState: true,
                preserveScroll: true,
            });
        }
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Offices" />
            <div className="flex h-full flex-1 flex-col rounded-xl p-4 gap-4">
                <Heading
                    title="Office Management"
                    description="Overview and maintenance of all office entries."
                />
                <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                    <Button onClick={() => setOpenCreateDialog(true)}>
                        <PlusIcon className="h-4 w-4" />
                        Create Office
                    </Button>

                    <div className="flex w-full sm:w-auto items-center gap-2">
                        <div className="relative w-full sm:w-[250px]">
                            <Label htmlFor="search" className="sr-only">
                                Search
                            </Label>
                            <Input
                                id="search"
                                placeholder="Search the offices..."
                                className="pl-8 w-full"
                                value={data.search}
                                onChange={(e) => setData({ search: e.target.value })}
                                onKeyDown={handleSearchKeyDown}
                            />
                            <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
                        </div>
                    </div>

                </div>

                <div className="w-full overflow-hidden rounded-sm border shadow-sm">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="font-bold text-primary">
                                    Name
                                </TableHead>
                                <TableHead className="font-bold text-primary">
                                    Code
                                </TableHead>

                                <TableHead className="font-bold text-primary text-right">
                                    Action
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {offices.data.length > 0 ? (
                                offices.data.map((office) => (
                                    <TableRow
                                        key={office.id}
                                        className="text-sm hover:bg-muted/30"
                                    >
                                        <TableCell className="text-sm">
                                            {office.name}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {office.code ?? (
                                                <span className="text-muted-foreground">
                                                    —
                                                </span>
                                            )}
                                        </TableCell>

                                        <TableCell className="text-sm flex items-center gap-2 justify-end">
                                            <span
                                                onClick={() => handleEditClick(office)}
                                                className="text-teal-600 cursor-pointer hover:underline"
                                            >
                                                Edit
                                            </span>
                                            <span
                                                onClick={() => handleDeleteClick(office)}
                                                className="text-orange-600 cursor-pointer hover:underline"
                                            >
                                                Delete
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        className="py-3 text-center text-gray-500"
                                    >
                                        No data available.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div>
                    <Pagination data={offices} />
                </div>
                {openCreateDialog && (
                    <CreateOfficeDialog
                        isOpen={openCreateDialog}
                        onClose={() => setOpenCreateDialog(false)}
                    />
                )}

                {openEditDialog && selectedOffice && (
                    <EditOfficeDialog
                        isOpen={openEditDialog}
                        onClose={() => setOpenEditDialog(false)}
                        office={selectedOffice}
                    />
                )}

                {openDeleteDialog && selectedOffice && (
                    <DeleteOfficeDialog
                        isOpen={openDeleteDialog}
                        onClose={() => setOpenDeleteDialog(false)}
                        office={selectedOffice}
                    />
                )}
            </div>
        </AppLayout>
    );
}
