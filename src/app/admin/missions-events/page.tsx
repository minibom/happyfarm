
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, ListChecks, Loader2, DatabaseZap, PlusCircle, Edit, Trash2, Eye } from 'lucide-react';
import AdminEventsPageContent from '../events/page'; // Re-check path if moved
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, doc, deleteDoc, setDoc, addDoc } from 'firebase/firestore';
import type { Mission, MissionCategory, MissionReward } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MissionActionModal, type MissionModalProps } from '@/components/admin/MissionActionModal'; // Ensure this path is correct

type MissionWithId = Mission & { firestoreId: string };

const AdminMissionsManagementContent = () => {
  const { toast } = useToast();
  const [activeMissionTab, setActiveMissionTab] = useState<MissionCategory>('main');
  const [missions, setMissions] = useState<Record<MissionCategory, MissionWithId[]>>({
    main: [],
    daily: [],
    weekly: [],
    random: [],
    event: [], // Though 'event' category might not be directly managed here in the same way
  });
  const [isLoading, setIsLoading] = useState<Record<MissionCategory, boolean>>({
    main: true, daily: true, weekly: true, random: true, event: true,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalProps, setModalProps] = useState<Omit<MissionModalProps, 'isOpen' | 'onClose' | 'onSave'>>({
    mode: 'view',
    missionData: { id: '', title: '', category: 'main', type: 'reach_level', targetQuantity: 1, rewards: [] },
  });

  const collectionMap: Record<MissionCategory, string> = {
    main: 'gameMainMissions',
    daily: 'gameDailyMissionTemplates',
    weekly: 'gameWeeklyMissionTemplates',
    random: 'gameRandomMissionPool',
    event: 'gameEventMissions', // Assuming a collection for event-specific missions if managed this way
  };

  useEffect(() => {
    const categoryToFetch = activeMissionTab;
    const collectionName = collectionMap[categoryToFetch];
    if (!collectionName) return;

    setIsLoading(prev => ({ ...prev, [categoryToFetch]: true }));

    const q = query(collection(db, collectionName), orderBy('title')); // Simple ordering for now
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMissions: MissionWithId[] = [];
      snapshot.forEach(docSnap => {
        fetchedMissions.push({ firestoreId: docSnap.id, ...(docSnap.data() as Mission) });
      });
      setMissions(prev => ({ ...prev, [categoryToFetch]: fetchedMissions }));
      setIsLoading(prev => ({ ...prev, [categoryToFetch]: false }));
    }, (error) => {
      console.error(`Error fetching ${categoryToFetch} missions:`, error);
      toast({ title: `Lỗi Tải Nhiệm Vụ ${categoryToFetch}`, description: error.message, variant: "destructive" });
      setIsLoading(prev => ({ ...prev, [categoryToFetch]: false }));
    });

    return () => unsubscribe();
  }, [activeMissionTab, toast]);

  const openModal = (mode: 'view' | 'edit' | 'create', mission?: MissionWithId, category?: MissionCategory) => {
    const cat = category || activeMissionTab;
    if (mode === 'create') {
      setModalProps({
        mode: 'create',
        missionData: {
            id: `new_${cat}_${Date.now().toString().slice(-4)}`, // Suggest an ID
            title: 'Nhiệm Vụ Mới',
            category: cat,
            type: 'reach_level', // Default type
            targetQuantity: 1,
            rewards: [],
            description: '',
            requiredLevelUnlock: 1,
        },
        missionCategory: cat
      });
    } else if (mission) {
      setModalProps({ mode, missionData: mission, missionId: mission.firestoreId, missionCategory: cat });
    }
    setIsModalOpen(true);
  };

  const handleSaveChanges = async (data: Mission, idToSave: string, category: MissionCategory, originalFirestoreId?: string) => {
    const collectionName = collectionMap[category];
    if (!collectionName) {
      toast({ title: "Lỗi", description: "Không xác định được loại nhiệm vụ.", variant: "destructive" });
      return;
    }

    try {
      const missionRef = doc(db, collectionName, idToSave); // Use idToSave which might be different from originalFirestoreId if ID was changed
      
      if (modalProps.mode === 'edit' && originalFirestoreId && originalFirestoreId !== idToSave) {
        // If ID changed during edit, we need to delete the old and create new.
        // For simplicity, this example assumes ID is not changed during edit, or if it is, it's a new doc.
        // A more robust solution for ID change would be to delete the old doc and add a new one.
        // Here, we'll just set with the new ID, potentially creating a new doc if ID is new.
        // Or, enforce ID non-editable in 'edit' mode. For now, let's assume ID can change but it acts like create.
        if (originalFirestoreId) {
            const oldDocRef = doc(db, collectionName, originalFirestoreId);
            await deleteDoc(oldDocRef); // Delete old if ID changed and original exists
        }
        await setDoc(missionRef, data); // This will create if idToSave is new, or overwrite
      } else {
         await setDoc(missionRef, data, { merge: modalProps.mode === 'edit' });
      }

      toast({
        title: `Thành Công (${modalProps.mode === 'create' ? 'Tạo Mới' : 'Chỉnh Sửa'})`,
        description: `Đã ${modalProps.mode === 'create' ? 'tạo' : 'cập nhật'} nhiệm vụ "${data.title}".`,
        className: "bg-green-500 text-white"
      });
    } catch (error: any) {
      console.error(`Error ${modalProps.mode === 'create' ? 'creating' : 'updating'} mission:`, error);
      toast({ title: "Lỗi Lưu Trữ", description: `Không thể ${modalProps.mode === 'create' ? 'tạo' : 'cập nhật'} nhiệm vụ. Lỗi: ${error.message}`, variant: "destructive" });
    }
    setIsModalOpen(false);
  };

 const handleDeleteMission = async (missionToDelete: MissionWithId, category: MissionCategory) => {
    const collectionName = collectionMap[category];
    if (!collectionName) {
      toast({ title: "Lỗi", description: "Không xác định được loại nhiệm vụ để xóa.", variant: "destructive" });
      return;
    }
    try {
      await deleteDoc(doc(db, collectionName, missionToDelete.firestoreId));
      toast({
        title: "Đã Xóa",
        description: `Đã xóa nhiệm vụ "${missionToDelete.title}".`,
        className: "bg-orange-500 text-white"
      });
    } catch (error: any) {
      console.error("Error deleting mission:", error);
      toast({ title: "Lỗi Xóa", description: `Không thể xóa nhiệm vụ "${missionToDelete.title}". Lỗi: ${error.message}`, variant: "destructive" });
    }
  };


  const getRewardSummary = (rewards: MissionReward[]) => {
    if (!rewards || rewards.length === 0) return "Không có";
    const summary = rewards.map(r => {
      if (r.type === 'gold') return `${r.amount} Vàng`;
      if (r.type === 'xp') return `${r.amount} XP`;
      if (r.type === 'item') return `${r.quantity}x ${r.itemId}`;
      return "";
    }).filter(s => s).join(', ');
    return summary.length > 40 ? summary.substring(0, 37) + "..." : summary;
  };
  

  const renderMissionsForCategory = (category: MissionCategory) => {
    const categoryMissions = missions[category];
    const categoryIsLoading = isLoading[category];

    if (categoryIsLoading) {
      return (
        <div className="flex-1 flex items-center justify-center py-10">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="ml-3 text-lg">Đang tải nhiệm vụ {category}...</p>
        </div>
      );
    }
    
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex justify-end mb-3 shrink-0">
            <Button onClick={() => openModal('create', undefined, category)} className="bg-accent hover:bg-accent/90">
                <PlusCircle className="mr-2 h-5 w-5" /> Tạo Nhiệm Vụ {category.charAt(0).toUpperCase() + category.slice(1)} Mới
            </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {categoryMissions.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">Không có nhiệm vụ nào trong danh mục này.</p>
          ) : (
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead className="w-[150px]">ID Nhiệm Vụ</TableHead>
                  <TableHead>Tiêu Đề</TableHead>
                  <TableHead className="w-[120px]">Loại</TableHead>
                  <TableHead>Mục Tiêu</TableHead>
                  <TableHead>Phần Thưởng</TableHead>
                  <TableHead className="w-[100px] text-center">Hành Động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoryMissions.map((mission) => (
                  <TableRow key={mission.firestoreId}>
                    <TableCell>
                        <Badge variant="outline" className="text-xs">{mission.id}</Badge>
                        <p className="text-[10px] text-muted-foreground mt-0.5">DB ID: {mission.firestoreId.substring(0,5)}...</p>
                    </TableCell>
                    <TableCell className="font-medium">{mission.title}</TableCell>
                    <TableCell>{mission.type}</TableCell>
                    <TableCell>
                      {mission.targetItemId ? `${mission.targetItemId}: ` : ''}
                      {mission.targetQuantity}
                    </TableCell>
                    <TableCell className="text-xs truncate max-w-[200px]" title={getRewardSummary(mission.rewards)}>
                        {getRewardSummary(mission.rewards)}
                    </TableCell>
                    <TableCell className="text-center space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => openModal('view', mission, category)} className="hover:text-primary" title="Xem">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openModal('edit', mission, category)} className="hover:text-blue-600" title="Sửa">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteMission(mission, category)} className="hover:text-destructive" title="Xóa">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="shadow-xl flex-1 flex flex-col min-h-0">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary font-headline flex items-center gap-2">
          <ListChecks className="h-7 w-7" /> Quản Lý Nhiệm Vụ (Từ Database)
        </CardTitle>
        <CardDescription>
          Xem, tạo, chỉnh sửa và xóa các loại nhiệm vụ trực tiếp từ cơ sở dữ liệu.
          Các thay đổi ở đây sẽ ảnh hưởng trực tiếp đến game.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0 p-4">
        <Tabs value={activeMissionTab} onValueChange={(value) => setActiveMissionTab(value as MissionCategory)} className="w-full flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-3 shrink-0">
            <TabsTrigger value="main" className="py-2 text-sm">N.Vụ Chính</TabsTrigger>
            <TabsTrigger value="daily" className="py-2 text-sm">Mẫu N.V Ngày</TabsTrigger>
            <TabsTrigger value="weekly" className="py-2 text-sm">Mẫu N.V Tuần</TabsTrigger>
            <TabsTrigger value="random" className="py-2 text-sm">N.V Ngẫu Nhiên</TabsTrigger>
          </TabsList>
          <TabsContent value="main" className="flex-1 min-h-0">
            {renderMissionsForCategory('main')}
          </TabsContent>
          <TabsContent value="daily" className="flex-1 min-h-0">
            {renderMissionsForCategory('daily')}
          </TabsContent>
          <TabsContent value="weekly" className="flex-1 min-h-0">
            {renderMissionsForCategory('weekly')}
          </TabsContent>
          <TabsContent value="random" className="flex-1 min-h-0">
            {renderMissionsForCategory('random')}
          </TabsContent>
        </Tabs>
      </CardContent>
       {isModalOpen && (
        <MissionActionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveChanges}
          {...modalProps}
        />
      )}
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

