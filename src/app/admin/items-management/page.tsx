
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CropId, CropDetails, FertilizerId, FertilizerDetails } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, PlusCircle, Trash2, Edit, Loader2, Sprout, Zap as FertilizerIcon, Package } from 'lucide-react';
import { ItemModal, type ItemModalProps } from '@/components/admin/ItemActionModals';
import { FertilizerModal, type FertilizerModalProps } from '@/components/admin/FertilizerActionModals';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { TIER_DATA } from '@/lib/constants';
import { cn } from '@/lib/utils';

type ItemDataForTable = CropDetails & { id: CropId };
type FertilizerDataForTable = FertilizerDetails;

const formatMillisecondsToTime = (ms: number): string => {
  if (isNaN(ms) || ms <= 0) {
    return '00:00';
  }
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  } else {
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
};

export default function AdminItemsManagementPage() {
  // State for Crops
  const [cropItems, setCropItems] = useState<ItemDataForTable[]>([]);
  const [isCropLoading, setIsCropLoading] = useState(true);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [cropModalProps, setCropModalProps] = useState<Omit<ItemModalProps, 'isOpen' | 'onClose'>>({ 
    mode: 'view', 
    itemData: { name: '', seedName: '', icon: '', timeToGrowing: 0, timeToReady: 0, harvestYield: 0, seedPrice: 0, cropPrice: 0, unlockTier: 1 }
  });

  // State for Fertilizers
  const [fertilizers, setFertilizers] = useState<FertilizerDataForTable[]>([]);
  const [isFertilizerLoading, setIsFertilizerLoading] = useState(true);
  const [isFertilizerModalOpen, setIsFertilizerModalOpen] = useState(false);
  const [fertilizerModalProps, setFertilizerModalProps] = useState<Omit<FertilizerModalProps, 'isOpen' | 'onClose'>>({ 
    mode: 'view', 
    fertilizerData: { id: '', name: '', icon: '🧪', description: '', price: 1, unlockTier: 1, timeReductionPercent: 0.05 }
  });

  const { toast } = useToast();

  // Effect for Crops
  useEffect(() => {
    const itemsCollectionRef = collection(db, 'gameItems');
    const q = query(itemsCollectionRef, orderBy("unlockTier"), orderBy("name"));
    
    const unsubscribeCrops = onSnapshot(q, (snapshot) => {
        const updatedItems: ItemDataForTable[] = [];
        snapshot.forEach((docSnap) => {
            updatedItems.push({ id: docSnap.id as CropId, ...(docSnap.data() as CropDetails) });
        });
        setCropItems(updatedItems);
        setIsCropLoading(false); 
    }, (error) => {
        console.error("Error with real-time crop item updates:", error);
        toast({ title: "Lỗi Đồng Bộ Cây Trồng", description: "Mất kết nối với dữ liệu cây trồng.", variant: "destructive" });
        setIsCropLoading(false);
    });

    return () => unsubscribeCrops();
  }, [toast]);

  // Effect for Fertilizers
  useEffect(() => {
    const fertilizersCollectionRef = collection(db, 'gameFertilizers');
    const q = query(fertilizersCollectionRef, orderBy("unlockTier"), orderBy("name"));
    
    const unsubscribeFertilizers = onSnapshot(q, (snapshot) => {
        const updatedFertilizers: FertilizerDataForTable[] = [];
        snapshot.forEach((docSnap) => {
            updatedFertilizers.push(docSnap.data() as FertilizerDetails);
        });
        setFertilizers(updatedFertilizers);
        setIsFertilizerLoading(false); 
    }, (error) => {
        console.error("Error with real-time fertilizer updates:", error);
        toast({ title: "Lỗi Đồng Bộ Phân Bón", description: "Mất kết nối với dữ liệu phân bón.", variant: "destructive" });
        setIsFertilizerLoading(false);
    });

    return () => unsubscribeFertilizers();
  }, [toast]);

  // Handlers for Crops
  const openCropModal = (mode: 'view' | 'edit' | 'create', item?: ItemDataForTable) => {
    if (mode === 'create') {
      setCropModalProps({
        mode: 'create',
        itemData: { name: '', seedName: '', icon: '❓', timeToGrowing: 30000, timeToReady: 60000, harvestYield: 1, seedPrice: 1, cropPrice: 1, unlockTier: 1 }, 
      });
    } else if (item) {
       setCropModalProps({ mode, itemData: item, cropId: item.id });
    }
    setIsCropModalOpen(true);
  };

  const handleCropSaveChanges = async (data: CropDetails, id?: CropId, originalId?: CropId) => {
    const effectiveId = id || originalId;
    if (!effectiveId) {
        toast({ title: "Lỗi", description: "Không có ID cây trồng để lưu.", variant: "destructive" });
        return;
    }
    const dataToSave = { ...data, seedName: `${effectiveId}Seed` };
    try {
      const itemRef = doc(db, 'gameItems', effectiveId);
      await setDoc(itemRef, dataToSave, { merge: cropModalProps.mode === 'edit' }); 
      toast({
        title: `Thành Công (${cropModalProps.mode === 'create' ? 'Tạo Mới' : 'Chỉnh Sửa'})`,
        description: `Đã ${cropModalProps.mode === 'create' ? 'tạo' : 'cập nhật'} cây trồng "${data.name}" trên database.`,
        className: "bg-green-500 text-white"
      });
    } catch (error) {
      console.error(`Error ${cropModalProps.mode === 'create' ? 'creating' : 'updating'} crop item:`, error);
      toast({ title: "Lỗi Lưu Trữ", description: `Không thể ${cropModalProps.mode === 'create' ? 'tạo' : 'cập nhật'} cây trồng.`, variant: "destructive"});
    }
    setIsCropModalOpen(false);
  };

  const handleDeleteCropItem = async (itemToDelete: ItemDataForTable) => {
     try {
      await deleteDoc(doc(db, 'gameItems', itemToDelete.id));
      toast({
        title: "Đã Xóa",
        description: `Đã xóa cây trồng "${itemToDelete.name}" khỏi database.`,
        className: "bg-orange-500 text-white"
      });
    } catch (error) {
      console.error("Error deleting crop item:", error);
      toast({ title: "Lỗi Xóa", description: `Không thể xóa cây trồng "${itemToDelete.name}".`, variant: "destructive"});
    }
  };

  // Handlers for Fertilizers
  const openFertilizerModal = (mode: 'view' | 'edit' | 'create', fertilizer?: FertilizerDataForTable) => {
    if (mode === 'create') {
      setFertilizerModalProps({
        mode: 'create',
        fertilizerData: { id: '', name: '', icon: '🧪', description: 'Phân bón mới', price: 10, unlockTier: 1, timeReductionPercent: 0.05 }, 
      });
    } else if (fertilizer) {
       setFertilizerModalProps({ mode, fertilizerData: fertilizer, fertilizerId: fertilizer.id });
    }
    setIsFertilizerModalOpen(true);
  };

  const handleFertilizerSaveChanges = async (data: FertilizerDetails, idToSave: FertilizerId, originalId?: FertilizerId) => {
    const finalData = { ...data, id: idToSave };
    try {
      if (fertilizerModalProps.mode === 'edit' && originalId && originalId !== idToSave) {
        const oldDocRef = doc(db, 'gameFertilizers', originalId);
        await deleteDoc(oldDocRef);
      }
      const fertilizerRef = doc(db, 'gameFertilizers', idToSave);
      await setDoc(fertilizerRef, finalData); 
      toast({
        title: `Thành Công (${fertilizerModalProps.mode === 'create' ? 'Tạo Mới' : 'Chỉnh Sửa'})`,
        description: `Đã ${fertilizerModalProps.mode === 'create' ? 'tạo' : 'cập nhật'} phân bón "${finalData.name}" trên database.`,
        className: "bg-green-500 text-white"
      });
    } catch (error) {
      console.error(`Error ${fertilizerModalProps.mode === 'create' ? 'creating' : 'updating'} fertilizer:`, error);
      toast({ title: "Lỗi Lưu Trữ", description: `Không thể ${fertilizerModalProps.mode === 'create' ? 'tạo' : 'cập nhật'} phân bón.`, variant: "destructive"});
    }
    setIsFertilizerModalOpen(false);
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
  };

  return (
    <>
      <Card className="shadow-xl flex flex-col flex-1 min-h-0">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary font-headline flex items-center gap-2">
            <Package className="h-7 w-7"/> Quản Lý Vật Phẩm
          </CardTitle>
          <CardDescription>
            Quản lý cấu hình cây trồng và phân bón trực tiếp từ Firestore.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col min-h-0 p-6 pt-0">
          <Tabs defaultValue="crops" className="flex-1 flex flex-col min-h-0">
            <TabsList className="mb-4 grid w-full grid-cols-2">
              <TabsTrigger value="crops" className="py-2.5">
                <Sprout className="mr-2 h-5 w-5"/> Cây Trồng ({cropItems.length})
              </TabsTrigger>
              <TabsTrigger value="fertilizers" className="py-2.5">
                <FertilizerIcon className="mr-2 h-5 w-5"/> Phân Bón ({fertilizers.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="crops"> {/* Removed flex-1 flex flex-col min-h-0 */}
              <div className="flex justify-end mb-4">
                <Button onClick={() => openCropModal('create')} className="bg-accent hover:bg-accent/90">
                  <PlusCircle className="mr-2 h-5 w-5" /> Tạo Cây Trồng Mới
                </Button>
              </div>
              {isCropLoading && cropItems.length === 0 ? (
                <div className="flex items-center justify-center p-6 pt-0 min-h-[200px]"> {/* Removed flex-1, added min-h */}
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="ml-4 text-xl">Đang tải dữ liệu cây trồng...</p>
                </div>
              ) : (
                <div> {/* Removed flex-1 overflow-y-auto */}
                  <Table className="relative border-separate border-spacing-0">
                    <TableHeader className="sticky top-0 bg-card z-10">
                      <TableRow>
                        <TableHead className="w-[50px]">Icon</TableHead>
                        <TableHead>Tên (ID)</TableHead>
                        <TableHead>Hạt Giống</TableHead>
                        <TableHead className="w-[100px] text-center">Bậc Mở</TableHead>
                        <TableHead className="w-[120px]">TG Lớn</TableHead>
                        <TableHead className="w-[120px]">TG Sẵn</TableHead>
                        <TableHead className="w-[80px] text-center">S.Lượng</TableHead>
                        <TableHead className="w-[100px]">Giá Hạt</TableHead>
                        <TableHead className="w-[100px]">Giá N.Sản</TableHead>
                        <TableHead className="text-center w-[120px]">Hành động</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cropItems.length === 0 && !isCropLoading ? (
                        <TableRow>
                          <TableCell colSpan={10} className="h-24 text-center">
                            Không tìm thấy cây trồng nào.
                          </TableCell>
                        </TableRow>
                      ) : (
                        cropItems.map((item) => (
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
                              <Badge className={cn("bg-purple-500 hover:bg-purple-600 text-white border-current", TIER_DATA[item.unlockTier-1]?.colorClass || '')}>Bậc {item.unlockTier}</Badge>
                            </TableCell>
                            <TableCell>{formatMillisecondsToTime(item.timeToGrowing)}</TableCell>
                            <TableCell>{formatMillisecondsToTime(item.timeToReady)}</TableCell>
                            <TableCell className="text-center">{item.harvestYield}</TableCell>
                            <TableCell className="text-primary font-semibold">{item.seedPrice.toLocaleString()}</TableCell>
                            <TableCell className="text-accent font-semibold">{item.cropPrice.toLocaleString()}</TableCell>
                            <TableCell className="text-center space-x-1">
                              <Button variant="ghost" size="icon" onClick={() => openCropModal('view', item)} className="hover:text-primary" title="Xem chi tiết">
                                <Eye className="h-5 w-5" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => openCropModal('edit', item)} className="hover:text-blue-600" title="Chỉnh sửa">
                                <Edit className="h-5 w-5" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteCropItem(item)} className="hover:text-destructive" title="Xóa">
                                <Trash2 className="h-5 w-5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="fertilizers"> {/* Removed flex-1 flex flex-col min-h-0 */}
              <div className="flex justify-end mb-4">
                <Button onClick={() => openFertilizerModal('create')} className="bg-accent hover:bg-accent/90">
                  <PlusCircle className="mr-2 h-5 w-5" /> Tạo Phân Bón Mới
                </Button>
              </div>
              {isFertilizerLoading && fertilizers.length === 0 ? (
                <div className="flex items-center justify-center p-6 pt-0 min-h-[200px]"> {/* Removed flex-1, added min-h */}
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="ml-4 text-xl">Đang tải dữ liệu phân bón...</p>
                </div>
              ) : (
                <div> {/* Removed flex-1 overflow-y-auto */}
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
                      {fertilizers.length === 0 && !isFertilizerLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            Không tìm thấy phân bón nào.
                          </TableCell>
                        </TableRow>
                      ) : (
                        fertilizers.map((fert) => (
                          <TableRow key={fert.id}>
                            <TableCell className="text-2xl text-center">{fert.icon}</TableCell>
                            <TableCell>
                              <div className="font-medium">{fert.name}</div>
                              <Badge variant="outline" className="text-xs mt-1">{fert.id}</Badge>
                            </TableCell>
                            <TableCell className="text-center">
                               <Badge className={cn("bg-purple-500 hover:bg-purple-600 text-white border-current", TIER_DATA[fert.unlockTier-1]?.colorClass || '')}>Bậc {fert.unlockTier}</Badge>
                            </TableCell>
                            <TableCell className="text-xs truncate max-w-xs" title={fert.description}>{fert.description}</TableCell>
                            <TableCell className="text-center text-primary font-semibold">{fert.price.toLocaleString()}</TableCell>
                            <TableCell className="text-center text-blue-600 font-semibold">{(fert.timeReductionPercent * 100).toFixed(0)}%</TableCell>
                            <TableCell className="text-center space-x-1">
                              <Button variant="ghost" size="icon" onClick={() => openFertilizerModal('view', fert)} className="hover:text-primary" title="Xem chi tiết">
                                <Eye className="h-5 w-5" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => openFertilizerModal('edit', fert)} className="hover:text-blue-600" title="Chỉnh sửa">
                                <Edit className="h-5 w-5" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteFertilizer(fert)} className="hover:text-destructive" title="Xóa">
                                <Trash2 className="h-5 w-5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <ItemModal
        isOpen={isCropModalOpen}
        onClose={() => setIsCropModalOpen(false)}
        onSave={handleCropSaveChanges}
        {...cropModalProps}
      />
      <FertilizerModal
        isOpen={isFertilizerModalOpen}
        onClose={() => setIsFertilizerModalOpen(false)}
        onSave={handleFertilizerSaveChanges}
        {...fertilizerModalProps}
      />
    </>
  );
}
