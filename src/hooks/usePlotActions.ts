
'use client';

import { useCallback } from 'react';
import type { GameState, SeedId, CropId, PlotState, TierInfo, FertilizerId, CropDetails, FertilizerDetails, InventoryItem, PlayerMissionProgress } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { getPlayerTierInfo, LEVEL_UP_XP_THRESHOLD, TOTAL_PLOTS, getPlotUnlockCost } from '@/lib/constants';

interface UsePlotActionsProps {
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  gameStateRef: React.MutableRefObject<GameState>; // To get current state in callbacks
  cropData: Record<CropId, CropDetails> | null;
  fertilizerData: Record<FertilizerId, FertilizerDetails> | null;
}

const updateMissionProgress = (
  currentActiveMissions: Record<string, PlayerMissionProgress>,
  missionType: PlayerMissionProgress['type'],
  itemId?: InventoryItem,
  quantity: number = 1
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
      } else { // For missions without specific item ID (e.g., harvest_any_X)
        match = true;
      }

      if (match) {
        const newProgress = mission.progress + quantity;
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


export const usePlotActions = ({
  setGameState,
  gameStateRef,
  cropData,
  fertilizerData,
}: UsePlotActionsProps) => {
  const { toast } = useToast();

  const plantCrop = useCallback((plotId: number, seedId: SeedId) => {
    const currentGameState = gameStateRef.current;
    const currentTierInfo = getPlayerTierInfo(currentGameState.level);

    if (!cropData) {
      toast({ title: "Lỗi", description: "Dữ liệu cây trồng chưa tải xong.", variant: "destructive" });
      return;
    }
    const cropId = seedId.replace('Seed', '') as CropId;
    const cropDetail = cropData[cropId];

    if (!cropDetail) {
      toast({ title: "Lỗi", description: "Loại hạt giống không hợp lệ.", variant: "destructive" });
      return;
    }
    if (currentTierInfo.tier < cropDetail.unlockTier) {
      toast({ title: "Bậc Chưa Mở Khóa", description: `Bạn cần đạt ${getPlayerTierInfo((cropDetail.unlockTier - 1) * 10 + 1).tierName} (Bậc ${cropDetail.unlockTier}) để trồng ${cropDetail.name}.`, variant: "destructive" });
      return;
    }
    if ((currentGameState.inventory[seedId] || 0) <= 0) {
      toast({ title: "Không Đủ Hạt Giống", description: `Bạn không có hạt giống ${cropDetail.name}.`, variant: "destructive" });
      return;
    }
    const currentPlot = currentGameState.plots.find(p => p.id === plotId);
    if (plotId >= currentGameState.unlockedPlotsCount) {
      toast({ title: "Đất Bị Khóa", description: "Bạn cần mở khóa ô đất này trước.", variant: "destructive"});
      return;
    }
    if (!currentPlot || currentPlot.state !== 'empty') {
      toast({ title: "Đất Đã Có Cây", description: "Thửa đất này không trống.", variant: "destructive" });
      return;
    }

    setGameState(prev => {
      const plotToUpdate = prev.plots.find(p => p.id === plotId);
      if (!plotToUpdate) return prev;
      const newPlots = prev.plots.map(p =>
        p.id === plotId ? { ...plotToUpdate, state: 'planted' as const, cropId, plantedAt: Date.now() } : p
      );
      const newInventory = { ...prev.inventory, [seedId]: (prev.inventory[seedId] || 0) - 1 };
      
      const updatedMissions = updateMissionProgress(prev.activeMissions, 'plant_seed', seedId, 1);

      return { ...prev, plots: newPlots, inventory: newInventory, activeMissions: updatedMissions, lastUpdate: Date.now() };
    });
    toast({ title: "Đã Trồng!", description: `Đã trồng ${cropDetail.name} trên thửa đất ${plotId + 1}.` });
  }, [setGameState, gameStateRef, cropData, toast]);

  const harvestCrop = useCallback(async (plotId: number) => {
    const currentGameState = gameStateRef.current;
    const currentTierInfoValue = getPlayerTierInfo(currentGameState.level);

    if (!cropData) {
      toast({ title: "Lỗi", description: "Dữ liệu cây trồng chưa tải xong.", variant: "destructive" });
      return;
    }
    const plotToHarvest = currentGameState.plots.find(p => p.id === plotId);

    if (plotId >= currentGameState.unlockedPlotsCount) {
      toast({ title: "Lỗi", description: "Không thể thu hoạch ô đất bị khóa.", variant: "destructive"});
      return;
    }

    if (!plotToHarvest || plotToHarvest.state !== 'ready_to_harvest' || !plotToHarvest.cropId || !cropData[plotToHarvest.cropId]) {
      toast({ title: "Chưa Sẵn Sàng", description: "Thửa đất này chưa sẵn sàng để thu hoạch hoặc dữ liệu không hợp lệ.", variant: "destructive" });
      return;
    }

    const cropDetail = cropData[plotToHarvest.cropId];
    const baseXp = cropDetail.harvestYield * 5; // Example XP calculation
    const earnedXp = Math.floor(baseXp * (1 + currentTierInfoValue.xpBoostPercent));

    setGameState(prev => {
      const newPlots = prev.plots.map(p => {
        if (p.id === plotId) {
          const { cropId: oldCropId, plantedAt, ...restOfPlot } = p;
          return { ...restOfPlot, state: 'empty' as const, cropId: undefined, plantedAt: undefined };
        }
        return p;
      });

      const newInventory = { ...prev.inventory };
      newInventory[plotToHarvest.cropId!] = (newInventory[plotToHarvest.cropId!] || 0) + cropDetail.harvestYield;

      let newXp = prev.xp + earnedXp;
      let newLevel = prev.level;

      let xpThreshold = LEVEL_UP_XP_THRESHOLD(newLevel);
      while (newXp >= xpThreshold && xpThreshold > 0) {
        newXp -= xpThreshold;
        newLevel += 1;
        xpThreshold = LEVEL_UP_XP_THRESHOLD(newLevel);
      }
      
      let updatedMissions = updateMissionProgress(prev.activeMissions, 'harvest_crop', plotToHarvest.cropId!, cropDetail.harvestYield);
      if (newLevel > prev.level) {
        updatedMissions = updateMissionProgress(updatedMissions, 'reach_level', undefined, newLevel - prev.level);
      }


      return { ...prev, plots: newPlots, inventory: newInventory, xp: newXp, level: newLevel, activeMissions: updatedMissions, lastUpdate: Date.now() };
    });

    toast({ title: "Đã Thu Hoạch!", description: `Thu hoạch được ${cropDetail.harvestYield} ${cropDetail.name} và nhận được ${earnedXp} XP.`, className: "bg-accent text-accent-foreground" });
  }, [setGameState, gameStateRef, cropData, toast]);

  const unlockPlot = useCallback((plotIdToUnlock: number) => {
    const currentGameState = gameStateRef.current;
    if (plotIdToUnlock !== currentGameState.unlockedPlotsCount) {
      toast({ title: "Mở Khóa Sai Thứ Tự", description: "Bạn cần mở khóa các ô đất theo thứ tự.", variant: "destructive" });
      return;
    }
    if (currentGameState.unlockedPlotsCount >= TOTAL_PLOTS) {
      toast({ title: "Đã Mở Hết", description: "Tất cả các ô đất đã được mở khóa.", variant: "default" });
      return;
    }

    const cost = getPlotUnlockCost(plotIdToUnlock);
    if (currentGameState.gold < cost) {
      toast({ title: "Không Đủ Vàng", description: `Bạn cần ${cost} vàng để mở ô đất này.`, variant: "destructive" });
      return;
    }

    setGameState(prev => {
      const updatedMissions = updateMissionProgress(prev.activeMissions, 'unlock_plots', undefined, 1);
      return {
        ...prev,
        gold: prev.gold - cost,
        unlockedPlotsCount: prev.unlockedPlotsCount + 1,
        activeMissions: updatedMissions,
        lastUpdate: Date.now(),
      }
    });
    toast({ title: "Mở Khóa Thành Công!", description: `Đã mở khóa ô đất ${plotIdToUnlock + 1}.`, className: "bg-accent text-accent-foreground" });
  }, [setGameState, gameStateRef, toast]);

  const applyFertilizer = useCallback((plotId: number, fertilizerId: FertilizerId) => {
    const currentGameState = gameStateRef.current;
    const currentTierInfo = getPlayerTierInfo(currentGameState.level);

    if (!fertilizerData || !cropData) {
      toast({ title: "Lỗi", description: "Dữ liệu phân bón hoặc cây trồng chưa tải.", variant: "destructive" });
      return;
    }

    const fertilizerDetail = fertilizerData[fertilizerId];
    if (!fertilizerDetail) {
      toast({ title: "Lỗi", description: "Không tìm thấy thông tin phân bón.", variant: "destructive" });
      return;
    }

    if (currentTierInfo.tier < fertilizerDetail.unlockTier) {
      toast({ title: "Bậc Chưa Đủ", description: `Cần Bậc ${getPlayerTierInfo((fertilizerDetail.unlockTier - 1) * 10 + 1).tierName} (Bậc ${fertilizerDetail.unlockTier}) để dùng ${fertilizerDetail.name}.`, variant: "destructive" });
      return;
    }

    if ((currentGameState.inventory[fertilizerId] || 0) <= 0) {
      toast({ title: "Hết Phân Bón", description: `Bạn không có ${fertilizerDetail.name}.`, variant: "destructive" });
      return;
    }

    const plot = currentGameState.plots.find(p => p.id === plotId);
    if (!plot || plotId >= currentGameState.unlockedPlotsCount) {
      toast({ title: "Lỗi", description: "Ô đất không hợp lệ.", variant: "destructive" });
      return;
    }

    if (plot.state !== 'planted' && plot.state !== 'growing') {
      toast({ title: "Không Thể Bón Phân", description: "Chỉ có thể bón phân cho cây đang trồng hoặc đang lớn.", variant: "default" });
      return;
    }

    if (!plot.cropId || !plot.plantedAt) {
      toast({ title: "Lỗi Dữ Liệu Ô Đất", description: "Không tìm thấy thông tin cây trồng trên ô đất.", variant: "destructive" });
      return;
    }
    const cropDetail = cropData[plot.cropId];
     if (!cropDetail) {
      toast({ title: "Lỗi Dữ Liệu Cây Trồng", description: "Không tìm thấy chi tiết cây trồng.", variant: "destructive" });
      return;
    }

    const tierGrowthReduction = currentTierInfo.growthTimeReductionPercent;
    const effectiveTimeToGrowing = cropDetail.timeToGrowing * (1 - tierGrowthReduction);
    const effectiveTimeToReady = cropDetail.timeToReady * (1 - tierGrowthReduction);

    let remainingTime;
    if (plot.state === 'planted') {
        remainingTime = (plot.plantedAt + effectiveTimeToGrowing) - Date.now();
    } else { // 'growing'
        remainingTime = (plot.plantedAt + effectiveTimeToReady) - Date.now();
    }
    
    if (remainingTime <= 0) {
      toast({ title: "Cây Sẵn Sàng", description: "Cây đã sẵn sàng hoặc đã thu hoạch, không cần bón phân.", variant: "default" });
      return;
    }

    const timeReductionAmount = remainingTime * fertilizerDetail.timeReductionPercent;

    setGameState(prev => {
      const newPlots = prev.plots.map(p => {
        if (p.id === plotId && p.plantedAt) {
          return { ...p, plantedAt: p.plantedAt - timeReductionAmount };
        }
        return p;
      });
      const newInventory = { ...prev.inventory, [fertilizerId]: (prev.inventory[fertilizerId] || 0) - 1 };
      const updatedMissions = updateMissionProgress(prev.activeMissions, 'use_fertilizer', fertilizerId, 1);
      return { ...prev, plots: newPlots, inventory: newInventory, activeMissions: updatedMissions, lastUpdate: Date.now() };
    });

    toast({ title: "Đã Bón Phân!", description: `${fertilizerDetail.name} đã được sử dụng, giảm thời gian chờ!`, className: "bg-accent text-accent-foreground" });
  }, [setGameState, gameStateRef, cropData, fertilizerData, toast]);

  const uprootCrop = useCallback((plotId: number) => {
    const currentGameState = gameStateRef.current;
    const plotToUproot = currentGameState.plots.find(p => p.id === plotId);

    if (!plotToUproot) {
      toast({ title: "Lỗi", description: "Ô đất không tồn tại.", variant: "destructive" });
      return;
    }

    if (plotId >= currentGameState.unlockedPlotsCount) {
      toast({ title: "Lỗi", description: "Không thể thao tác trên ô đất bị khóa.", variant: "destructive" });
      return;
    }

    if (plotToUproot.state !== 'planted' && plotToUproot.state !== 'growing') {
      toast({ title: "Không Thể Nhổ", description: "Chỉ có thể nhổ cây đang trồng hoặc đang lớn.", variant: "default" });
      return;
    }

    setGameState(prev => {
      const newPlots = prev.plots.map(p => {
        if (p.id === plotId) {
          return { ...p, state: 'empty' as const, cropId: undefined, plantedAt: undefined };
        }
        return p;
      });
      return { ...prev, plots: newPlots, lastUpdate: Date.now() };
    });

    toast({ title: "Đã Nhổ Cây", description: `Đã dọn sạch ô đất ${plotId + 1}.`, className: "bg-orange-500 text-white" });
  }, [setGameState, gameStateRef, toast]);

  return { plantCrop, harvestCrop, unlockPlot, applyFertilizer, uprootCrop };
};

