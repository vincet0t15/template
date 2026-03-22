'use client';

import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import { NavGroup } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function NavMain2({ items = [] }: { items: NavGroup[] }) {
    const page = usePage();
    const activeItemStyles = 'text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100';

    return (
        <NavigationMenu>
            <NavigationMenuList>
                {items.map((group) =>
                    group.children?.length ? (
                        //  WITH CHILDREN (Dropdown)
                        <NavigationMenuItem key={group.title}>
                            <NavigationMenuTrigger className="ml-2 flex items-center gap-2">
                                {group.icon && <group.icon className="h-4 w-4" />}
                                {group.title}
                            </NavigationMenuTrigger>

                            <NavigationMenuContent className="absolute top-full left-0">
                                <ul className="w-[220px] p-2">
                                    {group.children.map((item) => (
                                        <li key={item.title}>
                                            <NavigationMenuLink asChild>
                                                <Link
                                                    href={item.href}
                                                    className={cn(
                                                        'hover:bg-accent hover:text-accent-foreground flex items-center gap-2 rounded-md px-3 py-2 text-sm',
                                                        page.url.startsWith(item.href),
                                                    )}
                                                >
                                                    {item.icon && <item.icon className="h-4 w-4" />}
                                                    <span>{item.title}</span>
                                                </Link>
                                            </NavigationMenuLink>
                                        </li>
                                    ))}
                                </ul>
                            </NavigationMenuContent>
                        </NavigationMenuItem>
                    ) : (
                        //  NO CHILDREN (Direct link)
                        <NavigationMenuItem key={group.title}>
                            <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                                <Link
                                    href={group.href ?? '#'}
                                    className={cn('hover:bg-accent hover:text-accent-foreground flex items-center gap-2 rounded-md p-2 text-sm', {
                                        'bg-accent text-accent-foreground': page.url.startsWith(group.href ?? ''),
                                    })}
                                >
                                    {group.icon && <group.icon className="h-4 w-4" />}
                                    {group.title}
                                </Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                    ),
                )}
            </NavigationMenuList>
        </NavigationMenu>
    );
}
