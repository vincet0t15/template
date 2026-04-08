import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { format } from 'date-fns';
import { EllipsisVertical, Paperclip, Phone, Send, Smile, Trash2, Video } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface ChatUser {
    id: number;
    username: string;
    name: string;
    unread_count: number;
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
}

interface ChatWindowProps {
    selectedUser: ChatUser;
    currentUserId: number;
    onUsersUpdate: (users: ChatUser[]) => void;
}

export function ChatWindow({ selectedUser, currentUserId, onUsersUpdate }: ChatWindowProps) {
    const { auth } = usePage().props as any;
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [lastActivityTime, setLastActivityTime] = useState<Date>(new Date());
    const [messageMenuId, setMessageMenuId] = useState<number | null>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const messageInputRef = useRef<HTMLTextAreaElement>(null);

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
        '😒',
        '😞',
        '😔',
        '😟',
        '😕',
        '🙁',
        '☹️',
        '😣',
        '😖',
        '😫',
        '😩',
        '🥺',
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

    const loadMessages = async (loadOlder = false) => {
        if (loadOlder) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }

        try {
            const beforeId = loadOlder && messages.length > 0 ? messages[0].id : undefined;
            const params = beforeId ? { before: beforeId } : {};

            const response = await axios.get(`/chat/conversations/${selectedUser.id}`, { params });

            if (loadOlder) {
                setMessages((prev) => [...response.data.messages, ...prev]);
                setHasMore(response.data.has_more);
            } else {
                setMessages(response.data.messages);
                setHasMore(response.data.has_more);
                setTimeout(() => {
                    messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
                }, 100);
            }
        } catch (error) {
            console.error('Failed to load messages:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        setMessages([]);
        loadMessages();
    }, [selectedUser.id]);

    const handleScroll = () => {
        const container = messagesContainerRef.current;
        if (!container) return;

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
    }, [loadingMore, hasMore]);

    useEffect(() => {
        const channel = window.Echo?.private(`chat.${currentUserId}`);

        if (channel) {
            channel.listen('MessageSent', (data: any) => {
                const messageTime = new Date(data.created_at);

                if (data.sender_id === selectedUser.id || data.receiver_id === selectedUser.id) {
                    setMessages((prev) => [...prev, data]);
                    requestAnimationFrame(() => {
                        messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
                    });
                    setLastActivityTime(messageTime);
                }
            });
        }

        return () => {
            if (channel) {
                channel.stopListening('MessageSent');
            }
        };
    }, [selectedUser.id, currentUserId]);

    const loadOlderMessages = async () => {
        await loadMessages(true);
    };

    const sendMessage = async () => {
        if ((!newMessage.trim() && !selectedFile) || !selectedUser) return;

        const messageText = newMessage;
        const fileToSend = selectedFile;

        // Clear input immediately for better UX
        setNewMessage('');
        removeFile();
        if (messageInputRef.current) {
            messageInputRef.current.style.height = 'auto';
        }

        // Create optimistic message
        const optimisticMessage: Message = {
            id: Date.now(), // Temporary ID
            sender_id: currentUserId,
            receiver_id: selectedUser.id,
            message: messageText,
            file_path: fileToSend ? 'uploading...' : undefined,
            file_name: fileToSend?.name || undefined,
            file_type: fileToSend?.type || undefined,
            is_read: false,
            created_at: new Date().toISOString(),
            sender: { id: currentUserId, username: auth.user.username },
        };

        // Add message immediately (optimistic update)
        setMessages((prev) => [...prev, optimisticMessage]);
        setLastActivityTime(new Date());

        // Scroll immediately
        requestAnimationFrame(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
        });

        try {
            // Only use FormData if there's a file
            if (fileToSend) {
                const formData = new FormData();
                formData.append('message', messageText);
                formData.append('file', fileToSend);

                const response = await axios.post(`/chat/send/${selectedUser.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

                // Replace optimistic message with real one
                if (response.data.success) {
                    setMessages((prev) => prev.map((msg) => (msg.id === optimisticMessage.id ? response.data.chat : msg)));
                }
            } else {
                // Simple JSON for text-only messages (much faster)
                const response = await axios.post(`/chat/send/${selectedUser.id}`, {
                    message: messageText,
                });

                // Replace optimistic message with real one
                if (response.data.success) {
                    setMessages((prev) => prev.map((msg) => (msg.id === optimisticMessage.id ? response.data.chat : msg)));
                }
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            // Remove optimistic message on error
            setMessages((prev) => prev.filter((msg) => msg.id !== optimisticMessage.id));
            // Restore input
            setNewMessage(messageText);
            alert('Failed to send message');
        }
    };

    const deleteMessage = async (messageId: number) => {
        try {
            await axios.delete(`/chat/messages/${messageId}`);
            setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
            setMessageMenuId(null);
        } catch (error) {
            console.error('Failed to delete message:', error);
            alert('Failed to delete message');
        }
    };

    const removeFile = () => {
        setSelectedFile(null);
        setFilePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const autoResizeTextarea = () => {
        const textarea = messageInputRef.current;
        if (!textarea) return;
        textarea.style.height = 'auto';
        const newHeight = Math.min(textarea.scrollHeight, 48);
        textarea.style.height = `${newHeight}px`;
    };

    const insertEmoji = (emoji: string) => {
        setNewMessage((prev) => prev + emoji);
        setShowEmojiPicker(false);
        setTimeout(() => {
            messageInputRef.current?.focus();
        }, 100);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 25 * 1024 * 1024) {
                alert('File size must be less than 25MB');
                return;
            }
            setSelectedFile(file);
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFilePreview(reader.result as string);
                };
                reader.readAsDataURL(file);
            }
            setTimeout(() => {
                messageInputRef.current?.focus();
            }, 100);
        }
    };

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

    useEffect(() => {
        return () => {
            if (filePreview) {
                URL.revokeObjectURL(filePreview);
            }
        };
    }, [filePreview]);

    const formatBubbleTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString('en-PH', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getActivityStatus = () => {
        const now = new Date();
        const diffInMinutes = (now.getTime() - lastActivityTime.getTime()) / (1000 * 60);
        return diffInMinutes < 5;
    };

    return (
        <div className="bg-background flex flex-1 flex-col">
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-teal-500 text-white">{selectedUser.name.charAt(0).toUpperCase()}</AvatarFallback>
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
                        <EllipsisVertical className="h-4 w-4" />
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
                            {loadingMore && <div className="text-muted-foreground py-2 text-center text-xs">Loading older messages...</div>}
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
                                            new Date(msg.created_at).toDateString() !== new Date(messages[index - 1].created_at).toDateString();

                                        const emojiRegex =
                                            /^(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F)(?:\s*(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F)){0,3}$/u;
                                        const isEmojiOnly = msg.message && !msg.file_path && emojiRegex.test(msg.message.trim());

                                        return (
                                            <div key={msg.id}>
                                                {showDate && (
                                                    <div className="my-4 flex items-center justify-center">
                                                        <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs">
                                                            {new Date(msg.created_at).toDateString() === new Date().toDateString()
                                                                ? 'Today'
                                                                : new Date(msg.created_at).toDateString() ===
                                                                    new Date(Date.now() - 86400000).toDateString()
                                                                  ? 'Yesterday'
                                                                  : format(new Date(msg.created_at), 'MMMM dd, yyyy')}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                                    <div
                                                        className={`group relative flex max-w-[70%] flex-col ${isOwn ? 'items-end' : 'items-start'}`}
                                                    >
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
                                                        {isEmojiOnly || (msg.file_path && msg.file_type?.startsWith('image/') && !msg.message) ? (
                                                            <div>
                                                                {msg.message && <p className="text-4xl leading-tight">{msg.message}</p>}
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
                                                                className={`rounded-2xl px-4 py-2.5 ${isOwn ? 'bg-teal-600 text-white' : 'bg-muted'}`}
                                                            >
                                                                {msg.message && <p className="text-sm">{msg.message}</p>}
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
                                                                                className="flex items-center gap-2 rounded-lg bg-white/10 p-2 hover:bg-white/20"
                                                                            >
                                                                                <svg
                                                                                    className="h-4 w-4"
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
                                                                                <span className="truncate text-xs">{msg.file_name}</span>
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
                {filePreview && (
                    <div className="relative mb-3">
                        <img src={filePreview} alt="Preview" className="max-h-32 rounded-lg" />
                        <button onClick={removeFile} className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}
                {selectedFile && !filePreview && (
                    <div className="bg-muted mb-3 flex items-center gap-2 rounded-lg px-3 py-2">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                            />
                        </svg>
                        <span className="truncate text-sm">{selectedFile.name}</span>
                        <button onClick={removeFile} className="ml-auto rounded-full p-1 hover:bg-gray-200">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}
                <div className="flex items-end gap-2">
                    <div className="relative" ref={emojiPickerRef}>
                        {showEmojiPicker && (
                            <div className="bg-card absolute bottom-14 left-0 grid w-72 grid-cols-8 gap-1 rounded-lg border p-2 shadow-lg">
                                {emojis.map((emoji) => (
                                    <button
                                        key={emoji}
                                        onClick={() => insertEmoji(emoji)}
                                        className="flex h-9 w-9 cursor-pointer items-center justify-center text-xl hover:scale-125"
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        )}
                        <div className="flex gap-1">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                className="hidden"
                                accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.zip,.rar"
                            />
                            <Button variant="ghost" size="icon" className="shrink-0" onClick={() => fileInputRef.current?.click()}>
                                <Paperclip className="text-muted-foreground h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="shrink-0" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                                <Smile className="text-muted-foreground h-4 w-4" />
                            </Button>
                        </div>
                    </div>
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
                    <Button onClick={sendMessage} disabled={!newMessage.trim() && !selectedFile} className="shrink-0">
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
