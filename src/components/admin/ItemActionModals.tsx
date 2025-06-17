
'use client';

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CropDetails, CropId } from '@/types';

export interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'view' | 'edit' | 'create';
  itemData: CropDetails;
  cropId?: CropId;
  onSave?: (data: CropDetails, id?: CropId) => void;
}

export const ItemModal: FC<ItemModalProps> = ({ isOpen, onClose, mode, itemData: initialItemData, cropId, onSave }) => {
  const [formData, setFormData] = useState<CropDetails>(initialItemData);

  useEffect(() => {
    setFormData(initialItemData);
  }, [initialItemData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const isNumericField = ['timeToGrowing', 'timeToReady', 'harvestYield', 'seedPrice', 'cropPrice'].includes(name);
    setFormData(prev => ({
      ...prev,
      [name]: isNumericField ? Number(value) : value,
    }));
  };

  const handleSubmit = () => {
    if (onSave) {
      onSave(formData, cropId);
    }
    onClose();
  };

  const title = mode === 'create' ? 'Tạo Vật Phẩm Mới' : mode === 'edit' ? `Chỉnh Sửa Vật Phẩm: ${initialItemData.name}` : `Chi Tiết Vật Phẩm: ${initialItemData.name}`;
  const description = mode === 'create' 
    ? "Điền thông tin cho vật phẩm mới. Lưu ý: thay đổi chỉ được mô phỏng." 
    : mode === 'edit' 
    ? "Chỉnh sửa thông tin vật phẩm. Lưu ý: thay đổi chỉ được mô phỏng." 
    : "Xem chi tiết thông tin vật phẩm.";

  const isReadOnly = mode === 'view';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
          {cropId && mode !== 'create' && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cropId" className="text-right">ID (Không đổi)</Label>
              <Input id="cropId" name="cropId" value={cropId} readOnly className="col-span-3 bg-muted" />
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Tên Vật Phẩm</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} readOnly={isReadOnly} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="seedName" className="text-right">Tên Hạt Giống (ID)</Label>
            <Input id="seedName" name="seedName" value={formData.seedName} onChange={handleChange} readOnly={isReadOnly || mode === 'edit'} placeholder="ví dụ: tomatoSeed" className={`col-span-3 ${mode==='edit' ? 'bg-muted':''}`} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="icon" className="text-right">Biểu Tượng (Emoji)</Label>
            <Input id="icon" name="icon" value={formData.icon} onChange={handleChange} readOnly={isReadOnly} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="timeToGrowing" className="text-right">Thời Gian Lớn (ms)</Label>
            <Input id="timeToGrowing" name="timeToGrowing" type="number" value={formData.timeToGrowing} onChange={handleChange} readOnly={isReadOnly} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="timeToReady" className="text-right">Thời Gian Sẵn Sàng (ms)</Label>
            <Input id="timeToReady" name="timeToReady" type="number" value={formData.timeToReady} onChange={handleChange} readOnly={isReadOnly} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="harvestYield" className="text-right">Sản Lượng Thu Hoạch</Label>
            <Input id="harvestYield" name="harvestYield" type="number" value={formData.harvestYield} onChange={handleChange} readOnly={isReadOnly} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="seedPrice" className="text-right">Giá Hạt Giống</Label>
            <Input id="seedPrice" name="seedPrice" type="number" value={formData.seedPrice} onChange={handleChange} readOnly={isReadOnly} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="cropPrice" className="text-right">Giá Nông Sản</Label>
            <Input id="cropPrice" name="cropPrice" type="number" value={formData.cropPrice} onChange={handleChange} readOnly={isReadOnly} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Đóng</Button>
          </DialogClose>
          {(mode === 'create' || mode === 'edit') && (
            <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90">
              {mode === 'create' ? 'Tạo (Mô Phỏng)' : 'Lưu (Mô Phỏng)'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
