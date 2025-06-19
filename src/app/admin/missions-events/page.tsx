
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, ListChecks, Loader2, DatabaseZap } from 'lucide-react'; // Changed UploadCloud to DatabaseZap for semantic meaning
import AdminEventsPageContent from '../events/page';
import { useToast } from '@/hooks/use-toast';
// Mission data constants and Firebase direct sync logic removed from here

const AdminMissionsManagementContent = () => {
  // Syncing logic and buttons are removed from here
  // This component will now be a placeholder for future mission CRUD from DB

  return (
    <Card className="shadow-xl flex-1 flex flex-col min-h-0">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary font-headline flex items-center gap-2">
          <ListChecks className="h-7 w-7" /> Quản Lý Nhiệm Vụ (Từ Database)
        </CardTitle>
        <CardDescription>
          Chức năng xem, tạo, chỉnh sửa và xóa nhiệm vụ trực tiếp từ cơ sở dữ liệu sẽ được cập nhật tại đây.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-6 p-6">
        <div className="flex flex-col items-center justify-center text-center h-full py-10">
            <DatabaseZap className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-xl font-semibold text-muted-foreground">Tính năng đang được phát triển.</p>
            <p className="text-sm text-muted-foreground mt-1">
                Quản lý chi tiết (Thêm/Sửa/Xóa) các nhiệm vụ từ database sẽ sớm có mặt.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
                Để đồng bộ các định nghĩa nhiệm vụ từ code, vui lòng sử dụng trang "Cấu hình Hệ thống".
            </p>
        </div>
      </CardContent>
    </Card>
  );
};


export default function AdminMissionsAndEventsPage() {
  return (
    <Tabs defaultValue="missions" className="w-full flex-1 flex flex-col min-h-0">
      <TabsList className="grid w-full grid-cols-2 mb-4 shrink-0">
        <TabsTrigger value="missions" className="py-2.5 text-base">
          <ListChecks className="mr-2 h-5 w-5" /> Quản Lý Nhiệm Vụ
        </TabsTrigger>
        <TabsTrigger value="events" className="py-2.5 text-base">
          <CalendarDays className="mr-2 h-5 w-5" /> Quản Lý Sự Kiện
        </TabsTrigger>
      </TabsList>
      <TabsContent value="missions" className="flex-1 min-h-0">
        <AdminMissionsManagementContent />
      </TabsContent>
      <TabsContent value="events" className="flex-1 min-h-0">
        <AdminEventsPageContent />
      </TabsContent>
    </Tabs>
  );
}
