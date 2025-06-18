
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
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { BonusConfiguration, BonusTriggerType, RewardItem, RewardItemType, InventoryItem } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Coins, Star, Package } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface BonusModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'view' | 'edit' | 'create';
  bonusData: BonusConfiguration; 
  bonusId?: string; 
  onSave?: (data: BonusConfiguration, idToSave: string, originalId?: string) => void; 
}

const triggerTypes: BonusTriggerType[] = [
  'firstLogin', 'tierUp', 'firstPlotUnlock', 'leaderboardWeekly', 'leaderboardMonthly', 'specialEvent'
];

export const BonusActionModal: FC<BonusModalProps> = ({ 
    isOpen, 
    onClose, 
    mode, 
    bonusData: initialBonusData, 
    bonusId: initialBonusId, 
    onSave 
}) => {
  const [formData, setFormData] = useState<BonusConfiguration>(initialBonusData);
  const [currentBonusId, setCurrentBonusId] = useState<string | undefined>(initialBonusId);
  
  // State for managing current reward being added
  const [currentRewardType, setCurrentRewardType] = useState<RewardItemType>('gold');
  const [currentRewardItemId, setCurrentRewardItemId] = useState<InventoryItem | ''>('');
  const [currentRewardQuantity, setCurrentRewardQuantity] = useState<number>(1);
  const [currentRewardAmount, setCurrentRewardAmount] = useState<number>(100);

  const { toast } = useToast();

  useEffect(() => {
    setFormData(initialBonusData);
    setCurrentBonusId(mode === 'create' ? initialBonusData.id : initialBonusId);
    if (mode === 'create') {
      // Reset reward form for new bonus creation
      setCurrentRewardType('gold');
      setCurrentRewardItemId('');
      setCurrentRewardQuantity(1);
      setCurrentRewardAmount(100);
    }
  }, [initialBonusData, initialBonusId, mode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: keyof BonusConfiguration, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isEnabled: checked }));
  };

  const handleBonusIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newId = e.target.value.replace(/[^a-z0-9_.-]/gi, ''); // Allow alphanumeric, underscore, dot, hyphen
    setCurrentBonusId(newId);
    if (mode === 'create') {
        setFormData(prev => ({ ...prev, id: newId }));
    }
  };

  const getRewardItemNameDisplay = (reward: RewardItem): string => {
    if (reward.type === 'gold') return `${reward.amount} Vàng`;
    if (reward.type === 'xp') return `${reward.amount} XP`;
    if (reward.type === 'item' && reward.itemId) {
      // In a real app, you'd look up item names here
      return `${reward.quantity}x ${reward.itemId}`;
    }
    return 'Phần thưởng không xác định';
  };

  const handleAddReward = () => {
    let newReward: RewardItem | null = null;
    if (currentRewardType === 'gold') {
      if (currentRewardAmount <= 0) {
        toast({ title: "Lỗi", description: "Số lượng vàng phải lớn hơn 0.", variant: "destructive" }); return;
      }
      newReward = { type: 'gold', amount: currentRewardAmount };
    } else if (currentRewardType === 'xp') {
      if (currentRewardAmount <= 0) {
        toast({ title: "Lỗi", description: "Số lượng XP phải lớn hơn 0.", variant: "destructive" }); return;
      }
      newReward = { type: 'xp', amount: currentRewardAmount };
    } else if (currentRewardType === 'item') {
      if (!currentRewardItemId.trim()) {
        toast({ title: "Lỗi", description: "ID Vật phẩm không được để trống.", variant: "destructive" }); return;
      }
      if (currentRewardQuantity <= 0) {
        toast({ title: "Lỗi", description: "Số lượng vật phẩm phải lớn hơn 0.", variant: "destructive" }); return;
      }
      newReward = { type: 'item', itemId: currentRewardItemId.trim() as InventoryItem, quantity: currentRewardQuantity };
    }

    if (newReward) {
      setFormData(prev => ({ ...prev, rewards: [...prev.rewards, newReward!] }));
      // Reset reward input form
      setCurrentRewardItemId('');
      setCurrentRewardQuantity(1);
      setCurrentRewardAmount(currentRewardType === 'gold' ? 100 : currentRewardType === 'xp' ? 50 : 1);
      toast({ title: "Đã Thêm Phần Thưởng", description: getRewardItemNameDisplay(newReward), className: "bg-green-500 text-white" });
    }
  };

  const handleRemoveReward = (index: number) => {
    setFormData(prev => ({ ...prev, rewards: prev.rewards.filter((_, i) => i !== index)}));
    toast({ title: "Đã Xóa Phần Thưởng", variant: "default" });
  };

  const handleSubmit = () => {
    if (!currentBonusId || currentBonusId.trim() === '') {
      toast({ title: "Lỗi", description: "ID Cấu Hình Bonus không được để trống.", variant: "destructive" });
      return;
    }
    if (mode === 'create' && (!formData.description || formData.description.trim() === '')) {
        toast({ title: "Lỗi", description: "Mô tả không được để trống.", variant: "destructive" });
        return;
    }
    if (!formData.mailSubject.trim() || !formData.mailBody.trim()) {
        toast({ title: "Lỗi", description: "Chủ đề và nội dung thư không được để trống.", variant: "destructive" });
        return;
    }

    const finalData = {...formData, id: currentBonusId };

    if (onSave) {
      onSave(finalData, currentBonusId, initialBonusId); 
    }
    onClose();
  };

  const titleText = mode === 'create' ? 'Tạo Cấu Hình Bonus Mới' : mode === 'edit' ? `Chỉnh Sửa: ${initialBonusData.description}` : `Chi Tiết: ${initialBonusData.description}`;
  const descriptionText = mode === 'create' 
    ? "Điền thông tin cho cấu hình bonus mới. Thay đổi sẽ được lưu vào Firestore." 
    : mode === 'edit' 
    ? "Chỉnh sửa thông tin cấu hình bonus. Thay đổi sẽ được lưu vào Firestore." 
    : "Xem chi tiết thông tin cấu hình bonus từ Firestore.";

  const isReadOnly = mode === 'view';

  const getRewardItemIcon = (type: RewardItemType) => {
    if (type === 'gold') return <Coins className="mr-2 h-4 w-4 text-yellow-500" />;
    if (type === 'xp') return <Star className="mr-2 h-4 w-4 text-yellow-400" />;
    if (type === 'item') return <Package className="mr-2 h-4 w-4 text-muted-foreground" />;
    return null;
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg"> {/* Changed from sm:max-w-xl */}
        <DialogHeader>
          <DialogTitle>{titleText}</DialogTitle>
          <DialogDescription>{descriptionText}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] my-1 pr-3">
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="bonusId" className="text-right">ID Cấu Hình*</Label>
            <Input 
              id="bonusId" 
              name="id" 
              value={currentBonusId || ''} 
              onChange={handleBonusIdChange} 
              placeholder="vd: tierUp_2, event_xmas2024"
              className="col-span-3"
              readOnly={mode === 'edit' || mode === 'view'}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">Mô tả (Admin)*</Label>
            <Input id="description" name="description" value={formData.description} onChange={handleChange} readOnly={isReadOnly} className="col-span-3" placeholder="vd: Thưởng khi lên Bậc 2"/>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="triggerType" className="text-right">Loại Kích Hoạt*</Label>
             {isReadOnly ? (
                 <Input value={formData.triggerType} readOnly className="col-span-3 bg-muted" />
            ) : (
                <Select
                    value={formData.triggerType}
                    onValueChange={(value) => handleSelectChange('triggerType', value as BonusTriggerType)}
                    disabled={isReadOnly}
                >
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Chọn loại kích hoạt" />
                    </SelectTrigger>
                    <SelectContent>
                        {triggerTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="triggerValue" className="text-right">Giá Trị Kích Hoạt</Label>
            <Input id="triggerValue" name="triggerValue" value={formData.triggerValue || ''} onChange={handleChange} readOnly={isReadOnly} className="col-span-3" placeholder="vd: 2 (cho tierUp), event_id"/>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="mailSubject" className="text-right pt-2">Chủ Đề Thư*</Label>
            <Input id="mailSubject" name="mailSubject" value={formData.mailSubject} onChange={handleChange} readOnly={isReadOnly} className="col-span-3" placeholder="Chúc mừng bạn..."/>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="mailBody" className="text-right pt-2">Nội Dung Thư*</Label>
            <Textarea id="mailBody" name="mailBody" value={formData.mailBody} onChange={handleChange} readOnly={isReadOnly} className="col-span-3" rows={4} placeholder="Nội dung chi tiết thư gửi người chơi..."/>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isEnabled" className="text-right">Kích hoạt</Label>
            <Switch id="isEnabled" checked={formData.isEnabled} onCheckedChange={handleSwitchChange} disabled={isReadOnly} className="col-span-3"/>
          </div>
          
          {/* Rewards Section */}
          {!isReadOnly && (
            <div className="border-t pt-4 mt-4"> {/* Removed col-span-4 */}
                <Label className="text-lg font-semibold mb-2 block">Quản Lý Phần Thưởng</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-3">
                    <div className="space-y-1">
                        <Label htmlFor="rewardTypeModal">Loại</Label>
                        <Select value={currentRewardType} onValueChange={(value) => setCurrentRewardType(value as RewardItemType)}>
                            <SelectTrigger id="rewardTypeModal"><SelectValue /></SelectTrigger>
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
                                <Label htmlFor="rewardItemIdModal">ID Vật Phẩm*</Label>
                                <Input id="rewardItemIdModal" value={currentRewardItemId} onChange={(e) => setCurrentRewardItemId(e.target.value as InventoryItem)} placeholder="vd: tomatoSeed"/>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="rewardQuantityModal">Số Lượng*</Label>
                                <Input id="rewardQuantityModal" type="number" value={currentRewardQuantity} onChange={(e) => setCurrentRewardQuantity(Math.max(1, parseInt(e.target.value,10) || 1))} min="1"/>
                            </div>
                        </>
                    )}
                    {(currentRewardType === 'gold' || currentRewardType === 'xp') && (
                        <div className="space-y-1 md:col-span-2">
                            <Label htmlFor="rewardAmountModal">{currentRewardType === 'gold' ? 'Số Lượng Vàng*' : 'Số Lượng XP*'}</Label>
                            <Input id="rewardAmountModal" type="number" value={currentRewardAmount} onChange={(e) => setCurrentRewardAmount(Math.max(1, parseInt(e.target.value,10) || 1))} min="1"/>
                        </div>
                    )}
                </div>
                <Button onClick={handleAddReward} variant="outline" size="sm">
                    <PlusCircle className="mr-2 h-4 w-4"/> Thêm Phần Thưởng Này
                </Button>
            </div>
          )}

            {formData.rewards.length > 0 && (
                <div className="mt-3 border-t pt-3"> {/* Removed col-span-4 */}
                    <Label className="font-semibold mb-1 block">Danh sách phần thưởng đã thêm:</Label>
                    <div className="max-h-32 overflow-y-auto space-y-1 pr-2">
                        {formData.rewards.map((reward, index) => (
                            <div key={index} className="flex items-center justify-between p-1.5 bg-muted/50 rounded-md text-xs">
                                <span className="flex items-center">
                                    {getRewardItemIcon(reward.type)}
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
              {mode === 'create' ? 'Tạo Mới' : 'Lưu Thay Đổi'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

    
