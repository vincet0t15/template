import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavGroup, type NavItem } from '@/types';
import { Link } from '@inertiajs/react';

import AppLogo from './app-logo';
import {
    Banknote,
    Building2,
    Calculator,
    DollarSign,
    Key,
    LayoutGrid,
    LucideMoveVertical,
    Menu,
    MinusSquare,
    Receipt,
    ReceiptCent,
    Settings,
    Shield,
    Truck,
    UserCheck,
    UserRoundPen,
    Wallet,
} from 'lucide-react';
const mainNavItems: NavGroup[] = [
    {
        title: 'General',
        icon: Calculator,
        children: [
            {
                title: 'Dashboard',
                href: '/dashboard',
                icon: LayoutGrid,
            },
            {
                title: 'Employees',
                href: '/employees',
                icon: UserRoundPen,
            },
            {
                title: 'Suppliers',
                href: '/suppliers',
                icon: Truck,
            },
        ],
    },

    {
        title: 'Payroll',
        icon: Calculator,
        children: [
            {
                title: 'Payroll Summary',
                href: '/payroll',
                icon: Wallet,
            },
            {
                title: 'Employee Deductions',
                href: '/employee-deductions',
                icon: Receipt,
            },
        ],
    },
    {
        title: 'Compensation',
        icon: DollarSign,
        children: [
            {
                title: 'Salaries',
                href: '/salaries',
                icon: Banknote,
            },
            {
                title: 'PERA',
                href: '/peras',
                icon: DollarSign,
            },
            {
                title: 'RATA',
                href: '/ratas',
                icon: Calculator,
            },
        ],
    },
    {
        title: 'Settings',
        icon: Settings,
        children: [
            {
                title: 'Offices',
                href: '/settings/offices',
                icon: Building2,
            },
            {
                title: 'Employment Statuses',
                href: '/settings/employment-statuses',
                icon: UserRoundPen,
            },
            {
                title: 'Deduction Types',
                href: '/settings/deduction-types',
                icon: MinusSquare,
            },
            {
                title: 'Document Types',
                href: '/settings/document-types',
                icon: LucideMoveVertical,
            },
            {
                title: 'Claim Types',
                href: '/settings/claim-types',
                icon: ReceiptCent,
            },
            {
                title: 'Accounts',
                href: '/accounts',
                icon: UserCheck,
            },
            {
                title: 'Roles',
                href: '/roles',
                icon: Shield,
            },
            {
                title: 'Permissions',
                href: '/permissions',
                icon: Key,
            },
        ],
    },
];


export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>

                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
