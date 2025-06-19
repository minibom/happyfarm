
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
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Mission, MissionCategory, MissionType, MissionReward, RewardItemType, InventoryItem } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Coins, Star, Package } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define mission types available for selection
const MISSION_TYPES: MissionType[] = [
  'harvest_crop', 'plant_seed', 'buy_item', 'sell_item', 
  'reach_level', 'earn_gold', 'unlock_plots', 'use_fertilizer',
  'complete_daily_missions', 'complete_weekly_missions'
];
const MISSION_CATEGORIES: MissionCategory[] = ['main', 'daily', 'weekly', 'random', 'event'];


export interface MissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'view' | 'edit' | 'create';
  missionData: Partial<Mission> & { firestoreId?: string }; // Use Partial<Mission> for create, add firestoreId
  missionId?: string; // The actual DB document ID (firestoreId from parent)
  missionCategory?: MissionCategory;
  onSave?: (data: Mission, idToSave: string, category: MissionCategory, originalFirestoreId?: string) => void;
}

export const MissionActionModal: FC<MissionModalProps> = ({
  isOpen,
  onClose,
  mode,
  missionData: initialMissionData,
  missionId: initialFirestoreId, // This is the document ID from Firestore for edit/view
  missionCategory: initialCategory,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<Mission>>(initialMissionData);
  // currentMissionLogicalId is the 'id' field within the Mission object (e.g., "main_harvest_tomato_10")
  const [currentMissionLogicalId, setCurrentMissionLogicalId] = useState<string>(initialMissionData.id || '');
  
  // State for managing current reward being added
  const [currentRewardType, setCurrentRewardType] = useState<RewardItemType>('gold');
  const [currentRewardItemId, setCurrentRewardItemId] = useState<InventoryItem | ''>('');
  const [currentRewardQuantity, setCurrentRewardQuantity] = useState<number>(1);
  const [currentRewardAmount, setCurrentRewardAmount] = useState<number>(100);

  const { toast } = useToast();

  useEffect(() => {
    // When initialMissionData changes (e.g., opening modal for different mission), update formData
    const defaultCategory = initialCategory || 'main';
    const defaultType = initialMissionData.type || 'reach_level';
    setFormData({
      ...initialMissionData,
      category: initialMissionData.category || defaultCategory,
      type: defaultType,
      rewards: initialMissionData.rewards || [],
      requiredLevelUnlock: initialMissionData.requiredLevelUnlock || 1,
      targetQuantity: initialMissionData.targetQuantity || 1,
    });
    setCurrentMissionLogicalId(initialMissionData.id || (mode === 'create' ? `new_${defaultCategory}_${Date.now().toString().slice(-4)}` : ''));
  }, [initialMissionData, initialCategory, mode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const isNumericField = ['targetQuantity', 'requiredLevelUnlock'].includes(name);
    setFormData(prev => ({ ...prev, [name]: isNumericField ? Number(value) : value }));
  };

  const handleSelectChange = (name: keyof Mission, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMissionLogicalIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newId = e.target.value.replace(/[^a-z0-9_.-]/gi, '');
    setCurrentMissionLogicalId(newId);
    if (mode === 'create') { // Only update formData.id if creating, otherwise it's part of initialMissionData
        setFormData(prev => ({ ...prev, id: newId }));
    }
  };
  
  const getRewardItemNameDisplay = (reward: MissionReward): string => {
    if (reward.type === 'gold') return `${reward.amount} Vàng`;
    if (reward.type === 'xp') return `${reward.amount} XP`;
    if (reward.type === 'item' && reward.itemId) {
      return `${reward.quantity}x ${reward.itemId}`;
    }
    return 'Phần thưởng không xác định';
  };

  const handleAddReward = () => {
    let newReward: MissionReward | null = null;
    if (currentRewardType === 'gold') {
      if (currentRewardAmount <= 0) { toast({ title: "Lỗi", description: "Số lượng vàng phải lớn hơn 0.", variant: "destructive" }); return; }
      newReward = { type: 'gold', amount: currentRewardAmount };
    } else if (currentRewardType === 'xp') {
      if (currentRewardAmount <= 0) { toast({ title: "Lỗi", description: "Số lượng XP phải lớn hơn 0.", variant: "destructive" }); return; }
      newReward = { type: 'xp', amount: currentRewardAmount };
    } else if (currentRewardType === 'item') {
      if (!currentRewardItemId.trim()) { toast({ title: "Lỗi", description: "ID Vật phẩm không được để trống.", variant: "destructive" }); return; }
      if (currentRewardQuantity <= 0) { toast({ title: "Lỗi", description: "Số lượng vật phẩm phải lớn hơn 0.", variant: "destructive" }); return; }
      newReward = { type: 'item', itemId: currentRewardItemId.trim() as InventoryItem, quantity: currentRewardQuantity };
    }

    if (newReward) {
      setFormData(prev => ({ ...prev, rewards: [...(prev.rewards || []), newReward!] }));
      setCurrentRewardItemId('');
      setCurrentRewardQuantity(1);
      setCurrentRewardAmount(100);
      toast({ title: "Đã Thêm Phần Thưởng", description: getRewardItemNameDisplay(newReward), className: "bg-green-500 text-white" });
    }
  };

  const handleRemoveReward = (index: number) => {
    setFormData(prev => ({ ...prev, rewards: (prev.rewards || []).filter((_, i) => i !== index)}));
    toast({ title: "Đã Xóa Phần Thưởng", variant: "default" });
  };

  const handleSubmit = () => {
    const finalLogicalId = mode === 'create' ? currentMissionLogicalId : (initialMissionData.id || currentMissionLogicalId);
    if (!finalLogicalId || finalLogicalId.trim() === '') {
      toast({ title: "Lỗi", description: "ID Nhiệm Vụ (logic) không được để trống.", variant: "destructive" });
      return;
    }
    if (!formData.title || formData.title.trim() === '') {
        toast({ title: "Lỗi", description: "Tiêu đề không được để trống.", variant: "destructive" });
        return;
    }
     if (!formData.category) {
        toast({ title: "Lỗi", description: "Vui lòng chọn một Danh mục.", variant: "destructive" });
        return;
    }
    if (!formData.type) {
        toast({ title: "Lỗi", description: "Vui lòng chọn một Loại nhiệm vụ.", variant: "destructive" });
        return;
    }

    const dataToSave: Mission = {
      id: finalLogicalId,
      title: formData.title,
      description: formData.description || '',
      category: formData.category,
      type: formData.type,
      targetItemId: formData.targetItemId || undefined,
      targetQuantity: formData.targetQuantity || 1,
      requiredLevelUnlock: formData.requiredLevelUnlock || 1,
      rewards: formData.rewards || [],
      icon: formData.icon || undefined,
      eventSourceId: formData.eventSourceId || undefined,
    };

    if (onSave) {
      // For 'create' mode, initialFirestoreId will be undefined.
      // For 'edit' mode, initialFirestoreId is the document ID to update.
      // The idToSave passed to onSave is the one that will be used as the document ID in Firestore.
      // This means if the user edits the 'ID Nhiệm Vụ (DB)' field, it acts like saving to a new document.
      const dbDocumentIdToUse = mode === 'create' ? currentMissionLogicalId : (initialFirestoreId || currentMissionLogicalId);
      onSave(dataToSave, dbDocumentIdToUse, dataToSave.category, initialFirestoreId);
    }
    onClose();
  };

  const titleText = mode === 'create' ? 'Tạo Nhiệm Vụ Mới' : mode === 'edit' ? `Chỉnh Sửa: ${initialMissionData.title || currentMissionLogicalId}` : `Chi Tiết: ${initialMissionData.title || currentMissionLogicalId}`;
  const descriptionText = mode === 'create' 
    ? "Điền thông tin cho nhiệm vụ mới." 
    : mode === 'edit' 
    ? "Chỉnh sửa thông tin nhiệm vụ." 
    : "Xem chi tiết thông tin nhiệm vụ.";

  const isReadOnly = mode === 'view';
  const isDbIdEditable = mode === 'create'; // The Firestore document ID

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg md:max-w-xl">
        <DialogHeader>
          <DialogTitle>{titleText}</DialogTitle>
          <DialogDescription>{descriptionText}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] my-1 pr-3">
          <div className="grid gap-4 py-4">
            {/* ID Nhiệm Vụ (Logic ID, e.g., main_harvest_tomato_10) */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="missionLogicalId" className="text-right">ID Nhiệm Vụ (Logic)*</Label>
              <Input 
                id="missionLogicalId" 
                name="id" 
                value={currentMissionLogicalId} 
                onChange={handleMissionLogicalIdChange} 
                placeholder="vd: main_harvest_X, daily_plant_Y"
                className="col-span-3"
                readOnly={mode === 'edit' || isReadOnly} // Logical ID typically not changed after creation for templates
              />
            </div>

             {/* Firestore Document ID (only relevant if user needs to see/edit it, usually not) */}
             {(mode === 'edit' || mode === 'view') && initialFirestoreId && (
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="firestoreDocId" className="text-right">ID Cơ Sở Dữ Liệu</Label>
                    <Input id="firestoreDocId" value={initialFirestoreId} readOnly className="col-span-3 bg-muted" />
                </div>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">Tiêu Đề*</Label>
              <Input id="title" name="title" value={formData.title || ''} onChange={handleChange} readOnly={isReadOnly} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">Mô tả</Label>
              <Textarea id="description" name="description" value={formData.description || ''} onChange={handleChange} readOnly={isReadOnly} className="col-span-3" rows={2} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">Danh Mục*</Label>
              {isReadOnly ? (
                 <Input value={formData.category} readOnly className="col-span-3 bg-muted" />
              ) : (
                <Select value={formData.category || initialCategory} onValueChange={(value) => handleSelectChange('category', value as MissionCategory)} disabled={isReadOnly || mode === 'edit'}>
                  <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MISSION_CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">Loại Nhiệm Vụ*</Label>
               {isReadOnly ? (
                 <Input value={formData.type} readOnly className="col-span-3 bg-muted" />
              ) : (
                <Select value={formData.type} onValueChange={(value) => handleSelectChange('type', value as MissionType)} disabled={isReadOnly}>
                  <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MISSION_TYPES.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="targetItemId" className="text-right">ID Vật Phẩm Mục Tiêu</Label>
              <Input id="targetItemId" name="targetItemId" value={formData.targetItemId || ''} onChange={handleChange} readOnly={isReadOnly} className="col-span-3" placeholder="vd: tomato, carrotSeed (nếu có)"/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="targetQuantity" className="text-right">Số Lượng Mục Tiêu*</Label>
              <Input id="targetQuantity" name="targetQuantity" type="number" value={formData.targetQuantity || 1} onChange={handleChange} readOnly={isReadOnly} className="col-span-3" min="1"/>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="requiredLevelUnlock" className="text-right">Cấp Yêu Cầu</Label>
              <Input id="requiredLevelUnlock" name="requiredLevelUnlock" type="number" value={formData.requiredLevelUnlock || 1} onChange={handleChange} readOnly={isReadOnly} className="col-span-3" min="1"/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="icon" className="text-right">Biểu Tượng (Icon)</Label>
              <Input id="icon" name="icon" value={formData.icon || ''} onChange={handleChange} readOnly={isReadOnly} className="col-span-3" placeholder="Emoji (vd: 🌱)"/>
            </div>

            {/* Rewards Section */}
            {!isReadOnly && (
                <div className="border-t pt-4 mt-4">
                    <Label className="text-base font-semibold mb-2 block">Quản Lý Phần Thưởng</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-3">
                        <div className="space-y-1">
                            <Label htmlFor="rewardTypeModalMission">Loại</Label>
                            <Select value={currentRewardType} onValueChange={(value) => setCurrentRewardType(value as RewardItemType)}>
                                <SelectTrigger id="rewardTypeModalMission"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="gold">Vàng</SelectItem>
                                    <SelectItem value="xp">XP</SelectItem>
                                    <SelectItem value="item">Vật Phẩm</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {currentRewardType === 'item' && (
                            <>
                                <div className="space-y-1">
                                    <Label htmlFor="rewardItemIdModalMission">ID Vật Phẩm*</Label>
                                    <Input id="rewardItemIdModalMission" value={currentRewardItemId} onChange={(e) => setCurrentRewardItemId(e.target.value as InventoryItem)} placeholder="vd: tomatoSeed"/>
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="rewardQuantityModalMission">Số Lượng*</Label>
                                    <Input id="rewardQuantityModalMission" type="number" value={currentRewardQuantity} onChange={(e) => setCurrentRewardQuantity(Math.max(1, parseInt(e.target.value,10) || 1))} min="1"/>
                                </div>
                            </>
                        )}
                        {(currentRewardType === 'gold' || currentRewardType === 'xp') && (
                            <div className="space-y-1 md:col-span-2">
                                <Label htmlFor="rewardAmountModalMission">{currentRewardType === 'gold' ? 'Số Lượng Vàng*' : 'Số Lượng XP*'}</Label>
                                <Input id="rewardAmountModalMission" type="number" value={currentRewardAmount} onChange={(e) => setCurrentRewardAmount(Math.max(1, parseInt(e.target.value,10) || 1))} min="1"/>
                            </div>
                        )}
                    </div>
                    <Button onClick={handleAddReward} variant="outline" size="sm">
                        <PlusCircle className="mr-2 h-4 w-4"/> Thêm Phần Thưởng Này
                    </Button>
                </div>
            )}
            {formData.rewards && formData.rewards.length > 0 && (
                <div className="mt-3 border-t pt-3">
                    <Label className="font-semibold mb-1 block">Danh sách phần thưởng đã thêm:</Label>
                    <div className="max-h-28 overflow-y-auto space-y-1 pr-2">
                        {formData.rewards.map((reward, index) => (
                            <div key={index} className="flex items-center justify-between p-1.5 bg-muted/50 rounded-md text-xs">
                                <span className="flex items-center gap-1">
                                    {reward.type === 'gold' && <Coins className="w-3 h-3 text-yellow-500" />}
                                    {reward.type === 'xp' && <Star className="w-3 h-3 text-yellow-400" />}
                                    {reward.type === 'item' && <Package className="w-3 h-3 text-muted-foreground" />}
                                    {getRewardItemNameDisplay(reward)}
                                </span>
                                {!isReadOnly && (
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveReward(index)} className="h-5 w-5 text-destructive hover:bg-destructive/10">
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

          </div>
        </ScrollArea>
        <DialogFooter className="mt-2">
          <DialogClose asChild>
            <Button variant="outline">Đóng</Button>
          </DialogClose>
          {(mode === 'create' || mode === 'edit') && (
            <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90">
              {mode === 'create' ? 'Tạo Mới Nhiệm Vụ' : 'Lưu Thay Đổi'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
