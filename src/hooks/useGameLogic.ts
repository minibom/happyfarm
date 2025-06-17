
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
  const [gameDataLoaded, setGameDataLoaded] = useState(false); // True when current user's game data is loaded/initialized

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
    if (userId && gameDataLoaded && itemDataLoaded) { // Ensure data is loaded before attempting to save
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          const gameDocRef = doc(db, 'users', userId, 'gameState', 'data');
          // Use gameStateRef.current to ensure the latest state is saved, especially with debouncing
          const stateToSave = JSON.parse(JSON.stringify(gameStateRef.current, (key, value) => {
            return value === undefined ? null : value; // Convert undefined to null for Firestore
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
    // This effect triggers saving whenever gameState changes, IF conditions are met.
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
        toast({ title: "Thăng Hạng!", description: `Chúc mừng! Bạn đã đạt được Bậc ${newTierInfo.tierName}! Các vật phẩm mới có thể đã được mở khóa.`, className: "bg-accent text-accent-foreground", duration: 7000 });
      }
    }
    // Update prevLevelRef *after* checking, but only if gameDataLoaded to avoid issues during initial load transitions
    if (gameDataLoaded) {
        prevLevelRef.current = gameState.level;
    }
  }, [gameState.level, gameDataLoaded, toast]);

  // Effect to handle user authentication state changes and initial data load trigger
  useEffect(() => {
    if (authLoading) {
      setGameDataLoaded(false); // Reset flag while auth is in progress
      return;
    }

    let unsubscribe: Unsubscribe | undefined;

    if (!userId) { // User logged out or not yet logged in
      setGameState(INITIAL_GAME_STATE);
      setGameDataLoaded(false); // Data for a specific user is no longer loaded
      // itemDataLoaded, cropData, marketItems are global, so not reset here.
      return;
    }

    // Proceed only if:
    // 1. User is logged in (userId is present)
    // 2. Essential item data is loaded (itemDataLoaded and cropData are ready)
    // 3. Game data for THIS user session hasn't been loaded yet (!gameDataLoaded)
    if (userId && itemDataLoaded && cropData && allSeedIds.length > 0 && allCropIds.length > 0 && !gameDataLoaded) {
      const gameDocRef = doc(db, 'users', userId, 'gameState', 'data');
      unsubscribe = onSnapshot(gameDocRef, (docSnap) => {
        let finalStateToSet: GameState;
        if (docSnap.exists()) {
          const loadedState = docSnap.data() as GameState;

          // Plots validation
          let plots = loadedState.plots || [];
          if (!Array.isArray(plots) || plots.length !== TOTAL_PLOTS) {
            plots = INITIAL_GAME_STATE.plots.map((p, i) => ({ ...p, id: i }));
          } else {
            plots = plots.map((loadedPlotData, index) => {
              const basePlot = INITIAL_GAME_STATE.plots[index] || { id: index, state: 'empty' as PlotState };
              const newPlot: Plot = {
                id: loadedPlotData.id !== undefined ? loadedPlotData.id : basePlot.id,
                state: loadedPlotData.state || basePlot.state,
              };
              if (loadedPlotData.cropId) newPlot.cropId = loadedPlotData.cropId;
              if (loadedPlotData.plantedAt) newPlot.plantedAt = loadedPlotData.plantedAt;
              return newPlot;
            });
          }
          loadedState.plots = plots;

          // Inventory validation (cropData is guaranteed to be available here)
          const validatedInventory: Inventory = {};
          allSeedIds.forEach(id => validatedInventory[id] = 0);
          allCropIds.forEach(id => validatedInventory[id] = 0);
           // Apply defaults from INITIAL_GAME_STATE.inventory first
          for (const key in INITIAL_GAME_STATE.inventory) {
            if (Object.prototype.hasOwnProperty.call(INITIAL_GAME_STATE.inventory, key)) {
                 validatedInventory[key as InventoryItem] = INITIAL_GAME_STATE.inventory[key as InventoryItem];
            }
          }
          // Then overwrite with loaded data for known items
          if (loadedState.inventory && typeof loadedState.inventory === 'object') {
            for (const key in loadedState.inventory) {
              const itemKey = key as InventoryItem;
              if (Object.prototype.hasOwnProperty.call(validatedInventory, itemKey)) {
                validatedInventory[itemKey] = loadedState.inventory[itemKey] || 0;
              }
            }
          }
          loadedState.inventory = validatedInventory;

          // Other fields validation/initialization
          loadedState.gold = typeof loadedState.gold === 'number' ? loadedState.gold : INITIAL_GAME_STATE.gold;
          loadedState.xp = typeof loadedState.xp === 'number' ? loadedState.xp : INITIAL_GAME_STATE.xp;
          loadedState.level = typeof loadedState.level === 'number' ? loadedState.level : INITIAL_GAME_STATE.level;
          loadedState.unlockedPlotsCount = typeof loadedState.unlockedPlotsCount === 'number' && loadedState.unlockedPlotsCount >= INITIAL_UNLOCKED_PLOTS && loadedState.unlockedPlotsCount <= TOTAL_PLOTS
            ? loadedState.unlockedPlotsCount
            : INITIAL_UNLOCKED_PLOTS;
          
          loadedState.email = user?.email || loadedState.email || 'N/A';
          loadedState.lastLogin = Date.now();
          loadedState.status = loadedState.status || 'active';
          loadedState.lastUpdate = Date.now();
          
          finalStateToSet = loadedState;

        } else { // Document doesn't exist, initialize new user state
          const newInitialUserState: GameState = {
            ...INITIAL_GAME_STATE, // Spreads INITIAL_GAME_STATE which has correctly derived inventory
            inventory: { ...INITIAL_GAME_STATE.inventory }, // Ensure deep copy for inventory
            lastUpdate: Date.now(),
            unlockedPlotsCount: INITIAL_UNLOCKED_PLOTS,
            email: user?.email || 'N/A',
            lastLogin: Date.now(),
            status: 'active' as const,
          };
          finalStateToSet = newInitialUserState;
          setDoc(gameDocRef, newInitialUserState).catch(error => {
            console.error("Failed to create initial game state for new user:", error);
            toast({ title: "Lỗi Tạo Dữ Liệu", description: "Không thể tạo dữ liệu ban đầu cho người chơi mới.", variant: "destructive" });
          });
        }
        
        setGameState(finalStateToSet);
        prevLevelRef.current = finalStateToSet.level; // Set for the first successful load/init
        setGameDataLoaded(true); // Mark that data for this user session is now processed

      }, (error) => {
        console.error("Error listening to game state:", error);
        toast({ title: "Lỗi Kết Nối", description: "Không thể đồng bộ dữ liệu trò chơi.", variant: "destructive" });
        // Fallback: set to initial state and mark as loaded to prevent loops/UI hangs
        setGameState(INITIAL_GAME_STATE);
        prevLevelRef.current = INITIAL_GAME_STATE.level;
        setGameDataLoaded(true);
      });

      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [userId, authLoading, itemDataLoaded, cropData, allSeedIds, allCropIds, user, toast, gameDataLoaded]); // gameDataLoaded is a key dependency here to control the one-time setup

  useEffect(() => {
     setIsInitialized(gameDataLoaded && itemDataLoaded && !!userId && !authLoading);
  }, [gameDataLoaded, itemDataLoaded, userId, authLoading]);

  useEffect(() => {
    if (!isInitialized || !userId || !cropData) return;

    const gameLoop = setInterval(() => {
      setGameState(prev => {
        // Ensure prev and its properties are defined before proceeding
        if (!prev || !prev.plots || !cropData) return prev;
        const now = Date.now();
        const updatedPlots = prev.plots.map(plot => {
          if (plot.id >= prev.unlockedPlotsCount) return plot;

          const currentCropDetail = plot.cropId ? cropData[plot.cropId] : null;
          if (!currentCropDetail) return plot; // No crop or invalid cropId for this plot

          if (plot.state === 'planted' && plot.plantedAt) {
            if (now >= plot.plantedAt + currentCropDetail.timeToGrowing) {
              return { ...plot, state: 'growing' as const };
            }
          } else if (plot.state === 'growing' && plot.plantedAt) {
            if (now >= plot.plantedAt + currentCropDetail.timeToReady) { // timeToReady is total time from planting
              return { ...plot, state: 'ready_to_harvest' as const };
            }
          }
          return plot;
        });

        // Only update state if plots actually changed to avoid unnecessary re-renders
        if (JSON.stringify(updatedPlots) !== JSON.stringify(prev.plots)) {
          return { ...prev, plots: updatedPlots, lastUpdate: now };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(gameLoop);
  }, [isInitialized, userId, cropData]); // cropData dependency is important for game loop logic

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
    const earnedXp = cropDetail.harvestYield * 5; // Example XP calculation

    setGameState(prev => {
      const newPlots = prev.plots.map(p => {
        if (p.id === plotId) {
          // Reset plot state correctly, removing crop-specific data
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
  }, [toast, cropData]);

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
      if (prev.gold < totalCost) return prev; // Double check gold before state update
      const newInventory = { ...prev.inventory };
      newInventory[itemId] = (newInventory[itemId] || 0) + quantity;
      return { ...prev, gold: prev.gold - totalCost, inventory: newInventory, lastUpdate: Date.now() };
    });

    toast({ title: "Đã Mua!", description: `Mua ${quantity} x ${marketItemInfo.name}.`, className: "bg-accent text-accent-foreground" });
  }, [toast, marketItems, cropData]);

  const sellItem = useCallback((itemId: InventoryItem, quantity: number, price: number) => {
    if (quantity <= 0) return;
    const currentGameState = gameStateRef.current;
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
      if ((prev.inventory[itemId] || 0) < quantity) return prev; // Double check inventory
      const totalGain = quantity * price;
      const newInventory = { ...prev.inventory };
      newInventory[itemId] -= quantity;
      return { ...prev, gold: prev.gold + totalGain, inventory: newInventory, lastUpdate: Date.now() };
    });
    toast({ title: "Đã Bán!", description: `Bán ${quantity} x ${itemName}.`, className: "bg-primary text-primary-foreground" });
  }, [toast, marketItems]);

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


  return {
    gameState,
    plantCrop,
    harvestCrop,
    buyItem,
    sellItem,
    unlockPlot,
    isInitialized,
    playerTierInfo,
    cropData,
    marketItems,
    allSeedIds,
    allCropIds,
  };
};

    