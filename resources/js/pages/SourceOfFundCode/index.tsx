import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

import Heading from '@/components/heading';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusIcon, Search } from 'lucide-react';
import { useState } from 'react';
import { CreateSourceOfFundCode } from './create';
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Source of Fund Code',
        href: '/source-of-fund-code',
    },
];

export default function SourceOfFundCode() {
    const [openCreateDialog, setOpenCreateDialog] = useState(false);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Source of Fund Code" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <Heading title="Source of Fund Code" description="Overview and maintenance of all source of fund code entries." />
                <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <Button onClick={() => setOpenCreateDialog(true)}>
                        <PlusIcon className="h-4 w-4" />
                        Source of Fund Code
                    </Button>

                    <div className="flex w-full items-center gap-2 sm:w-auto">
                        <div className="relative w-full sm:w-[280px]">
                            <Label htmlFor="search" className="sr-only">
                                Search
                            </Label>
                            <Input id="search" placeholder="Search the source of fund code..." className="w-full pl-8" />
                            <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
                        </div>
                    </div>
                </div>
                {openCreateDialog && <CreateSourceOfFundCode open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} />}
            </div>
        </AppLayout>
    );
}
