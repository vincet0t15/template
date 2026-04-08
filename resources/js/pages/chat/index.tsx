import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import axios from 'axios';
import { format, formatDistanceToNow } from 'date-fns';
import { EllipsisVertical, MoreVertical, Paperclip, Phone, Search, Send, Smile, Trash2, Video } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

interface ChatUser {
    id: number;
    username: string;
    name: string;
    unread_count: number;
    total_messages?: number;
    last_message?: string;
    last_message_time?: string;
    is_online?: boolean;
}

interface Message {
    id: number;
    sender_id: number;
    receiver_id: number;
    message: string;
    file_path?: string;
    file_name?: string;
    file_type?: string;
    is_read: boolean;
    read_at?: string;
    created_at: string;
    sender?: { id: number; username: string };
    receiver?: { id: number; username: string };
    can_delete?: boolean;
}

export default function ChatIndex({ chatUsers, selectedUserId }: { chatUsers: ChatUser[]; selectedUserId?: number }) {
    const { auth } = usePage().props as any;
    const currentUserId = auth.user.id;

    const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState<ChatUser[]>(chatUsers);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [lastActivityTime, setLastActivityTime] = useState<Date>(new Date());
    const [messageMenuId, setMessageMenuId] = useState<number | null>(null);
    const [currentTime, setCurrentTime] = useState<Date>(new Date());
    const [displayedUsers, setDisplayedUsers] = useState<ChatUser[]>([]);
    const [loadingMoreUsers, setLoadingMoreUsers] = useState(false);
    const [hasMoreUsers, setHasMoreUsers] = useState(true);
    const [userOffset, setUserOffset] = useState(0);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const userListRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const messageInputRef = useRef<HTMLTextAreaElement>(null);

    // Common emojis
    const emojis = [
        '😀',
        '😃',
        '😄',
        '😁',
        '😆',
        '😅',
        '🤣',
        '😂',
        '😊',
        '😇',
        '🙂',
        '🙃',
        '😉',
        '😌',
        '😍',
        '🥰',
        '😘',
        '😗',
        '😙',
        '😚',
        '😋',
        '😛',
        '😝',
        '😜',
        '🤪',
        '🤨',
        '🧐',
        '🤓',
        '😎',
        '🤩',
        '🥳',
        '😏',
        '👍',
        '👎',
        '👏',
        '🙌',
        '🤝',
        '❤️',
        '🔥',
        '⭐',
        '🎉',
        '🎊',
        '💯',
        '✅',
        '❌',
        '⚡',
        '💪',
        '🙏',
        '😢',
        '😭',
        '😤',
        '😠',
        '😡',
        '🤬',
        '😱',
        '😨',
        '👀',
        '💬',
        '💭',
        '🗯️',
        '☕',
        '🍕',
        '🎵',
        '🎶',
    ];

    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Chat', href: '/chat' }];

    // Initialize displayed users (first 20)
    useEffect(() => {
        // Users are already sorted from backend, just take first 20
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

        // Simulate loading delay for smooth UX
        setTimeout(() => {
            const nextUsers = users.slice(userOffset, userOffset + 20);
            setDisplayedUsers((prev) => [...prev, ...nextUsers]);
            setUserOffset((prev) => prev + 20);
            setHasMoreUsers(userOffset + 20 < users.length);
            setLoadingMoreUsers(false);
        }, 100);
    };

    useEffect(() => {
        if (selectedUserId && users.length > 0) {
            const user = users.find((u) => u.id === selectedUserId);
            if (user) {
                setSelectedUser(user);
            }
        }
    }, [selectedUserId, users]);

    useEffect(() => {
        if (selectedUser) {
            loadMessages(selectedUser.id);
        }
    }, [selectedUser]);

    // Handle scroll to load older messages
    const handleScroll = () => {
        const container = messagesContainerRef.current;
        if (!container) return;

        // Check if scrolled to top (with 50px threshold)
        if (container.scrollTop < 50 && !loadingMore && hasMore) {
            loadOlderMessages();
        }
    };

    useEffect(() => {
        const container = messagesContainerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, [loadingMore, hasMore, messages]);

    useEffect(() => {
        const channel = window.Echo?.private(`chat.${currentUserId}`);

        if (channel) {
            channel.listen('MessageSent', (data: any) => {
                // Update messages if chatting with this user
                if (selectedUser && (data.sender_id === selectedUser.id || data.receiver_id === selectedUser.id)) {
                    setMessages((prev) => [...prev, data]);
                    // Always scroll to bottom for new messages
                    setTimeout(() => {
                        messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
                    }, 100);
                    // Update last activity time
                    setLastActivityTime(new Date());
                }

                // Update sidebar user list with latest message
                setUsers((prevUsers) => {
                    const updatedUsers = prevUsers.map((user) => {
                        if (user.id === data.sender_id || user.id === data.receiver_id) {
                            return {
                                ...user,
                                last_message: data.message,
                                last_message_time: data.created_at,
                                total_messages: (user.total_messages || 0) + 1,
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
                    const sortedUsers = updatedUsers.sort((a, b) => {
                        if (!a.last_message_time && !b.last_message_time) return 0;
                        if (!a.last_message_time) return 1;
                        if (!b.last_message_time) return -1;
                        return new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime();
                    });

                    // Update displayed users as well (for infinite scroll)
                    setDisplayedUsers(sortedUsers.slice(0, userOffset));

                    return sortedUsers;
                });
            });
        }

        return () => {
            if (channel) {
                channel.stopListening('MessageSent');
            }
        };
    }, [selectedUser, currentUserId]);

    const loadMessages = async (userId: number, loadOlder = false) => {
        if (loadOlder) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }

        try {
            const beforeId = loadOlder && messages.length > 0 ? messages[0].id : undefined;
            const params = beforeId ? { before: beforeId } : {};

            const response = await axios.get(`/chat/conversations/${userId}`, { params });

            if (loadOlder) {
                // Prepend older messages
                setMessages((prev) => [...response.data.messages, ...prev]);
                setHasMore(response.data.has_more);
            } else {
                // Initial load - always scroll to bottom
                setMessages(response.data.messages);
                setHasMore(response.data.has_more);
                // Force scroll to bottom after messages render
                setTimeout(() => {
                    messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
                }, 150);
            }
        } catch (error) {
            console.error('Failed to load messages:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const loadOlderMessages = async () => {
        if (loadingMore || !hasMore || !selectedUser) return;

        // Save current scroll position
        const container = messagesContainerRef.current;
        if (!container) return;

        const previousScrollHeight = container.scrollHeight;
        const previousScrollTop = container.scrollTop;

        await loadMessages(selectedUser.id, true);

        // Restore scroll position after loading
        setTimeout(() => {
            if (container) {
                const newScrollHeight = container.scrollHeight;
                const heightDifference = newScrollHeight - previousScrollHeight;
                container.scrollTop = previousScrollTop + heightDifference;
            }
        }, 0);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (25MB max)
        if (file.size > 25 * 1024 * 1024) {
            alert('File size must be less than 25MB');
            return;
        }

        setSelectedFile(file);

        // Create preview for images
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFilePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setFilePreview(null);
        }

        // Focus back to message input
        setTimeout(() => {
            messageInputRef.current?.focus();
        }, 100);
    };

    const removeFile = () => {
        setSelectedFile(null);
        setFilePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const deleteMessage = async (messageId: number) => {
        try {
            await axios.delete(`/chat/messages/${messageId}`);
            // Remove message from local state
            setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
            setMessageMenuId(null);
        } catch (error) {
            console.error('Failed to delete message:', error);
            alert('Failed to delete message');
        }
    };

    const autoResizeTextarea = () => {
        const textarea = messageInputRef.current;
        if (!textarea) return;

        // Reset height to auto to get the correct scrollHeight
        textarea.style.height = 'auto';
        // Set new height based on content, with max limit of 2 rows (approx 48px)
        const newHeight = Math.min(textarea.scrollHeight, 48);
        textarea.style.height = `${newHeight}px`;
    };

    const insertEmoji = (emoji: string) => {
        setNewMessage((prev) => prev + emoji);
        setShowEmojiPicker(false);
        // Focus back to message input
        setTimeout(() => {
            messageInputRef.current?.focus();
        }, 100);
    };

    // Close emoji picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false);
            }
        };

        if (showEmojiPicker) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showEmojiPicker]);

    // Update activity status every minute
    useEffect(() => {
        const interval = setInterval(() => {
            // Force re-render to update activity status
            setLastActivityTime(new Date(lastActivityTime));
        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, [lastActivityTime]);

    // Close message menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            if (messageMenuId) {
                setMessageMenuId(null);
            }
        };

        if (messageMenuId) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [messageMenuId]);

    // Update sidebar times every minute
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000); // Update every minute

        return () => clearInterval(interval);
    }, []);

    const sendMessage = async () => {
        if ((!newMessage.trim() && !selectedFile) || !selectedUser) return;

        try {
            const formData = new FormData();
            if (newMessage.trim()) {
                formData.append('message', newMessage);
            }
            if (selectedFile) {
                formData.append('file', selectedFile);
            }

            const response = await axios.post(`/chat/send/${selectedUser.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setMessages((prev) => [...prev, response.data.chat]);

            // Update sidebar with the sent message
            setUsers((prevUsers) => {
                const updatedUsers = prevUsers.map((user) => {
                    if (user.id === selectedUser.id) {
                        return {
                            ...user,
                            last_message: selectedFile ? `📎 ${selectedFile.name}` : newMessage,
                            last_message_time: response.data.chat.created_at,
                            unread_count: 0,
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

            setNewMessage('');
            removeFile();
            // Reset textarea height
            if (messageInputRef.current) {
                messageInputRef.current.style.height = 'auto';
            }
            // Update last activity time
            setLastActivityTime(new Date());
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
            }, 100);
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
    };

    const getActivityStatus = () => {
        const now = new Date();
        const diffInMinutes = (now.getTime() - lastActivityTime.getTime()) / (1000 * 60);
        return diffInMinutes < 5; // Active if less than 5 minutes
    };

    const formatSidebarTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);

        // If less than 5 minutes, show "Now"
        if (diffInMinutes < 5) {
            return 'Now';
        }

        // Otherwise show formatted time
        return formatBubbleTime(dateStr);
    };

    const formatMessageTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return formatDistanceToNow(date, { addSuffix: true });
        }
        return format(date, 'MMM dd');
    };

    const formatBubbleTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString('en-PH', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const filteredUsers = useMemo(() => {
        const filtered = displayedUsers.filter(
            (user) => user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.username.toLowerCase().includes(searchQuery.toLowerCase()),
        );
        return filtered;
    }, [displayedUsers, searchQuery]);

    const handleUserListScroll = () => {
        const container = userListRef.current;
        if (!container) return;

        // Check if scrolled to bottom (within 50px)
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 50;

        if (isNearBottom && hasMoreUsers && !loadingMoreUsers) {
            loadMoreUsers();
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Chat" />
            <div className="flex h-[calc(100vh-4rem)]">
                {/* Sidebar - Inbox List */}
                <div className="bg-card flex w-80 flex-col border-r">
                    {/* Header */}
                    <div className="border-b p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold">Messages</h2>
                                <p className="text-muted-foreground text-xs">{filteredUsers.length} conversations</p>
                            </div>
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
                                            onClick={() => setSelectedUser(user)}
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
                                                        {user.total_messages && user.total_messages > 0 && (
                                                            <span className="text-muted-foreground shrink-0 text-[10px]">{user.total_messages}</span>
                                                        )}
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

                {/* Main Chat Area */}
                <div className="bg-background flex flex-1 flex-col">
                    {selectedUser ? (
                        <>
                            {/* Chat Header */}
                            <div className="flex items-center justify-between border-b px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback className="bg-teal-500 text-white">
                                                {selectedUser.name.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        {selectedUser.is_online && (
                                            <span className="border-background absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 bg-green-500" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold">{selectedUser.name}</p>
                                        <p className="text-muted-foreground text-xs">
                                            {selectedUser.is_online
                                                ? getActivityStatus()
                                                    ? 'Active now'
                                                    : formatBubbleTime(lastActivityTime.toISOString())
                                                : 'Offline'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon">
                                        <Phone className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon">
                                        <Video className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Messages */}
                            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto">
                                <div className="space-y-4 p-4">
                                    {loading ? (
                                        <div className="text-muted-foreground py-8 text-center text-sm">Loading messages...</div>
                                    ) : (
                                        <>
                                            {loadingMore && (
                                                <div className="text-muted-foreground py-2 text-center text-xs">Loading older messages...</div>
                                            )}
                                            {messages.length === 0 ? (
                                                <div className="py-8 text-center">
                                                    <p className="text-muted-foreground text-sm">No messages yet</p>
                                                    <p className="text-muted-foreground mt-1 text-xs">Send a message to start the conversation</p>
                                                </div>
                                            ) : (
                                                <>
                                                    {messages.map((msg, index) => {
                                                        const isOwn = msg.sender_id === currentUserId;
                                                        const showDate =
                                                            index === 0 ||
                                                            new Date(msg.created_at).toDateString() !==
                                                                new Date(messages[index - 1].created_at).toDateString();

                                                        // Format date label
                                                        const messageDate = new Date(msg.created_at);
                                                        const today = new Date();
                                                        const yesterday = new Date(today);
                                                        yesterday.setDate(yesterday.getDate() - 1);

                                                        let dateLabel = format(messageDate, 'MMMM dd, yyyy');
                                                        if (messageDate.toDateString() === today.toDateString()) {
                                                            dateLabel = 'Today';
                                                        } else if (messageDate.toDateString() === yesterday.toDateString()) {
                                                            dateLabel = 'Yesterday';
                                                        }

                                                        // Check if message is emoji-only (1-4 emojis, no other text including numbers)
                                                        const emojiRegex =
                                                            /^(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F)(?:\s*(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F)){0,3}$/u;
                                                        const isEmojiOnly = msg.message && !msg.file_path && emojiRegex.test(msg.message.trim());

                                                        return (
                                                            <div key={msg.id}>
                                                                {showDate && (
                                                                    <div className="mt-2 mb-4 flex items-center justify-center">
                                                                        <div className="bg-card rounded-full border px-4 py-1.5 shadow-sm">
                                                                            <span className="text-muted-foreground text-xs font-medium">
                                                                                {dateLabel}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                                                    <div
                                                                        className={`group relative flex max-w-[70%] flex-col ${isOwn ? 'items-end' : 'items-start'}`}
                                                                    >
                                                                        {/* Message options menu - only for own messages */}
                                                                        {isOwn && (
                                                                            <div className="absolute -top-1 right-0">
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        setMessageMenuId(messageMenuId === msg.id ? null : msg.id);
                                                                                    }}
                                                                                    className="rounded-full bg-white p-1 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hover:bg-gray-100"
                                                                                >
                                                                                    <EllipsisVertical className="h-4 w-4 text-gray-600" />
                                                                                </button>
                                                                                {messageMenuId === msg.id && (
                                                                                    <div className="absolute right-0 z-10 mt-1 w-32 rounded-lg border bg-white py-1 shadow-lg">
                                                                                        <button
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                if (confirm('Delete this message?')) {
                                                                                                    deleteMessage(msg.id);
                                                                                                }
                                                                                            }}
                                                                                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                                                                                        >
                                                                                            <Trash2 className="h-4 w-4" />
                                                                                            <span>Delete</span>
                                                                                        </button>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                        {/* Message bubble - no background for emoji-only or image-only */}
                                                                        {isEmojiOnly ||
                                                                        (msg.file_path && msg.file_type?.startsWith('image/') && !msg.message) ? (
                                                                            <div>
                                                                                {msg.message && (
                                                                                    <p className="text-4xl leading-tight">{msg.message}</p>
                                                                                )}
                                                                                {/* Image attachment without background */}
                                                                                {msg.file_path && msg.file_type?.startsWith('image/') && (
                                                                                    <a
                                                                                        href={`/storage/${msg.file_path}`}
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                        className="block"
                                                                                    >
                                                                                        <img
                                                                                            src={`/storage/${msg.file_path}`}
                                                                                            alt={msg.file_name}
                                                                                            className="max-w-full cursor-pointer rounded-lg hover:opacity-90"
                                                                                            style={{ maxHeight: '400px' }}
                                                                                        />
                                                                                    </a>
                                                                                )}
                                                                            </div>
                                                                        ) : (
                                                                            <div
                                                                                className={`rounded-2xl px-4 py-2.5 ${
                                                                                    isOwn ? 'bg-teal-600 text-white' : 'bg-muted'
                                                                                }`}
                                                                            >
                                                                                {msg.message && <p className="text-sm">{msg.message}</p>}

                                                                                {/* File attachment display */}
                                                                                {msg.file_path && (
                                                                                    <div className="mt-2">
                                                                                        {msg.file_type?.startsWith('image/') ? (
                                                                                            <a
                                                                                                href={`/storage/${msg.file_path}`}
                                                                                                target="_blank"
                                                                                                rel="noopener noreferrer"
                                                                                                className="block"
                                                                                            >
                                                                                                <img
                                                                                                    src={`/storage/${msg.file_path}`}
                                                                                                    alt={msg.file_name}
                                                                                                    className="max-w-full cursor-pointer rounded-lg hover:opacity-90"
                                                                                                    style={{ maxHeight: '300px' }}
                                                                                                />
                                                                                            </a>
                                                                                        ) : (
                                                                                            <a
                                                                                                href={`/storage/${msg.file_path}`}
                                                                                                target="_blank"
                                                                                                rel="noopener noreferrer"
                                                                                                className={`flex items-center gap-2 rounded-lg p-2 ${
                                                                                                    isOwn
                                                                                                        ? 'bg-teal-700 hover:bg-teal-800'
                                                                                                        : 'bg-background hover:bg-muted'
                                                                                                } transition-colors`}
                                                                                            >
                                                                                                <svg
                                                                                                    className="h-5 w-5"
                                                                                                    fill="none"
                                                                                                    viewBox="0 0 24 24"
                                                                                                    stroke="currentColor"
                                                                                                >
                                                                                                    <path
                                                                                                        strokeLinecap="round"
                                                                                                        strokeLinejoin="round"
                                                                                                        strokeWidth={2}
                                                                                                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                                                                                                    />
                                                                                                </svg>
                                                                                                <span className="truncate text-xs">
                                                                                                    {msg.file_name}
                                                                                                </span>
                                                                                            </a>
                                                                                        )}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                        <div className="mt-1 flex items-center gap-1 px-1">
                                                                            <span className="text-muted-foreground text-[10px]">
                                                                                {format(new Date(msg.created_at), 'MMM dd, yyyy')}
                                                                            </span>
                                                                            <span className="text-muted-foreground text-[10px]">
                                                                                {formatBubbleTime(msg.created_at)}
                                                                            </span>
                                                                            {isOwn && msg.is_read && (
                                                                                <span className="text-[10px] font-medium text-teal-600">• Seen</span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                    <div ref={messagesEndRef} />
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Message Input */}
                            <div className="border-t p-4">
                                {/* File Preview */}
                                {selectedFile && (
                                    <div className="bg-muted/50 mb-3 flex items-start gap-2 rounded-lg border p-3">
                                        {filePreview ? (
                                            <div className="relative">
                                                <img src={filePreview} alt="Preview" className="h-20 w-20 rounded object-cover" />
                                                <button
                                                    onClick={removeFile}
                                                    className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-1 items-center gap-2">
                                                <Paperclip className="text-muted-foreground h-5 w-5" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium">{selectedFile.name}</p>
                                                    <p className="text-muted-foreground text-xs">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                                                </div>
                                                <button onClick={removeFile} className="text-muted-foreground text-xl font-bold hover:text-red-500">
                                                    ×
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="relative">
                                    {/* Emoji Picker */}
                                    {showEmojiPicker && (
                                        <div
                                            ref={emojiPickerRef}
                                            className="bg-card absolute bottom-16 left-0 mb-2 rounded-lg border p-3 shadow-lg"
                                            style={{ zIndex: 1000 }}
                                        >
                                            <div className="grid grid-cols-8 gap-1">
                                                {emojis.map((emoji, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => insertEmoji(emoji)}
                                                        className="hover:bg-muted flex h-8 w-8 items-center justify-center rounded text-lg transition-colors"
                                                    >
                                                        {emoji}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
                                        />
                                        <Button variant="ghost" size="icon" className="shrink-0" onClick={() => fileInputRef.current?.click()}>
                                            <Paperclip className="text-muted-foreground h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="shrink-0" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                                            <Smile className="text-muted-foreground h-4 w-4" />
                                        </Button>
                                        <Textarea
                                            ref={messageInputRef}
                                            value={newMessage}
                                            onChange={(e) => {
                                                setNewMessage(e.target.value);
                                                autoResizeTextarea();
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    // Send if there's a message OR a file attached
                                                    if (newMessage.trim() || selectedFile) {
                                                        sendMessage();
                                                    }
                                                }
                                            }}
                                            placeholder={selectedFile ? 'Add a message (optional)...' : 'Type a message...'}
                                            className="flex-1 resize-none overflow-y-auto"
                                            rows={1}
                                            style={{ minHeight: '38px' }}
                                        />
                                        <Button
                                            onClick={sendMessage}
                                            disabled={!newMessage.trim() && !selectedFile}
                                            size="icon"
                                            className="shrink-0 bg-teal-600 hover:bg-teal-700"
                                        >
                                            <Send className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-1 items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                            <div className="text-center">
                                <div className="bg-card mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full shadow-sm">
                                    <Send className="text-muted-foreground h-10 w-10" />
                                </div>
                                <h3 className="mb-2 text-xl font-semibold">Welcome to Messages</h3>
                                <p className="text-muted-foreground text-sm">Select a conversation from the sidebar to start chatting</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
