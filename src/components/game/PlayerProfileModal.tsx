
'use client';

import type { FC } from 'react';
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
import { Progress } from '@/components/ui/progress';
import { UserCircle2, Coins, Star, Award, Mail } from 'lucide-react';

interface PlayerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerEmail: string;
  playerLevel: number;
  playerGold: number;
  playerXP: number;
  xpToNextLevel: number;
}

const PlayerProfileModal: FC<PlayerProfileModalProps> = ({
  isOpen,
  onClose,
  playerEmail,
  playerLevel,
  playerGold,
  playerXP,
  xpToNextLevel,
}) => {
  const xpProgress = Math.min((playerXP / xpToNextLevel) * 100, 100);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-headline text-primary">
            <UserCircle2 className="w-7 h-7" />
            Thông Tin Người Chơi
          </DialogTitle>
          <DialogDescription>
            Đây là thông tin và tiến trình hiện tại của bạn trong Happy Farm.
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
            <p className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Mail className="w-5 h-5 text-muted-foreground" /> {playerEmail}
            </p>
          </div>

          <div className="space-y-4">
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
                  <span className="font-medium">Kinh Nghiệm:</span>
                </div>
                <span className="text-sm font-semibold text-primary">
                  {playerXP.toLocaleString()} / {xpToNextLevel.toLocaleString()} XP
                </span>
              </div>
              <Progress value={xpProgress} className="h-3 w-full" />
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
