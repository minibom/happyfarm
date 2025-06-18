
import { useState, useEffect, useCallback, useRef } from 'react';
import type { GameState, Plot, CropId, InventoryItem, SeedId, CropDetails, MarketItem, TierInfo, PlotState } from '@/types';
import {
  INITIAL_GAME_STATE,
  LEVEL_UP_XP_THRESHOLD,
  TOTAL_PLOTS,
  CROP_DATA as FALLBACK_CROP_DATA,
  getPlayerTierInfo,
  getPlotUnlockCost,
  INITIAL_UNLOCKED_PLOTS,
} from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './useAuth';
import { db } from '@/lib/firebase';
import { doc, setDoc, onSnapshot, type Unsubscribe, collection, getDocs } from 'firebase/firestore';

export const useGameLogic = () => {
  const { user, userId, loading: authLoading } = useAuth();
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [isInitialized, setIsInitialized] = useState(false);
  const [itemDataLoaded, setItemDataLoaded] = useState(false);
  const [gameDataLoaded, setGameDataLoaded] = useState(false); 

  const { toast } = useToast();

  const [cropData, setCropData] = useState<Record<CropId, CropDetails> | null>(null);
  const [marketItems, setMarketItems] = useState<MarketItem[] | null>(null);
  const [allSeedIds, setAllSeedIds] = useState<SeedId[]>([]);
  const [allCropIds, setAllCropIds] = useState<CropId[]>([]);
  const [playerTierInfo, setPlayerTierInfo] = useState<TierInfo>(getPlayerTierInfo(INITIAL_GAME_STATE.level));

  const prevLevelRef = useRef(gameState.level);
  const gameStateRef = useRef(gameState);

  useEffect(() => {
    gameStateRef.current = gameState;
    setPlayerTierInfo(getPlayerTierInfo(gameState.level));
  }, [gameState]);

  useEffect(() => {
    const fetchItemData = async () => {
      try {
        const itemsCollectionRef = collection(db, 'gameItems');
        const querySnapshot = await getDocs(itemsCollectionRef);
        const fetchedItems: Record<CropId, CropDetails> = {};
        querySnapshot.forEach((docSnap) => {
          fetchedItems[docSnap.id as CropId] = docSnap.data() as CropDetails;
        });

        if (Object.keys(fetchedItems).length === 0) {
            console.warn("No items found in Firestore 'gameItems' collection. Using fallback data.");
            setCropData(FALLBACK_CROP_DATA);
            toast({ title: "Lưu ý", description: "Không tìm thấy dữ liệu vật phẩm trên server, sử dụng dữ liệu tạm.", variant: "destructive"});
        } else {
            setCropData(fetchedItems);
        }
        setItemDataLoaded(true);
      } catch (error) {
        console.error("Failed to fetch item data from Firestore:", error);
        toast({ title: "Lỗi Tải Vật Phẩm", description: "Không thể tải dữ liệu vật phẩm từ server. Sử dụng dữ liệu tạm.", variant: "destructive" });
        setCropData(FALLBACK_CROP_DATA);
        setItemDataLoaded(true);
      }
    };
    fetchItemData();
  }, [toast]);

  useEffect(() => {
    if (cropData) {
      const derivedCropIds = Object.keys(cropData) as CropId[];
      const derivedSeedIds = derivedCropIds.map(id => cropData[id].seedName as SeedId);
      setAllCropIds(derivedCropIds);
      setAllSeedIds(derivedSeedIds);

      const derivedMarketItems: MarketItem[] = [
        ...derivedCropIds.map(id => ({
          id: cropData[id].seedName as SeedId,
          name: `${cropData[id].name} (Hạt Giống)`,
          price: cropData[id].seedPrice,
          type: 'seed' as 'seed',
          unlockTier: cropData[id].unlockTier,
          icon: cropData[id].icon,
        })),
        ...derivedCropIds.map(id => ({
          id: id,
          name: cropData[id].name,
          price: cropData[id].cropPrice,
          type: 'crop' as 'crop',
          unlockTier: cropData[id].unlockTier,
          icon: cropData[id].icon,
        })),
      ];
      setMarketItems(derivedMarketItems);
    }
  }, [cropData]);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const saveGameStateToFirestore = useCallback(() => {
    if (userId && gameDataLoaded && itemDataLoaded) { 
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          const gameDocRef = doc(db, 'users', userId, 'gameState', 'data');
          const stateToSave = JSON.parse(JSON.stringify(gameStateRef.current, (key, value) => {
            return value === undefined ? null : value; 
          }));
          await setDoc(gameDocRef, stateToSave);
        } catch (error) {
          console.error("Failed to save game state:", error);
          toast({ title: "Lỗi Lưu Trữ", description: "Không thể lưu tiến trình trò chơi của bạn vào đám mây.", variant: "destructive" });
        }
      }, 1000);
    }
  }, [userId, gameDataLoaded, itemDataLoaded, toast]);


  useEffect(() => {
    if (gameDataLoaded && itemDataLoaded && userId) {
      saveGameStateToFirestore();
    }
  }, [gameState, gameDataLoaded, itemDataLoaded, userId, saveGameStateToFirestore]);


  useEffect(() => {
    if (gameDataLoaded && gameState.level > prevLevelRef.current && prevLevelRef.current !== INITIAL_GAME_STATE.level) {
      const oldTierInfo = getPlayerTierInfo(prevLevelRef.current);
      const newTierInfo = getPlayerTierInfo(gameState.level);
      toast({ title: "Lên Cấp!", description: `Chúc mừng! Bạn đã đạt cấp ${gameState.level}!`, className: "bg-primary text-primary-foreground" });
      if (newTierInfo.tier > oldTierInfo.tier) {
        toast({ title: "Thăng Hạng!", description: `Chúc mừng! Bạn đã đạt được Bậc ${newTierInfo.tierName}! Các vật phẩm mới có thể đã được mở khóa và buff mới đã được kích hoạt.`, className: "bg-accent text-accent-foreground", duration: 7000 });
      }
    }
    if (gameDataLoaded) {
        prevLevelRef.current = gameState.level;
    }
  }, [gameState.level, gameDataLoaded, toast]);

  useEffect(() => {
    if (authLoading) {
      setGameDataLoaded(false); 
      return;
    }

    let unsubscribe: Unsubscribe | undefined;

    if (!userId) { 
      setGameState(INITIAL_GAME_STATE);
      setGameDataLoaded(false); 
      return;
    }

    // SignUp in useAuth now writes the initial GameState, so onSnapshot should pick it up.
    // The "else" block for docSnap.exists() being false in onSnapshot is now less critical for *new* users
    // as their document should ideally be created by signUp.
    // It remains important for scenarios where the doc might be missing for other reasons.

    if (userId && itemDataLoaded && cropData && allSeedIds.length > 0 && allCropIds.length > 0) {
      const gameDocRef = doc(db, 'users', userId, 'gameState', 'data');
      unsubscribe = onSnapshot(gameDocRef, (docSnap) => {
        let finalStateToSet: GameState;
        if (docSnap.exists()) {
          const firestoreData = docSnap.data() as GameState;
          let loadedState = { ...INITIAL_GAME_STATE, ...firestoreData };

          let plots = (firestoreData.plots && Array.isArray(firestoreData.plots) && firestoreData.plots.length === TOTAL_PLOTS)
            ? firestoreData.plots.map((loadedPlotData: any, index: number) => {
                const basePlot = INITIAL_GAME_STATE.plots[index] || { id: index, state: 'empty' as PlotState };
                const newPlot: Plot = {
                  id: loadedPlotData.id !== undefined ? loadedPlotData.id : basePlot.id,
                  state: loadedPlotData.state || basePlot.state,
                };
                if (loadedPlotData.cropId) newPlot.cropId = loadedPlotData.cropId;
                if (loadedPlotData.plantedAt) newPlot.plantedAt = loadedPlotData.plantedAt;
                return newPlot;
              })
            : INITIAL_GAME_STATE.plots.map((p, i) => ({ ...p, id: i }));
          loadedState.plots = plots;

          const validatedInventory: Inventory = {};
          allSeedIds.forEach(id => validatedInventory[id] = INITIAL_GAME_STATE.inventory[id] || 0);
          allCropIds.forEach(id => validatedInventory[id] = INITIAL_GAME_STATE.inventory[id] || 0);

          if (firestoreData.inventory && typeof firestoreData.inventory === 'object') {
            for (const key in firestoreData.inventory) {
              const itemKey = key as InventoryItem;
              if (Object.prototype.hasOwnProperty.call(validatedInventory, itemKey)) {
                validatedInventory[itemKey] = firestoreData.inventory[itemKey] || 0;
              }
            }
          }
          loadedState.inventory = validatedInventory;
          
          loadedState.gold = typeof firestoreData.gold === 'number' ? firestoreData.gold : INITIAL_GAME_STATE.gold;
          loadedState.xp = typeof firestoreData.xp === 'number' ? firestoreData.xp : INITIAL_GAME_STATE.xp;
          loadedState.level = typeof firestoreData.level === 'number' ? firestoreData.level : INITIAL_GAME_STATE.level;
          loadedState.unlockedPlotsCount = typeof firestoreData.unlockedPlotsCount === 'number' && firestoreData.unlockedPlotsCount >= INITIAL_UNLOCKED_PLOTS && firestoreData.unlockedPlotsCount <= TOTAL_PLOTS
            ? firestoreData.unlockedPlotsCount
            : INITIAL_UNLOCKED_PLOTS;
          
          loadedState.email = firestoreData.email || user?.email || INITIAL_GAME_STATE.email;
          loadedState.displayName = firestoreData.displayName || user?.displayName || INITIAL_GAME_STATE.displayName;
          loadedState.status = firestoreData.status || INITIAL_GAME_STATE.status;
          
          loadedState.lastLogin = firestoreData.lastLogin || Date.now(); 
          loadedState.lastUpdate = firestoreData.lastUpdate || gameStateRef.current.lastUpdate || Date.now();
          
          finalStateToSet = loadedState;

        } else { 
          // This case should be less common for new users if signUp creates the doc.
          // For robustness, if it's somehow missed, create it.
          const newInitialUserState: GameState = {
            ...INITIAL_GAME_STATE,
            inventory: { ...INITIAL_GAME_STATE.inventory },
            plots: INITIAL_GAME_STATE.plots.map(p => ({ ...p })),
            email: user?.email || undefined,
            displayName: user?.displayName || undefined, // Could be Firebase Auth display name if set
            lastLogin: Date.now(), 
            lastUpdate: Date.now(),
            unlockedPlotsCount: INITIAL_UNLOCKED_PLOTS,
            status: 'active' as const,
          };
          finalStateToSet = newInitialUserState;
          // No need to setDoc here if signUp is responsible, but if it wasn't, you would.
          // For now, we assume signUp handles the *very first* creation.
        }
        
        setGameState(finalStateToSet);
        prevLevelRef.current = finalStateToSet.level;

        if (!gameDataLoaded && !authLoading && userId) {
            setGameDataLoaded(true);
        }

      }, (error) => {
        console.error("Error listening to game state:", error);
        toast({ title: "Lỗi Kết Nối", description: "Không thể đồng bộ dữ liệu trò chơi.", variant: "destructive" });
        setGameState(INITIAL_GAME_STATE);
        prevLevelRef.current = INITIAL_GAME_STATE.level;
        if (!gameDataLoaded && !authLoading && userId) { 
          setGameDataLoaded(true);
        }
      });

      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [userId, authLoading, itemDataLoaded, cropData, allSeedIds, allCropIds, user, toast]); 

  useEffect(() => {
     setIsInitialized(gameDataLoaded && itemDataLoaded && !!userId && !authLoading);
  }, [gameDataLoaded, itemDataLoaded, userId, authLoading]);

  useEffect(() => {
    if (!isInitialized || !userId || !cropData) return;
    const currentTierInfo = playerTierInfo;

    const gameLoop = setInterval(() => {
      setGameState(prev => {
        if (!prev || !prev.plots || !cropData) return prev;
        const now = Date.now();
        const updatedPlots = prev.plots.map(plot => {
          if (plot.id >= prev.unlockedPlotsCount) return plot;

          const currentCropDetail = plot.cropId ? cropData[plot.cropId] : null;
          if (!currentCropDetail) return plot; 

          const growthTimeReduction = currentTierInfo.growthTimeReductionPercent;
          const effectiveTimeToGrowing = currentCropDetail.timeToGrowing * (1 - growthTimeReduction);
          const effectiveTimeToReady = currentCropDetail.timeToReady * (1 - growthTimeReduction);


          if (plot.state === 'planted' && plot.plantedAt) {
            if (now >= plot.plantedAt + effectiveTimeToGrowing) {
              return { ...plot, state: 'growing' as const };
            }
          } else if (plot.state === 'growing' && plot.plantedAt) {
            if (now >= plot.plantedAt + effectiveTimeToReady) { 
              return { ...plot, state: 'ready_to_harvest' as const };
            }
          }
          return plot;
        });

        if (JSON.stringify(updatedPlots) !== JSON.stringify(prev.plots)) {
          return { ...prev, plots: updatedPlots, lastUpdate: now };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(gameLoop);
  }, [isInitialized, userId, cropData, playerTierInfo]);

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
      toast({ title: "Bậc Chưa Mở Khóa", description: `Bạn cần đạt ${getPlayerTierInfo( (cropDetail.unlockTier -1) * 10 +1 ).tierName} (Bậc ${cropDetail.unlockTier}) để trồng ${cropDetail.name}.`, variant: "destructive" });
      return;
    }
    if (currentGameState.inventory[seedId] <= 0) {
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
      const newInventory = { ...prev.inventory, [seedId]: prev.inventory[seedId] - 1 };
      return { ...prev, plots: newPlots, inventory: newInventory, lastUpdate: Date.now() };
    });
    toast({ title: "Đã Trồng!", description: `Đã trồng ${cropDetail.name} trên thửa đất ${plotId + 1}.` });
  }, [toast, cropData]);

  const harvestCrop = useCallback(async (plotId: number) => {
    const currentGameState = gameStateRef.current;
    const currentTierInfo = playerTierInfo;
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
    const baseXp = cropDetail.harvestYield * 5; 
    const earnedXp = Math.floor(baseXp * (1 + currentTierInfo.xpBoostPercent));


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
      while (newXp >= xpThreshold) {
        newXp -= xpThreshold;
        newLevel += 1;
        xpThreshold = LEVEL_UP_XP_THRESHOLD(newLevel);
      }
      return { ...prev, plots: newPlots, inventory: newInventory, xp: newXp, level: newLevel, lastUpdate: Date.now() };
    });

    toast({ title: "Đã Thu Hoạch!", description: `Thu hoạch được ${cropDetail.harvestYield} ${cropDetail.name} và nhận được ${earnedXp} XP.`, className: "bg-accent text-accent-foreground" });
  }, [toast, cropData, playerTierInfo]);

  const buyItem = useCallback((itemId: InventoryItem, quantity: number, price: number) => {
    if (quantity <= 0) return;
    const currentGameState = gameStateRef.current;
    const currentTierInfo = getPlayerTierInfo(currentGameState.level);

     if (!marketItems || !cropData) {
        toast({ title: "Lỗi", description: "Dữ liệu chợ hoặc cây trồng chưa tải.", variant: "destructive" });
        return;
    }
    const marketItemInfo = marketItems.find(i => i.id === itemId);
    if (!marketItemInfo) {
        toast({ title: "Lỗi", description: "Không tìm thấy vật phẩm trong chợ.", variant: "destructive" });
        return;
    }

    if (currentTierInfo.tier < marketItemInfo.unlockTier) {
         toast({ title: "Bậc Chưa Mở Khóa", description: `Bạn cần đạt ${getPlayerTierInfo( (marketItemInfo.unlockTier-1) * 10 + 1 ).tierName} (Bậc ${marketItemInfo.unlockTier}) để mua ${marketItemInfo.name}.`, variant: "destructive", duration: 7000 });
        return;
    }

    const totalCost = quantity * price;
    if (currentGameState.gold < totalCost) {
      toast({ title: "Không Đủ Vàng", description: "Bạn không có đủ vàng.", variant: "destructive" });
      return;
    }

    setGameState(prev => {
      if (prev.gold < totalCost) return prev; 
      const newInventory = { ...prev.inventory };
      newInventory[itemId] = (newInventory[itemId] || 0) + quantity;
      return { ...prev, gold: prev.gold - totalCost, inventory: newInventory, lastUpdate: Date.now() };
    });

    toast({ title: "Đã Mua!", description: `Mua ${quantity} x ${marketItemInfo.name}.`, className: "bg-accent text-accent-foreground" });
  }, [toast, marketItems, cropData]);

  const sellItem = useCallback((itemId: InventoryItem, quantity: number, price: number) => {
    if (quantity <= 0) return;
    const currentGameState = gameStateRef.current;
    const currentTierInfo = playerTierInfo; 
     if (!marketItems) {
        toast({ title: "Lỗi", description: "Dữ liệu chợ chưa tải.", variant: "destructive" });
        return;
    }
    const itemName = marketItems.find(i => i.id === itemId)?.name || itemId;

    if ((currentGameState.inventory[itemId] || 0) < quantity) {
      toast({ title: "Không Đủ Vật Phẩm", description: `Bạn không có ${quantity} ${itemName}.`, variant: "destructive" });
      return;
    }

    setGameState(prev => {
      if ((prev.inventory[itemId] || 0) < quantity) return prev; 
      const baseGain = quantity * price;
      const totalGain = Math.floor(baseGain * (1 + currentTierInfo.sellPriceBoostPercent));
      const newInventory = { ...prev.inventory };
      newInventory[itemId] -= quantity;
      return { ...prev, gold: prev.gold + totalGain, inventory: newInventory, lastUpdate: Date.now() };
    });
    toast({ title: "Đã Bán!", description: `Bán ${quantity} x ${itemName}.`, className: "bg-primary text-primary-foreground" });
  }, [toast, marketItems, playerTierInfo]);

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

    setGameState(prev => ({
      ...prev,
      gold: prev.gold - cost,
      unlockedPlotsCount: prev.unlockedPlotsCount + 1,
      lastUpdate: Date.now(),
    }));
    toast({ title: "Mở Khóa Thành Công!", description: `Đã mở khóa ô đất ${plotIdToUnlock + 1}.`, className: "bg-accent text-accent-foreground" });
  }, [toast]);

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
  }, [toast]);


  return {
    gameState,
    plantCrop,
    harvestCrop,
    buyItem,
    sellItem,
    unlockPlot,
    updateDisplayName,
    isInitialized,
    playerTierInfo,
    cropData,
    marketItems,
    allSeedIds,
    allCropIds,
  };
};
