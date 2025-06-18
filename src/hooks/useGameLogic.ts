
import { useState, useEffect, useCallback, useRef } from 'react';
import type { GameState, Plot, CropId, InventoryItem, SeedId, CropDetails, TierInfo, PlotState, MarketState, MarketActivityLog, FertilizerId, FertilizerDetails } from '@/types';
import {
  INITIAL_GAME_STATE,
  LEVEL_UP_XP_THRESHOLD,
  TOTAL_PLOTS,
  CROP_DATA as FALLBACK_CROP_DATA,
  FERTILIZER_DATA as FALLBACK_FERTILIZER_DATA,
  ALL_FERTILIZER_IDS,
  getPlayerTierInfo,
  getPlotUnlockCost,
  INITIAL_UNLOCKED_PLOTS,
  INITIAL_MARKET_STATE,
  ALL_CROP_IDS,
  ALL_SEED_IDS
} from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './useAuth';
import { db } from '@/lib/firebase';
import { doc, setDoc, onSnapshot, type Unsubscribe, collection, getDocs, serverTimestamp, addDoc } from 'firebase/firestore';

export const useGameLogic = () => {
  const { user, userId, loading: authLoading } = useAuth();
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [isInitialized, setIsInitialized] = useState(false);
  const [itemDataLoaded, setItemDataLoaded] = useState(false);
  const [fertilizerDataLoaded, setFertilizerDataLoaded] = useState(false);
  const [gameDataLoaded, setGameDataLoaded] = useState(false);
  const [marketState, setMarketState] = useState<MarketState>(INITIAL_MARKET_STATE);

  const { toast } = useToast();

  const [cropData, setCropData] = useState<Record<CropId, CropDetails> | null>(null);
  const [fertilizerData, setFertilizerData] = useState<Record<FertilizerId, FertilizerDetails> | null>(null);
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
            console.warn("No items found in Firestore 'gameItems' collection. Using fallback data from constants.ts for crops.");
            setCropData(FALLBACK_CROP_DATA);
        } else {
            setCropData(fetchedItems);
        }
        setItemDataLoaded(true);
      } catch (error) {
        console.error("Failed to fetch crop data from Firestore:", error);
        toast({ title: "Lỗi Tải Vật Phẩm Cây Trồng", description: "Không thể tải dữ liệu cây trồng từ server. Sử dụng dữ liệu tạm.", variant: "destructive" });
        setCropData(FALLBACK_CROP_DATA);
        setItemDataLoaded(true);
      }
    };
    fetchItemData();
  }, [toast]);

  useEffect(() => {
    setFertilizerData(FALLBACK_FERTILIZER_DATA); 
    setFertilizerDataLoaded(true);
  }, []);


  useEffect(() => {
    const marketDocRef = doc(db, 'marketState', 'global');
    const unsubscribeMarket = onSnapshot(marketDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setMarketState(docSnap.data() as MarketState);
      } else {
        console.warn("'/marketState/global' document does not exist. Using initial market state from constants.");
        setMarketState(INITIAL_MARKET_STATE);
      }
    }, (error) => {
      console.error("Error fetching dynamic market state:", error);
      toast({ title: "Lỗi Chợ Động", description: "Không thể tải dữ liệu chợ động. Sử dụng giá cố định.", variant: "destructive" });
      setMarketState(INITIAL_MARKET_STATE);
    });
    return () => unsubscribeMarket();
  }, [toast]);


  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const saveGameStateToFirestore = useCallback(() => {
    if (userId && gameDataLoaded && itemDataLoaded && fertilizerDataLoaded) {
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
  }, [userId, gameDataLoaded, itemDataLoaded, fertilizerDataLoaded, toast]);


  useEffect(() => {
    if (gameDataLoaded && itemDataLoaded && fertilizerDataLoaded && userId) {
      saveGameStateToFirestore();
    }
  }, [gameState, gameDataLoaded, itemDataLoaded, fertilizerDataLoaded, userId, saveGameStateToFirestore]);


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

    if (userId && itemDataLoaded && fertilizerDataLoaded && cropData && fertilizerData) {
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

          const validatedInventory: GameState['inventory'] = {};
          ALL_SEED_IDS.forEach(id => validatedInventory[id] = INITIAL_GAME_STATE.inventory[id] || 0);
          ALL_CROP_IDS.forEach(id => validatedInventory[id] = INITIAL_GAME_STATE.inventory[id] || 0);
          ALL_FERTILIZER_IDS.forEach(id => validatedInventory[id] = INITIAL_GAME_STATE.inventory[id] || 0); 

          if (firestoreData.inventory && typeof firestoreData.inventory === 'object') {
            for (const key in firestoreData.inventory) {
              const itemKey = key as InventoryItem;
              if (ALL_SEED_IDS.includes(itemKey as SeedId) || ALL_CROP_IDS.includes(itemKey as CropId) || ALL_FERTILIZER_IDS.includes(itemKey as FertilizerId)) {
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
          const newInitialUserState: GameState = {
            ...INITIAL_GAME_STATE,
            inventory: { ...INITIAL_GAME_STATE.inventory },
            plots: INITIAL_GAME_STATE.plots.map(p => ({ ...p })),
            email: user?.email || undefined,
            displayName: user?.displayName || undefined,
            lastLogin: Date.now(),
            lastUpdate: Date.now(),
            unlockedPlotsCount: INITIAL_UNLOCKED_PLOTS,
            status: 'active' as const,
          };
          finalStateToSet = newInitialUserState;
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
  }, [userId, authLoading, itemDataLoaded, fertilizerDataLoaded, cropData, fertilizerData, user, toast]);

  useEffect(() => {
     setIsInitialized(gameDataLoaded && itemDataLoaded && fertilizerDataLoaded && !!userId && !authLoading && !!cropData && !!fertilizerData);
  }, [gameDataLoaded, itemDataLoaded, fertilizerDataLoaded, userId, authLoading, cropData, fertilizerData]);

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

  const logMarketActivity = async (logData: Omit<MarketActivityLog, 'timestamp' | 'logId' | 'userId'>) => {
    if (!userId) return;
    // In a real app, this would write to Firestore:
    // await addDoc(collection(db, 'marketActivityLogs'), {
    //   ...logData,
    //   userId,
    //   timestamp: serverTimestamp(),
    // });
    console.log("Market Activity (simulated log):", { ...logData, userId, timestamp: Date.now() });
  };

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
    const baseXp = cropDetail.harvestYield * 5;
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
      while (newXp >= xpThreshold) {
        newXp -= xpThreshold;
        newLevel += 1;
        xpThreshold = LEVEL_UP_XP_THRESHOLD(newLevel);
      }
      return { ...prev, plots: newPlots, inventory: newInventory, xp: newXp, level: newLevel, lastUpdate: Date.now() };
    });

    toast({ title: "Đã Thu Hoạch!", description: `Thu hoạch được ${cropDetail.harvestYield} ${cropDetail.name} và nhận được ${earnedXp} XP.`, className: "bg-accent text-accent-foreground" });
  }, [toast, cropData]);

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
    } else if (cropData) {
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
      if (prev.gold < totalCost) return prev; // Double check gold
      const newInventory = { ...prev.inventory };
      newInventory[itemId] = (newInventory[itemId] || 0) + quantity;
      return { ...prev, gold: prev.gold - totalCost, inventory: newInventory, lastUpdate: Date.now() };
    });

    logMarketActivity({ itemId, quantity, pricePerUnit: priceAtTransaction, totalPrice: totalCost, type: 'buy' });
    toast({ title: "Đã Mua!", description: `Mua ${quantity} x ${itemName}.`, className: "bg-accent text-accent-foreground" });
  }, [toast, cropData, fertilizerData, logMarketActivity]);

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
        toast({ title: "Lỗi", description: "Không tìm thấy thông tin vật phẩm.", variant: "destructive" });
        return;
    }
    const itemName = itemDetails.name;

    if ((currentGameState.inventory[itemId] || 0) < quantity) {
      toast({ title: "Không Đủ Vật Phẩm", description: `Bạn không có ${quantity} ${itemName}.`, variant: "destructive" });
      return;
    }

    setGameState(prev => {
      if ((prev.inventory[itemId] || 0) < quantity) return prev;
      const baseGain = quantity * priceAtTransaction;
      const totalGain = Math.floor(baseGain * (1 + currentTierInfoValue.sellPriceBoostPercent));
      const newInventory = { ...prev.inventory };
      newInventory[itemId] -= quantity;
      return { ...prev, gold: prev.gold + totalGain, inventory: newInventory, lastUpdate: Date.now() };
    });

    logMarketActivity({ itemId, quantity, pricePerUnit: priceAtTransaction, totalPrice: quantity * priceAtTransaction * (1 + currentTierInfoValue.sellPriceBoostPercent), type: 'sell'});
    toast({ title: "Đã Bán!", description: `Bán ${quantity} x ${itemName}.`, className: "bg-primary text-primary-foreground" });
  }, [toast, cropData, logMarketActivity]);

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
      toast({ title: "Bậc Chưa Đủ", description: `Cần Bậc ${getPlayerTierInfo( (fertilizerDetail.unlockTier-1) * 10 +1 ).tierName} (Bậc ${fertilizerDetail.unlockTier}) để dùng ${fertilizerDetail.name}.`, variant: "destructive" });
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
    
    // Calculate total original growth time for the crop on this plot
    const baseTimeToGrowing = cropDetail.timeToGrowing;
    const baseTimeToReady = cropDetail.timeToReady;

    // Calculate effective growth time considering tier bonus
    const effectiveTimeToGrowing = baseTimeToGrowing * (1 - tierGrowthReduction);
    const effectiveTimeToReady = baseTimeToReady * (1 - tierGrowthReduction);

    // Determine total time required based on current plot state
    let totalTimeRequiredForCurrentStage;
    if (plot.state === 'planted') {
        totalTimeRequiredForCurrentStage = effectiveTimeToGrowing;
    } else { // growing
        totalTimeRequiredForCurrentStage = effectiveTimeToReady; // This is total time from planting to harvest ready
    }
    
    const elapsedTime = Date.now() - plot.plantedAt;
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
          return { ...p, plantedAt: p.plantedAt + timeReductionAmount }; 
        }
        return p;
      });
      const newInventory = { ...prev.inventory, [fertilizerId]: (prev.inventory[fertilizerId] || 0) - 1 };
      return { ...prev, plots: newPlots, inventory: newInventory, lastUpdate: Date.now() };
    });

    toast({ title: "Đã Bón Phân!", description: `${fertilizerDetail.name} đã được sử dụng, giảm thời gian chờ!`, className: "bg-accent text-accent-foreground" });

  }, [toast, cropData, fertilizerData]);


  return {
    gameState,
    plantCrop,
    harvestCrop,
    buyItem,
    sellItem,
    unlockPlot,
    updateDisplayName,
    applyFertilizer, 
    isInitialized,
    playerTierInfo,
    cropData,
    fertilizerData, 
  };
};
