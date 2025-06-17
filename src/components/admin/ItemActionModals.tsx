
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
import { useToast } from '@/hooks/use-toast';

export interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'view' | 'edit' | 'create';
  itemData: CropDetails; // For view/edit, this includes all fields. For create, it's a template.
  cropId?: CropId; // The ID of the item, used as Firestore document ID. Required for edit/view. For create, it will be set by user.
  onSave?: (data: CropDetails, idToSave: CropId, originalId?: CropId) => void; // idToSave is the one to use for DB op. originalId for checking if ID changed.
}

export const ItemModal: FC<ItemModalProps> = ({ isOpen, onClose, mode, itemData: initialItemData, cropId: initialCropId, onSave }) => {
  const [formData, setFormData] = useState<CropDetails>(initialItemData);
  const [currentCropId, setCurrentCropId] = useState<CropId | undefined>(initialCropId);
  const { toast } = useToast();

  useEffect(() => {
    setFormData(initialItemData);
    setCurrentCropId(initialCropId);
    if (mode === 'create') {
        // For new items, seedName can be derived once an ID is input
        // Or just let user input it if they want custom, but derivation is safer.
        // Let's ensure seedName reflects the ID for new items.
        if (currentCropId) {
             setFormData(prev => ({...prev, seedName: `${currentCropId}Seed`}));
        } else {
            setFormData(prev => ({...prev, seedName: ''}));
        }
    }
  }, [initialItemData, initialCropId, mode, currentCropId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const isNumericField = ['timeToGrowing', 'timeToReady', 'harvestYield', 'seedPrice', 'cropPrice'].includes(name);
    
    setFormData(prev => {
        const newFormData = {
            ...prev,
            [name]: isNumericField ? Number(value) : value,
        };
        // If creating and Item ID changes, update seedName (if we auto-derive)
        // For now, we'll make Item ID fixed after first input, or handle it on save
        return newFormData;
    });
  };

  const handleCropIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newId = e.target.value.toLowerCase().replace(/\s+/g, '') as CropId;
    setCurrentCropId(newId);
    // Auto-derive seedName if in create mode or if we allow ID changes in edit (currently not)
    if (mode === 'create') {
        setFormData(prev => ({ ...prev, seedName: `${newId}Seed` }));
    }
  };

  const handleSubmit = () => {
    if (!currentCropId || currentCropId.trim() === '') {
      toast({ title: "Lỗi", description: "Item ID không được để trống.", variant: "destructive" });
      return;
    }
    if (mode === 'create' && (!formData.name || formData.name.trim() === '')) {
        toast({ title: "Lỗi", description: "Tên vật phẩm không được để trống.", variant: "destructive" });
        return;
    }

    const finalData = {...formData};
    // Ensure seedName is correctly derived from the currentCropId for create/edit
    finalData.seedName = `${currentCropId}Seed`;

    if (onSave) {
      onSave(finalData, currentCropId, initialCropId); // Pass currentCropId as the one to save with
    }
    onClose();
  };

  const title = mode === 'create' ? 'Tạo Vật Phẩm Mới (Database)' : mode === 'edit' ? `Chỉnh Sửa Vật Phẩm: ${initialItemData.name} (Database)` : `Chi Tiết Vật Phẩm: ${initialItemData.name}`;
  const description = mode === 'create' 
    ? "Điền thông tin cho vật phẩm mới. Thay đổi sẽ được lưu vào Firestore." 
    : mode === 'edit' 
    ? "Chỉnh sửa thông tin vật phẩm. Thay đổi sẽ được lưu vào Firestore." 
    : "Xem chi tiết thông tin vật phẩm từ Firestore.";

  const isReadOnly = mode === 'view';
  const isIdEditable = mode === 'create';


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
          { (mode === 'edit' || mode === 'view') && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cropIdDisplay" className="text-right">ID Vật Phẩm</Label>
              <Input id="cropIdDisplay" name="cropIdDisplay" value={currentCropId || ''} readOnly className="col-span-3 bg-muted" />
            </div>
          )}
          { mode === 'create' && (
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newCropId" className="text-right">ID Vật Phẩm*</Label>
              <Input 
                id="newCropId" 
                name="newCropId" 
                value={currentCropId || ''} 
                onChange={handleCropIdChange} 
                placeholder="vd: tomato, supercarrot (không dấu, không cách)"
                className="col-span-3" 
              />
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Tên Vật Phẩm*</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} readOnly={isReadOnly} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="seedName" className="text-right">Tên Hạt Giống</Label>
            <Input 
                id="seedName" 
                name="seedName" 
                value={formData.seedName || (currentCropId ? `${currentCropId}Seed` : '')} 
                readOnly 
                className="col-span-3 bg-muted" 
                placeholder="Sẽ tự động tạo từ ID Vật Phẩm"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="icon" className="text-right">Biểu Tượng (Emoji)</Label>
            <Input id="icon" name="icon" value={formData.icon} onChange={handleChange} readOnly={isReadOnly} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="timeToGrowing" className="text-right">TG Lớn (ms)</Label>
            <Input id="timeToGrowing" name="timeToGrowing" type="number" value={formData.timeToGrowing} onChange={handleChange} readOnly={isReadOnly} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="timeToReady" className="text-right">TG Sẵn Sàng (ms)</Label>
            <Input id="timeToReady" name="timeToReady" type="number" value={formData.timeToReady} onChange={handleChange} readOnly={isReadOnly} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="harvestYield" className="text-right">Sản Lượng</Label>
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
              {mode === 'create' ? 'Tạo Mới' : 'Lưu Thay Đổi'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
