"use client"

import * as React from "react"
import { Link, usePage } from "@inertiajs/react"
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { NavGroup } from "@/types"
import { cn } from "@/lib/utils"

export function NavMain2({ items = [] }: { items: NavGroup[] }) {
    const page = usePage()

    return (
        <NavigationMenu>
            <NavigationMenuList>
                {items.map((group) =>
                    group.children?.length ? (
                        //  WITH CHILDREN (Dropdown)
                        <NavigationMenuItem key={group.title}>
                            <NavigationMenuTrigger className="flex items-center gap-2">
                                {group.icon && (
                                    <group.icon className="h-4 w-4" />
                                )}
                                {group.title}
                            </NavigationMenuTrigger>

                            <NavigationMenuContent>
                                <ul className=" w-[200px] gap-2 p-2">
                                    {group.children.map((item) => (
                                        <li key={item.title}>
                                            <NavigationMenuLink asChild>
                                                <Link
                                                    href={item.href}
                                                    className={cn(
                                                        "flex items-center gap-2 rounded-md p-2 text-sm hover:bg-accent hover:text-accent-foreground",
                                                        page.url.startsWith(item.href) &&
                                                        "bg-accent text-accent-foreground"
                                                    )}
                                                >
                                                    {item.icon && (
                                                        <item.icon className="h-4 w-4" />
                                                    )}
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
                            <NavigationMenuLink
                                asChild
                                className={navigationMenuTriggerStyle()}
                            >
                                <Link
                                    href={group.href ?? "#"}
                                    className={cn(
                                        "flex items-center gap-2 rounded-md p-2 text-sm hover:bg-accent hover:text-accent-foreground",
                                        {
                                            "bg-accent text-accent-foreground":
                                                page.url.startsWith(group.href ?? ""),
                                        }
                                    )}
                                >
                                    {group.icon && (
                                        <group.icon className="h-4 w-4" />
                                    )}
                                    {group.title}
                                </Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                    )
                )}
            </NavigationMenuList>
        </NavigationMenu>
    )
}