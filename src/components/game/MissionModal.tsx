
'use client';

import type { FC } from 'react';
import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { PlayerMissionProgress, Mission, MissionStatus } from '@/types'; // Mission type for definitions
import { CheckSquare, ListChecks, CalendarDays, Sparkles, Package, Coins, Star, Info, Lock } from 'lucide-react';
// Constants are not directly needed here if playerMissionState has all necessary display info
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerMissionState: Record<string, PlayerMissionProgress>; // This now contains all display info
  onClaimMissionReward: (missionId: string) => void;
}

const MissionModal: FC<MissionModalProps> = ({
  isOpen,
  onClose,
  playerMissionState,
  onClaimMissionReward,
}) => {

  const getDisplayableMissions = (
    categoryFilter: Mission['category']
  ): PlayerMissionProgress[] => { // Now returns PlayerMissionProgress directly
    return Object.values(playerMissionState)
      .filter(pm => pm.category === categoryFilter)
      .sort((a, b) => {
        const statusOrder: Record<MissionStatus, number> = {
          active: 1,
          completed_pending_claim: 2,
          locked: 3, // Should ideally not be in activeMissions if truly locked by level
          claimed: 4,
          expired: 5,
        };
        if (statusOrder[a.status] !== statusOrder[b.status]) {
          return statusOrder[a.status] - statusOrder[b.status];
        }
        // Fallback sort, e.g. by title or assignedAt if available
        return (a.assignedAt || 0) - (b.assignedAt || 0) || a.title.localeCompare(b.title);
      });
  };

  const mainMissions = useMemo(() => getDisplayableMissions('main'), [playerMissionState]);
  const dailyMissions = useMemo(() => getDisplayableMissions('daily'), [playerMissionState]);
  const weeklyMissions = useMemo(() => getDisplayableMissions('weekly'), [playerMissionState]);


  const renderMissionCard = (mission: PlayerMissionProgress) => { // Now takes PlayerMissionProgress
    const progressPercent = mission.targetQuantity > 0 ? (mission.progress / mission.targetQuantity) * 100 : 0;
    const isClaimable = mission.status === 'completed_pending_claim';
    const isClaimed = mission.status === 'claimed';
    const isActive = mission.status === 'active';
    const isLockedByLevel = mission.requiredLevelUnlock && gameStateRef.current.level < mission.requiredLevelUnlock; // Assuming gameStateRef is accessible or player level is passed
    const isLocked = mission.status === 'locked' || isLockedByLevel;
    const isExpired = mission.status === 'expired';


    let statusBadge;
    if (isClaimed) statusBadge = <Badge variant="outline" className="text-xs">Đã Nhận</Badge>;
    else if (isClaimable) statusBadge = <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-xs">Hoàn Thành!</Badge>;
    else if (isActive) statusBadge = <Badge variant="secondary" className="text-xs">Đang Làm</Badge>;
    else if (isLocked) statusBadge = <Badge variant="outline" className="text-muted-foreground text-xs flex items-center gap-1"><Lock className="h-3 w-3"/>Bị Khóa</Badge>;
    else if (isExpired) statusBadge = <Badge variant="destructive" className="text-xs">Hết Hạn</Badge>;


    return (
      <div key={mission.missionId} className={cn("p-3 border rounded-lg shadow-sm bg-card flex flex-col", (isLocked || isExpired) && "opacity-60")}>
        <div className="flex justify-between items-start mb-1">
          <h4 className="font-semibold text-sm text-primary mr-2">{mission.title}</h4>
          {statusBadge}
        </div>
        {mission.description && <p className="text-xs text-muted-foreground mb-2">{mission.description}</p>}

        {mission.expiresAt && (mission.category === 'daily' || mission.category === 'weekly') && (
          <p className="text-[10px] text-orange-600 mb-1.5">
            Hết hạn: {new Date(mission.expiresAt).toLocaleString('vi-VN', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        )}

        {(isActive || isClaimable) && mission.targetQuantity > 0 && (
          <div className="mb-2">
            <div className="flex justify-between text-xs text-muted-foreground mb-0.5">
              <span>Tiến độ:</span>
              <span>{mission.progress} / {mission.targetQuantity}</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        )}

        {mission.rewards.length > 0 && (
          <div className="mb-2">
            <p className="text-xs font-medium mb-0.5">Phần thưởng:</p>
            <div className="flex flex-wrap gap-1">
              {mission.rewards.map((reward, index) => (
                <Badge key={index} variant="outline" className="text-xs py-0.5 px-1.5">
                  {reward.type === 'gold' && <Coins className="w-3 h-3 mr-1 text-yellow-500" />}
                  {reward.type === 'xp' && <Star className="w-3 h-3 mr-1 text-yellow-400" />}
                  {reward.type === 'item' && <Package className="w-3 h-3 mr-1 text-muted-foreground" />}
                  {reward.type === 'gold' ? `${reward.amount} Vàng` :
                   reward.type === 'xp' ? `${reward.amount} XP` :
                   reward.type === 'item' ? `${reward.quantity}x ${reward.itemId}` : ''}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {isClaimable && (
          <Button
            size="sm"
            onClick={() => onClaimMissionReward(mission.missionId)} // Use missionId from PlayerMissionProgress
            className="w-full mt-auto bg-accent hover:bg-accent/90"
          >
            Nhận Thưởng
          </Button>
        )}
         {(isClaimed || isLocked || isExpired || (isActive && !isClaimable)) && (
          <Button size="sm" disabled className="w-full mt-auto">
            {isClaimed ? 'Đã Nhận Thưởng' : 
             isLocked ? 'Chưa Mở Khóa' : 
             isExpired ? 'Đã Hết Hạn' : 
             'Chưa Hoàn Thành'}
          </Button>
        )}
      </div>
    );
  };

  const renderTabContent = (missions: PlayerMissionProgress[], tabName: string) => {
    if (missions.length === 0) {
      return <p className="text-center text-muted-foreground py-6">Không có nhiệm vụ {tabName.toLowerCase()} nào hiện tại.</p>;
    }
    return (
      <ScrollArea className="h-[calc(60vh-120px)] pr-2">
        <div className="space-y-3">
          {missions.map(renderMissionCard)}
        </div>
      </ScrollArea>
    );
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl flex flex-col max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-headline">
            <ListChecks className="w-7 h-7 text-primary" /> Sổ Tay Nhiệm Vụ
          </DialogTitle>
          <DialogDescription>
            Hoàn thành các nhiệm vụ để nhận phần thưởng hấp dẫn!
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="main" className="w-full flex-grow flex flex-col min-h-0 mt-2">
          <TabsList className="grid w-full grid-cols-3 shrink-0">
            <TabsTrigger value="main"><CheckSquare className="w-4 h-4 mr-1.5"/>Nhiệm Vụ Chính</TabsTrigger>
            <TabsTrigger value="daily"><CalendarDays className="w-4 h-4 mr-1.5"/>Nhiệm Vụ Ngày</TabsTrigger>
            <TabsTrigger value="weekly"><CalendarDays className="w-4 h-4 mr-1.5"/>Nhiệm Vụ Tuần</TabsTrigger>
          </TabsList>
          <TabsContent value="main" className="mt-2 flex-1 overflow-hidden">
            {renderTabContent(mainMissions, 'Chính')}
          </TabsContent>
          <TabsContent value="daily" className="mt-2 flex-1 overflow-hidden">
            {renderTabContent(dailyMissions, 'Ngày')}
          </TabsContent>
          <TabsContent value="weekly" className="mt-2 flex-1 overflow-hidden">
            {renderTabContent(weeklyMissions, 'Tuần')}
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
// Temporary gameStateRef for isLockedByLevel check until player level is passed or accessed globally
const gameStateRef = { current: { level: 1 } }; 
export default MissionModal;
