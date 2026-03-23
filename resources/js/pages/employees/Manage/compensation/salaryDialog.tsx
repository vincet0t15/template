import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
interface SalaryDialogProps {
    open: boolean;
    onClose: () => void;
}
export function SalaryDialog({ open, onClose }: SalaryDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <form>
                <DialogContent className="min-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Edit profil1e</DialogTitle>
                        <DialogDescription>Make changes to your profile here. Click save when you&apos;re done.</DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <Field>
                            <Label htmlFor="name-1">Name</Label>
                            <Input id="name-1" name="name" defaultValue="Pedro Duarte" />
                        </Field>
                        <Field>
                            <Label htmlFor="username-1">Username</Label>
                            <Input id="username-1" name="username" defaultValue="@peduarte" />
                        </Field>
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
