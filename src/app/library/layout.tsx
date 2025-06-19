
'use client';

import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { useState, useEffect } from 'react';
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
import { usePathname, useRouter } from 'next/navigation';
import { Library, Info, Award, Sprout, Zap, Home, Loader2, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

// Metadata for the library section - this won't be dynamically generated per child page from here
// but sets a good default if child pages don't specify their own.
// Child pages should export their own `metadata` object for more specific SEO.

export default function LibraryLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const menuItems = [
    { href: '/library', label: 'Giới Thiệu Game', icon: Info, exact: true },
    { href: '/library/tiers', label: 'Các Cấp Bậc', icon: Award },
    { href: '/library/items', label: 'Vật Phẩm', icon: Sprout },
    { href: '/library/events', label: 'Sự Kiện', icon: Zap },
  ];

  const getCurrentPageLabel = () => {
    const currentItem = menuItems.find(item => item.exact ? pathname === item.href : pathname.startsWith(item.href));
    if (currentItem) return currentItem.label;
    if (pathname === '/library') return 'Giới Thiệu Game';
    return 'Thư Viện Game';
  };

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-xl text-muted-foreground">Đang tải...</p>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <SidebarProvider defaultOpen style={{ '--sidebar-width': '20%' }}>
      <Sidebar collapsible="icon" side="left" variant="sidebar" className="border-r border-sidebar-border">
        <SidebarHeader className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
            <Button variant="ghost" size="icon" className="h-10 w-10 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8" asChild>
              <Link href="/game">
                <Library className="h-6 w-6 text-primary" />
              </Link>
            </Button>
            <h2 className="text-xl font-semibold text-primary group-data-[collapsible=icon]:hidden font-headline">
              Thư Viện Farm
            </h2>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={item.exact ? pathname === item.href : pathname.startsWith(item.href)}
                  tooltip={{ children: item.label, side: 'right', align: 'center' }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip={{ children: "Về Trang Game", side: 'right', align: 'center' }}
              >
                <Link href="/game">
                  <Home />
                  <span>Về Trang Game</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="bg-muted/30 flex flex-col h-screen">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-2 shrink-0">
          <SidebarTrigger className="md:hidden" />
          <div className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-lg font-semibold text-foreground">
              {getCurrentPageLabel()}
            </h1>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto flex flex-col gap-4 p-4 sm:p-6">
          {children}
        </main>
         <footer className="text-center py-4 text-sm text-muted-foreground shrink-0 border-t bg-background">
            <p>&copy; {new Date().getFullYear()} Happy Farm by Firebase Studio.</p>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
