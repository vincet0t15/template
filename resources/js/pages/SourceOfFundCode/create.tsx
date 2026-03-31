import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
interface CreateSourceOfFundCodeProps {
    open: boolean;
    onClose: (open: boolean) => void;
}
export function CreateSourceOfFundCode({ open, onClose }: CreateSourceOfFundCodeProps) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <form>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Create Source of Fund Code </DialogTitle>
                        <DialogDescription>Make changes to your source of fund code here. Click save when you&apos;re done.</DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <Field>
                            <Label htmlFor="name-1">Code</Label>
                            <Input id="name-1" name="name" placeholder="Enter code" />
                        </Field>
                        <Field>
                            <Label htmlFor="username-1">Description</Label>
                            <Textarea id="username-1" name="username" placeholder="Enter description" />
                        </Field>
                    </FieldGroup>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Create Source of Fund Code</Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    );
}
