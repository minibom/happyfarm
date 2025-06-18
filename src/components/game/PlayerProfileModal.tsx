
'use client';

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { UserCircle2, Coins, Star, Award, Mail, ShieldHalf, Edit3, Save } from 'lucide-react';
import type { TierInfo } from '@/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useGameLogic } from '@/hooks/useGameLogic'; // Import useGameLogic
import { useToast } from '@/hooks/use-toast';

interface PlayerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerEmail: string; // Still useful for initial display or if displayName is cleared
  playerLevel: number;
  playerGold: number;
  playerXP: number;
  xpToNextLevel: number;
  playerTierInfo: TierInfo;
  currentDisplayName?: string; // Pass current display name from GameState
}

const PlayerProfileModal: FC<PlayerProfileModalProps> = ({
  isOpen,
  onClose,
  playerEmail,
  playerLevel,
  playerGold,
  playerXP,
  xpToNextLevel,
  playerTierInfo,
  currentDisplayName,
}) => {
  const { updateDisplayName } = useGameLogic();
  const { toast } = useToast();
  const [editingName, setEditingName] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState(currentDisplayName || '');

  useEffect(() => {
    setNewDisplayName(currentDisplayName || '');
  }, [currentDisplayName, isOpen]);

  const xpProgress = xpToNextLevel > 0 ? Math.min((playerXP / xpToNextLevel) * 100, 100) : 0;

  const handleSaveName = async () => {
    if (!newDisplayName.trim()) {
      toast({ title: "Tên không hợp lệ", description: "Tên hiển thị không được để trống.", variant: "destructive" });
      return;
    }
    if (newDisplayName.trim().length > 20) {
      toast({ title: "Tên quá dài", description: "Tên hiển thị tối đa 20 ký tự.", variant: "destructive" });
      return;
    }
    try {
      await updateDisplayName(newDisplayName.trim());
      setEditingName(false);
      // Toast is handled by useGameLogic.updateDisplayName
    } catch (error) {
      console.error("Failed to update display name:", error);
      toast({ title: "Lỗi", description: "Không thể cập nhật tên hiển thị.", variant: "destructive" });
    }
  };

  const displayOrDefaultName = currentDisplayName || playerEmail.split('@')[0] || 'Nông Dân';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-headline text-primary">
            <UserCircle2 className="w-7 h-7" />
            Thông Tin Người Chơi
          </DialogTitle>
          <DialogDescription>
            Xem và chỉnh sửa thông tin cá nhân của bạn.
          </DialogDescription>
        </DialogHeader>

        <div className="my-6 space-y-6">
          <div className="flex flex-col items-center gap-3">
            <Image
              src="https://placehold.co/120x120.png"
              alt="Ảnh đại diện"
              width={120}
              height={120}
              className="rounded-full shadow-lg border-4 border-primary/70"
              data-ai-hint="farmer avatar"
            />
            {!editingName ? (
              <div className="flex items-center gap-2">
                <p className="text-xl font-bold text-foreground">{displayOrDefaultName}</p>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingName(true)}>
                  <Edit3 className="w-4 h-4 text-muted-foreground hover:text-primary" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 w-full max-w-xs">
                <Input
                  type="text"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  placeholder="Nhập tên mới"
                  className="flex-grow"
                  maxLength={20}
                />
                <Button size="icon" onClick={handleSaveName} className="h-9 w-9 bg-accent hover:bg-accent/80">
                  <Save className="w-4 h-4" />
                </Button>
                 <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => {setEditingName(false); setNewDisplayName(currentDisplayName || '');}}>
                   X
                </Button>
              </div>
            )}
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Mail className="w-4 h-4" /> {playerEmail}
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-md shadow-sm">
              <div className="flex items-center gap-2 text-lg">
                <ShieldHalf className="w-6 h-6 text-purple-500" />
                <span className="font-medium">Bậc Hiện Tại:</span>
              </div>
              <Badge variant="outline" className={cn("text-base px-3 py-1 font-semibold border-current", playerTierInfo.colorClass)}>
                <span className="mr-1.5 text-lg">{playerTierInfo.icon}</span>
                {playerTierInfo.tierName}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-md shadow-sm">
              <div className="flex items-center gap-2 text-lg">
                <Award className="w-6 h-6 text-blue-500" />
                <span className="font-medium">Cấp Độ:</span>
              </div>
              <span className="text-lg font-bold text-primary">{playerLevel}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-md shadow-sm">
              <div className="flex items-center gap-2 text-lg">
                <Coins className="w-6 h-6 text-yellow-500" />
                <span className="font-medium">Vàng:</span>
              </div>
              <span className="text-lg font-bold text-primary">{playerGold.toLocaleString()}</span>
            </div>
            
            <div className="p-3 bg-secondary/30 rounded-md shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 text-lg">
                  <Star className="w-6 h-6 text-yellow-400" />
                  <span className="font-medium">Kinh Nghiệm (XP):</span>
                </div>
                <span className="text-sm font-semibold text-primary">
                  {playerXP.toLocaleString()} / {xpToNextLevel > 0 ? xpToNextLevel.toLocaleString() : "Tối đa"} XP
                </span>
              </div>
              <Progress value={xpProgress} className="h-3 w-full" />
              {playerTierInfo.nextTierLevel && (
                <p className="text-xs text-muted-foreground mt-1 text-center">
                    Lên Bậc tiếp theo ở Cấp {playerTierInfo.nextTierLevel}
                </p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PlayerProfileModal;
