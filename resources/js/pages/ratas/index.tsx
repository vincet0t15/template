import Heading from '@/components/heading';
import Pagination from '@/components/paginationData';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import type { Employee } from '@/types/employee';
import type { FilterProps } from '@/types/filter';
import type { PaginatedDataResponse } from '@/types/pagination';
import { Head, router, useForm } from '@inertiajs/react';
import { History, PlusIcon, Search, User } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'RATA',
        href: '/ratas',
    },
];

interface RatasProps {
    employees: PaginatedDataResponse<Employee>;
    filters: FilterProps;
}

export default function RatasIndex({ employees, filters }: RatasProps) {
    const { data: searchData, setData: setSearchData } = useForm({
        search: filters.search || '',
    });

    const [openAdd, setOpenAdd] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

    const {
        data: rataData,
        setData: setRataData,
        post,
        reset,
        errors,
    } = useForm({
        employee_id: 0,
        amount: '',
        effective_date: new Date().toISOString().split('T')[0],
    });

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const queryString = searchData.search ? { search: searchData.search } : {};
            router.get(route('ratas.index'), queryString, {
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    const handleOpenAdd = (employee: Employee) => {
        setSelectedEmployee(employee);
        setRataData('employee_id', employee.id);
        setOpenAdd(true);
    };

    const handleAddRata = () => {
        post(route('ratas.store'), {
            onSuccess: () => {
                reset();
                setOpenAdd(false);
                setSelectedEmployee(null);
            },
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="RATA" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <Heading title="Representation and Transportation Allowance (RATA)" description="Manage RATA records for eligible employees only." />

                <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex w-full items-center gap-2 sm:w-auto">
                        <div className="relative w-full sm:w-[250px]">
                            <Label htmlFor="search" className="sr-only">
                                Search
                            </Label>
                            <Input
                                id="search"
                                placeholder="Search employee..."
                                className="w-full pl-8"
                                value={searchData.search}
                                onChange={(e) => setSearchData('search', e.target.value)}
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
                                <TableHead className="text-primary font-bold">Employee</TableHead>
                                <TableHead className="text-primary font-bold">Office</TableHead>
                                <TableHead className="text-primary text-right font-bold">Current RATA</TableHead>
                                <TableHead className="text-primary w-[150px] text-center font-bold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {employees.data.length > 0 ? (
                                employees.data.map((employee) => (
                                    <TableRow key={employee.id} className="hover:bg-muted/30">
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-10 w-10 border-2 border-slate-200 shadow-sm dark:border-slate-700">
                                                    {employee.image_path ? (
                                                        <AvatarImage
                                                            src={employee.image_path ?? undefined}
                                                            alt={`${employee.first_name} ${employee.last_name}`}
                                                            className="object-cover"
                                                        />
                                                    ) : null}
                                                    <AvatarFallback className="bg-slate-100 dark:bg-slate-800">
                                                        <User className="h-5 w-5 text-slate-400" />
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="font-bold uppercase">
                                                        {employee.last_name}, {employee.first_name} {employee.middle_name}
                                                    </span>
                                                    <span className="text-muted-foreground text-xs">{employee.position}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{employee.office?.name}</TableCell>
                                        <TableCell className="text-right font-medium">
                                            {employee.latest_rata ? formatCurrency(employee.latest_rata.amount) : '-'}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Button variant="outline" size="sm" onClick={() => router.get(route('ratas.history', employee.id))}>
                                                    <History className="mr-1 h-4 w-4" />
                                                    History
                                                </Button>
                                                <Button variant="default" size="sm" onClick={() => handleOpenAdd(employee)}>
                                                    <PlusIcon className="mr-1 h-4 w-4" />
                                                    Add
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="py-3 text-center text-gray-500">
                                        No RATA-eligible employees found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <Pagination data={employees} />

                {/* Add RATA Dialog */}
                <Dialog open={openAdd} onOpenChange={setOpenAdd}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add RATA Record</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Employee</Label>
                                <div className="text-lg font-medium">
                                    {selectedEmployee?.last_name}, {selectedEmployee?.first_name} {selectedEmployee?.middle_name}
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="amount">Amount (PHP)</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    value={rataData.amount}
                                    onChange={(e) => setRataData('amount', e.target.value)}
                                    placeholder="0.00"
                                />
                                {errors.amount && <p className="text-destructive text-sm">{errors.amount}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="effective_date">Effective Date</Label>
                                <Input
                                    id="effective_date"
                                    type="date"
                                    value={rataData.effective_date}
                                    onChange={(e) => setRataData('effective_date', e.target.value)}
                                />
                                {errors.effective_date && <p className="text-destructive text-sm">{errors.effective_date}</p>}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setOpenAdd(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleAddRata}>Add RATA</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
