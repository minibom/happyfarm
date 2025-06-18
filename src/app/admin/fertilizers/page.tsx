
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { FertilizerId, FertilizerDetails } from '@/types';
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
import { Eye, PlusCircle, Trash2, Edit, Loader2, Zap as FertilizerIcon } from 'lucide-react';
import { FertilizerModal, type FertilizerModalProps } from '@/components/admin/FertilizerActionModals';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { TIER_DATA } from '@/lib/constants';

type FertilizerDataForTable = FertilizerDetails; // id is already part of FertilizerDetails

export default function AdminFertilizersPage() {
  const [fertilizers, setFertilizers] = useState<FertilizerDataForTable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalProps, setModalProps] = useState<Omit<FertilizerModalProps, 'isOpen' | 'onClose'>>({ 
    mode: 'view', 
    fertilizerData: { id: '', name: '', icon: '🧪', description: '', price: 1, unlockTier: 1, timeReductionPercent: 0.05 }
  });
  const { toast } = useToast();

  useEffect(() => {
    const fertilizersCollectionRef = collection(db, 'gameFertilizers');
    const q = query(fertilizersCollectionRef, orderBy("unlockTier"), orderBy("name"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const updatedFertilizers: FertilizerDataForTable[] = [];
        snapshot.forEach((docSnap) => {
            // The document ID is the fertilizerId, and it's also stored in the document data as 'id'
            updatedFertilizers.push(docSnap.data() as FertilizerDetails);
        });
        setFertilizers(updatedFertilizers);
        setIsLoading(false); 
    }, (error) => {
        console.error("Error with real-time fertilizer updates:", error);
        toast({ title: "Lỗi Đồng Bộ Phân Bón", description: "Mất kết nối với dữ liệu phân bón.", variant: "destructive" });
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const openModal = (mode: 'view' | 'edit' | 'create', fertilizer?: FertilizerDataForTable) => {
    if (mode === 'create') {
      setModalProps({
        mode: 'create',
        fertilizerData: { id: '', name: '', icon: '🧪', description: 'Phân bón mới', price: 10, unlockTier: 1, timeReductionPercent: 0.05 }, 
      });
    } else if (fertilizer) {
       setModalProps({ mode, fertilizerData: fertilizer, fertilizerId: fertilizer.id });
    }
    setIsModalOpen(true);
  };

  const handleSaveChanges = async (data: FertilizerDetails, idToSave: FertilizerId, originalId?: FertilizerId) => {
    // For fertilizers, the ID is part of the data object (`data.id`) and should match idToSave
    // If mode is 'create', idToSave will be the new ID.
    // If mode is 'edit', idToSave is the originalId (which should also be data.id from the form if ID wasn't editable).
    // If ID was editable in 'edit' mode and changed, originalId is the old ID, idToSave is the new ID.
    // We must ensure data.id matches idToSave.
    
    const finalData = { ...data, id: idToSave }; // Ensure data.id is the ID we are saving to

    try {
      if (mode === 'edit' && originalId && originalId !== idToSave) {
        // ID changed, so delete old and create new (or use a transaction)
        // For simplicity, we'll assume ID change might require delete + add
        // This path is less common if ID is not typically changed after creation.
        // For now, let's assume ID isn't changed in edit mode, or if it is, handle as a new creation if ID changes.
        // The current FertilizerModal sets readOnly for ID in edit mode.
        const oldDocRef = doc(db, 'gameFertilizers', originalId);
        await deleteDoc(oldDocRef);
      }
      
      const fertilizerRef = doc(db, 'gameFertilizers', idToSave);
      await setDoc(fertilizerRef, finalData); 
      
      toast({
        title: `Thành Công (${modalProps.mode === 'create' ? 'Tạo Mới' : 'Chỉnh Sửa'})`,
        description: `Đã ${modalProps.mode === 'create' ? 'tạo' : 'cập nhật'} phân bón "${finalData.name}" trên database.`,
        className: "bg-green-500 text-white"
      });
    } catch (error) {
      console.error(`Error ${modalProps.mode === 'create' ? 'creating' : 'updating'} fertilizer:`, error);
      toast({ title: "Lỗi Lưu Trữ", description: `Không thể ${modalProps.mode === 'create' ? 'tạo' : 'cập nhật'} phân bón.`, variant: "destructive"});
    }
    setIsModalOpen(false);
  };

  const handleDeleteFertilizer = async (fertilizerToDelete: FertilizerDataForTable) => {
     try {
      await deleteDoc(doc(db, 'gameFertilizers', fertilizerToDelete.id));
      toast({
        title: "Đã Xóa",
        description: `Đã xóa phân bón "${fertilizerToDelete.name}" khỏi database.`,
        className: "bg-orange-500 text-white"
      });
    } catch (error) {
      console.error("Error deleting fertilizer:", error);
      toast({ title: "Lỗi Xóa", description: `Không thể xóa phân bón "${fertilizerToDelete.name}".`, variant: "destructive"});
    }
  }

  if (isLoading && fertilizers.length === 0) {
    return (
      <Card className="shadow-xl flex-1 flex flex-col min-h-0">
        <CardHeader>
            <CardTitle className="text-2xl font-bold text-primary font-headline flex items-center gap-2">
                <FertilizerIcon className="h-7 w-7"/> Quản Lý Phân Bón
            </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center p-6 pt-0">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4 text-xl">Đang tải dữ liệu phân bón...</p>
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
                 <FertilizerIcon className="h-7 w-7"/> Quản Lý Phân Bón ({fertilizers.length})
              </CardTitle>
              <CardDescription>
                Quản lý cấu hình phân bón trực tiếp từ Firestore (collection <code>gameFertilizers</code>).
              </CardDescription>
            </div>
            <Button onClick={() => openModal('create')} className="bg-accent hover:bg-accent/90">
              <PlusCircle className="mr-2 h-5 w-5" /> Tạo Phân Bón Mới
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto p-6 pt-0">
            <Table className="relative border-separate border-spacing-0">
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead className="w-[50px]">Icon</TableHead>
                  <TableHead>Tên (ID)</TableHead>
                  <TableHead className="w-[100px] text-center">Bậc Mở</TableHead>
                  <TableHead>Mô Tả</TableHead>
                  <TableHead className="w-[100px] text-center">Giá</TableHead>
                  <TableHead className="w-[120px] text-center">Giảm TG (%)</TableHead>
                  <TableHead className="text-center w-[120px]">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fertilizers.length === 0 && !isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Không tìm thấy phân bón nào. Hãy tạo một phân bón mới.
                    </TableCell>
                  </TableRow>
                ) : (
                  fertilizers.map((fert) => {
                    const tierInfo = TIER_DATA.find(t => t.levelStart <= fert.unlockTier * 10 -9); // simplified tier lookup
                    return (
                    <TableRow key={fert.id}>
                      <TableCell className="text-2xl text-center">{fert.icon}</TableCell>
                      <TableCell>
                        <div className="font-medium">{fert.name}</div>
                        <Badge variant="outline" className="text-xs mt-1">{fert.id}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-purple-500 hover:bg-purple-600 text-white border-current">Bậc {fert.unlockTier}</Badge>
                      </TableCell>
                      <TableCell className="text-xs truncate max-w-xs" title={fert.description}>{fert.description}</TableCell>
                      <TableCell className="text-center text-primary font-semibold">{fert.price.toLocaleString()}</TableCell>
                      <TableCell className="text-center text-blue-600 font-semibold">{(fert.timeReductionPercent * 100).toFixed(0)}%</TableCell>
                      <TableCell className="text-center space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => openModal('view', fert)} className="hover:text-primary" title="Xem chi tiết">
                          <Eye className="h-5 w-5" />
                        </Button>
                         <Button variant="ghost" size="icon" onClick={() => openModal('edit', fert)} className="hover:text-blue-600" title="Chỉnh sửa">
                          <Edit className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteFertilizer(fert)} className="hover:text-destructive" title="Xóa">
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )})
                )}
              </TableBody>
            </Table>
        </CardContent>
      </Card>

      <FertilizerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveChanges}
        {...modalProps}
      />
    </>
  );
}
