import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavGroup } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';

interface ExtendedNavItem {
    title: string;
    href: string;
    icon?: any;
    isActive?: boolean;
    hasUnread?: boolean;
}

export function NavMain({ items = [] }: { items: NavGroup[] }) {
    const { isCurrentUrl } = useCurrentUrl();
    const auth = usePage().props.auth as any;
    const currentUserId = auth?.user?.id;
    const [hasUnread, setHasUnread] = useState(false);

    // Fetch initial unread status
    useEffect(() => {
        if (!currentUserId) return;

        const fetchUnreadStatus = async () => {
            try {
                const response = await axios.get('/chat/unread-count');
                setHasUnread((response.data.total_unread || 0) > 0);
            } catch (error) {
                console.error('Failed to fetch unread status:', error);
            }
        };

        fetchUnreadStatus();
    }, [currentUserId]);

    // Listen for real-time chat messages
    useEffect(() => {
        if (!currentUserId) return;

        const channel = window.Echo?.private(`chat.${currentUserId}`);

        if (channel) {
            channel.listen('MessageSent', (data: any) => {
                // Show red dot when receiving a message
                if (data.receiver_id === currentUserId && data.sender_id !== currentUserId) {
                    setHasUnread(true);
                }
            });

            return () => {
                channel.stopListening('MessageSent');
            };
        }
    }, [currentUserId]);

    // Update chat item with unread indicator
    const updatedItems = items.map((group) => ({
        ...group,
        children: group.children?.map((item) => {
            if (item.href === '/chat') {
                return {
                    ...item,
                    hasUnread: hasUnread,
                } as ExtendedNavItem;
            }
            return item as ExtendedNavItem;
        }) as ExtendedNavItem[],
    }));

    return (
        <div className="space-y-2">
            {updatedItems.map((group) => (
                <SidebarGroup key={group.title} className="px-2 py-0">
                    <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
                    <SidebarMenu className="gap-1">
                        {group.children?.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild isActive={isCurrentUrl(item.href)} tooltip={{ children: item.title }} className="">
                                    <Link href={item.href} prefetch preserveState preserveScroll>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                        {item.hasUnread && <span className="ml-auto h-2 w-2 rounded-full bg-red-500" />}
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            ))}
        </div>
    );
}
