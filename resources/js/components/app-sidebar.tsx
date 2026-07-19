import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, CreditCard, Folder, LayoutGrid, Package, Ship, Box, ClipboardList, BarChart2, MessageCircle } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        url: '/admin/dashboard',
        icon: LayoutGrid,
    },


    {
        title: 'Shipment',
        url: '/admin/shipment',
        icon: Ship // Or History if available, let's use BookOpen for now as it's already imported or similar
    },
    {
        title: 'Payments',
        url: '/admin/payments',
        icon: CreditCard,
    },
    {
        title: 'Consument Care',
        url: '/admin/consument-care',
        icon: MessageCircle,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        url: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },

    {
        title: 'Documentation',
        url: 'https://laravel.com/docs/starter-kits',
        icon: BookOpen,
    },
];

const StorageItems: NavItem[] = [
    {
        title: 'Material Dashboard',
        url: '/admin/material-dashboard',
        icon: BarChart2,
    },
    {
        title: 'Materials',
        url: '/admin/materials',
        icon: Box,
    },
    {
        title: 'Products',
        url: '/admin/products',
        icon: Package,
    },
    {
        title: 'Materials Logs',
        url: '/admin/material-logs',
        icon: BookOpen,
    },
    {
        title: 'Shoe Recipes',
        url: '/admin/recipes',
        icon: ClipboardList,
    },
    {
        title: 'Product Logs',
        url: '/admin/products-logs',
        icon: BookOpen, // Or History if available, let's use BookOpen for now as it's already imported or similar
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/admin/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} name='product' />
                <NavMain items={StorageItems} name='storage' />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
