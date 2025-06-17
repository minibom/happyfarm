
import { useState, useEffect, useCallback, useRef } from 'react';
import type { GameState, Plot, CropId, InventoryItem, SeedId } from '@/types';
import {
  INITIAL_GAME_STATE,
  CROP_DATA,
  LEVEL_UP_XP_THRESHOLD,
  TOTAL_PLOTS,
  MARKET_ITEMS,
} from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { getFarmingAdvice, type FarmingAdviceInput } from '@/ai/flows/ai-farming-advisor';
import { useAuth } from './useAuth';
import { db } from '@/lib/firebase';
import { doc, setDoc, onSnapshot, type Unsubscribe } from 'firebase/firestore';

export const useGameLogic = () => {
  const { userId, loading: authLoading } = useAuth();
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [isInitialized, setIsInitialized] = useState(false);
  const [advisorTip, setAdvisorTip] = useState<string | null>(null);
  const [isAdvisorLoading, setIsAdvisorLoading] = useState(false);
  const { toast } = useToast();

  const prevLevelRef = useRef(gameState.level);
  const gameStateRef = useRef(gameState); 

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const saveGameStateToFirestore = useCallback(() => {
    if (userId && isInitialized) {
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
  }, [userId, isInitialized, toast]);
  
  useEffect(() => {
    if (isInitialized && gameState.level > prevLevelRef.current && prevLevelRef.current !== INITIAL_GAME_STATE.level) {
      toast({ title: "Lên Cấp!", description: `Chúc mừng! Bạn đã đạt cấp ${gameState.level}!`, className: "bg-primary text-primary-foreground" });
    }
    prevLevelRef.current = gameState.level;
  }, [gameState.level, isInitialized, toast]);

  useEffect(() => {
    if (authLoading) return; 

    if (userId) {
      const gameDocRef = doc(db, 'users', userId, 'gameState', 'data');
      const unsubscribe: Unsubscribe = onSnapshot(gameDocRef, (docSnap) => {
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
          if (!isInitialized) prevLevelRef.current = loadedState.level;
        } else {
          const newInitialState = { ...INITIAL_GAME_STATE, lastUpdate: Date.now() };
          setGameState(newInitialState);
          if (!isInitialized) prevLevelRef.current = newInitialState.level;
          setDoc(gameDocRef, newInitialState);
        }
        setIsInitialized(true);
      }, (error) => {
        console.error("Error listening to game state:", error);
        toast({ title: "Lỗi Kết Nối", description: "Không thể đồng bộ dữ liệu trò chơi.", variant: "destructive" });
        if (!isInitialized) {
            setGameState(INITIAL_GAME_STATE);
            prevLevelRef.current = INITIAL_GAME_STATE.level;
            setIsInitialized(true);
        }
      });
      return () => unsubscribe();
    } else if (!authLoading && !userId) {
      setGameState(INITIAL_GAME_STATE);
      setIsInitialized(false); 
    }
  }, [userId, authLoading, toast, isInitialized]);


  useEffect(() => {
    if (isInitialized && userId) {
      saveGameStateToFirestore();
    }
  }, [gameState, isInitialized, userId, saveGameStateToFirestore]);

  useEffect(() => {
    if (!isInitialized || !userId) return;

    const gameLoop = setInterval(() => {
      setGameState(prev => {
        if (!prev.plots) return prev; 
        const now = Date.now();
        const updatedPlots = prev.plots.map(plot => {
          if (plot.state === 'planted' && plot.plantedAt && plot.cropId) {
            const cropDetail = CROP_DATA[plot.cropId];
            if (now >= plot.plantedAt + cropDetail.timeToGrowing) {
              return { ...plot, state: 'growing' as const };
            }
          } else if (plot.state === 'growing' && plot.plantedAt && plot.cropId) {
            const cropDetail = CROP_DATA[plot.cropId];
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
  }, [isInitialized, userId]);

  const plantCrop = useCallback((plotId: number, seedId: SeedId) => {
    const currentGameState = gameStateRef.current;
    const cropId = seedId.replace('Seed', '') as CropId;

    if (!CROP_DATA[cropId]) {
      toast({ title: "Lỗi", description: "Loại hạt giống không hợp lệ.", variant: "destructive" });
      return;
    }
    if (currentGameState.inventory[seedId] <= 0) {
      toast({ title: "Không Đủ Hạt Giống", description: `Bạn không có hạt giống ${CROP_DATA[cropId].name}.`, variant: "destructive" });
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
    toast({ title: "Đã Trồng!", description: `Đã trồng ${CROP_DATA[cropId].name} trên thửa đất ${plotId + 1}.` });
  }, [toast]);

  const harvestCrop = useCallback(async (plotId: number) => {
    const currentGameState = gameStateRef.current;
    const plotToHarvest = currentGameState.plots.find(p => p.id === plotId);

    if (!plotToHarvest || plotToHarvest.state !== 'ready_to_harvest' || !plotToHarvest.cropId) {
      toast({ title: "Chưa Sẵn Sàng", description: "Thửa đất này chưa sẵn sàng để thu hoạch.", variant: "destructive" });
      return;
    }

    const cropDetail = CROP_DATA[plotToHarvest.cropId];
    const earnedXp = cropDetail.harvestYield * 5;

    setGameState(prev => {
      const newPlots = prev.plots.map(p => {
        if (p.id === plotId) {
          const { cropId, plantedAt, ...restOfPlot } = p;
          return { ...restOfPlot, state: 'empty' as const };
        }
        return p;
      });
      
      const newInventory = { ...prev.inventory };
      newInventory[plotToHarvest.cropId!] = (newInventory[plotToHarvest.cropId!] || 0) + cropDetail.harvestYield;
      
      let newXp = prev.xp + earnedXp;
      let newLevel = prev.level;
      const xpThreshold = LEVEL_UP_XP_THRESHOLD(newLevel);
      if (newXp >= xpThreshold) {
        newXp -= xpThreshold;
        newLevel += 1;
      }
      return { ...prev, plots: newPlots, inventory: newInventory, xp: newXp, level: newLevel };
    });

    toast({ title: "Đã Thu Hoạch!", description: `Thu hoạch được ${cropDetail.harvestYield} ${cropDetail.name} và nhận được ${earnedXp} XP.`, className: "bg-accent text-accent-foreground" });
  }, [toast]);

  const buyItem = useCallback((itemId: InventoryItem, quantity: number, price: number) => {
    if (quantity <= 0) return;
    const currentGameState = gameStateRef.current;
    const totalCost = quantity * price;

    if (currentGameState.gold < totalCost) {
      toast({ title: "Không Đủ Vàng", description: "Bạn không có đủ vàng.", variant: "destructive" });
      return;
    }

    setGameState(prev => {
      if (prev.gold < totalCost) return prev; 
      const newInventory = { ...prev.inventory };
      newInventory[itemId] = (newInventory[itemId] || 0) + quantity;
      return { ...prev, gold: prev.gold - totalCost, inventory: newInventory };
    });
    const itemName = MARKET_ITEMS.find(i => i.id === itemId)?.name || itemId;
    toast({ title: "Đã Mua!", description: `Mua ${quantity} x ${itemName}.`, className: "bg-accent text-accent-foreground" });
  }, [toast]);

  const sellItem = useCallback((itemId: InventoryItem, quantity: number, price: number) => {
    if (quantity <= 0) return;
    const currentGameState = gameStateRef.current;
    const itemName = MARKET_ITEMS.find(i => i.id === itemId)?.name || itemId;

    if ((currentGameState.inventory[itemId] || 0) < quantity) {
      toast({ title: "Không Đủ Vật Phẩm", description: `Bạn không có ${quantity} ${itemName}.`, variant: "destructive" });
      return;
    }

    setGameState(prev => {
      if ((prev.inventory[itemId] || 0) < quantity) return prev;
      const totalGain = quantity * price;
      const newInventory = { ...prev.inventory };
      newInventory[itemId] -= quantity;
      return { ...prev, gold: prev.gold + totalGain, inventory: newInventory };
    });
    toast({ title: "Đã Bán!", description: `Bán ${quantity} x ${itemName}.`, className: "bg-primary text-primary-foreground" });
  }, [toast]);

  const fetchAdvisorTip = useCallback(async () => {
    setIsAdvisorLoading(true);
    try {
      const currentGameState = gameStateRef.current;
      const marketPrices: Record<string, number> = {};
      MARKET_ITEMS.forEach(item => marketPrices[item.id] = item.price);

      const plotsForAI = currentGameState.plots.map(p => ({
        state: p.state,
        crop: p.cropId ? CROP_DATA[p.cropId].name : undefined,
      }));

      const adviceInput: FarmingAdviceInput = {
        gold: currentGameState.gold,
        xp: currentGameState.xp,
        level: currentGameState.level,
        plots: plotsForAI,
        inventory: currentGameState.inventory,
        marketPrices,
      };
      const tip = await getFarmingAdvice(adviceInput);
      setAdvisorTip(tip.advice);
    } catch (error) {
      console.error("Failed to get farming advice:", error);
      setAdvisorTip("Hmm, tôi đang gặp chút khó khăn trong việc suy nghĩ. Hãy thử lại sau!");
      toast({ title: "Lỗi Cố Vấn", description: "Không thể lấy lời khuyên.", variant: "destructive" });
    } finally {
      setIsAdvisorLoading(false);
    }
  }, [toast]);
  
  return {
    gameState,
    plantCrop,
    harvestCrop,
    buyItem,
    sellItem,
    isInitialized: isInitialized && !!userId && !authLoading,
    advisorTip,
    fetchAdvisorTip,
    isAdvisorLoading,
  };
};
