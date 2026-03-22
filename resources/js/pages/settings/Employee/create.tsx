import { CustomComboBox } from '@/components/CustomComboBox';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { EmployeeCreateRequest } from '@/types/employee';
import type { EmploymentStatus } from '@/types/employmentStatuses';
import type { Office } from '@/types/office';
import { useForm } from '@inertiajs/react';
import { UploadIcon, XIcon } from 'lucide-react';
import { useRef, useState, type ChangeEventHandler, type FormEventHandler } from 'react';
import { toast } from 'sonner';
interface CreateEmployeeDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    employmentStatuses: EmploymentStatus[];
    offices: Office[];
}
export function CreateEmployeeDialog({ isOpen, onOpenChange, employmentStatuses, offices }: CreateEmployeeDialogProps) {
    const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
    const photoPreviewUrlRef = useRef<string | null>(null);
    const { data, setData, post, errors } = useForm<EmployeeCreateRequest>({
        first_name: '',
        middle_name: '',
        last_name: '',
        suffix: '',
        position: '',
        is_rata_eligible: false,
        office_id: '',
        employment_status_id: '',
        photo: null,
    });
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;

        if (photoPreviewUrlRef.current) {
            URL.revokeObjectURL(photoPreviewUrlRef.current);
            photoPreviewUrlRef.current = null;
        }

        if (file) {
            const url = URL.createObjectURL(file);
            photoPreviewUrlRef.current = url;
            setPhotoPreviewUrl(url);
        } else {
            setPhotoPreviewUrl(null);
        }

        setData('photo', file);
    };

    const handleInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        const { name, value } = e.target;

        if (['salary', 'pera', 'rata'].includes(name)) {
            let numericValue = value.replace(/[^\d.]/g, '');
            const parts = numericValue.split('.');
            if (parts.length > 2) return;

            const integerPart = parts[0];
            const decimalPart = parts[1] ?? '';

            const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

            const formattedValue = decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;

            setData({ ...data, [name]: formattedValue });
        } else {
            setData({ ...data, [name]: value });
        }
    };

    const handleSuffixChange = (value: string | null) => {
        setData('suffix', value ?? '');
    };

    const handleEmploymentStatusChange = (value: string | null) => {
        setData('employment_status_id', value ?? '');
    };

    const onSubmit: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();

        post(route('employees.store'), {
            onSuccess: (response: { props: FlashProps }) => {
                toast.success(response.props.flash?.success ?? 'Employee created successfully');
            },
            forceFormData: true,
        });
    };

    const officeOptions = offices.map((office) => ({
        value: String(office.id),
        label: office.name,
    }));

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <form>
                <DialogContent className="sm:max-w-[725px]">
                    <DialogHeader>
                        <DialogTitle>Edit profile</DialogTitle>
                        <DialogDescription>Make changes to your profile here. Click save when you&apos;re done.</DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <form className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            {/* LEFT SIDE - PHOTO */}
                            <div className="flex flex-col items-center space-y-4 md:col-span-1">
                                <input
                                    id="photo"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    onChange={handlePhotoChange}
                                />

                                <button
                                    type="button"
                                    className="bg-background relative flex aspect-square w-full max-w-xs cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed"
                                    onClick={() => document.getElementById('photo')?.click()}
                                >
                                    {photoPreviewUrl ? (
                                        <img src={photoPreviewUrl} alt="Preview" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center gap-2 text-center">
                                            <div className="bg-muted flex size-12 items-center justify-center rounded-full">
                                                <UploadIcon className="text-muted-foreground size-5" />
                                            </div>
                                            <div className="text-sm font-semibold">Upload Photo</div>
                                            <div className="text-muted-foreground text-xs">Click to browse</div>
                                        </div>
                                    )}
                                </button>

                                <div className="flex flex-wrap justify-center gap-2">
                                    <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('photo')?.click()}>
                                        <UploadIcon className="mr-1 size-4" />
                                        {photoPreviewUrl ? 'Change' : 'Choose'}
                                    </Button>

                                    {photoPreviewUrl && (
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => {
                                                if (photoPreviewUrlRef.current) {
                                                    URL.revokeObjectURL(photoPreviewUrlRef.current);
                                                    photoPreviewUrlRef.current = null;
                                                }
                                                setPhotoPreviewUrl(null);
                                                setData('photo', null);
                                            }}
                                        >
                                            <XIcon className="mr-1 size-4" />
                                            Remove
                                        </Button>
                                    )}
                                </div>

                                <p className="text-muted-foreground text-center text-xs">jpeg, jpg, png, webp (max 2MB)</p>
                            </div>

                            {/* RIGHT SIDE - FORM */}
                            <div className="space-y-4 md:col-span-2">
                                {/* NAME */}
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-2">
                                    <div className="flex w-full flex-col gap-1">
                                        <Label>First Name</Label>
                                        <Input name="first_name" value={data.first_name} onChange={handleInputChange} />
                                    </div>
                                    <div className="flex w-full flex-col gap-1">
                                        <Label>Middle Name</Label>
                                        <Input name="middle_name" value={data.middle_name} onChange={handleInputChange} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-2">
                                    <div className="flex w-full flex-col gap-1">
                                        <Label>Last Name</Label>
                                        <Input name="last_name" value={data.last_name} onChange={handleInputChange} />
                                    </div>
                                    <div className="w-full">
                                        <Label>Suffix</Label>
                                        <Select onValueChange={handleSuffixChange}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Suffix" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Jr.">Jr.</SelectItem>
                                                <SelectItem value="Sr.">Sr.</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                {/* POSITION / OFFICE / STATUS */}
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-1">
                                    <div className="flex w-full flex-col gap-1">
                                        <Label>Position</Label>
                                        <Input name="position" onChange={handleInputChange} />
                                    </div>
                                    <div className="flex w-full flex-col gap-1">
                                        <Label>Office</Label>
                                        <CustomComboBox
                                            items={officeOptions}
                                            placeholder="Office"
                                            onSelect={(value) => setData('office_id', value ?? '')}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-2">
                                    <div className="flex w-full flex-col gap-1">
                                        <Label>Employment Status</Label>
                                        <Select onValueChange={handleEmploymentStatusChange}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Employment Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {employmentStatuses.map((status) => (
                                                    <SelectItem key={status.id} value={String(status.id)}>
                                                        {status.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex w-full flex-col gap-1">
                                        <Label className="mb-2">RATA Eligible</Label>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                id="is_rata_eligible"
                                                checked={data.is_rata_eligible}
                                                onCheckedChange={(checked: boolean) => setData('is_rata_eligible', checked)}
                                            />
                                            <Label htmlFor="is_rata_eligible" className="font-normal">
                                                {data.is_rata_eligible ? 'Yes' : 'No'}
                                            </Label>
                                        </div>
                                        <p className="text-muted-foreground text-xs">
                                            Check if employee is eligible for RATA (e.g., Department Heads)
                                        </p>
                                    </div>
                                </div>

                                {/* ACTIONS */}
                                {/* <div className="flex justify-end gap-2 pt-4">
                                            <Button type="button" variant="outline" onClick={() => router.get(route('employees.index'))}>
                                                Cancel
                                            </Button>
                                            <Button type="submit">Save Employee</Button>
                                        </div> */}
                            </div>
                        </form>
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
