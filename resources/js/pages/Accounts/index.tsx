import Heading from '@/components/heading';
import Pagination from '@/components/paginationData';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { PaginatedDataResponse } from '@/types/pagination';
import { Head, router, useForm } from '@inertiajs/react';
import { Edit, MessageSquare, Shield, User, Users } from 'lucide-react';
import { useState } from 'react';

interface Role {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    username: string;
    is_active: boolean;
    is_online: boolean;
    last_seen_formatted: string | null;
    roles: (string | { id: number; name: string })[];
    created_at: string;
}

interface AccountsIndexProps {
    users: PaginatedDataResponse<User>;
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
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const roleForm = useForm({
        roles: [] as string[],
    });

    const handleToggle = (userId: number, field: 'is_active', value: boolean) => {
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

    const openRoleDialog = (user: User) => {
        setEditingUser(user);
        const roleNames = user.roles.map((role) => (typeof role === 'string' ? role : role.name));
        roleForm.setData({
            roles: roleNames,
        });
    };

    const handleRoleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        roleForm.put(route('accounts.update', editingUser.id), {
            onSuccess: () => {
                setEditingUser(null);
                roleForm.reset();
            },
        });
    };

    const toggleRole = (roleName: string) => {
        const current = roleForm.data.roles;
        const updated = current.includes(roleName) ? current.filter((r) => r !== roleName) : [...current, roleName];
        roleForm.setData('roles', updated);
    };

    const startChat = (userId: number) => {
        router.visit(`/chat?user=${userId}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Accounts" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading title="Account Management" description="Manage user accounts, toggle active status and admin privileges." />
                    <div className="text-muted-foreground flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        <span className="text-sm">{users.data.length} accounts</span>
                    </div>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="w-[50px]"></TableHead>
                                <TableHead>Username</TableHead>
                                <TableHead>Roles</TableHead>
                                <TableHead className="text-center">Active</TableHead>
                                <TableHead className="text-right">Created</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-muted-foreground h-24 text-center">
                                        No accounts found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.data.map((user) => (
                                    <TableRow key={user.id} className={!user.is_active ? 'bg-muted/30' : undefined}>
                                        <TableCell>
                                            <button
                                                onClick={() => startChat(user.id)}
                                                className="group flex items-center gap-2 transition-opacity hover:opacity-80"
                                                title={`Chat with ${user.name}`}
                                            >
                                                <div className="relative">
                                                    <Avatar className="h-10 w-10 border-2 border-slate-200 transition-colors group-hover:border-teal-400">
                                                        <AvatarFallback className="bg-gradient-to-br from-teal-400 to-teal-600 text-sm font-semibold text-white">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    {user.is_online && (
                                                        <span className="border-background absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 bg-green-500"></span>
                                                    )}
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-sm font-medium">{user.name}</div>
                                                    {user.is_online ? (
                                                        <div className="flex items-center gap-1 text-xs text-green-600">
                                                            <span className="relative flex h-2 w-2">
                                                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                                                                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                                                            </span>
                                                            Online
                                                        </div>
                                                    ) : (
                                                        <div className="text-muted-foreground text-xs">Offline</div>
                                                    )}
                                                </div>
                                                <MessageSquare className="text-muted-foreground ml-2 h-4 w-4 transition-colors group-hover:text-teal-600" />
                                            </button>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{user.username}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="flex flex-wrap gap-1">
                                                    {user.roles.map((role) => {
                                                        const roleName = typeof role === 'string' ? role : role.name;
                                                        return (
                                                            <Badge key={roleName} variant="secondary" className="text-xs capitalize">
                                                                {roleName.replace(/_/g, ' ')}
                                                            </Badge>
                                                        );
                                                    })}
                                                    {user.roles.length === 0 && <span className="text-muted-foreground text-xs">No roles</span>}
                                                </div>
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openRoleDialog(user)}>
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Switch
                                                checked={user.is_active}
                                                onCheckedChange={(checked) => handleToggle(user.id, 'is_active', checked)}
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
                        <span>Has admin role</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="bg-primary/10 flex h-6 w-6 items-center justify-center rounded-full">
                            <User className="text-muted-foreground h-3 w-3" />
                        </div>
                        <span>Regular user</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
                        </span>
                        <span>Online now</span>
                    </div>
                </div>

                {/* Role Assignment Dialog */}
                <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Assign Roles</DialogTitle>
                            <DialogDescription>Manage roles for {editingUser?.name}</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleRoleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Roles</Label>
                                <div className="grid grid-cols-2 gap-3 rounded-md border p-4">
                                    {roles.map((role) => (
                                        <div key={role.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`role-${role.id}`}
                                                checked={roleForm.data.roles.includes(role.name)}
                                                onCheckedChange={() => toggleRole(role.name)}
                                            />
                                            <Label htmlFor={`role-${role.id}`} className="text-sm font-normal capitalize">
                                                {role.name.replace(/_/g, ' ')}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={roleForm.processing}>
                                    Save Roles
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <div>
                    <Pagination data={users} />
                </div>
            </div>
        </AppLayout>
    );
}
