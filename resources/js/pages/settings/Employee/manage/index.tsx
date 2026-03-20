import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { LayoutDashboard, FileText, PieChart, Settings, CoinsIcon } from "lucide-react"
import { Compensation } from './compensation';
import Overview from './overview';
import { RateTable } from './rata';
import { PeraTable } from './pera';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">

                {/* --- PROFESSIONAL HEADER SECTION --- */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <Avatar className="h-24 w-24 rounded-2xl border-4 border-background shadow-xl">
                            <AvatarImage src="" alt="Juan Dela Cruz" className="object-cover" />
                            <AvatarFallback className="rounded-2xl bg-slate-100 text-xl">JD</AvatarFallback>
                        </Avatar>

                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Juan Dela Cruz</h1>
                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                                    Active
                                </Badge>
                            </div>
                            <p className="text-slate-500 font-medium flex items-center gap-2">
                                Permanent Employee <span className="text-slate-300">•</span> ID: #10293
                            </p>
                            <div className="pt-1">
                                <span className="text-2xl font-bold text-slate-900">₱ 25,000</span>
                                <span className="text-slate-500 text-sm ml-1">/ month</span>
                            </div>
                        </div>
                    </div>
                </header>

                <Separator className="bg-slate-200/60" />

                {/* --- TABS SECTION --- */}
                <Tabs defaultValue="overview" className="space-y-6">
                    <div className="flex items-center justify-between overflow-x-auto pb-1">
                        <TabsList >
                            <TabsTrigger value="overview" >
                                <LayoutDashboard className="h-4 w-4" /> Overview
                            </TabsTrigger>
                            <TabsTrigger value="Compensation" >
                                <CoinsIcon className="h-4 w-4" /> Compensation
                            </TabsTrigger>
                            <TabsTrigger value="reports" >
                                <FileText className="h-4 w-4" /> Reports
                            </TabsTrigger>
                            <TabsTrigger value="settings" >
                                <Settings className="h-4 w-4" /> Settings
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="overview" className="mt-0 outline-none">
                        <Overview />
                    </TabsContent>
                    <TabsContent value="Compensation" className="mt-0 outline-none">
                        <Compensation />
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}