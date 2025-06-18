
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, Send, Users, User, Gift, PlusCircle, Trash2, Package, Coins, Star } from 'lucide-react';
import type { RewardItem, RewardItemType, InventoryItem } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { CROP_DATA, FERTILIZER_DATA } from '@/lib/constants'; // For item name display

export default function AdminMailPage() {
  const [recipientType, setRecipientType] = useState<'all' | 'specific'>('all');
  const [recipientUid, setRecipientUid] = useState('');
  const [mailSubject, setMailSubject] = useState('');
  const [mailBody, setMailBody] = useState('');
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  
  const [currentRewardType, setCurrentRewardType] = useState<RewardItemType>('gold');
  const [currentRewardItemId, setCurrentRewardItemId] = useState<InventoryItem | ''>('');
  const [currentRewardQuantity, setCurrentRewardQuantity] = useState<number>(1);
  const [currentRewardAmount, setCurrentRewardAmount] = useState<number>(100);

  const { toast } = useToast();

  const getRewardItemName = (reward: RewardItem): string => {
    if (reward.type === 'gold') return `${reward.amount} Vàng`;
    if (reward.type === 'xp') return `${reward.amount} XP`;
    if (reward.type === 'item' && reward.itemId) {
      const cropDetail = CROP_DATA[reward.itemId as keyof typeof CROP_DATA];
      if (cropDetail) return `${reward.quantity}x ${cropDetail.name}`;
      const fertilizerDetail = FERTILIZER_DATA[reward.itemId as keyof typeof FERTILIZER_DATA];
      if (fertilizerDetail) return `${reward.quantity}x ${fertilizerDetail.name}`;
      return `${reward.quantity}x ${reward.itemId}`;
    }
    return 'Phần thưởng không xác định';
  };

  const getRewardItemIcon = (type: RewardItemType) => {
    if (type === 'gold') return <Coins className="mr-2 h-4 w-4 text-yellow-500" />;
    if (type === 'xp') return <Star className="mr-2 h-4 w-4 text-yellow-400" />;
    if (type === 'item') return <Package className="mr-2 h-4 w-4 text-muted-foreground" />;
    return null;
  };

  const handleAddReward = () => {
    let newReward: RewardItem | null = null;
    if (currentRewardType === 'gold') {
      if (currentRewardAmount <= 0) {
        toast({ title: "Lỗi Thêm Quà", description: "Số lượng vàng phải lớn hơn 0.", variant: "destructive" });
        return;
      }
      newReward = { type: 'gold', amount: currentRewardAmount };
    } else if (currentRewardType === 'xp') {
      if (currentRewardAmount <= 0) {
        toast({ title: "Lỗi Thêm Quà", description: "Số lượng XP phải lớn hơn 0.", variant: "destructive" });
        return;
      }
      newReward = { type: 'xp', amount: currentRewardAmount };
    } else if (currentRewardType === 'item') {
      if (!currentRewardItemId.trim()) {
        toast({ title: "Lỗi Thêm Quà", description: "ID Vật phẩm không được để trống.", variant: "destructive" });
        return;
      }
      if (currentRewardQuantity <= 0) {
        toast({ title: "Lỗi Thêm Quà", description: "Số lượng vật phẩm phải lớn hơn 0.", variant: "destructive" });
        return;
      }
      newReward = { type: 'item', itemId: currentRewardItemId.trim() as InventoryItem, quantity: currentRewardQuantity };
    }

    if (newReward) {
      setRewards(prev => [...prev, newReward!]);
      // Reset reward input form
      setCurrentRewardItemId('');
      setCurrentRewardQuantity(1);
      setCurrentRewardAmount(currentRewardType === 'gold' ? 100 : currentRewardType === 'xp' ? 50 : 1);
      toast({ title: "Đã Thêm Phần Thưởng", description: getRewardItemName(newReward), className: "bg-green-500 text-white" });
    }
  };

  const handleRemoveReward = (index: number) => {
    setRewards(prev => prev.filter((_, i) => i !== index));
    toast({ title: "Đã Xóa Phần Thưởng", variant: "default" });
  };

  const handleSendMail = () => {
    if (!mailSubject.trim()) {
        toast({ title: "Thiếu Thông Tin", description: "Chủ đề thư không được để trống.", variant: "destructive" });
        return;
    }
    if (!mailBody.trim()) {
        toast({ title: "Thiếu Thông Tin", description: "Nội dung thư không được để trống.", variant: "destructive" });
        return;
    }
    if (recipientType === 'specific' && !recipientUid.trim()) {
        toast({ title: "Thiếu Thông Tin", description: "UID người nhận cụ thể không được để trống.", variant: "destructive" });
        return;
    }

    const mailData = {
      recipientType,
      recipientUid: recipientType === 'specific' ? recipientUid.trim() : null,
      subject: mailSubject.trim(),
      body: mailBody.trim(),
      rewards,
      senderType: 'admin' as const,
      senderName: 'Quản Trị Viên HappyFarm',
      isRead: false,
      isClaimed: false,
      createdAt: Date.now(), // Simulate timestamp
    };

    // TODO: Implement actual mail sending logic (e.g., call a Firebase Function)
    console.log("Simulating sending mail:", mailData);
    toast({
      title: "Gửi Thư (Mô Phỏng)",
      description: `Đã mô phỏng gửi thư "${mailData.subject}" đến ${mailData.recipientType === 'all' ? 'tất cả người chơi' : `UID: ${mailData.recipientUid}`}. Kèm ${mailData.rewards.length} phần thưởng.`,
      duration: 7000,
    });
    
    // Clear form after "sending"
    setRecipientUid('');
    setMailSubject('');
    setMailBody('');
    setRewards([]);
    setCurrentRewardItemId('');
    setCurrentRewardQuantity(1);
    setCurrentRewardAmount(100);
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary font-headline flex items-center gap-2">
            <Mail className="h-7 w-7"/> Quản Lý Hệ Thống Thư
          </CardTitle>
          <CardDescription>
            Soạn và gửi thư thông báo hoặc quà tặng cho người chơi. (Chức năng gửi thư hiện đang mô phỏng)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Card className="border-blue-500/50">
            <CardHeader>
              <CardTitle className="text-xl">Soạn Thư Mới</CardTitle>
              <CardDescription>
                Gửi thư cho tất cả người chơi hoặc một người chơi cụ thể.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Người Nhận</Label>
                <div className="flex gap-4 mt-1">
                  <Button 
                    variant={recipientType === 'all' ? 'default' : 'outline'} 
                    onClick={() => setRecipientType('all')}
                    className={recipientType === 'all' ? 'bg-primary hover:bg-primary/90' : ''}
                  >
                    <Users className="mr-2 h-4 w-4"/> Gửi Tất Cả
                  </Button>
                  <Button 
                    variant={recipientType === 'specific' ? 'default' : 'outline'} 
                    onClick={() => setRecipientType('specific')}
                    className={recipientType === 'specific' ? 'bg-primary hover:bg-primary/90' : ''}
                  >
                    <User className="mr-2 h-4 w-4"/> Gửi Cụ Thể
                  </Button>
                </div>
              </div>

              {recipientType === 'specific' && (
                <div className="space-y-1">
                  <Label htmlFor="recipientUid">UID Người Nhận</Label>
                  <Input 
                    id="recipientUid" 
                    value={recipientUid} 
                    onChange={(e) => setRecipientUid(e.target.value)}
                    placeholder="Nhập Firebase User ID"
                  />
                </div>
              )}

              <div className="space-y-1">
                <Label htmlFor="mailSubject">Chủ Đề Thư*</Label>
                <Input 
                  id="mailSubject" 
                  value={mailSubject}
                  onChange={(e) => setMailSubject(e.target.value)}
                  placeholder="Ví dụ: Thông báo bảo trì, Chúc mừng sự kiện..."
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="mailBody">Nội Dung Thư*</Label>
                <Textarea 
                  id="mailBody" 
                  value={mailBody}
                  onChange={(e) => setMailBody(e.target.value)}
                  placeholder="Nhập nội dung chi tiết của thư..."
                  rows={5}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-500/50">
            <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                    <Gift className="h-5 w-5"/>Vật Phẩm Đính Kèm
                </CardTitle>
                <CardDescription>Thêm phần thưởng vàng, XP, hoặc vật phẩm vào thư.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="space-y-1">
                        <Label htmlFor="rewardType">Loại Phần Thưởng</Label>
                        <Select value={currentRewardType} onValueChange={(value) => setCurrentRewardType(value as RewardItemType)}>
                            <SelectTrigger id="rewardType">
                                <SelectValue placeholder="Chọn loại phần thưởng" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="gold">Vàng</SelectItem>
                                <SelectItem value="xp">Kinh Nghiệm (XP)</SelectItem>
                                <SelectItem value="item">Vật Phẩm</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {currentRewardType === 'item' && (
                        <>
                            <div className="space-y-1">
                                <Label htmlFor="rewardItemId">ID Vật Phẩm*</Label>
                                <Input 
                                    id="rewardItemId" 
                                    value={currentRewardItemId}
                                    onChange={(e) => setCurrentRewardItemId(e.target.value as InventoryItem)}
                                    placeholder="vd: tomatoSeed, carrot, t1_basicGrow"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="rewardQuantity">Số Lượng*</Label>
                                <Input 
                                    id="rewardQuantity" 
                                    type="number" 
                                    value={currentRewardQuantity}
                                    onChange={(e) => setCurrentRewardQuantity(Math.max(1, parseInt(e.target.value,10) || 1))}
                                    min="1"
                                />
                            </div>
                        </>
                    )}
                    {(currentRewardType === 'gold' || currentRewardType === 'xp') && (
                        <div className="space-y-1 md:col-span-2">
                            <Label htmlFor="rewardAmount">{currentRewardType === 'gold' ? 'Số Lượng Vàng*' : 'Số Lượng XP*'}</Label>
                            <Input 
                                id="rewardAmount" 
                                type="number" 
                                value={currentRewardAmount}
                                onChange={(e) => setCurrentRewardAmount(Math.max(1, parseInt(e.target.value,10) || 1))}
                                min="1"
                            />
                        </div>
                    )}
                </div>
                 <Button onClick={handleAddReward} variant="outline" size="sm">
                    <PlusCircle className="mr-2 h-4 w-4"/> Thêm Phần Thưởng
                </Button>

                {rewards.length > 0 && (
                    <div className="space-y-2 pt-3 border-t">
                        <Label>Danh sách phần thưởng đã thêm:</Label>
                        <div className="max-h-40 overflow-y-auto space-y-1 pr-2">
                        {rewards.map((reward, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-md text-sm">
                                <span className="flex items-center">
                                    {getRewardItemIcon(reward.type)}
                                    {getRewardItemName(reward)}
                                </span>
                                <Button variant="ghost" size="icon" onClick={() => handleRemoveReward(index)} className="h-6 w-6 text-destructive hover:bg-destructive/10">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        </div>
                    </div>
                )}
            </CardContent>
          </Card>

          <Button onClick={handleSendMail} className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-lg py-3">
            <Send className="mr-2 h-5 w-5" />
            Gửi Thư (Mô Phỏng)
          </Button>

           <Card className="border-gray-400/50 mt-8">
            <CardHeader>
                <CardTitle className="text-xl">Lịch Sử Thư Đã Gửi</CardTitle>
                <CardDescription>
                Xem lại các thư đã được gửi từ hệ thống. (Chức năng này sẽ được phát triển)
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Tính năng xem lịch sử thư sẽ được cập nhật trong tương lai...</p>
            </CardContent>
          </Card>

        </CardContent>
      </Card>
    </div>
  );
}

    