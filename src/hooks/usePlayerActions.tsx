
'use client';

import { useCallback } from 'react';
import type { GameState, PlayerMissionProgress, MissionReward, InventoryItem } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { LEVEL_UP_XP_THRESHOLD } from '@/lib/constants'; 
import { analytics } from '@/lib/firebase'; // Added analytics
import { logEvent } from 'firebase/analytics'; // Added logEvent

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
    
    if (analytics) {
      logEvent(analytics, 'update_display_name', {
        new_name_length: trimmedName.length,
      });
    }
  }, [setGameState, toast]);

  const claimMissionReward = useCallback((missionId: string) => {
    let canClaim = false;
    let missionTitleForToast: string | undefined;
    let rewardsSummaryForToast: string[] = [];
    let errorForToast: { title: string, description: string, variant: "destructive" | "default" } | null = null;
    let claimedRewardsAnalytics: { type: string, value?: number, item_id?: string, quantity?: number }[] = [];


    setGameState(prev => {
      const activeMissions = { ...prev.activeMissions };
      const missionToClaim = activeMissions[missionId];

      if (!missionToClaim) {
        errorForToast = { title: "Lỗi", description: "Không tìm thấy nhiệm vụ này.", variant: "destructive" };
        return prev;
      }

      if (missionToClaim.status !== 'completed_pending_claim') {
        errorForToast = { title: "Chưa Hoàn Thành", description: "Nhiệm vụ này chưa hoàn thành hoặc đã nhận thưởng.", variant: "default" };
        return prev;
      }

      canClaim = true;
      missionTitleForToast = missionToClaim.title;
      rewardsSummaryForToast = []; 
      claimedRewardsAnalytics = [];


      let newGold = prev.gold;
      let newXp = prev.xp;
      let newLevel = prev.level;
      const newInventory = { ...prev.inventory };
      

      missionToClaim.rewards.forEach(reward => {
        if (reward.type === 'gold' && reward.amount) {
          newGold += reward.amount;
          rewardsSummaryForToast.push(`${reward.amount.toLocaleString()} vàng`);
          claimedRewardsAnalytics.push({ type: 'gold', value: reward.amount });
        } else if (reward.type === 'xp' && reward.amount) {
          newXp += reward.amount;
          rewardsSummaryForToast.push(`${reward.amount.toLocaleString()} XP`);
          claimedRewardsAnalytics.push({ type: 'xp', value: reward.amount });
        } else if (reward.type === 'item' && reward.itemId && reward.quantity) {
          newInventory[reward.itemId] = (newInventory[reward.itemId] || 0) + reward.quantity;
          rewardsSummaryForToast.push(`${reward.quantity}x ${reward.itemId}`); 
          claimedRewardsAnalytics.push({ type: 'item', item_id: reward.itemId, quantity: reward.quantity });
        }
      });
      
      let xpThreshold = LEVEL_UP_XP_THRESHOLD(newLevel);
      while (newXp >= xpThreshold && xpThreshold > 0) { 
        newXp -= xpThreshold;
        newLevel += 1;
        xpThreshold = LEVEL_UP_XP_THRESHOLD(newLevel);
      }

      activeMissions[missionId] = { ...missionToClaim, status: 'claimed' };
      
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

    if (errorForToast) {
      toast(errorForToast);
    } else if (canClaim && missionTitleForToast) {
      toast({
        title: `Đã Nhận Thưởng: ${missionTitleForToast}!`,
        description: `Bạn nhận được: ${rewardsSummaryForToast.join(', ')}.`,
        className: "bg-green-500 text-white",
        duration: 7000,
      });
      if (analytics) {
        logEvent(analytics, 'claim_mission_reward', {
          mission_id: missionId,
          mission_title: missionTitleForToast,
          rewards_count: claimedRewardsAnalytics.length,
        });
        claimedRewardsAnalytics.forEach(reward => {
          if (reward.type === 'gold') {
            logEvent(analytics, 'earn_virtual_currency', { virtual_currency_name: 'gold', value: reward.value });
          } else if (reward.type === 'xp') {
            logEvent(analytics, 'earn_virtual_currency', { virtual_currency_name: 'xp', value: reward.value });
          } else if (reward.type === 'item' && reward.item_id && reward.quantity) {
            logEvent(analytics, 'receive_item', { item_id: reward.item_id, quantity: reward.quantity, source: 'mission_reward' });
          }
        });
      }
    }
  }, [setGameState, toast]);

  return { updateDisplayName, claimMissionReward };
};
