import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Employee } from '@/types/employee';
import { router, useForm } from '@inertiajs/react';
import { PlusCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface CompensationProps {
    employee: Employee;
}

const formatCurrency = (amount: number | undefined) => {
    if (!amount) return '₱0.00';
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
    }).format(amount);
};

function AddSalaryDialog({ employeeId, onSuccess }: { employeeId: number; onSuccess: () => void }) {
    const [open, setOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        employee_id: employeeId,
        amount: '',
        effective_date: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('salaries.store'), {
            onSuccess: () => {
                toast.success('Salary added successfully');
                setOpen(false);
                reset();
                onSuccess();
            },
            onError: () => {
                toast.error('Failed to add salary');
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <PlusCircle className="mr-1 h-4 w-4" />
                    Add Salary
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Salary</DialogTitle>
                    <DialogDescription>Add a new salary record for this employee.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="salary-amount">Amount</Label>
                        <Input
                            id="salary-amount"
                            type="number"
                            placeholder="Enter salary amount"
                            value={data.amount}
                            onChange={(e) => setData('amount', e.target.value)}
                        />
                        {errors.amount && <p className="text-destructive text-xs">{errors.amount}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="salary-date">Effective Date</Label>
                        <Input id="salary-date" type="date" value={data.effective_date} onChange={(e) => setData('effective_date', e.target.value)} />
                        {errors.effective_date && <p className="text-destructive text-xs">{errors.effective_date}</p>}
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function AddPeraDialog({ employeeId, onSuccess }: { employeeId: number; onSuccess: () => void }) {
    const [open, setOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        employee_id: employeeId,
        amount: '',
        effective_date: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('peras.store'), {
            onSuccess: () => {
                toast.success('PERA added successfully');
                setOpen(false);
                reset();
                onSuccess();
            },
            onError: () => {
                toast.error('Failed to add PERA');
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <PlusCircle className="mr-1 h-4 w-4" />
                    Add PERA
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add PERA</DialogTitle>
                    <DialogDescription>Add Personnel Economic Relief Allowance for this employee.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="pera-amount">Amount</Label>
                        <Input
                            id="pera-amount"
                            type="number"
                            placeholder="Enter PERA amount (default: 2000)"
                            value={data.amount}
                            onChange={(e) => setData('amount', e.target.value)}
                        />
                        {errors.amount && <p className="text-destructive text-xs">{errors.amount}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="pera-date">Effective Date</Label>
                        <Input id="pera-date" type="date" value={data.effective_date} onChange={(e) => setData('effective_date', e.target.value)} />
                        {errors.effective_date && <p className="text-destructive text-xs">{errors.effective_date}</p>}
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function AddRataDialog({ employeeId, onSuccess }: { employeeId: number; onSuccess: () => void }) {
    const [open, setOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        employee_id: employeeId,
        amount: '',
        effective_date: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('ratas.store'), {
            onSuccess: () => {
                toast.success('RATA added successfully');
                setOpen(false);
                reset();
                onSuccess();
            },
            onError: () => {
                toast.error('Failed to add RATA');
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <PlusCircle className="mr-1 h-4 w-4" />
                    Add RATA
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add RATA</DialogTitle>
                    <DialogDescription>Add Representation and Transportation Allowance for this employee.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="rata-amount">Amount</Label>
                        <Input
                            id="rata-amount"
                            type="number"
                            placeholder="Enter RATA amount"
                            value={data.amount}
                            onChange={(e) => setData('amount', e.target.value)}
                        />
                        {errors.amount && <p className="text-destructive text-xs">{errors.amount}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="rata-date">Effective Date</Label>
                        <Input id="rata-date" type="date" value={data.effective_date} onChange={(e) => setData('effective_date', e.target.value)} />
                        {errors.effective_date && <p className="text-destructive text-xs">{errors.effective_date}</p>}
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export function Compensation({ employee }: CompensationProps) {
    const refreshPage = () => {
        router.reload({ only: ['employee'] });
    };

    return (
        <div>
            <Tabs defaultValue="salary" orientation="vertical" className="flex flex-col gap-6 md:flex-row">
                {/* Left Side: Sidebar Tabs */}
                <TabsList className="flex h-auto w-full flex-col items-stretch gap-1 bg-transparent p-0 md:w-48">
                    <TabsTrigger value="salary">Salary</TabsTrigger>
                    <TabsTrigger value="rata">R.A.T.A</TabsTrigger>
                    <TabsTrigger value="pera">P.E.R.A</TabsTrigger>
                </TabsList>

                {/* Right Side: Content Area */}
                <div className="flex-1">
                    <TabsContent value="salary" className="mt-0">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Salary History</CardTitle>
                                        <CardDescription>Employee salary records over time</CardDescription>
                                    </div>
                                    <AddSalaryDialog employeeId={employee.id} onSuccess={refreshPage} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                {employee.salaries && employee.salaries.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Amount</TableHead>
                                                <TableHead>Effective Date</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {employee.salaries.map((salary, index) => (
                                                <TableRow key={salary.id}>
                                                    <TableCell className="font-medium">{formatCurrency(salary.amount)}</TableCell>
                                                    <TableCell>{new Date(salary.effective_date).toLocaleDateString('en-PH')}</TableCell>
                                                    <TableCell>
                                                        {index === 0 ? (
                                                            <Badge className="bg-green-100 text-green-700">Current</Badge>
                                                        ) : (
                                                            <Badge variant="secondary">Previous</Badge>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="text-muted-foreground py-8 text-center">
                                        No salary records found. Add the employee's first salary record.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="rata" className="mt-0">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>RATA History</CardTitle>
                                        <CardDescription>
                                            {employee.is_rata_eligible
                                                ? 'Representation and Transportation Allowance records'
                                                : 'Employee is not eligible for RATA'}
                                        </CardDescription>
                                    </div>
                                    {employee.is_rata_eligible && <AddRataDialog employeeId={employee.id} onSuccess={refreshPage} />}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {employee.is_rata_eligible ? (
                                    employee.ratas && employee.ratas.length > 0 ? (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Amount</TableHead>
                                                    <TableHead>Effective Date</TableHead>
                                                    <TableHead>Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {employee.ratas.map((rata, index) => (
                                                    <TableRow key={rata.id}>
                                                        <TableCell className="font-medium">{formatCurrency(rata.amount)}</TableCell>
                                                        <TableCell>{new Date(rata.effective_date).toLocaleDateString('en-PH')}</TableCell>
                                                        <TableCell>
                                                            {index === 0 ? (
                                                                <Badge className="bg-green-100 text-green-700">Current</Badge>
                                                            ) : (
                                                                <Badge variant="secondary">Previous</Badge>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <div className="text-muted-foreground py-8 text-center">
                                            No RATA records found. Add the first RATA record.
                                        </div>
                                    )
                                ) : (
                                    <div className="text-muted-foreground py-8 text-center">
                                        This employee is not eligible for RATA allowance.
                                        <br />
                                        <span className="text-xs">Enable RATA eligibility in Settings tab.</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="pera" className="mt-0">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>PERA History</CardTitle>
                                        <CardDescription>Personnel Economic Relief Allowance records</CardDescription>
                                    </div>
                                    <AddPeraDialog employeeId={employee.id} onSuccess={refreshPage} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                {employee.peras && employee.peras.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Amount</TableHead>
                                                <TableHead>Effective Date</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {employee.peras.map((pera, index) => (
                                                <TableRow key={pera.id}>
                                                    <TableCell className="font-medium">{formatCurrency(pera.amount)}</TableCell>
                                                    <TableCell>{new Date(pera.effective_date).toLocaleDateString('en-PH')}</TableCell>
                                                    <TableCell>
                                                        {index === 0 ? (
                                                            <Badge className="bg-green-100 text-green-700">Current</Badge>
                                                        ) : (
                                                            <Badge variant="secondary">Previous</Badge>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="text-muted-foreground py-8 text-center">No PERA records found. Add the first PERA record.</div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
