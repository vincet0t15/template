import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
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
                href: '/settings/offices',
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
            <div className="border-sidebar-border/80 border-b">
                <div className="mx-auto grid h-16 grid-cols-3 items-center px-4">
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
                                <SheetHeader className="flex justify-start text-left p-4">
                                    <div className="flex w-full items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                                            <AppLogoIcon className="h-5 w-5 fill-current text-white dark:text-black" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold leading-tight text-foreground">Laravel Starter Kit</p>
                                        </div>
                                    </div>
                                </SheetHeader>
                                <div className="flex h-full flex-1 flex-col">
                                    <nav className="flex flex-1 flex-col gap-2 p-2 text-sm">
                                        <div>
                                            <p className="px-3 pb-1 text-xs font-semibold text-muted-foreground">General</p>
                                            <Link
                                                href="/dashboard"
                                                prefetch
                                                className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                            >
                                                <LayoutGrid className="h-5 w-5" />
                                                <span className="font-medium">Dashboard</span>
                                            </Link>
                                        </div>
                                        <div className="mt-1">
                                            <p className="px-3 pb-1 text-xs font-semibold text-muted-foreground">Settings</p>
                                            <div className="flex flex-col gap-1">
                                                {mainNavItems.find((g) => g.title === 'Settings')?.children?.map((item) => (
                                                    <Link
                                                        key={item.title}
                                                        href={item.href}
                                                        prefetch
                                                        className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                                    >
                                                        {item.icon && <Icon iconNode={item.icon} className="h-5 w-5" />}
                                                        <span>{item.title}</span>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    </nav>
                                    <Separator className="mt-auto bg-sidebar-border" />
                                    <div className="flex items-center gap-3 p-4">
                                        <Avatar className="size-9 rounded-full">
                                            <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                                            <AvatarFallback>{getInitials(auth.user.name)}</AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium leading-tight">{auth.user.name}</p>
                                            <p className="text-xs text-muted-foreground leading-tight">{auth.user.email}</p>
                                        </div>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    <div className="relative contents">

                        {/* Left: Logo */}
                        <div className="flex items-center justify-self-start">
                            <Link href="/dashboard" prefetch className="flex items-center space-x-2">
                                <AppLogo />
                            </Link>
                        </div>

                        {/* Center: Navigation */}
                        <div className="hidden lg:flex justify-self-center">
                            <NavigationMenu>
                                <NavigationMenuList className="flex items-center space-x-2">
                                    <NavMain2 items={mainNavItems} />
                                </NavigationMenuList>
                            </NavigationMenu>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center space-x-2 justify-self-end">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="size-10 rounded-full p-1">
                                        <Avatar className="size-8 overflow-hidden rounded-full">
                                            <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                                            <AvatarFallback>
                                                {getInitials(auth.user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end">
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
