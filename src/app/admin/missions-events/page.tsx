
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, ListChecks, Loader2, UploadCloud } from 'lucide-react'; // Added ListChecks
import AdminEventsPageContent from '../events/page'; // Re-using existing event page content
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { doc, writeBatch } from 'firebase/firestore';
import {
  MAIN_MISSIONS_DATA,
  DAILY_MISSION_TEMPLATES_DATA,
  WEEKLY_MISSION_TEMPLATES_DATA,
  RANDOM_MISSION_POOL_DATA,
} from '@/lib/constants';
import type { Mission } from '@/types';

const AdminMissionsManagementContent = () => {
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncMissionData = async (
    missionData: Mission[],
    collectionName: string,
    dataTypeLabel: string
  ) => {
    setIsSyncing(true);
    toast({
      title: "Đang Xử Lý...",
      description: `Bắt đầu đẩy dữ liệu ${dataTypeLabel} lên Firestore...`,
    });

    try {
      const batch = writeBatch(db);
      let itemCount = 0;

      for (const mission of missionData) {
        const missionRef = doc(db, collectionName, mission.id);
        batch.set(missionRef, mission);
        itemCount++;
      }

      await batch.commit();
      toast({
        title: "Thành Công!",
        description: `Đã đẩy ${itemCount} ${dataTypeLabel} lên Firestore collection '${collectionName}'.`,
        className: "bg-green-500 text-white",
        duration: 7000,
      });
    } catch (error) {
      console.error(`Error pushing ${dataTypeLabel} to Firestore:`, error);
      toast({
        title: `Lỗi Đẩy Dữ Liệu ${dataTypeLabel}`,
        description: `Không thể đẩy dữ liệu. Lỗi: ${(error as Error).message}`,
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Card className="shadow-xl flex-1 flex flex-col min-h-0">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary font-headline flex items-center gap-2">
          <ListChecks className="h-7 w-7" /> Quản Lý Nhiệm Vụ
        </CardTitle>
        <CardDescription>
          Xem, tạo, chỉnh sửa và đồng bộ hóa các định nghĩa nhiệm vụ trong game.
          (Chức năng CRUD chi tiết sẽ được bổ sung).
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Đồng Bộ Định Nghĩa Nhiệm Vụ</CardTitle>
            <CardDescription>
              Đẩy TOÀN BỘ cấu hình Nhiệm Vụ từ file constants (mission-data.ts) lên các collection tương ứng trong Firestore.
              Sử dụng để khởi tạo hoặc GHI ĐÈ dữ liệu trên database.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => handleSyncMissionData(MAIN_MISSIONS_DATA, 'gameMainMissions', 'Nhiệm Vụ Chính')}
              disabled={isSyncing}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              {isSyncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
              Đồng Bộ Nhiệm Vụ Chính
            </Button>
            <Button
              onClick={() => handleSyncMissionData(DAILY_MISSION_TEMPLATES_DATA, 'gameDailyMissionTemplates', 'Mẫu NV Ngày')}
              disabled={isSyncing}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              {isSyncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
              Đồng Bộ Mẫu NV Ngày
            </Button>
            <Button
              onClick={() => handleSyncMissionData(WEEKLY_MISSION_TEMPLATES_DATA, 'gameWeeklyMissionTemplates', 'Mẫu NV Tuần')}
              disabled={isSyncing}
              className="bg-purple-500 hover:bg-purple-600 text-white"
            >
              {isSyncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
              Đồng Bộ Mẫu NV Tuần
            </Button>
            <Button
              onClick={() => handleSyncMissionData(RANDOM_MISSION_POOL_DATA, 'gameRandomMissionPool', 'NV Ngẫu Nhiên')}
              disabled={isSyncing}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isSyncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
              Đồng Bộ NV Ngẫu Nhiên
            </Button>
          </CardContent>
        </Card>
         <p className="text-sm text-muted-foreground">
          Lưu ý: Chức năng tạo và sửa chi tiết từng nhiệm vụ sẽ được cập nhật trong các phiên bản sau.
        </p>
        {/* Placeholder for future mission CRUD UI */}
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
        {/* Here we embed the existing event page content.
            AdminEventsPage is a default export, so we can rename it. */}
        <AdminEventsPageContent />
      </TabsContent>
    </Tabs>
  );
}

  