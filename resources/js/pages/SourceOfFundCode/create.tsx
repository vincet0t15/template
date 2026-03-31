import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SourceOfFundCodeCreate } from '@/types/sourceOfFundCOde';
import { useForm } from '@inertiajs/react';
import { ChangeEventHandler } from 'react';
interface CreateSourceOfFundCodeProps {
    open: boolean;
    onClose: (open: boolean) => void;
}
export function CreateSourceOfFundCode({ open, onClose }: CreateSourceOfFundCodeProps) {
    const { data, setData, processing, reset, post } = useForm<SourceOfFundCodeCreate>({
        code: '',
        description: '',
        status: false,
    });

    const onChangeInput: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    const onCheckedChange = (value: boolean | 'indeterminate') => {
        setData('status', typeof value === 'boolean' ? value : false);
    };
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
                            <Input id="name-1" name="code" placeholder="Enter code" onChange={onChangeInput} />
                        </Field>
                        <Field>
                            <Label htmlFor="username-1">Description</Label>
                            <Textarea id="username-1" name="description" placeholder="Enter description" onChange={onChangeInput} />
                        </Field>
                        <Field orientation="horizontal">
                            <Label htmlFor="username-1">Status</Label>
                            <Checkbox id="status" name="status" checked={data.status} onCheckedChange={onCheckedChange} />
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
