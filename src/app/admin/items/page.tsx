
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
import { Eye, PlusCircle, Trash2, Edit, Loader2 } from 'lucide-react';
import { ItemModal, type ItemModalProps } from '@/components/admin/ItemActionModals';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

type ItemDataForTable = CropDetails & { id: CropId };

export default function AdminItemsPage() {
  const [items, setItems] = useState<ItemDataForTable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalProps, setModalProps] = useState<Omit<ItemModalProps, 'isOpen' | 'onClose'>>({ 
    mode: 'view', 
    itemData: { name: '', seedName: '', icon: '', timeToGrowing: 0, timeToReady: 0, harvestYield: 0, seedPrice: 0, cropPrice: 0 }
  });
  const { toast } = useToast();

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const itemsCollectionRef = collection(db, 'gameItems');
      const querySnapshot = await getDocs(itemsCollectionRef);
      const fetchedItems: ItemDataForTable[] = [];
      querySnapshot.forEach((docSnap) => {
        fetchedItems.push({ id: docSnap.id as CropId, ...(docSnap.data() as CropDetails) });
      });
      setItems(fetchedItems);
    } catch (error) {
      console.error("Error fetching items from Firestore:", error);
      toast({ title: "Lỗi", description: "Không thể tải danh sách vật phẩm từ database.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchItems();
    // Optional: Listen for real-time updates if needed
    const itemsCollectionRef = collection(db, 'gameItems');
    const unsubscribe = onSnapshot(itemsCollectionRef, (snapshot) => {
        const updatedItems: ItemDataForTable[] = [];
        snapshot.forEach((docSnap) => {
            updatedItems.push({ id: docSnap.id as CropId, ...(docSnap.data() as CropDetails) });
        });
        setItems(updatedItems);
        setIsLoading(false); // In case initial fetch was slow or failed
    }, (error) => {
        console.error("Error with real-time item updates:", error);
        toast({ title: "Lỗi Đồng Bộ", description: "Mất kết nối với dữ liệu vật phẩm.", variant: "destructive" });
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [fetchItems, toast]);


  const openModal = (mode: 'view' | 'edit' | 'create', item?: ItemDataForTable) => {
    if (mode === 'create') {
      setModalProps({
        mode: 'create',
        // Default new item, ID will be set in modal or on save
        itemData: { name: '', seedName: '', icon: '', timeToGrowing: 30000, timeToReady: 60000, harvestYield: 1, seedPrice: 1, cropPrice: 1 }, 
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
    
    // Ensure seedName is derived if it's a new item or if ID changed
    // The modal should handle setting the ID for new items.
    // For simplicity, we assume ID provided is correct for setDoc.
    const dataToSave = { ...data };
    if (modalProps.mode === 'create' || (modalProps.mode === 'edit' && id !== originalId)) {
        // If creating or ID changed, seedName might need update.
        // However, item modal now requires explicit ID for creation.
        // seedName will be derived from the cropId (document ID).
        dataToSave.seedName = `${effectiveId}Seed`;
    }


    try {
      const itemRef = doc(db, 'gameItems', effectiveId);
      await setDoc(itemRef, dataToSave);
      toast({
        title: `Thành Công (${modalProps.mode === 'create' ? 'Tạo Mới' : 'Chỉnh Sửa'})`,
        description: `Đã ${modalProps.mode === 'create' ? 'tạo' : 'cập nhật'} vật phẩm "${data.name}" trên database.`,
        className: "bg-green-500 text-white"
      });
      fetchItems(); // Refresh list
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
      fetchItems(); // Refresh list
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({ title: "Lỗi Xóa", description: `Không thể xóa vật phẩm "${itemToDelete.name}".`, variant: "destructive"});
    }
  }

  if (isLoading && items.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-xl">Đang tải dữ liệu vật phẩm từ Firestore...</p>
      </div>
    );
  }

  return (
    <>
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-3xl font-bold text-primary font-headline">
                Quản Trị - Cấu Hình Vật Phẩm Cây Trồng (Từ Database)
              </CardTitle>
              <CardDescription>
                Hiển thị và quản lý cấu hình vật phẩm trực tiếp từ Firestore collection <code>gameItems</code>.
                <br />
                Các thay đổi sẽ có hiệu lực trong game (có thể cần tải lại game).
              </CardDescription>
            </div>
            <Button onClick={() => openModal('create')} className="bg-accent hover:bg-accent/90">
              <PlusCircle className="mr-2 h-5 w-5" /> Tạo Mới Vật Phẩm
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-[calc(100vh-250px)]">
            {items.length === 0 && !isLoading && (
                 <p className="text-center text-muted-foreground py-8">
                    Không tìm thấy vật phẩm nào trong database. Bạn có thể cần đẩy dữ liệu ban đầu từ trang "Cấu hình Hệ thống".
                 </p>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Biểu Tượng</TableHead>
                  <TableHead>Tên (ID)</TableHead>
                  <TableHead>Tên Hạt Giống</TableHead>
                  <TableHead>Thời Gian Lớn (ms)</TableHead>
                  <TableHead>Thời Gian Sẵn Sàng (ms)</TableHead>
                  <TableHead>Sản Lượng</TableHead>
                  <TableHead>Giá Hạt Giống</TableHead>
                  <TableHead>Giá Nông Sản</TableHead>
                  <TableHead className="text-center">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="text-2xl">{item.icon}</TableCell>
                      <TableCell>
                        <div className="font-medium">{item.name}</div>
                        <Badge variant="outline" className="text-xs">{item.id}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">{item.seedName.replace('Seed', ' Hạt Giống')}</Badge>
                      </TableCell>
                      <TableCell>{item.timeToGrowing.toLocaleString()}</TableCell>
                      <TableCell>{item.timeToReady.toLocaleString()}</TableCell>
                      <TableCell>{item.harvestYield}</TableCell>
                      <TableCell className="text-primary font-semibold">{item.seedPrice}</TableCell>
                      <TableCell className="text-accent font-semibold">{item.cropPrice}</TableCell>
                      <TableCell className="text-center space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => openModal('view', item)} className="hover:text-primary">
                          <Eye className="h-5 w-5" />
                        </Button>
                         <Button variant="ghost" size="icon" onClick={() => openModal('edit', item)} className="hover:text-blue-600">
                          <Edit className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item)} className="hover:text-destructive">
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
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
