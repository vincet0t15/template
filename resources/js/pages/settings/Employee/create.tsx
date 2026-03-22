import { CustomComboBox } from "@/components/CustomComboBox"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { EmployeeCreateRequest } from "@/types/employee"
import type { EmploymentStatus } from "@/types/employmentStatuses"
import type { Office } from "@/types/office"
import { router, useForm } from "@inertiajs/react"
import { UploadIcon, XIcon } from "lucide-react"
import { useRef, useState, type ChangeEventHandler, type FormEventHandler } from "react"
import { toast } from "sonner"
interface CreateEmployeeDialogProps {
    isOpen: boolean
    onOpenChange: (isOpen: boolean) => void
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

            const formattedValue = decimalPart
                ? `${formattedInteger}.${decimalPart}`
                : formattedInteger;

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
                        <DialogDescription>
                            Make changes to your profile here. Click save when you&apos;re
                            done.
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup>

                        <form className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            {/* LEFT SIDE - PHOTO */}
                            <div className="md:col-span-1 space-y-4 flex flex-col items-center">
                                <input
                                    id="photo"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    onChange={handlePhotoChange}
                                />

                                <button
                                    type="button"
                                    className="relative flex aspect-square w-full max-w-xs cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed bg-background"
                                    onClick={() => document.getElementById('photo')?.click()}
                                >
                                    {photoPreviewUrl ? (
                                        <img src={photoPreviewUrl} alt="Preview" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center gap-2 text-center">
                                            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                                                <UploadIcon className="size-5 text-muted-foreground" />
                                            </div>
                                            <div className="text-sm font-semibold">Upload Photo</div>
                                            <div className="text-xs text-muted-foreground">Click to browse</div>
                                        </div>
                                    )}
                                </button>

                                <div className="flex flex-wrap gap-2 justify-center">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => document.getElementById('photo')?.click()}
                                    >
                                        <UploadIcon className="size-4 mr-1" />
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
                                            <XIcon className="size-4 mr-1" />
                                            Remove
                                        </Button>
                                    )}
                                </div>

                                <p className="text-xs text-muted-foreground text-center">
                                    jpeg, jpg, png, webp (max 2MB)
                                </p>
                            </div>

                            {/* RIGHT SIDE - FORM */}
                            <div className="md:col-span-2 space-y-4">

                                {/* NAME */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-3">
                                    <div className="w-full flex flex-col gap-1">
                                        <Label>First Name</Label>
                                        <Input name="first_name" value={data.first_name} onChange={handleInputChange} />
                                    </div>
                                    <div className="w-full flex flex-col gap-1">
                                        <Label>Middle Name</Label>
                                        <Input name="middle_name" value={data.middle_name} onChange={handleInputChange} />
                                    </div>

                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-3">
                                    <div className="w-full flex flex-col gap-1">
                                        <Label>Last Name</Label>
                                        <Input name="last_name" value={data.last_name} onChange={handleInputChange} />
                                    </div>
                                    <div className="w-full">
                                        <Label>Suffix</Label>
                                        <Select onValueChange={handleSuffixChange} >
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
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1   gap-3">
                                    <div className="w-full flex flex-col gap-1">
                                        <Label>Position</Label>
                                        <Input name="position" onChange={handleInputChange} />
                                    </div>
                                    <div className="w-full flex flex-col gap-1">
                                        <Label>Office</Label>
                                        <CustomComboBox
                                            items={officeOptions}
                                            placeholder="Office"
                                            onSelect={(value) => setData('office_id', value ?? '')}
                                        />
                                    </div>


                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-3">
                                    <div className="w-full flex flex-col gap-1">
                                        <Label>Employment Status</Label>
                                        <Select onValueChange={handleEmploymentStatusChange} >
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
                                    <div className="w-full flex flex-col gap-1">
                                        <Label>Employment Status</Label>
                                        <Select onValueChange={handleEmploymentStatusChange} >
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
    )
}
