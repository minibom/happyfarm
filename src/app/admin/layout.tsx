
'use client';

import type { ReactNode } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBasket, Users, Settings, ShieldCheck, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const menuItems = [
    { href: '/admin/items', label: 'Quản lý Vật phẩm', icon: ShoppingBasket },
    { href: '/admin/users', label: 'Quản lý Người dùng', icon: Users },
    { href: '/admin/config', label: 'Cấu hình Hệ thống', icon: Settings },
  ];

  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon" side="left" variant="sidebar">
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
            <Button variant="ghost" size="icon" className="h-10 w-10 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8" asChild>
              <Link href="/">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </Link>
            </Button>
            <h2 className="text-xl font-semibold text-primary group-data-[collapsible=icon]:hidden">
              Admin HappyFarm
            </h2>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={{ children: item.label, side: 'right', align: 'center' }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="bg-muted/30">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-2">
            <SidebarTrigger className="md:hidden" />
            <div className="flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
              <h1 className="text-lg font-semibold text-foreground">
                {menuItems.find(item => item.href === pathname)?.label || 'Bảng điều khiển'}
              </h1>
            </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
