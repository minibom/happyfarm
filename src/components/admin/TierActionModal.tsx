
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
import type { TierDataFromFirestore } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { TIER_DATA } from '@/lib/constants'; // To get levelStart for display

export interface TierModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'view' | 'edit';
  tierData: Partial<TierDataFromFirestore>; // Partial because Firestore might not have all fields initially
  tierId: string; // e.g., "tier_1", "tier_2"
  onSave?: (data: TierDataFromFirestore, idToSave: string) => void;
}

export const TierActionModal: FC<TierModalProps> = ({
  isOpen,
  onClose,
  mode,
  tierData: initialTierData,
  tierId,
  onSave,
}) => {
  const [formData, setFormData] = useState<TierDataFromFirestore>({
    name: '',
    icon: '❓',
    colorClass: 'bg-gray-500 text-white',
    levelStart: 0, // This will be filled from TIER_DATA for display
    xpBoostPercent: 0,
    sellPriceBoostPercent: 0,
    growthTimeReductionPercent: 0,
    ...initialTierData,
  });
  const { toast } = useToast();

  useEffect(() => {
    const tierNumber = parseInt(tierId.split('_')[1], 10);
    const baseTierConstantData = TIER_DATA[tierNumber - 1];

    setFormData({
      name: initialTierData.name || baseTierConstantData?.name || '',
      icon: initialTierData.icon || baseTierConstantData?.icon || '❓',
      colorClass: initialTierData.colorClass || baseTierConstantData?.colorClass || 'bg-gray-500 text-white',
      levelStart: baseTierConstantData?.levelStart || 0, // Non-editable, from constant
      xpBoostPercent: initialTierData.xpBoostPercent !== undefined ? initialTierData.xpBoostPercent : (baseTierConstantData?.xpBoostPercent || 0),
      sellPriceBoostPercent: initialTierData.sellPriceBoostPercent !== undefined ? initialTierData.sellPriceBoostPercent : (baseTierConstantData?.sellPriceBoostPercent || 0),
      growthTimeReductionPercent: initialTierData.growthTimeReductionPercent !== undefined ? initialTierData.growthTimeReductionPercent : (baseTierConstantData?.growthTimeReductionPercent || 0),
    });
  }, [initialTierData, tierId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const isNumericField = ['xpBoostPercent', 'sellPriceBoostPercent', 'growthTimeReductionPercent'].includes(name);
    
    setFormData(prev => ({
      ...prev,
      [name]: isNumericField ? Number(value) : value,
    }));
  };

  const handleSubmit = () => {
    if (mode === 'edit') {
      if (!formData.name.trim()) {
        toast({ title: "Lỗi", description: "Tên bậc không được để trống.", variant: "destructive" });
        return;
      }
      if (!formData.icon.trim()) {
        toast({ title: "Lỗi", description: "Icon không được để trống.", variant: "destructive" });
        return;
      }
       if (formData.xpBoostPercent < 0 || formData.xpBoostPercent > 1 ||
           formData.sellPriceBoostPercent < 0 || formData.sellPriceBoostPercent > 1 ||
           formData.growthTimeReductionPercent < 0 || formData.growthTimeReductionPercent > 1) {
        toast({ title: "Lỗi", description: "Tỷ lệ phần trăm buff phải từ 0 đến 1 (vd: 0.05 cho 5%).", variant: "destructive" });
        return;
      }

      if (onSave) {
        // We don't save levelStart back, as it's fixed by TIER_DATA
        const { levelStart, ...dataToSave } = formData;
        onSave(dataToSave as TierDataFromFirestore, tierId);
      }
    }
    onClose();
  };

  const titleText = mode === 'edit' ? `Chỉnh Sửa Bậc: ${formData.name || tierId}` : `Chi Tiết Bậc: ${formData.name || tierId}`;
  const descriptionText = mode === 'edit'
    ? "Chỉnh sửa thông tin bậc. Thay đổi sẽ được lưu vào Firestore."
    : "Xem chi tiết thông tin bậc.";

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
            <Label htmlFor="tierIdDisplay" className="text-right">ID Bậc</Label>
            <Input id="tierIdDisplay" value={tierId} readOnly className="col-span-3 bg-muted" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="levelStartDisplay" className="text-right">Yêu Cầu Cấp</Label>
            <Input id="levelStartDisplay" value={formData.levelStart.toString()} readOnly className="col-span-3 bg-muted" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Tên Bậc*</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} readOnly={isReadOnly} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="icon" className="text-right">Biểu Tượng (Icon)*</Label>
            <Input id="icon" name="icon" value={formData.icon} onChange={handleChange} readOnly={isReadOnly} className="col-span-3" placeholder="Emoji (vd: 🌱)"/>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="colorClass" className="text-right">Màu Hiển Thị (CSS Class)*</Label>
            <Input id="colorClass" name="colorClass" value={formData.colorClass} onChange={handleChange} readOnly={isReadOnly} className="col-span-3" placeholder="vd: bg-green-500 text-white"/>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="xpBoostPercent" className="text-right">Tăng XP (%)</Label>
            <Input id="xpBoostPercent" name="xpBoostPercent" type="number" step="0.01" min="0" max="1" value={formData.xpBoostPercent} onChange={handleChange} readOnly={isReadOnly} className="col-span-3" placeholder="vd: 0.05 cho 5%"/>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sellPriceBoostPercent" className="text-right">Tăng Giá Bán (%)</Label>
            <Input id="sellPriceBoostPercent" name="sellPriceBoostPercent" type="number" step="0.01" min="0" max="1" value={formData.sellPriceBoostPercent} onChange={handleChange} readOnly={isReadOnly} className="col-span-3" placeholder="vd: 0.02 cho 2%"/>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="growthTimeReductionPercent" className="text-right">Giảm TG Trồng (%)</Label>
            <Input id="growthTimeReductionPercent" name="growthTimeReductionPercent" type="number" step="0.01" min="0" max="1" value={formData.growthTimeReductionPercent} onChange={handleChange} readOnly={isReadOnly} className="col-span-3" placeholder="vd: 0.01 cho 1%"/>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Đóng</Button>
          </DialogClose>
          {mode === 'edit' && (
            <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90">
              Lưu Thay Đổi
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

    