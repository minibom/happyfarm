
import { useState, useEffect, useCallback, useRef } from 'react';
import type { GameState, Plot, CropId, InventoryItem, SeedId, GeneratedItem } from '@/types';
import {
  INITIAL_GAME_STATE,
  CROP_DATA,
  LEVEL_UP_XP_THRESHOLD,
  LOCAL_STORAGE_GAME_KEY,
  TOTAL_PLOTS,
  ALL_CROP_IDS,
  ALL_SEED_IDS,
  MARKET_ITEMS,
} from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { getFarmingAdvice, type FarmingAdviceInput } from '@/ai/flows/ai-farming-advisor';
import { generateItemDescription, type ItemDescriptionInput } from '@/ai/flows/ai-generated-item-descriptions';

export const useGameLogic = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [isInitialized, setIsInitialized] = useState(false);
  const [advisorTip, setAdvisorTip] = useState<string | null>(null);
  const [isAdvisorLoading, setIsAdvisorLoading] = useState(false);
  const [newItemDescription, setNewItemDescription] = useState<GeneratedItem | null>(null);
  const [isDescriptionLoading, setIsDescriptionLoading] = useState(false);
  const { toast } = useToast();

  const prevLevelRef = useRef(gameState.level);

  // Effect for Level Up Toast
  useEffect(() => {
    if (isInitialized && gameState.level > prevLevelRef.current) {
      toast({ title: "Level Up!", description: `Congratulations! You've reached level ${gameState.level}!`, className: "bg-primary text-primary-foreground" });
    }
    prevLevelRef.current = gameState.level;
  }, [gameState.level, isInitialized, toast]);

  // Load game state from local storage
  useEffect(() => {
    const savedGame = localStorage.getItem(LOCAL_STORAGE_GAME_KEY);
    if (savedGame) {
      try {
        const parsedState: GameState = JSON.parse(savedGame);
        if (parsedState.plots.length !== TOTAL_PLOTS) {
          parsedState.plots = INITIAL_GAME_STATE.plots;
        } else {
          parsedState.plots = parsedState.plots.map((plot, index) => ({
            ...plot,
            id: plot.id !== undefined ? plot.id : index,
          }));
        }

        const validatedInventory = { ...INITIAL_GAME_STATE.inventory };
        for (const key in parsedState.inventory) {
          if (Object.prototype.hasOwnProperty.call(validatedInventory, key)) {
            validatedInventory[key as InventoryItem] = parsedState.inventory[key as InventoryItem] || 0;
          }
        }
        parsedState.inventory = validatedInventory;
        
        setGameState(parsedState);
        prevLevelRef.current = parsedState.level; // Initialize prevLevelRef with loaded level
      } catch (error) {
        console.error("Failed to parse saved game state:", error);
        setGameState(INITIAL_GAME_STATE);
        prevLevelRef.current = INITIAL_GAME_STATE.level;
      }
    } else {
      setGameState(INITIAL_GAME_STATE);
      prevLevelRef.current = INITIAL_GAME_STATE.level;
    }
    setIsInitialized(true);
  }, []);

  // Save game state to local storage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(LOCAL_STORAGE_GAME_KEY, JSON.stringify({ ...gameState, lastUpdate: Date.now() }));
    }
  }, [gameState, isInitialized]);

  // Game loop for plot updates
  useEffect(() => {
    if (!isInitialized) return;

    const gameLoop = setInterval(() => {
      setGameState(prev => {
        const now = Date.now();
        const updatedPlots = prev.plots.map(plot => {
          if (plot.state === 'planted' && plot.plantedAt && plot.cropId) {
            const cropDetail = CROP_DATA[plot.cropId];
            if (now - plot.plantedAt >= cropDetail.timeToGrowing) {
              return { ...plot, state: 'growing' as const };
            }
          } else if (plot.state === 'growing' && plot.plantedAt && plot.cropId) {
            const cropDetail = CROP_DATA[plot.cropId];
            if (now - plot.plantedAt >= cropDetail.timeToReady) {
              return { ...plot, state: 'ready_to_harvest' as const };
            }
          }
          return plot;
        });
        return { ...prev, plots: updatedPlots, lastUpdate: now };
      });
    }, 1000);

    return () => clearInterval(gameLoop);
  }, [isInitialized]);

  const plantCrop = useCallback((plotId: number, seedId: SeedId) => {
    const cropId = seedId.replace('Seed', '') as CropId;
    if (!CROP_DATA[cropId]) {
      toast({ title: "Error", description: "Invalid seed type.", variant: "destructive" });
      return;
    }

    if (gameState.inventory[seedId] <= 0) {
      toast({ title: "No Seeds", description: `You don't have any ${CROP_DATA[cropId].name} seeds. Buy some from the market.`, variant: "destructive" });
      return;
    }
    
    const currentPlot = gameState.plots[plotId];
    if (currentPlot.state !== 'empty') {
      toast({ title: "Plot Occupied", description: "This plot is not empty.", variant: "destructive" });
      return;
    }

    setGameState(prev => {
      const plotToUpdate = prev.plots[plotId]; // Use plot from prev state for update
      const newPlots = [...prev.plots];
      newPlots[plotId] = { ...plotToUpdate, state: 'planted', cropId, plantedAt: Date.now() };
      const newInventory = { ...prev.inventory, [seedId]: prev.inventory[seedId] - 1 };
      return { ...prev, plots: newPlots, inventory: newInventory };
    });
    
    toast({ title: "Planted!", description: `${CROP_DATA[cropId].name} planted on plot ${plotId + 1}.` });
  }, [gameState.inventory, gameState.plots, toast]);

  const harvestCrop = useCallback(async (plotId: number) => {
    const currentPlot = gameState.plots[plotId];
    if (currentPlot.state !== 'ready_to_harvest' || !currentPlot.cropId) {
      toast({ title: "Not Ready", description: "This plot is not ready for harvest.", variant: "destructive" });
      return;
    }

    const cropDetail = CROP_DATA[currentPlot.cropId];
    const earnedXp = cropDetail.harvestYield * 5;

    setGameState(prev => {
      const plotToUpdate = prev.plots[plotId];
      const newPlots = [...prev.plots];
      newPlots[plotId] = { ...plotToUpdate, state: 'empty', cropId: undefined, plantedAt: undefined };
      
      const newInventory = { ...prev.inventory };
      newInventory[plotToUpdate.cropId!] = (newInventory[plotToUpdate.cropId!] || 0) + cropDetail.harvestYield;
      
      let newXp = prev.xp + earnedXp;
      let newLevel = prev.level;
      if (newXp >= LEVEL_UP_XP_THRESHOLD(newLevel)) {
        newXp -= LEVEL_UP_XP_THRESHOLD(newLevel);
        newLevel += 1;
      }
      return { ...prev, plots: newPlots, inventory: newInventory, xp: newXp, level: newLevel };
    });

    toast({ title: "Harvested!", description: `Harvested ${cropDetail.harvestYield} ${cropDetail.name}(s) and earned ${earnedXp} XP.`, className: "bg-accent text-accent-foreground" });

    setIsDescriptionLoading(true);
    try {
      const itemInput: ItemDescriptionInput = { cropType: cropDetail.name, harvestQuality: 'perfect' };
      const desc = await generateItemDescription(itemInput);
      setNewItemDescription({ name: desc.itemName, description: desc.itemDescription, cropId: currentPlot.cropId });
    } catch (error) {
      console.error("Failed to generate item description:", error);
    } finally {
      setIsDescriptionLoading(false);
    }
  }, [gameState.plots, toast]);

  const buyItem = useCallback((itemId: InventoryItem, quantity: number, price: number) => {
    if (quantity <= 0) return;
    const totalCost = quantity * price;

    if (gameState.gold < totalCost) {
      toast({ title: "Not Enough Gold", description: "You don't have enough gold to buy this.", variant: "destructive" });
      return;
    }

    setGameState(prev => {
      if (prev.gold < totalCost) return prev; // Double check with prev state for atomicity
      const newInventory = { ...prev.inventory };
      newInventory[itemId] = (newInventory[itemId] || 0) + quantity;
      return { ...prev, gold: prev.gold - totalCost, inventory: newInventory };
    });

    toast({ title: "Purchased!", description: `Bought ${quantity} x ${MARKET_ITEMS.find(i => i.id === itemId)?.name || itemId}.`, className: "bg-accent text-accent-foreground" });
  }, [gameState.gold, toast]);

  const sellItem = useCallback((itemId: InventoryItem, quantity: number, price: number) => {
    if (quantity <= 0) return;

    if ((gameState.inventory[itemId] || 0) < quantity) {
      toast({ title: "Not Enough Items", description: `You don't have ${quantity} ${MARKET_ITEMS.find(i => i.id === itemId)?.name || itemId} to sell.`, variant: "destructive" });
      return;
    }

    setGameState(prev => {
      if ((prev.inventory[itemId] || 0) < quantity) return prev; // Double check
      const totalGain = quantity * price;
      const newInventory = { ...prev.inventory };
      newInventory[itemId] -= quantity;
      return { ...prev, gold: prev.gold + totalGain, inventory: newInventory };
    });

    toast({ title: "Sold!", description: `Sold ${quantity} x ${MARKET_ITEMS.find(i => i.id === itemId)?.name || itemId}.`, className: "bg-primary text-primary-foreground" });
  }, [gameState.inventory, toast]);

  const fetchAdvisorTip = useCallback(async () => {
    setIsAdvisorLoading(true);
    try {
      const marketPrices: Record<string, number> = {};
      MARKET_ITEMS.forEach(item => marketPrices[item.id] = item.price);

      const plotsForAI = gameState.plots.map(p => ({
        state: p.state,
        crop: p.cropId ? CROP_DATA[p.cropId].name : undefined,
      }));

      const adviceInput: FarmingAdviceInput = {
        gold: gameState.gold,
        xp: gameState.xp,
        level: gameState.level,
        plots: plotsForAI,
        inventory: gameState.inventory,
        marketPrices,
      };
      const tip = await getFarmingAdvice(adviceInput);
      setAdvisorTip(tip.advice);
    } catch (error) {
      console.error("Failed to get farming advice:", error);
      setAdvisorTip("Hmm, I'm having trouble thinking right now. Try again later!");
      toast({ title: "Advisor Error", description: "Could not fetch advice.", variant: "destructive" });
    } finally {
      setIsAdvisorLoading(false);
    }
  }, [gameState, toast]);
  
  const resetGame = useCallback(() => {
    if (window.confirm("Are you sure you want to reset the game? All progress will be lost.")) {
      localStorage.removeItem(LOCAL_STORAGE_GAME_KEY);
      setGameState(INITIAL_GAME_STATE);
      prevLevelRef.current = INITIAL_GAME_STATE.level; // Reset ref
      setIsInitialized(false);
      setTimeout(() => setIsInitialized(true),0);
      toast({ title: "Game Reset", description: "Your farm has been reset to its initial state."});
    }
  }, [toast]);


  return {
    gameState,
    plantCrop,
    harvestCrop,
    buyItem,
    sellItem,
    isInitialized,
    advisorTip,
    fetchAdvisorTip,
    isAdvisorLoading,
    newItemDescription,
    isDescriptionLoading,
    clearNewItemDescription: () => setNewItemDescription(null),
    resetGame,
  };
};

    