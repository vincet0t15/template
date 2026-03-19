import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { useRef, useState } from 'react';
import { UploadIcon, XIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import type { EmployeeCreateRequest } from '@/types/employee';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import type { EmploymentStatus } from '@/types/employmentStatuses';
import type { Office } from '@/types/office';
import { CustomComboBox } from '@/components/CustomComboBox';
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];


interface EmployeeProps {
    employmentStatuses: EmploymentStatus[];
    offices: Office[];
}
export default function CreateEmployee({ employmentStatuses, offices }: EmployeeProps) {
    const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
    const photoPreviewUrlRef = useRef<string | null>(null);

    const { data, setData } = useForm<EmployeeCreateRequest>({
        first_name: '',
        middle_name: '',
        last_name: '',
        suffix: '',
        contact_number: '',
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-5xl mx-auto">
                    <div className="bg-background shadow rounded-xl p-6 space-y-6">

                        {/* PHOTO */}
                        <div className="space-y-2">
                            <input
                                id="photo"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden"
                                onChange={handlePhotoChange}
                            />

                            <div className="flex justify-center">
                                <button
                                    type="button"
                                    className="relative flex aspect-square w-full max-w-xs cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed bg-background"
                                    onClick={() =>
                                        document.getElementById('photo')?.click()
                                    }
                                >
                                    {photoPreviewUrl ? (
                                        <img
                                            src={photoPreviewUrl}
                                            alt="Preview"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center gap-2 text-center">
                                            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                                                <UploadIcon className="size-5 text-muted-foreground" />
                                            </div>
                                            <div className="text-sm font-semibold">
                                                Upload Photo
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                Click to browse
                                            </div>
                                        </div>
                                    )}
                                </button>
                            </div>

                            <div className="space-y-3 mt-2">
                                <div className="flex flex-wrap gap-2 justify-center">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            document.getElementById('photo')?.click()
                                        }
                                    >
                                        <UploadIcon className="size-4 mr-1" />
                                        {photoPreviewUrl
                                            ? 'Change photo'
                                            : 'Choose photo'}
                                    </Button>

                                    {photoPreviewUrl && (
                                        <Button
                                            className='bg-primary text-white'
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => {
                                                if (photoPreviewUrlRef.current) {
                                                    URL.revokeObjectURL(
                                                        photoPreviewUrlRef.current
                                                    );
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

                                <div className="text-xs text-muted-foreground text-center">
                                    Allowed: jpeg, jpg, png, webp. Max size 2MB.
                                </div>
                            </div>
                        </div>

                        {/* NAME */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="first_name">First Name</Label>
                                <Input
                                    id="first_name"
                                    value={data.first_name}
                                    onChange={(e) =>
                                        setData('first_name', e.target.value)
                                    }
                                    placeholder='First Name'
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <Label htmlFor="middle_name">Middle Name</Label>
                                <Input
                                    id="middle_name"
                                    value={data.middle_name}
                                    onChange={(e) =>
                                        setData('middle_name', e.target.value)
                                    }
                                    placeholder='Middle Name'
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <Label htmlFor="last_name">Last Name</Label>
                                <Input
                                    id="last_name"
                                    value={data.last_name}
                                    onChange={(e) =>
                                        setData('last_name', e.target.value)
                                    }
                                    placeholder='Last Name'
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <Label htmlFor="suffix">Suffix</Label>
                                <Select>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Suffix" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="light">Jr.</SelectItem>
                                            <SelectItem value="dark">Sr.</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* POSITION / OFFICE / STATUS */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            <div className="flex flex-col gap-1">
                                <Label>Position</Label>
                                <Input placeholder='Position' />
                            </div>

                            <div className="flex flex-col gap-1">
                                <Label>Office</Label>
                                <CustomComboBox items={officeOptions} placeholder="Office" onSelect={(value) => console.log(value)} />
                            </div>

                            <div className="flex flex-col gap-1">
                                <Label>Employment Status</Label>
                                <Select>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Employment Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {employmentStatuses.map((status) => (
                                                <SelectItem key={status.id} value={String(status.id)}>
                                                    {status.name}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* SALARY */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            <div className="flex flex-col gap-1">
                                <Label>Salary</Label>
                                <Input placeholder='Salary' />
                            </div>

                            <div className="flex flex-col gap-1">
                                <Label>PERA</Label>
                                <Input placeholder='PERA' />
                            </div>

                            <div className="flex flex-col gap-1">
                                <Label>RATA</Label>
                                <Input placeholder='RATA' />
                            </div>
                        </div>

                        {/* ACTIONS */}
                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline">Cancel</Button>
                            <Button type="submit">Save Employee</Button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
