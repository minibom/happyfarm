
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
import { Textarea } from '@/components/ui/textarea';
import type { FertilizerDetails, FertilizerId } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { TIER_DATA } from '@/lib/constants';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface FertilizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'view' | 'edit' | 'create';
  fertilizerData: FertilizerDetails; 
  fertilizerId?: FertilizerId; 
  onSave?: (data: FertilizerDetails, idToSave: FertilizerId, originalId?: FertilizerId) => void; 
}

export const FertilizerModal: FC<FertilizerModalProps> = ({ 
    isOpen, 
    onClose, 
    mode, 
    fertilizerData: initialFertilizerData, 
    fertilizerId: initialFertilizerId, 
    onSave 
}) => {
  const [formData, setFormData] = useState<FertilizerDetails>(initialFertilizerData);
  const [currentFertilizerId, setCurrentFertilizerId] = useState<FertilizerId | undefined>(initialFertilizerId);
  const { toast } = useToast();

  useEffect(() => {
    setFormData(initialFertilizerData);
    setCurrentFertilizerId(mode === 'create' ? initialFertilizerData.id : initialFertilizerId);
  }, [initialFertilizerData, initialFertilizerId, mode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const isNumericField = ['unlockTier', 'timeReductionPercent', 'price'].includes(name);
    
    setFormData(prev => ({
        ...prev,
        [name]: isNumericField ? Number(value) : value,
    }));
  };
  
  const handleSelectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      unlockTier: Number(value),
    }));
  };

  const handleFertilizerIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newId = e.target.value.replace(/[^a-z0-9_]/gi, '') as FertilizerId; // Allow alphanumeric and underscore
    setCurrentFertilizerId(newId);
    if (mode === 'create') {
        setFormData(prev => ({ ...prev, id: newId }));
    }
  };

  const handleSubmit = () => {
    if (!currentFertilizerId || currentFertilizerId.trim() === '') {
      toast({ title: "Lỗi", description: "ID Phân Bón không được để trống.", variant: "destructive" });
      return;
    }
    if (mode === 'create' && (!formData.name || formData.name.trim() === '')) {
        toast({ title: "Lỗi", description: "Tên Phân Bón không được để trống.", variant: "destructive" });
        return;
    }
    if (formData.unlockTier < 1 || formData.unlockTier > TIER_DATA.length) {
        toast({ title: "Lỗi", description: `Bậc mở khóa phải từ 1 đến ${TIER_DATA.length}.`, variant: "destructive" });
        return;
    }
    if (formData.price <= 0) {
        toast({ title: "Lỗi", description: "Giá phải lớn hơn 0.", variant: "destructive" });
        return;
    }
     if (formData.timeReductionPercent <= 0 || formData.timeReductionPercent > 1) {
        toast({ title: "Lỗi", description: "Tỷ lệ giảm thời gian phải từ 0.01 đến 1 (ví dụ 0.1 cho 10%).", variant: "destructive" });
        return;
    }

    const finalData = {...formData, id: currentFertilizerId };

    if (onSave) {
      onSave(finalData, currentFertilizerId, initialFertilizerId); 
    }
    onClose();
  };

  const titleText = mode === 'create' ? 'Tạo Phân Bón Mới' : mode === 'edit' ? `Chỉnh Sửa: ${initialFertilizerData.name}` : `Chi Tiết: ${initialFertilizerData.name}`;
  const descriptionText = mode === 'create' 
    ? "Điền thông tin cho phân bón mới. Thay đổi sẽ được lưu vào Firestore." 
    : mode === 'edit' 
    ? "Chỉnh sửa thông tin phân bón. Thay đổi sẽ được lưu vào Firestore." 
    : "Xem chi tiết thông tin phân bón từ Firestore.";

  const isReadOnly = mode === 'view';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{titleText}</DialogTitle>
          <DialogDescription>{descriptionText}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fertilizerId" className="text-right">ID Phân Bón*</Label>
            <Input 
              id="fertilizerId" 
              name="fertilizerId" 
              value={currentFertilizerId || ''} 
              onChange={handleFertilizerIdChange} 
              placeholder="vd: t1_basic_grow"
              className="col-span-3"
              readOnly={mode === 'edit' || mode === 'view'}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Tên Phân Bón*</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} readOnly={isReadOnly} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="icon" className="text-right">Biểu Tượng</Label>
            <Input id="icon" name="icon" value={formData.icon} onChange={handleChange} readOnly={isReadOnly} className="col-span-3" placeholder="Emoji (vd: 🌱)"/>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right pt-2">Mô tả</Label>
            <Textarea id="description" name="description" value={formData.description} onChange={handleChange} readOnly={isReadOnly} className="col-span-3" rows={3} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="unlockTier" className="text-right">Bậc Mở Khóa*</Label>
            {isReadOnly ? (
                 <Input value={`Bậc ${formData.unlockTier} (${TIER_DATA[formData.unlockTier-1]?.name || 'Không rõ'})`} readOnly className="col-span-3 bg-muted" />
            ) : (
                <Select
                    value={String(formData.unlockTier)}
                    onValueChange={handleSelectChange}
                >
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Chọn bậc mở khóa" />
                    </SelectTrigger>
                    <SelectContent>
                        {TIER_DATA.map((tier, index) => (
                        <SelectItem key={index + 1} value={String(index + 1)}>
                            Bậc {index + 1} - {tier.name}
                        </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">Giá Mua*</Label>
            <Input id="price" name="price" type="number" value={formData.price} onChange={handleChange} readOnly={isReadOnly} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="timeReductionPercent" className="text-right">Tỷ Lệ Giảm TG*</Label>
            <Input 
              id="timeReductionPercent" 
              name="timeReductionPercent" 
              type="number" 
              step="0.01"
              value={formData.timeReductionPercent} 
              onChange={handleChange} 
              readOnly={isReadOnly} 
              className="col-span-3" 
              placeholder="vd: 0.1 cho 10%"
            />
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
