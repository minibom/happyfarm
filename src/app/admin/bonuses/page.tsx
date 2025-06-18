
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { BonusConfiguration, RewardItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, PlusCircle, Trash2, Edit, Loader2, Gift } from 'lucide-react';
import { BonusActionModal, type BonusModalProps } from '@/components/admin/BonusActionModal';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { cn } from '@/lib/utils';

export default function AdminBonusesPage() {
  const [bonusConfigs, setBonusConfigs] = useState<BonusConfiguration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalProps, setModalProps] = useState<Omit<BonusModalProps, 'isOpen' | 'onClose'>>({ 
    mode: 'view', 
    bonusData: { 
      id: '', 
      triggerType: 'firstLogin', 
      description: '', 
      rewards: [], 
      mailSubject: '', 
      mailBody: '', 
      isEnabled: true 
    }
  });
  const { toast } = useToast();

  useEffect(() => {
    const bonusCollectionRef = collection(db, 'gameBonusConfigurations');
    const q = query(bonusCollectionRef, orderBy("triggerType"), orderBy("description"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const updatedBonuses: BonusConfiguration[] = [];
        snapshot.forEach((docSnap) => {
            updatedBonuses.push(docSnap.data() as BonusConfiguration);
        });
        setBonusConfigs(updatedBonuses);
        setIsLoading(false); 
    }, (error) => {
        console.error("Error with real-time bonus config updates:", error);
        toast({ title: "Lỗi Đồng Bộ Bonus", description: "Mất kết nối với dữ liệu cấu hình bonus.", variant: "destructive" });
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const openModal = (mode: 'view' | 'edit' | 'create', bonus?: BonusConfiguration) => {
    if (mode === 'create') {
      setModalProps({
        mode: 'create',
        bonusData: { 
          id: '', 
          triggerType: 'firstLogin', 
          description: 'Bonus mới', 
          rewards: [], 
          mailSubject: 'Quà tặng từ Happy Farm!', 
          mailBody: 'Bạn nhận được một phần quà đặc biệt!', 
          isEnabled: true 
        },
      });
    } else if (bonus) {
       setModalProps({ mode, bonusData: bonus, bonusId: bonus.id });
    }
    setIsModalOpen(true);
  };

  const handleSaveChanges = async (data: BonusConfiguration, idToSave: string, originalId?: string) => {
    const finalData = { ...data, id: idToSave }; 

    try {
      if (modalProps.mode === 'edit' && originalId && originalId !== idToSave) {
        // ID changed, so delete old and create new
        const oldDocRef = doc(db, 'gameBonusConfigurations', originalId);
        await deleteDoc(oldDocRef);
      }
      
      const bonusRef = doc(db, 'gameBonusConfigurations', idToSave);
      await setDoc(bonusRef, finalData); 
      
      toast({
        title: `Thành Công (${modalProps.mode === 'create' ? 'Tạo Mới' : 'Chỉnh Sửa'})`,
        description: `Đã ${modalProps.mode === 'create' ? 'tạo' : 'cập nhật'} cấu hình bonus "${finalData.description}" trên database.`,
        className: "bg-green-500 text-white"
      });
    } catch (error) {
      console.error(`Error ${modalProps.mode === 'create' ? 'creating' : 'updating'} bonus config:`, error);
      toast({ title: "Lỗi Lưu Trữ", description: `Không thể ${modalProps.mode === 'create' ? 'tạo' : 'cập nhật'} cấu hình bonus.`, variant: "destructive"});
    }
    setIsModalOpen(false);
  };

  const handleDeleteBonus = async (bonusToDelete: BonusConfiguration) => {
     try {
      await deleteDoc(doc(db, 'gameBonusConfigurations', bonusToDelete.id));
      toast({
        title: "Đã Xóa",
        description: `Đã xóa cấu hình bonus "${bonusToDelete.description}" khỏi database.`,
        className: "bg-orange-500 text-white"
      });
    } catch (error) {
      console.error("Error deleting bonus config:", error);
      toast({ title: "Lỗi Xóa", description: `Không thể xóa cấu hình bonus "${bonusToDelete.description}".`, variant: "destructive"});
    }
  }

  const getRewardItemName = (reward: RewardItem): string => {
    if (reward.type === 'gold') return `${reward.amount} Vàng`;
    if (reward.type === 'xp') return `${reward.amount} XP`;
    if (reward.type === 'item' && reward.itemId) {
      // In a real app, you'd look up item names here from CROP_DATA or FERTILIZER_DATA
      return `${reward.quantity}x ${reward.itemId}`;
    }
    return 'Phần thưởng không xác định';
  };


  if (isLoading && bonusConfigs.length === 0) {
    return (
      <Card className="shadow-xl flex-1 flex flex-col min-h-0">
        <CardHeader>
            <CardTitle className="text-2xl font-bold text-primary font-headline flex items-center gap-2">
                <Gift className="h-7 w-7"/> Quản Lý Cấu Hình Bonus
            </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center p-6 pt-0">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4 text-xl">Đang tải dữ liệu cấu hình bonus...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-xl flex flex-col flex-1 min-h-0">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold text-primary font-headline flex items-center gap-2">
                 <Gift className="h-7 w-7"/> Quản Lý Cấu Hình Bonus ({bonusConfigs.length})
              </CardTitle>
              <CardDescription>
                Quản lý các cấu hình bonus tự động từ Firestore (collection <code>gameBonusConfigurations</code>).
                Cloud Functions sẽ sử dụng các cấu hình này để gửi thư thưởng cho người chơi.
              </CardDescription>
            </div>
            <Button onClick={() => openModal('create')} className="bg-accent hover:bg-accent/90">
              <PlusCircle className="mr-2 h-5 w-5" /> Tạo Cấu Hình Mới
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto p-6 pt-0">
            <Table className="relative border-separate border-spacing-0">
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead className="w-[150px]">ID</TableHead>
                  <TableHead>Mô Tả</TableHead>
                  <TableHead className="w-[150px]">Loại Kích Hoạt</TableHead>
                  <TableHead className="w-[100px]">Giá Trị</TableHead>
                  <TableHead>Phần Thưởng</TableHead>
                  <TableHead className="w-[100px] text-center">Trạng Thái</TableHead>
                  <TableHead className="text-center w-[150px]">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bonusConfigs.length === 0 && !isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Không tìm thấy cấu hình bonus nào. Hãy tạo một cấu hình mới.
                    </TableCell>
                  </TableRow>
                ) : (
                  bonusConfigs.map((bonus) => (
                    <TableRow key={bonus.id}>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{bonus.id}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{bonus.description}</TableCell>
                      <TableCell>{bonus.triggerType}</TableCell>
                      <TableCell>{bonus.triggerValue ?? 'N/A'}</TableCell>
                      <TableCell className="text-xs">
                        {bonus.rewards.map(getRewardItemName).join(', ')}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={cn(bonus.isEnabled ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600", "text-white")}>
                          {bonus.isEnabled ? "Đang Bật" : "Đang Tắt"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => openModal('view', bonus)} className="hover:text-primary" title="Xem chi tiết">
                          <Eye className="h-5 w-5" />
                        </Button>
                         <Button variant="ghost" size="icon" onClick={() => openModal('edit', bonus)} className="hover:text-blue-600" title="Chỉnh sửa">
                          <Edit className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteBonus(bonus)} className="hover:text-destructive" title="Xóa">
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )))
                }
              </TableBody>
            </Table>
        </CardContent>
      </Card>

      <BonusActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveChanges}
        {...modalProps}
      />
    </>
  );
}

    