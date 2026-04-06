import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { DeductionType } from '@/types/deductionType';
import type { Employee } from '@/types/employee';
import { useForm } from '@inertiajs/react';
import { AlertTriangle, Loader2, Users } from 'lucide-react';

interface BulkAddDeductionDialogProps {
    open: boolean;
    onClose: () => void;
    employees: Employee[];
    deductionTypes: DeductionType[];
}

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

export function BulkAddDeductionDialog({ open, onClose, employees, deductionTypes }: BulkAddDeductionDialogProps) {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const form = useForm({
        employee_ids: [] as number[],
        deduction_type_id: '',
        amount: '',
        pay_period_month: String(currentMonth),
        pay_period_year: String(currentYear),
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (form.data.employee_ids.length === 0) {
            alert('Please select at least one employee');
            return;
        }

        form.post(route('employee-deductions.bulk-store'), {
            onSuccess: () => {
                form.reset();
                onClose();
            },
        });
    };

    const selectAllEmployees = () => {
        const allIds = employees.map((emp) => emp.id);
        form.setData('employee_ids', allIds);
    };

    const deselectAllEmployees = () => {
        form.setData('employee_ids', []);
    };

    const toggleEmployee = (employeeId: number) => {
        const current = form.data.employee_ids;
        if (current.includes(employeeId)) {
            form.setData(
                'employee_ids',
                current.filter((id) => id !== employeeId),
            );
        } else {
            form.setData('employee_ids', [...current, employeeId]);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] min-w-3xl overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Bulk Add Deduction
                        </DialogTitle>
                        <DialogDescription>
                            Add the same deduction to multiple employees at once. This will save you time when processing monthly deductions.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Employee Selection */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>
                                    Select Employees <span className="text-red-500">*</span>
                                </Label>
                                <div className="flex gap-2">
                                    <Button type="button" variant="outline" size="sm" onClick={selectAllEmployees}>
                                        Select All
                                    </Button>
                                    <Button type="button" variant="outline" size="sm" onClick={deselectAllEmployees}>
                                        Deselect All
                                    </Button>
                                </div>
                            </div>
                            <div className="max-h-48 overflow-y-auto rounded-md border">
                                <div className="space-y-1 p-2">
                                    {employees.map((employee) => {
                                        const fullName = `${employee.first_name} ${employee.last_name}`;
                                        const isSelected = form.data.employee_ids.includes(employee.id);
                                        return (
                                            <div
                                                key={employee.id}
                                                className={`flex cursor-pointer items-center gap-2 rounded p-2 hover:bg-slate-50 ${
                                                    isSelected ? 'border border-blue-200 bg-blue-50' : ''
                                                }`}
                                                onClick={() => toggleEmployee(employee.id)}
                                            >
                                                <input type="checkbox" checked={isSelected} onChange={() => {}} className="h-4 w-4" />
                                                <span className="text-sm">{fullName}</span>
                                                {employee.office && <span className="ml-auto text-xs text-slate-500">{employee.office.name}</span>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <p className="text-xs text-slate-600">{form.data.employee_ids.length} employee(s) selected</p>
                        </div>

                        {/* Deduction Type */}
                        <div className="space-y-2">
                            <Label>
                                Deduction Type <span className="text-red-500">*</span>
                            </Label>
                            <Select value={form.data.deduction_type_id} onValueChange={(value) => form.setData('deduction_type_id', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select deduction type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {deductionTypes.map((type) => (
                                        <SelectItem key={type.id} value={String(type.id)}>
                                            {type.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {form.errors.deduction_type_id && <p className="text-sm text-red-500">{form.errors.deduction_type_id}</p>}
                        </div>

                        {/* Amount */}
                        <div className="space-y-2">
                            <Label>
                                Amount <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                value={form.data.amount}
                                onChange={(e) => form.setData('amount', e.target.value)}
                            />
                            {form.errors.amount && <p className="text-sm text-red-500">{form.errors.amount}</p>}
                        </div>

                        {/* Pay Period */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>
                                    Month <span className="text-red-500">*</span>
                                </Label>
                                <Select value={form.data.pay_period_month} onValueChange={(value) => form.setData('pay_period_month', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {MONTHS.map((month) => (
                                            <SelectItem key={month.value} value={month.value}>
                                                {month.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>
                                    Year <span className="text-red-500">*</span>
                                </Label>
                                <Select value={form.data.pay_period_year} onValueChange={(value) => form.setData('pay_period_year', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map((year) => (
                                            <SelectItem key={year} value={String(year)}>
                                                {year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label>Notes (Optional)</Label>
                            <Textarea
                                placeholder="e.g., Monthly GSIS deduction"
                                value={form.data.notes}
                                onChange={(e) => form.setData('notes', e.target.value)}
                                rows={2}
                            />
                        </div>

                        {/* Warning */}
                        <div className="flex gap-2 rounded-md border border-yellow-200 bg-yellow-50 p-3">
                            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />
                            <div className="text-sm text-yellow-800">
                                <p className="font-medium">Important:</p>
                                <p>Duplicate deductions for the same employee, type, and period will be automatically skipped.</p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing || form.data.employee_ids.length === 0}>
                            {form.processing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                `Add to ${form.data.employee_ids.length} Employee(s)`
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
