
'use client';

import { useCallback } from 'react';
import type { GameState, InventoryItem, TierInfo, CropId, CropDetails, FertilizerId, FertilizerDetails, MarketActivityLog, PlayerMissionProgress } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { getPlayerTierInfo, ALL_FERTILIZER_IDS, ALL_SEED_IDS, ALL_CROP_IDS } from '@/lib/constants';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from './useAuth';


interface UseTransactionActionsProps {
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  gameStateRef: React.MutableRefObject<GameState>;
  cropData: Record<CropId, CropDetails> | null;
  fertilizerData: Record<FertilizerId, FertilizerDetails> | null;
}

// Shared mission progress update logic (can be moved to a utility if used elsewhere)
const updateMissionProgressForTransaction = (
  currentActiveMissions: Record<string, PlayerMissionProgress>,
  missionType: PlayerMissionProgress['type'],
  itemId?: InventoryItem,
  quantity: number = 1,
  value?: number // For earn_gold
): Record<string, PlayerMissionProgress> => {
  const updatedMissions = { ...currentActiveMissions };
  let missionChanged = false;

  Object.keys(updatedMissions).forEach(key => {
    const mission = updatedMissions[key];
    if (mission.status === 'active' && mission.type === missionType) {
      let match = false;
      if (mission.targetItemId) {
        if (mission.targetItemId === itemId) {
          match = true;
        }
      } else if (missionType === 'earn_gold' && value !== undefined) { // earn_gold doesn't use itemId, uses value
         match = true;
      }
       else if (missionType !== 'earn_gold') { // For missions without specific item ID (e.g., harvest_any_X), but not earn_gold
        match = true;
      }


      if (match) {
        const progressIncrement = (missionType === 'earn_gold' && value !== undefined) ? value : quantity;
        const newProgress = mission.progress + progressIncrement;
        updatedMissions[key] = { ...mission, progress: newProgress };
        missionChanged = true;
        if (newProgress >= mission.targetQuantity) {
          updatedMissions[key].status = 'completed_pending_claim';
        }
      }
    }
  });
  return missionChanged ? updatedMissions : currentActiveMissions;
};


export const useTransactionActions = ({
  setGameState,
  gameStateRef,
  cropData,
  fertilizerData,
}: UseTransactionActionsProps) => {
  const { toast } = useToast();
  const { userId } = useAuth();

  const logMarketActivity = useCallback(async (logData: Omit<MarketActivityLog, 'timestamp' | 'logId' | 'userId'>) => {
    if (!userId) return;
    console.log("Market Activity (simulated log):", { ...logData, userId, timestamp: Date.now() });
  }, [userId]);


  const buyItem = useCallback((itemId: InventoryItem, quantity: number, priceAtTransaction: number) => {
    if (quantity <= 0) return;

    const currentGameState = gameStateRef.current;
    const currentTierInfo = getPlayerTierInfo(currentGameState.level);
    let itemDetails;
    let itemName;
    let itemUnlockTier;

    if (ALL_FERTILIZER_IDS.includes(itemId as FertilizerId) && fertilizerData) {
        itemDetails = fertilizerData[itemId as FertilizerId];
        itemName = itemDetails?.name;
        itemUnlockTier = itemDetails?.unlockTier;
    } else if (cropData && (ALL_SEED_IDS.includes(itemId as SeedId) || ALL_CROP_IDS.includes(itemId as CropId))) {
        const baseCropId = itemId.endsWith('Seed') ? itemId.replace('Seed', '') as CropId : itemId as CropId;
        itemDetails = cropData[baseCropId];
        itemName = itemId.endsWith('Seed') ? `${itemDetails?.name} (Hạt)` : itemDetails?.name;
        itemUnlockTier = itemDetails?.unlockTier;
    }

    if (!itemDetails || !itemName || typeof itemUnlockTier !== 'number') {
      toast({ title: "Lỗi", description: "Không tìm thấy thông tin vật phẩm.", variant: "destructive" });
      return;
    }

    if (currentTierInfo.tier < itemUnlockTier) {
      toast({ title: "Bậc Chưa Mở Khóa", description: `Bạn cần đạt ${getPlayerTierInfo((itemUnlockTier - 1) * 10 + 1).tierName} (Bậc ${itemUnlockTier}) để mua ${itemName}.`, variant: "destructive", duration: 7000 });
      return;
    }

    const totalCost = quantity * priceAtTransaction;
    if (currentGameState.gold < totalCost) {
      toast({ title: "Không Đủ Vàng", description: "Bạn không có đủ vàng.", variant: "destructive" });
      return;
    }

    setGameState(prev => {
      if (prev.gold < totalCost) return prev; // Double check gold before state update
      const newInventory = { ...prev.inventory };
      newInventory[itemId] = (newInventory[itemId] || 0) + quantity;
      
      const updatedMissions = updateMissionProgressForTransaction(prev.activeMissions, 'buy_item', itemId, quantity);

      return { ...prev, gold: prev.gold - totalCost, inventory: newInventory, activeMissions: updatedMissions, lastUpdate: Date.now() };
    });

    logMarketActivity({ itemId, quantity, pricePerUnit: priceAtTransaction, totalPrice: totalCost, type: 'buy' });
    toast({ title: "Đã Mua!", description: `Mua ${quantity} x ${itemName}.`, className: "bg-accent text-accent-foreground" });
  }, [setGameState, gameStateRef, cropData, fertilizerData, toast, logMarketActivity]);

  const sellItem = useCallback((itemId: InventoryItem, quantity: number, priceAtTransaction: number) => {
    if (quantity <= 0) return;
    const currentGameState = gameStateRef.current;
    const currentTierInfoValue = getPlayerTierInfo(currentGameState.level);

    if (!cropData) {
        toast({ title: "Lỗi", description: "Dữ liệu vật phẩm cơ bản chưa tải.", variant: "destructive" });
        return;
    }
    const itemDetails = cropData[itemId as CropId];
    if (!itemDetails) {
        toast({ title: "Lỗi", description: "Không tìm thấy thông tin vật phẩm để bán.", variant: "destructive" });
        return;
    }
    const itemName = itemDetails.name;

    if ((currentGameState.inventory[itemId] || 0) < quantity) {
      toast({ title: "Không Đủ Vật Phẩm", description: `Bạn không có ${quantity} ${itemName}.`, variant: "destructive" });
      return;
    }

    setGameState(prev => {
      if ((prev.inventory[itemId] || 0) < quantity) return prev; // Double check inventory
      const baseGain = quantity * priceAtTransaction;
      const totalGain = Math.floor(baseGain * (1 + currentTierInfoValue.sellPriceBoostPercent));
      const newInventory = { ...prev.inventory };
      newInventory[itemId] -= quantity;

      let updatedMissions = updateMissionProgressForTransaction(prev.activeMissions, 'sell_item', itemId, quantity);
      updatedMissions = updateMissionProgressForTransaction(updatedMissions, 'earn_gold', undefined, 0, totalGain);


      return { ...prev, gold: prev.gold + totalGain, inventory: newInventory, activeMissions: updatedMissions, lastUpdate: Date.now() };
    });

    logMarketActivity({ itemId, quantity, pricePerUnit: priceAtTransaction, totalPrice: quantity * priceAtTransaction * (1 + currentTierInfoValue.sellPriceBoostPercent), type: 'sell'});
    toast({ title: "Đã Bán!", description: `Bán ${quantity} x ${itemName}.`, className: "bg-primary text-primary-foreground" });
  }, [setGameState, gameStateRef, cropData, toast, logMarketActivity]);

  return { buyItem, sellItem };
};
