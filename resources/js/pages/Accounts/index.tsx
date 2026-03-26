import { CustomComboBox } from '@/components/CustomComboBox';
import Heading from '@/components/heading';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Shield, User, Users } from 'lucide-react';
import { useState } from 'react';

interface Role {
    id: number;
    name: string;
    display_name: string;
}

interface User {
    id: number;
    name: string;
    username: string;
    is_active: boolean;
    is_super_admin: boolean;
    role_id: number | null;
    role?: Role;
    created_at: string;
}

interface AccountsIndexProps {
    users: User[];
    roles: Role[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Accounts',
        href: '/accounts',
    },
];

export default function AccountsIndex({ users, roles }: AccountsIndexProps) {
    const [updating, setUpdating] = useState<number | null>(null);

    const handleToggle = (userId: number, field: 'is_active' | 'is_super_admin', value: boolean) => {
        setUpdating(userId);
        router.put(
            route('accounts.update', userId),
            { [field]: value },
            {
                preserveScroll: true,
                onFinish: () => setUpdating(null),
            },
        );
    };

    const handleRoleChange = (userId: number, roleId: string | null) => {
        setUpdating(userId);
        router.put(
            route('accounts.update', userId),
            { role_id: roleId ? parseInt(roleId) : null },
            {
                preserveScroll: true,
                onFinish: () => setUpdating(null),
            },
        );
    };

    const roleItems = roles.map((role) => ({
        value: role.id.toString(),
        label: role.display_name,
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Accounts" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading title="Account Management" description="Manage user accounts, toggle active status and admin privileges." />
                    <div className="text-muted-foreground flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        <span className="text-sm">{users.length} accounts</span>
                    </div>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="w-[50px]"></TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Username</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className="text-center">Active</TableHead>
                                <TableHead className="text-center">Super Admin</TableHead>
                                <TableHead className="text-right">Created</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-muted-foreground h-24 text-center">
                                        No accounts found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.id} className={!user.is_active ? 'bg-muted/30' : undefined}>
                                        <TableCell>
                                            <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
                                                {user.is_super_admin ? (
                                                    <Shield className="text-primary h-4 w-4" />
                                                ) : (
                                                    <User className="text-muted-foreground h-4 w-4" />
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{user.name}</div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{user.username}</TableCell>
                                        <TableCell>
                                            <div className="w-[160px]">
                                                <CustomComboBox
                                                    items={roleItems}
                                                    placeholder="Select role..."
                                                    value={user.role_id?.toString() ?? ''}
                                                    onSelect={(value) => handleRoleChange(user.id, value)}
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Switch
                                                checked={user.is_active}
                                                onCheckedChange={(checked) => handleToggle(user.id, 'is_active', checked)}
                                                disabled={updating === user.id}
                                            />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Switch
                                                checked={user.is_super_admin}
                                                onCheckedChange={(checked) => handleToggle(user.id, 'is_super_admin', checked)}
                                                disabled={updating === user.id}
                                            />
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-right">
                                            {new Date(user.created_at).toLocaleDateString('en-PH', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Legend */}
                <div className="text-muted-foreground flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary/10 flex h-6 w-6 items-center justify-center rounded-full">
                            <Shield className="text-primary h-3 w-3" />
                        </div>
                        <span>Admin user</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="bg-primary/10 flex h-6 w-6 items-center justify-center rounded-full">
                            <User className="text-muted-foreground h-3 w-3" />
                        </div>
                        <span>Regular user</span>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
