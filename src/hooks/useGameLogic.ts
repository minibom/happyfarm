
import { useState, useEffect, useCallback, useRef } from 'react';
import type { GameState, Plot, CropId, InventoryItem, SeedId, CropDetails, MarketItem, TierInfo } from '@/types';
import {
  INITIAL_GAME_STATE,
  LEVEL_UP_XP_THRESHOLD,
  TOTAL_PLOTS,
  CROP_DATA as FALLBACK_CROP_DATA, 
  getPlayerTierInfo, // Import tier helper
} from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
// import { getFarmingAdvice, type FarmingAdviceInput } from '@/ai/flows/ai-farming-advisor'; // Advisor temporarily commented
import { useAuth } from './useAuth';
import { db } from '@/lib/firebase';
import { doc, setDoc, onSnapshot, type Unsubscribe, collection, getDocs } from 'firebase/firestore';

export const useGameLogic = () => {
  const { userId, loading: authLoading } = useAuth();
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [isInitialized, setIsInitialized] = useState(false); 
  const [gameDataLoaded, setGameDataLoaded] = useState(false); 
  const [itemDataLoaded, setItemDataLoaded] = useState(false); 

  // const [advisorTip, setAdvisorTip] = useState<string | null>(null); // Advisor temporarily commented
  // const [isAdvisorLoading, setIsAdvisorLoading] = useState(false); // Advisor temporarily commented
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
    setPlayerTierInfo(getPlayerTierInfo(gameState.level)); // Update tier info when game state (level) changes
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
      // Ensure seedName is correctly typed as SeedId
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
          unlockTier: cropData[id].unlockTier, // Crops are generally sellable regardless of tier, but good to have
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
    if (gameDataLoaded && gameState.level > prevLevelRef.current && prevLevelRef.current !== INITIAL_GAME_STATE.level) {
      const oldTierInfo = getPlayerTierInfo(prevLevelRef.current);
      const newTierInfo = getPlayerTierInfo(gameState.level);
      toast({ title: "Lên Cấp!", description: `Chúc mừng! Bạn đã đạt cấp ${gameState.level}!`, className: "bg-primary text-primary-foreground" });
      if (newTierInfo.tier > oldTierInfo.tier) {
        toast({ title: "Thăng Hạng!", description: `Chúc mừng! Bạn đã đạt được Bậc ${newTierInfo.tierName}! Các vật phẩm mới có thể đã được mở khóa.`, className: "bg-accent text-accent-foreground", duration: 7000 });
      }
    }
    prevLevelRef.current = gameState.level;
  }, [gameState.level, gameDataLoaded, toast]);

  useEffect(() => {
    if (authLoading) return;

    let unsubscribe: Unsubscribe | undefined;

    if (userId) {
      const gameDocRef = doc(db, 'users', userId, 'gameState', 'data');
      unsubscribe = onSnapshot(gameDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const loadedState = docSnap.data() as GameState;

          let plots = loadedState.plots || [];
          if (!Array.isArray(plots) || plots.length !== TOTAL_PLOTS) {
            plots = INITIAL_GAME_STATE.plots.map((p, i) => ({ ...p, id: i }));
          } else {
            plots = plots.map((loadedPlotData, index) => {
              const basePlot = INITIAL_GAME_STATE.plots[index] || { id: index, state: 'empty' };
              const newPlot: Plot = {
                id: loadedPlotData.id !== undefined ? loadedPlotData.id : basePlot.id,
                state: loadedPlotData.state || basePlot.state,
              };
              if (loadedPlotData.cropId) {
                newPlot.cropId = loadedPlotData.cropId;
              }
              if (loadedPlotData.plantedAt) {
                newPlot.plantedAt = loadedPlotData.plantedAt;
              }
              return newPlot;
            });
          }
          loadedState.plots = plots;

          const validatedInventory = { ...INITIAL_GAME_STATE.inventory };
          if (cropData) {
            allSeedIds.forEach(id => validatedInventory[id] = validatedInventory[id] || 0);
            allCropIds.forEach(id => validatedInventory[id] = validatedInventory[id] || 0);
          }

          if (loadedState.inventory && typeof loadedState.inventory === 'object') {
            for (const key in loadedState.inventory) {
              if (Object.prototype.hasOwnProperty.call(validatedInventory, key)) {
                validatedInventory[key as InventoryItem] = loadedState.inventory[key as InventoryItem] || 0;
              }
            }
          }
          loadedState.inventory = validatedInventory;

          loadedState.gold = typeof loadedState.gold === 'number' ? loadedState.gold : INITIAL_GAME_STATE.gold;
          loadedState.xp = typeof loadedState.xp === 'number' ? loadedState.xp : INITIAL_GAME_STATE.xp;
          loadedState.level = typeof loadedState.level === 'number' ? loadedState.level : INITIAL_GAME_STATE.level;
          loadedState.lastUpdate = typeof loadedState.lastUpdate === 'number' ? loadedState.lastUpdate : Date.now();

          setGameState(loadedState);
          if (!gameDataLoaded) prevLevelRef.current = loadedState.level;
        } else {
          const newInitialState = { ...INITIAL_GAME_STATE, lastUpdate: Date.now() };
            if (cropData) { 
                allSeedIds.forEach(id => newInitialState.inventory[id] = newInitialState.inventory[id] || 0);
                allCropIds.forEach(id => newInitialState.inventory[id] = newInitialState.inventory[id] || 0);
            }
          setGameState(newInitialState);

          if (!gameDataLoaded) prevLevelRef.current = newInitialState.level;
          setDoc(gameDocRef, newInitialState); 
        }
        setGameDataLoaded(true);
      }, (error) => {
        console.error("Error listening to game state:", error);
        toast({ title: "Lỗi Kết Nối", description: "Không thể đồng bộ dữ liệu trò chơi.", variant: "destructive" });
        if (!gameDataLoaded) {
          setGameState(INITIAL_GAME_STATE);
          prevLevelRef.current = INITIAL_GAME_STATE.level;
          setGameDataLoaded(true);
        }
      });
    } else if (!authLoading && !userId) {
      setGameState(INITIAL_GAME_STATE);
      setGameDataLoaded(false);
      setItemDataLoaded(false); 
      setCropData(null);
      setMarketItems(null);
    }
    return () => {
        if (unsubscribe) unsubscribe();
    };
  }, [userId, authLoading, toast, cropData, allSeedIds, allCropIds, gameDataLoaded]);


  useEffect(() => {
    if (gameDataLoaded && itemDataLoaded && userId) {
      saveGameStateToFirestore();
    }
  }, [gameState, gameDataLoaded, itemDataLoaded, userId, saveGameStateToFirestore]);
  
  useEffect(() => {
     setIsInitialized(gameDataLoaded && itemDataLoaded && !!userId && !authLoading);
  }, [gameDataLoaded, itemDataLoaded, userId, authLoading]);


  useEffect(() => {
    if (!isInitialized || !userId || !cropData) return;

    const gameLoop = setInterval(() => {
      setGameState(prev => {
        if (!prev.plots) return prev;
        const now = Date.now();
        const updatedPlots = prev.plots.map(plot => {
          if (plot.state === 'planted' && plot.plantedAt && plot.cropId && cropData[plot.cropId]) {
            const cropDetail = cropData[plot.cropId];
            if (now >= plot.plantedAt + cropDetail.timeToGrowing) {
              return { ...plot, state: 'growing' as const };
            }
          } else if (plot.state === 'growing' && plot.plantedAt && plot.cropId && cropData[plot.cropId]) {
            const cropDetail = cropData[plot.cropId];
            if (now >= plot.plantedAt + cropDetail.timeToReady) {
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
  }, [isInitialized, userId, cropData]);

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
      return { ...prev, plots: newPlots, inventory: newInventory };
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

    if (!plotToHarvest || plotToHarvest.state !== 'ready_to_harvest' || !plotToHarvest.cropId || !cropData[plotToHarvest.cropId]) {
      toast({ title: "Chưa Sẵn Sàng", description: "Thửa đất này chưa sẵn sàng để thu hoạch hoặc dữ liệu không hợp lệ.", variant: "destructive" });
      return;
    }

    const cropDetail = cropData[plotToHarvest.cropId];
    const earnedXp = cropDetail.harvestYield * 5; // XP per yield unit

    setGameState(prev => {
      const newPlots = prev.plots.map(p => {
        if (p.id === plotId) {
          const { cropId: oldCropId, plantedAt, ...restOfPlot } = p; 
          return { ...restOfPlot, state: 'empty' as const };
        }
        return p;
      });

      const newInventory = { ...prev.inventory };
      newInventory[plotToHarvest.cropId!] = (newInventory[plotToHarvest.cropId!] || 0) + cropDetail.harvestYield;

      let newXp = prev.xp + earnedXp;
      let newLevel = prev.level;
      
      // Level up logic
      let xpThreshold = LEVEL_UP_XP_THRESHOLD(newLevel);
      while (newXp >= xpThreshold) {
        newXp -= xpThreshold;
        newLevel += 1;
        xpThreshold = LEVEL_UP_XP_THRESHOLD(newLevel);
      }
      return { ...prev, plots: newPlots, inventory: newInventory, xp: newXp, level: newLevel };
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
      if (prev.gold < totalCost) return prev; // Double check
      const newInventory = { ...prev.inventory };
      newInventory[itemId] = (newInventory[itemId] || 0) + quantity;
      return { ...prev, gold: prev.gold - totalCost, inventory: newInventory };
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
      if ((prev.inventory[itemId] || 0) < quantity) return prev; // Double check
      const totalGain = quantity * price;
      const newInventory = { ...prev.inventory };
      newInventory[itemId] -= quantity;
      return { ...prev, gold: prev.gold + totalGain, inventory: newInventory };
    });
    toast({ title: "Đã Bán!", description: `Bán ${quantity} x ${itemName}.`, className: "bg-primary text-primary-foreground" });
  }, [toast, marketItems]);

  // Advisor temporarily commented out
  // const fetchAdvisorTip = useCallback(async () => {
  //   setIsAdvisorLoading(true);
  //   try {
  //     const currentGameState = gameStateRef.current;
  //      if (!cropData || !marketItems) {
  //       setAdvisorTip("Dữ liệu trò chơi chưa sẵn sàng cho lời khuyên.");
  //       setIsAdvisorLoading(false);
  //       return;
  //     }

  //     const currentMarketPrices: Record<string, number> = {};
  //     marketItems.forEach(item => currentMarketPrices[item.id] = item.price);

  //     const plotsForAI = currentGameState.plots.map(p => ({
  //       state: p.state,
  //       crop: p.cropId ? cropData[p.cropId]?.name : undefined,
  //     }));

  //     const adviceInput: FarmingAdviceInput = {
  //       gold: currentGameState.gold,
  //       xp: currentGameState.xp,
  //       level: currentGameState.level,
  //       plots: plotsForAI,
  //       inventory: currentGameState.inventory,
  //       marketPrices: currentMarketPrices,
  //     };
  //     const tip = await getFarmingAdvice(adviceInput);
  //     setAdvisorTip(tip.advice);
  //   } catch (error) {
  //     console.error("Failed to get farming advice:", error);
  //     setAdvisorTip("Hmm, tôi đang gặp chút khó khăn trong việc suy nghĩ. Hãy thử lại sau!");
  //     toast({ title: "Lỗi Cố Vấn", description: "Không thể lấy lời khuyên.", variant: "destructive" });
  //   } finally {
  //     setIsAdvisorLoading(false);
  //   }
  // }, [toast, cropData, marketItems]);

  return {
    gameState,
    plantCrop,
    harvestCrop,
    buyItem,
    sellItem,
    isInitialized, 
    playerTierInfo, // Expose player tier info
    // advisorTip, // Advisor temporarily commented
    // fetchAdvisorTip, // Advisor temporarily commented
    // isAdvisorLoading, // Advisor temporarily commented
    cropData,
    marketItems,
    allSeedIds,
    allCropIds,
  };
};
