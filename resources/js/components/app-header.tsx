import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { NavigationMenu, NavigationMenuItem, NavigationMenuList, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { NavGroup, type BreadcrumbItem, type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Building2, Calendar, LayoutGrid, Menu, Search, Settings, } from 'lucide-react';
import AppLogo from './app-logo';
import AppLogoIcon from './app-logo-icon';
import { NavMain2 } from './NavMain2';

const mainNavItems: NavGroup[] = [
    {
        title: 'Dasboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Settings',
        icon: Settings,
        children: [
            {
                title: 'Offices',
                href: '/events',
                icon: Building2,
            },
            {
                title: 'Attendance Logs',
                href: '/attendance-logs',
                icon: Calendar,
            },
            {
                title: 'DTR',
                href: '/dtr',
                icon: Calendar,
            },
        ],
    },

];


interface AppHeaderProps {
    breadcrumbs?: BreadcrumbItem[];
}

export function AppHeader({ breadcrumbs = [] }: AppHeaderProps) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const getInitials = useInitials();
    return (
        <>
            <div className="border-sidebar-border/80 border-b bg-sidebar">
                <div className="mx-auto flex h-16 items-center px-4 ">
                    {/* Mobile Menu */}
                    <div className="lg:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="mr-2 h-[34px] w-[34px]">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="flex h-full w-64 flex-col items-stretch justify-between bg-sidebar">
                                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                                <SheetHeader className="flex justify-start text-left">
                                    <AppLogoIcon className="h-6 w-6 fill-current text-black dark:text-white" />
                                </SheetHeader>
                                <div className="mt-6 flex h-full flex-1 flex-col space-y-4">
                                    <div className="flex h-full flex-col justify-between text-sm">
                                        <div className="flex flex-col space-y-4">
                                            {mainNavItems.map((group) => (
                                                <div key={group.title}>
                                                    <p className="px-2 text-xs font-semibold text-muted-foreground">
                                                        {group.title}
                                                    </p>

                                                    {group.children?.map((item) => (
                                                        <Link
                                                            key={item.title}
                                                            href={item.href}
                                                            className="flex items-center space-x-2 px-2 py-1 font-medium"
                                                        >
                                                            {item.icon && (
                                                                <Icon iconNode={item.icon} className="h-5 w-5" />
                                                            )}
                                                            <span>{item.title}</span>
                                                        </Link>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    <div className="relative flex items-center flex-1">

                        {/* Left: Logo */}
                        <Link href="/dashboard" prefetch className="flex items-center space-x-2 z-10">
                            <AppLogo />
                        </Link>

                        {/* Center: Navigation (TRUE CENTER) */}
                        <div className="absolute left-1/2 -translate-x-1/2 hidden lg:flex">
                            <NavigationMenu>
                                <NavigationMenuList className="flex items-center space-x-2">
                                    <NavMain2 items={mainNavItems} />
                                </NavigationMenuList>
                            </NavigationMenu>
                        </div>

                        {/* Right: Actions */}
                        <div className="ml-auto flex items-center space-x-2 z-10">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="size-10 rounded-full p-1">
                                        <Avatar className="size-8">
                                            <AvatarImage src={auth.user.avatar} />
                                            <AvatarFallback>
                                                {getInitials(auth.user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <UserMenuContent user={auth.user} />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
