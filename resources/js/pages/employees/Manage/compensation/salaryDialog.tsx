import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { DeductionType } from '@/types/deductionType';
import type { Employee } from '@/types/employee';
import { useForm } from '@inertiajs/react';
import { type FormEventHandler } from 'react';
import { toast } from 'sonner';

const MONTHS = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => currentYear - i);

interface SalaryDialogProps {
    open: boolean;
    onClose: () => void;
    employee: Employee;
    deductionTypes: DeductionType[];
}

export function SalaryDialog({ open, onClose, employee, deductionTypes }: SalaryDialogProps) {
    const { data, setData, post, processing, reset } = useForm<{
        pay_period_month: string;
        pay_period_year: string;
        deductions: { deduction_type_id: number; amount: string }[];
    }>({
        pay_period_month: String(new Date().getMonth() + 1),
        pay_period_year: String(currentYear),
        deductions: deductionTypes.map((dt) => ({
            deduction_type_id: dt.id,
            amount: '',
        })),
    });

    const handleAmountChange = (index: number, value: string) => {
        const updated = [...data.deductions];
        updated[index] = { ...updated[index], amount: value };
        setData('deductions', updated);
    };

    const onSubmit: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();

        post(route('manage.employees.deductions.store', employee.id), {
            onSuccess: () => {
                toast.success('Deductions saved successfully');
                reset();
                onClose();
            },
            onError: () => {
                toast.error('Failed to save deductions. Please check the form.');
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <form onSubmit={onSubmit}>
                <DialogContent className="max-h-[95vh] min-w-2xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Salary Deductions</DialogTitle>
                        <DialogDescription>
                            Enter deductions for {employee.last_name}, {employee.first_name}.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Pay Period */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <Label>Month</Label>
                            <Select value={data.pay_period_month} onValueChange={(v) => setData('pay_period_month', v)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select month" />
                                </SelectTrigger>
                                <SelectContent>
                                    {MONTHS.map((m) => (
                                        <SelectItem key={m.value} value={m.value}>
                                            {m.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <Label>Year</Label>
                            <Select value={data.pay_period_year} onValueChange={(v) => setData('pay_period_year', v)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {YEARS.map((y) => (
                                        <SelectItem key={y} value={String(y)}>
                                            {y}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Deduction Fields */}
                    <div className="mt-2">
                        <h4 className="mb-3 text-sm font-semibold">Deduction Amounts</h4>
                        <div className="grid grid-cols-2 gap-4">
                            {deductionTypes.map((deductionType, index) => (
                                <div key={deductionType.id} className="flex flex-col gap-1">
                                    <Label htmlFor={`deduction-${deductionType.id}`}>
                                        {deductionType.name}
                                        <span className="text-muted-foreground ml-1 text-xs">({deductionType.code})</span>
                                    </Label>
                                    <Input
                                        id={`deduction-${deductionType.id}`}
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={data.deductions[index]?.amount ?? ''}
                                        onChange={(e) => handleAmountChange(index, e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Save Deductions'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    );
}
