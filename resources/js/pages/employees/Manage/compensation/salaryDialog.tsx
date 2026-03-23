import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { DeductionType } from '@/types/deductionType';

interface SalaryDialogProps {
    open: boolean;
    onClose: () => void;
    deductionTypes: DeductionType[];
}

export function SalaryDialog({ open, onClose, deductionTypes }: SalaryDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <form>
                <DialogContent className="min-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Salary</DialogTitle>
                        <DialogDescription>Enter salary deductions.</DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <div className="mt-4">
                            <h4 className="mb-2 text-sm font-semibold">Deductions</h4>
                            <div className="grid grid-cols-2 gap-4">
                                {deductionTypes.map((deductionType) => (
                                    <Field key={deductionType.id}>
                                        <Label htmlFor={`deduction-${deductionType.id}`}>{deductionType.name}</Label>
                                        <Input
                                            id={`deduction-${deductionType.id}`}
                                            name={`deductions[${deductionType.code}]`}
                                            type="number"
                                            placeholder={`Enter ${deductionType.name.toLowerCase()} amount`}
                                        />
                                    </Field>
                                ))}
                            </div>
                        </div>
                    </FieldGroup>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Save changes</Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    );
}
