import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

interface ChatUser {
    id: number;
    username: string;
    name: string;
    unread_count: number;
    last_message?: string;
    last_message_time?: string;
    is_online?: boolean;
}

interface ChatSidebarProps {
    users: ChatUser[];
    selectedUser: ChatUser | null;
    onSelectUser: (user: ChatUser) => void;
    onUsersUpdate: (users: ChatUser[]) => void;
    currentUserId: number;
}

export function ChatSidebar({ users, selectedUser, onSelectUser, onUsersUpdate, currentUserId }: ChatSidebarProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [displayedUsers, setDisplayedUsers] = useState<ChatUser[]>([]);
    const [loadingMoreUsers, setLoadingMoreUsers] = useState(false);
    const [hasMoreUsers, setHasMoreUsers] = useState(true);
    const [userOffset, setUserOffset] = useState(0);
    const userListRef = useRef<HTMLDivElement>(null);

    // Initialize displayed users (first 20)
    useEffect(() => {
        const sorted = [...users].sort((a, b) => {
            if (!a.last_message_time && !b.last_message_time) return 0;
            if (!a.last_message_time) return 1;
            if (!b.last_message_time) return -1;
            return new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime();
        });
        setDisplayedUsers(sorted.slice(0, 20));
        setUserOffset(20);
        setHasMoreUsers(users.length > 20);
    }, [users]);

    // Load more users when scrolling
    const loadMoreUsers = () => {
        if (loadingMoreUsers || !hasMoreUsers) return;

        setLoadingMoreUsers(true);
        setTimeout(() => {
            const nextUsers = users.slice(userOffset, userOffset + 20);
            setDisplayedUsers((prev) => [...prev, ...nextUsers]);
            setUserOffset((prev) => prev + 20);
            setHasMoreUsers(userOffset + 20 < users.length);
            setLoadingMoreUsers(false);
        }, 100);
    };

    const filteredUsers = useMemo(() => {
        return displayedUsers.filter(
            (user) => user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.username.toLowerCase().includes(searchQuery.toLowerCase()),
        );
    }, [displayedUsers, searchQuery]);

    const handleUserListScroll = () => {
        const container = userListRef.current;
        if (!container) return;

        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 50;
        if (isNearBottom && hasMoreUsers && !loadingMoreUsers) {
            loadMoreUsers();
        }
    };

    const formatSidebarTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);

        if (diffInMinutes < 5) {
            return 'Now';
        }

        return new Date(dateStr).toLocaleTimeString('en-PH', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="bg-card flex w-80 flex-col border-r">
            {/* Header */}
            <div className="border-b px-4 py-4">
                <div>
                    <h2 className="text-xl font-bold">Messages</h2>
                    <p className="text-muted-foreground mt-1 text-sm">{users.filter((u) => u.last_message_time).length} conversations</p>
                </div>
                {/* Search */}
                <div className="relative mt-3">
                    <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            {/* User List - Scrollable */}
            <div ref={userListRef} className="flex-1 overflow-y-auto" onScroll={handleUserListScroll}>
                <div className="space-y-1 p-2">
                    {filteredUsers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="bg-muted mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                                <Search className="text-muted-foreground h-6 w-6" />
                            </div>
                            <p className="text-muted-foreground text-sm">No conversations found</p>
                            <p className="text-muted-foreground mt-1 text-xs">Try a different search</p>
                        </div>
                    ) : (
                        filteredUsers.map((user) => {
                            const isSelected = selectedUser?.id === user.id;
                            return (
                                <button
                                    key={user.id}
                                    onClick={() => onSelectUser(user)}
                                    className={`hover:bg-muted/50 flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-all ${
                                        isSelected ? 'bg-muted shadow-sm' : ''
                                    }`}
                                >
                                    <div className="relative shrink-0">
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback className="bg-gradient-to-br from-teal-400 to-teal-600 font-semibold text-white">
                                                {user.name.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        {user.is_online && (
                                            <span className="border-card absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 bg-green-500" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className="truncate text-sm font-medium">{user.name}</span>
                                                {user.unread_count > 0 && <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {user.last_message_time && (
                                                    <span className="text-muted-foreground shrink-0 text-xs">
                                                        {formatSidebarTime(user.last_message_time)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-1 flex items-center justify-between gap-2">
                                            <span className="text-muted-foreground truncate text-xs">
                                                {user.last_message
                                                    ? user.last_message.length > 30
                                                        ? user.last_message.substring(0, 30) + '...'
                                                        : user.last_message
                                                    : 'Start a conversation'}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            );
                        })
                    )}
                    {loadingMoreUsers && (
                        <div className="py-3 text-center">
                            <div className="text-muted-foreground inline-block h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                            <p className="text-muted-foreground mt-1 text-xs">Loading more users...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
