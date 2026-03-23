import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Employee } from '@/types/employee';
import type { Rata } from '@/types/rata';
import { useForm } from '@inertiajs/react';
import { CalendarIcon, Plus, TrendingUp } from 'lucide-react';
import { useState, type FormEventHandler } from 'react';
import { toast } from 'sonner';

interface CompensationRataProps {
    employee: Employee;
}

function AddRataDialog({ open, onClose, employee }: { open: boolean; onClose: () => void; employee: Employee }) {
    const { data, setData, post, processing, reset } = useForm({
        employee_id: employee.id,
        amount: '',
        effective_date: new Date().toISOString().split('T')[0],
    });

    const onSubmit: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();
        post(route('ratas.store'), {
            onSuccess: () => {
                toast.success('RATA added successfully');
                reset();
                onClose();
            },
            onError: () => toast.error('Failed to add RATA.'),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add RATA</DialogTitle>
                        <DialogDescription>Enter the RATA amount and effective date.</DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 space-y-4">
                        <div className="flex flex-col gap-1">
                            <Label>Amount (₱)</Label>
                            <Input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                value={data.amount}
                                onChange={(e) => setData('amount', e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <Label>Effective Date</Label>
                            <Input type="date" value={data.effective_date} onChange={(e) => setData('effective_date', e.target.value)} required />
                        </div>
                    </div>
                    <DialogFooter className="mt-6">
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Save RATA'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

const formatCurrency = (amount: number | undefined) => {
    if (!amount) return '₱0.00';
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(amount);
};

const formatDate = (date: string) => new Date(date).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });

export default function CompensationRata({ employee }: CompensationRataProps) {
    const [openDialog, setOpenDialog] = useState(false);
    const ratas: Rata[] = employee.ratas ?? [];
    const current = employee.latest_rata;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">RATA</h3>
                {employee.is_rata_eligible && (
                    <Button size="sm" onClick={() => setOpenDialog(true)}>
                        <Plus className="h-4 w-4" />
                        Add RATA
                    </Button>
                )}
            </div>

            {/* Not eligible notice */}
            {!employee.is_rata_eligible && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
                    This employee is not marked as RATA eligible. Enable it in the Settings tab to manage RATA records.
                </div>
            )}

            {/* Current RATA Card */}
            <div className="rounded-xl border bg-gradient-to-br from-purple-50 to-violet-50 p-5 shadow-sm dark:from-purple-950/30 dark:to-violet-950/30">
                <div className="mb-1 flex items-center gap-2 text-xs font-semibold tracking-wide text-purple-700 uppercase dark:text-purple-400">
                    <TrendingUp className="h-3.5 w-3.5" />
                    Current RATA
                </div>
                {current ? (
                    <>
                        <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(current.amount)}</p>
                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                            <CalendarIcon className="h-3 w-3" />
                            Effective {formatDate(current.effective_date)}
                        </p>
                    </>
                ) : (
                    <p className="text-muted-foreground text-sm">No RATA record yet.</p>
                )}
            </div>

            {/* History Table */}
            <div>
                <p className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">History</p>
                {ratas.length === 0 ? (
                    <div className="text-muted-foreground rounded-lg border py-8 text-center text-sm">No RATA history.</div>
                ) : (
                    <div className="overflow-hidden rounded-lg border shadow-sm">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Effective Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {ratas.map((r, i) => (
                                    <TableRow key={r.id} className={i === 0 ? 'font-semibold' : ''}>
                                        <TableCell>{formatCurrency(r.amount)}</TableCell>
                                        <TableCell className="text-muted-foreground text-sm">{formatDate(r.effective_date)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>

            {openDialog && <AddRataDialog open={openDialog} onClose={() => setOpenDialog(false)} employee={employee} />}
        </div>
    );
}
