import { ChatSidebar } from '@/components/chat-sidebar';
import { ChatWindow } from '@/components/chat-window';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface ChatUser {
    id: number;
    username: string;
    name: string;
    unread_count: number;
    last_message?: string;
    last_message_time?: string;
    is_online?: boolean;
}

export default function ChatIndex({ chatUsers, selectedUserId }: { chatUsers: ChatUser[]; selectedUserId?: number }) {
    const { auth } = usePage().props as any;
    const currentUserId = auth.user.id;

    const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
    const [users, setUsers] = useState<ChatUser[]>(chatUsers);

    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Chat', href: '/chat' }];

    // Auto-select user if provided in URL
    useEffect(() => {
        if (selectedUserId && users.length > 0) {
            const user = users.find((u) => u.id === selectedUserId);
            if (user) {
                setSelectedUser(user);
            }
        }
    }, [selectedUserId, users]);

    // Listen for real-time updates to sidebar
    useEffect(() => {
        const channel = window.Echo?.private(`chat.${currentUserId}`);

        if (channel) {
            channel.listen('MessageSent', (data: any) => {
                // Update sidebar user list with latest message
                setUsers((prevUsers) => {
                    const updatedUsers = prevUsers.map((user) => {
                        if (user.id === data.sender_id || user.id === data.receiver_id) {
                            return {
                                ...user,
                                last_message: data.message,
                                last_message_time: data.created_at,
                                unread_count:
                                    data.receiver_id === currentUserId && data.sender_id !== currentUserId
                                        ? user.unread_count + 1
                                        : user.id === data.sender_id
                                          ? 0
                                          : user.unread_count,
                            };
                        }
                        return user;
                    });

                    // Re-sort: users with latest messages at top
                    return updatedUsers.sort((a, b) => {
                        if (!a.last_message_time && !b.last_message_time) return 0;
                        if (!a.last_message_time) return 1;
                        if (!b.last_message_time) return -1;
                        return new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime();
                    });
                });
            });
        }

        return () => {
            if (channel) {
                channel.stopListening('MessageSent');
            }
        };
    }, [currentUserId]);

    const handleSelectUser = (user: ChatUser) => {
        setSelectedUser(user);
        // Mark messages as read when opening chat
        if (user.unread_count > 0) {
            setUsers((prev) =>
                prev.map((u) => (u.id === user.id ? { ...u, unread_count: 0 } : u))
            );
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Chat" />
            <div className="flex h-[calc(100vh-4rem)]">
                {/* Sidebar - User List */}
                <ChatSidebar
                    users={users}
                    selectedUser={selectedUser}
                    onSelectUser={handleSelectUser}
                    onUsersUpdate={setUsers}
                    currentUserId={currentUserId}
                />

                {/* Main Chat Area or Empty State */}
                {selectedUser ? (
                    <ChatWindow
                        selectedUser={selectedUser}
                        currentUserId={currentUserId}
                        onUsersUpdate={setUsers}
                    />
                ) : (
                    <div className="flex flex-1 items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                        <div className="text-center">
                            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900">
                                <svg className="h-10 w-10 text-teal-600 dark:text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Welcome to Chat</h3>
                            <p className="text-muted-foreground mt-2 text-sm">Select a conversation from the sidebar to start messaging</p>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
