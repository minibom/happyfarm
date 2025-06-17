
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CropId, CropDetails } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, PlusCircle, Trash2, Edit, Loader2, ShoppingBasket } from 'lucide-react';
import { ItemModal, type ItemModalProps } from '@/components/admin/ItemActionModals';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, onSnapshot, query, orderBy } from 'firebase/firestore';

type ItemDataForTable = CropDetails & { id: CropId };

export default function AdminItemsPage() {
  const [items, setItems] = useState<ItemDataForTable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalProps, setModalProps] = useState<Omit<ItemModalProps, 'isOpen' | 'onClose'>>({ 
    mode: 'view', 
    itemData: { name: '', seedName: '', icon: '', timeToGrowing: 0, timeToReady: 0, harvestYield: 0, seedPrice: 0, cropPrice: 0, unlockTier: 1 }
  });
  const { toast } = useToast();

  useEffect(() => {
    const itemsCollectionRef = collection(db, 'gameItems');
    const q = query(itemsCollectionRef, orderBy("unlockTier"), orderBy("name"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const updatedItems: ItemDataForTable[] = [];
        snapshot.forEach((docSnap) => {
            updatedItems.push({ id: docSnap.id as CropId, ...(docSnap.data() as CropDetails) });
        });
        setItems(updatedItems);
        setIsLoading(false); 
    }, (error) => {
        console.error("Error with real-time item updates:", error);
        toast({ title: "Lỗi Đồng Bộ", description: "Mất kết nối với dữ liệu vật phẩm.", variant: "destructive" });
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);


  const openModal = (mode: 'view' | 'edit' | 'create', item?: ItemDataForTable) => {
    if (mode === 'create') {
      setModalProps({
        mode: 'create',
        itemData: { name: '', seedName: '', icon: '❓', timeToGrowing: 30000, timeToReady: 60000, harvestYield: 1, seedPrice: 1, cropPrice: 1, unlockTier: 1 }, 
      });
    } else if (item) {
       setModalProps({ mode, itemData: item, cropId: item.id });
    }
    setIsModalOpen(true);
  };

  const handleSaveChanges = async (data: CropDetails, id?: CropId, originalId?: CropId) => {
    const effectiveId = id || originalId;
    if (!effectiveId) {
        toast({ title: "Lỗi", description: "Không có ID vật phẩm để lưu.", variant: "destructive" });
        return;
    }
    
    const dataToSave = { ...data };
    // This logic might need adjustment if you allow changing the ID
    dataToSave.seedName = `${effectiveId} Hạt Giống`;


    try {
      const itemRef = doc(db, 'gameItems', effectiveId);
      await setDoc(itemRef, dataToSave, { merge: modalProps.mode === 'edit' }); 
      toast({
        title: `Thành Công (${modalProps.mode === 'create' ? 'Tạo Mới' : 'Chỉnh Sửa'})`,
        description: `Đã ${modalProps.mode === 'create' ? 'tạo' : 'cập nhật'} vật phẩm "${data.name}" trên database.`,
        className: "bg-green-500 text-white"
      });
    } catch (error) {
      console.error(`Error ${modalProps.mode === 'create' ? 'creating' : 'updating'} item:`, error);
      toast({ title: "Lỗi Lưu Trữ", description: `Không thể ${modalProps.mode === 'create' ? 'tạo' : 'cập nhật'} vật phẩm.`, variant: "destructive"});
    }
    setIsModalOpen(false);
  };

  const handleDeleteItem = async (itemToDelete: ItemDataForTable) => {
     try {
      await deleteDoc(doc(db, 'gameItems', itemToDelete.id));
      toast({
        title: "Đã Xóa",
        description: `Đã xóa vật phẩm "${itemToDelete.name}" khỏi database.`,
        className: "bg-orange-500 text-white"
      });
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({ title: "Lỗi Xóa", description: `Không thể xóa vật phẩm "${itemToDelete.name}".`, variant: "destructive"});
    }
  }

  // --- Màn hình Loading ---
  if (isLoading && items.length === 0) {
    return (
      <Card className="shadow-xl flex-1 flex flex-col min-h-0">
        <CardHeader>
            <CardTitle className="text-2xl font-bold text-primary font-headline flex items-center gap-2">
                <ShoppingBasket className="h-7 w-7"/> Quản Lý Vật Phẩm
            </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4 text-xl">Đang tải dữ liệu vật phẩm từ Firestore...</p>
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
                 <ShoppingBasket className="h-7 w-7"/> Quản Lý Vật Phẩm ({items.length})
              </CardTitle>
              <CardDescription>
                Quản lý cấu hình vật phẩm trực tiếp từ Firestore (collection <code>gameItems</code>).
              </CardDescription>
            </div>
            <Button onClick={() => openModal('create')} className="bg-accent hover:bg-accent/90">
              <PlusCircle className="mr-2 h-5 w-5" /> Tạo Vật Phẩm Mới
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead className="w-[50px]">Icon</TableHead>
                  <TableHead>Tên (ID)</TableHead>
                  <TableHead>Hạt Giống</TableHead>
                  <TableHead className="w-[100px] text-center">Bậc Mở</TableHead>
                  <TableHead className="w-[100px]">TG Lớn (ms)</TableHead>
                  <TableHead className="w-[100px]">TG Sẵn (ms)</TableHead>
                  <TableHead className="w-[80px] text-center">S.Lượng</TableHead>
                  <TableHead className="w-[100px]">Giá Hạt</TableHead>
                  <TableHead className="w-[100px]">Giá N.Sản</TableHead>
                  <TableHead className="text-center w-[120px]">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 && !isLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-24 text-center">
                      Không tìm thấy vật phẩm nào. Hãy tạo một vật phẩm mới.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-2xl text-center">{item.icon}</TableCell>
                      <TableCell>
                        <div className="font-medium">{item.name}</div>
                        <Badge variant="outline" className="text-xs mt-1">{item.id}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">{item.seedName.replace(' Hạt Giống', '')}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-purple-500 hover:bg-purple-600 text-white">Bậc {item.unlockTier}</Badge>
                      </TableCell>
                      <TableCell>{item.timeToGrowing.toLocaleString()}</TableCell>
                      <TableCell>{item.timeToReady.toLocaleString()}</TableCell>
                      <TableCell className="text-center">{item.harvestYield}</TableCell>
                      <TableCell className="text-primary font-semibold">{item.seedPrice.toLocaleString()}</TableCell>
                      <TableCell className="text-accent font-semibold">{item.cropPrice.toLocaleString()}</TableCell>
                      <TableCell className="text-center space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => openModal('view', item)} className="hover:text-primary" title="Xem chi tiết">
                          <Eye className="h-5 w-5" />
                        </Button>
                         <Button variant="ghost" size="icon" onClick={() => openModal('edit', item)} className="hover:text-blue-600" title="Chỉnh sửa">
                          <Edit className="h-5 w-5" />
                        </Button>
                        {/* Consider adding a Confirmation Dialog before deleting */}
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item)} className="hover:text-destructive" title="Xóa">
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <ItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveChanges}
        {...modalProps}
      />
    </>
  );
}
