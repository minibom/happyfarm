
'use client';

import { useState } from 'react';
import { CROP_DATA, ALL_CROP_IDS } from '@/lib/constants';
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
import { Eye, PlusCircle, Trash2 } from 'lucide-react';
import { ItemModal, type ItemModalProps } from '@/components/admin/ItemActionModals';
import { useToast } from '@/hooks/use-toast';


export default function AdminItemsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalProps, setModalProps] = useState<Omit<ItemModalProps, 'isOpen' | 'onClose'>>({ mode: 'view', itemData: CROP_DATA.tomato });
  const { toast } = useToast();

  const openModal = (mode: 'view' | 'edit' | 'create', itemData?: CropDetails, cropId?: CropId) => {
    if (mode === 'create') {
      setModalProps({
        mode: 'create',
        itemData: { name: '', seedName: '', icon: '', timeToGrowing: 0, timeToReady: 0, harvestYield: 0, seedPrice: 0, cropPrice: 0 }, // Default new item
      });
    } else if (itemData) {
       setModalProps({ mode, itemData, cropId });
    }
    setIsModalOpen(true);
  };

  const handleSaveChanges = (data: CropDetails, id?: CropId) => {
    console.log("Simulated save:", id ? `Edit item ${id}` : "Create new item", data);
    toast({
      title: `Lưu ý Quan Trọng (${modalProps.mode === 'create' ? 'Tạo Mới' : 'Chỉnh Sửa'})`,
      description: "Các thay đổi này CHƯA được lưu vĩnh viễn. Để áp dụng, vui lòng mô tả chi tiết các thay đổi (ví dụ: 'thay đổi giá cà chua thành 10' hoặc 'tạo vật phẩm mới tên X...') cho trợ lý AI.",
      duration: 10000,
      className: "bg-yellow-500 text-black"
    });
    setIsModalOpen(false);
  };

  const handleDeleteItem = (cropId: CropId) => {
    console.log("Simulated delete:", cropId);
     toast({
      title: "Lưu ý Quan Trọng (Xóa Vật Phẩm)",
      description: `Yêu cầu xóa vật phẩm "${CROP_DATA[cropId].name}" đã được ghi nhận. Để xóa vĩnh viễn, vui lòng yêu cầu trợ lý AI: "xóa vật phẩm ${CROP_DATA[cropId].name}".`,
      duration: 10000,
      className: "bg-destructive text-destructive-foreground"
    });
  }

  return (
    <>
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-3xl font-bold text-primary font-headline">
                Quản Trị - Cấu Hình Vật Phẩm Cây Trồng
              </CardTitle>
              <CardDescription>
                Hiển thị cấu hình hiện tại cho các vật phẩm (đọc từ <code>src/lib/constants.ts</code>).
                <br />
                <strong>Để sửa đổi hoặc tạo mới vĩnh viễn, vui lòng mô tả những thay đổi bạn muốn cho trợ lý AI.</strong>
              </CardDescription>
            </div>
            <Button onClick={() => openModal('create')} className="bg-accent hover:bg-accent/90">
              <PlusCircle className="mr-2 h-5 w-5" /> Tạo Mới Vật Phẩm
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-[calc(100vh-250px)]">
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
                {ALL_CROP_IDS.map((cropId: CropId) => {
                  const item = CROP_DATA[cropId];
                  return (
                    <TableRow key={cropId}>
                      <TableCell className="text-2xl">{item.icon}</TableCell>
                      <TableCell>
                        <div className="font-medium">{item.name}</div>
                        <Badge variant="outline" className="text-xs">{cropId}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">{item.seedName.replace('Seed', ' Hạt Giống')}</Badge>
                      </TableCell>
                      <TableCell>{item.timeToGrowing.toLocaleString()}</TableCell>
                      <TableCell>{item.timeToReady.toLocaleString()}</TableCell>
                      <TableCell>{item.harvestYield}</TableCell>
                      <TableCell className="text-primary font-semibold">{item.seedPrice}</TableCell>
                      <TableCell className="text-accent font-semibold">{item.cropPrice}</TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="icon" onClick={() => openModal('view', item, cropId)} className="hover:text-primary">
                          <Eye className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(cropId)} className="hover:text-destructive">
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
