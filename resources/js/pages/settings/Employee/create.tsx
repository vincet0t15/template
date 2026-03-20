import { CustomComboBox } from '@/components/CustomComboBox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import type { EmployeeCreateRequest } from '@/types/employee';
import type { EmploymentStatus } from '@/types/employmentStatuses';
import type { Office } from '@/types/office';
import { Head, router, useForm } from '@inertiajs/react';
import { UploadIcon } from 'lucide-react';
import { useRef, useState, type ChangeEventHandler, type FormEventHandler } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

interface EmployeeProps {
    employmentStatuses: EmploymentStatus[];
    offices: Office[];
}

export default function CreateEmployee({ employmentStatuses, offices }: EmployeeProps) {
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

    const officeOptions = offices.map((office) => ({
        value: String(office.id),
        label: office.name,
    }));

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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Employee" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mx-auto w-full max-w-6xl space-y-6">
                    {/* HEADER */}
                    <div>
                        <h1 className="text-2xl font-semibold">Create Employee</h1>
                        <p className="text-muted-foreground text-sm">Add employee details and assign employment information.</p>
                    </div>

                    <form onSubmit={onSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* ================= LEFT: PHOTO ================= */}
                        <div className="space-y-4">
                            <div className="bg-background rounded-xl border p-4 shadow-sm">
                                <h2 className="text-muted-foreground mb-4 text-sm font-medium">Profile Photo</h2>

                                <div className="flex flex-col items-center gap-4">
                                    <input
                                        id="photo"
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        className="hidden"
                                        onChange={handlePhotoChange}
                                    />

                                    <button
                                        type="button"
                                        onClick={() => document.getElementById('photo')?.click()}
                                        className="group relative flex h-48 w-48 items-center justify-center overflow-hidden rounded-full border-2 border-dashed"
                                    >
                                        {photoPreviewUrl ? (
                                            <img src={photoPreviewUrl} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="text-center">
                                                <UploadIcon className="text-muted-foreground mx-auto mb-2 size-6" />
                                                <p className="text-sm font-medium">Upload</p>
                                            </div>
                                        )}
                                    </button>

                                    <div className="flex gap-2">
                                        <Button type="button" size="sm" variant="outline" onClick={() => document.getElementById('photo')?.click()}>
                                            Change
                                        </Button>

                                        {photoPreviewUrl && (
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => {
                                                    setPhotoPreviewUrl(null);
                                                    setData('photo', null);
                                                }}
                                            >
                                                Remove
                                            </Button>
                                        )}
                                    </div>

                                    <p className="text-muted-foreground text-xs">Max 2MB • JPG, PNG, WEBP</p>
                                </div>
                            </div>
                        </div>

                        {/* ================= RIGHT SIDE ================= */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* PERSONAL INFO */}
                            <div className="bg-background space-y-4 rounded-xl border p-6 shadow-sm">
                                <h2 className="text-muted-foreground text-sm font-medium">Personal Information</h2>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="flex w-full flex-col gap-2">
                                        <Label>First Name</Label>
                                        <Input name="first_name" value={data.first_name} onChange={handleInputChange} />
                                    </div>

                                    <div className="flex w-full flex-col gap-2">
                                        <Label>Middle Name</Label>
                                        <Input name="middle_name" value={data.middle_name} onChange={handleInputChange} />
                                    </div>

                                    <div className="flex w-full flex-col gap-2">
                                        <Label>Last Name</Label>
                                        <Input name="last_name" value={data.last_name} onChange={handleInputChange} />
                                    </div>

                                    <div className="flex w-full flex-col gap-2">
                                        <Label>Suffix</Label>
                                        <Select onValueChange={handleSuffixChange}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select suffix" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Jr.">Jr.</SelectItem>
                                                <SelectItem value="Sr.">Sr.</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* EMPLOYMENT INFO */}
                            <div className="bg-background space-y-4 rounded-xl border p-6 shadow-sm">
                                <h2 className="text-muted-foreground text-sm font-medium">Employment Details</h2>

                                <div className="grid gap-4">
                                    <div className="flex w-full flex-col gap-2">
                                        <Label>Position</Label>
                                        <Input name="position" onChange={handleInputChange} />
                                    </div>

                                    <div className="flex w-full flex-col gap-2">
                                        <Label>Office</Label>
                                        <CustomComboBox
                                            items={officeOptions}
                                            placeholder="Select office"
                                            onSelect={(value) => setData('office_id', value ?? '')}
                                        />
                                    </div>

                                    <div className="flex w-full flex-col gap-2">
                                        <Label>Employment Status</Label>
                                        <Select onValueChange={handleEmploymentStatusChange}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select status" />
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
                            </div>

                            {/* ACTIONS */}
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => router.get(route('employees.index'))}>
                                    Cancel
                                </Button>

                                <Button type="submit" className="px-6">
                                    Save Employee
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
