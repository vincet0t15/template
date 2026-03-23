import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ClaimForm } from '@/types/claim';
import { useForm } from '@inertiajs/react';
interface CreateClaimDialogProps {
    open: boolean;
    onClose: () => void;
}
export function CreateClaimDialog({ open, onClose }: CreateClaimDialogProps) {
    const { data, setData, post, processing, errors } = useForm<ClaimForm>({
        employee_id: 0,
        claim_type_id: 0,
        claim_date: '',
        amount: 0,
        purpose: '',
        remarks: '',
    });
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <form>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Edit profile</DialogTitle>
                        <DialogDescription>Make changes to your profile here. Click save when you&apos;re done.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="claim_type_id">Claim Type *</Label>
                            <Select value={data.claim_type_id} onValueChange={(value) => setData('claim_type_id', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select claim type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {claimTypes.map((type) => (
                                        <SelectItem key={type.id} value={String(type.id)}>
                                            {type.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.claim_type_id && <p className="text-sm text-red-500">{errors.claim_type_id}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="claim_date">Date *</Label>
                            <Input id="claim_date" type="date" value={data.claim_date} onChange={(e) => setData('claim_date', e.target.value)} />
                            {errors.claim_date && <p className="text-sm text-red-500">{errors.claim_date}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="amount">Amount *</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.amount}
                                onChange={(e) => setData('amount', e.target.value)}
                                placeholder="0.00"
                            />
                            {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="purpose">Purpose *</Label>
                            <Input
                                id="purpose"
                                value={data.purpose}
                                onChange={(e) => setData('purpose', e.target.value)}
                                placeholder="Purpose of the claim"
                            />
                            {errors.purpose && <p className="text-sm text-red-500">{errors.purpose}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="remarks">Remarks</Label>
                            <Input
                                id="remarks"
                                value={data.remarks}
                                onChange={(e) => setData('remarks', e.target.value)}
                                placeholder="Optional remarks"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Save</Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    );
}
