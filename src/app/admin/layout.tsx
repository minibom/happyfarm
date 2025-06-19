
'use client';

import type { ReactNode } from 'react';
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
import { Package, Users, Settings, ShieldCheck, LayoutDashboard, Home, Loader2, BarChart3, Mail, Gift, CalendarDays, ListChecks } from 'lucide-react'; 
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';


export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingPermissions, setIsCheckingPermissions] = useState(false);

  const menuItems = [
    { href: '/admin/items-management', label: 'QL Vật Phẩm', icon: Package },
    { href: '/admin/users-tiers', label: 'Người Dùng & Bậc', icon: Users },
    { href: '/admin/mail-bonuses', label: 'Thư & Bonus', icon: Mail },
    { href: '/admin/missions-events', label: 'Nhiệm Vụ & Sự Kiện', icon: ListChecks }, 
    { href: '/admin/config', label: 'Cấu hình Hệ thống', icon: Settings },
  ];

  useEffect(() => {
    if (authLoading) {
      setIsCheckingPermissions(true);
      return;
    }

    if (!user) {
      router.push('/login');
      return;
    }

    const adminUidsString = process.env.NEXT_PUBLIC_ADMIN_UIDS;
    const adminUids = adminUidsString ? adminUidsString.split(',').map(uid => uid.trim()).filter(uid => uid) : [];
    
    if (adminUids.length === 0) {
        console.warn("NEXT_PUBLIC_ADMIN_UIDS is not set. No one will have admin access.");
    }

    if (user && adminUids.includes(user.uid)) {
      setIsAdmin(true);
    } else {
      toast({
        title: "Truy Cập Bị Từ Chối",
        description: "Bạn không có quyền truy cập vào trang quản trị.",
        variant: "destructive",
        duration: 5000,
      });
      router.push('/game');
    }
    setIsCheckingPermissions(false);
  }, [user, authLoading, router, toast]);

  const getCurrentPageLabel = () => {
    const currentItem = menuItems.find(item => pathname.startsWith(item.href));
    if (currentItem) return currentItem.label;

    if (pathname.startsWith('/admin/items-management')) return 'Quản Lý Vật Phẩm';
    if (pathname.startsWith('/admin/users-tiers')) return 'Người Dùng & Cấp Bậc';
    if (pathname.startsWith('/admin/mail-bonuses')) return 'Thư & Bonus';
    if (pathname.startsWith('/admin/missions-events')) return 'Nhiệm Vụ & Sự Kiện'; 
    if (pathname.startsWith('/admin/config')) return 'Cấu hình Hệ thống';
    
    return 'Bảng điều khiển Admin';
  };

  if (authLoading || isCheckingPermissions) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-xl text-muted-foreground">Đang kiểm tra quyền truy cập...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <SidebarProvider defaultOpen style={{ '--sidebar-width': '20%' }}>
      <Sidebar collapsible="icon" side="left" variant="sidebar" className="border-r border-sidebar-border">
        <SidebarHeader className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
            <Button variant="ghost" size="icon" className="h-10 w-10 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8" asChild>
              <Link href="/game">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </Link>
            </Button>
            <h2 className="text-xl font-semibold text-primary group-data-[collapsible=icon]:hidden font-headline">
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
                  isActive={pathname.startsWith(item.href)}
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
              <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
              <h1 className="text-lg font-semibold text-foreground">
                {getCurrentPageLabel()}
              </h1>
            </div>
        </header>
        <main className="flex-1 overflow-y-auto flex flex-col gap-4 p-4 sm:p-6">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
