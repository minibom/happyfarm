
'use client';

import { useCallback } from 'react';
import type { GameState, PlayerMissionProgress, MissionReward, InventoryItem } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { LEVEL_UP_XP_THRESHOLD } from '@/lib/constants'; // For XP and level up from mission rewards

interface UsePlayerActionsProps {
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export const usePlayerActions = ({ setGameState }: UsePlayerActionsProps) => {
  const { toast } = useToast();

  const updateDisplayName = useCallback(async (newName: string) => {
    const trimmedName = newName.trim();
    if (!trimmedName) {
      toast({ title: "Tên Không Hợp Lệ", description: "Tên hiển thị không được để trống.", variant: "destructive" });
      return;
    }
    if (trimmedName.length > 20) {
      toast({ title: "Tên Quá Dài", description: "Tên hiển thị không được quá 20 ký tự.", variant: "destructive" });
      return;
    }

    setGameState(prev => ({
      ...prev,
      displayName: trimmedName,
      lastUpdate: Date.now(),
    }));
    toast({ title: "Đã Cập Nhật Tên", description: `Tên hiển thị mới của bạn là: ${trimmedName}`, className: "bg-primary text-primary-foreground" });
  }, [setGameState, toast]);

  const claimMissionReward = useCallback((missionId: string) => {
    setGameState(prev => {
      const activeMissions = { ...prev.activeMissions };
      const missionToClaim = activeMissions[missionId];

      if (!missionToClaim) {
        toast({ title: "Lỗi", description: "Không tìm thấy nhiệm vụ này.", variant: "destructive" });
        return prev;
      }

      if (missionToClaim.status !== 'completed_pending_claim') {
        toast({ title: "Chưa Hoàn Thành", description: "Nhiệm vụ này chưa hoàn thành hoặc đã nhận thưởng.", variant: "default" });
        return prev;
      }

      let newGold = prev.gold;
      let newXp = prev.xp;
      let newLevel = prev.level;
      const newInventory = { ...prev.inventory };
      let rewardsSummary: string[] = [];

      missionToClaim.rewards.forEach(reward => {
        if (reward.type === 'gold' && reward.amount) {
          newGold += reward.amount;
          rewardsSummary.push(`${reward.amount.toLocaleString()} vàng`);
        } else if (reward.type === 'xp' && reward.amount) {
          newXp += reward.amount;
          rewardsSummary.push(`${reward.amount.toLocaleString()} XP`);
        } else if (reward.type === 'item' && reward.itemId && reward.quantity) {
          newInventory[reward.itemId] = (newInventory[reward.itemId] || 0) + reward.quantity;
          rewardsSummary.push(`${reward.quantity}x ${reward.itemId}`); // Consider getting item name here
        }
      });
      
      let xpThreshold = LEVEL_UP_XP_THRESHOLD(newLevel);
      while (newXp >= xpThreshold && xpThreshold > 0) {
        newXp -= xpThreshold;
        newLevel += 1;
        xpThreshold = LEVEL_UP_XP_THRESHOLD(newLevel);
      }

      activeMissions[missionId] = { ...missionToClaim, status: 'claimed' };
      
      toast({
        title: `Đã Nhận Thưởng: ${missionToClaim.title}!`,
        description: `Bạn nhận được: ${rewardsSummary.join(', ')}.`,
        className: "bg-green-500 text-white",
        duration: 7000,
      });

      return {
        ...prev,
        gold: newGold,
        xp: newXp,
        level: newLevel,
        inventory: newInventory,
        activeMissions,
        lastUpdate: Date.now(),
      };
    });
  }, [setGameState, toast]);

  return { updateDisplayName, claimMissionReward };
};
