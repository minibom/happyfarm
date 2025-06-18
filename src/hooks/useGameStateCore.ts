
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { GameState, TierInfo, Plot, PlotState, CropId, SeedId, FertilizerId, InventoryItem, MailMessage, RewardItem } from '@/types';
import {
  INITIAL_GAME_STATE,
  LEVEL_UP_XP_THRESHOLD,
  TOTAL_PLOTS,
  getPlayerTierInfo,
  INITIAL_UNLOCKED_PLOTS,
  ALL_SEED_IDS,
  ALL_CROP_IDS,
  ALL_FERTILIZER_IDS,
  TIER_DATA, 
} from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './useAuth';
import { db } from '@/lib/firebase';
import { doc, setDoc, onSnapshot, type Unsubscribe, Timestamp } from 'firebase/firestore';
import type { CropDetails } from '@/types';

interface UseGameStateCoreProps {
  cropData: Record<CropId, CropDetails> | null;
  itemDataLoaded: boolean;
  fertilizerDataLoaded: boolean;
}

export const useGameStateCore = ({ cropData, itemDataLoaded, fertilizerDataLoaded }: UseGameStateCoreProps) => {
  const { user, userId, loading: authLoading } = useAuth();
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [gameDataLoaded, setGameDataLoaded] = useState(false);
  const [playerTierInfo, setPlayerTierInfo] = useState<TierInfo>(getPlayerTierInfo(INITIAL_GAME_STATE.level));
  const { toast } = useToast();

  const prevLevelRef = useRef(gameState.level);
  const gameStateRef = useRef(gameState);

  useEffect(() => {
    gameStateRef.current = gameState;
    setPlayerTierInfo(getPlayerTierInfo(gameState.level));
  }, [gameState]);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const saveGameStateToFirestore = useCallback(() => {
    if (userId && gameDataLoaded && itemDataLoaded && fertilizerDataLoaded) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          const gameDocRef = doc(db, 'users', userId, 'gameState', 'data');
          // Ensure only properties defined in GameState type are saved
          const { ...stateToSaveRest } = gameStateRef.current;
          const finalStateToSave: GameState = {
            ...stateToSaveRest
          };

          // Ensure fields that might be undefined are handled or omitted if necessary
          if (finalStateToSave.email === undefined) delete (finalStateToSave as any).email;
          if (finalStateToSave.displayName === undefined) delete (finalStateToSave as any).displayName;
          
          await setDoc(gameDocRef, JSON.parse(JSON.stringify(finalStateToSave, (key, value) => {
             return value === undefined ? null : value; // Convert undefined to null for Firestore
          })));
        } catch (error) {
          console.error("Failed to save game state:", error);
          toast({ title: "Lỗi Lưu Trữ", description: "Không thể lưu tiến trình trò chơi của bạn.", variant: "destructive" });
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
    
    if (userId && itemDataLoaded && fertilizerDataLoaded) {
      const gameDocRef = doc(db, 'users', userId, 'gameState', 'data');
      unsubscribe = onSnapshot(gameDocRef, (docSnap) => {
        let finalStateToSet: GameState;
        if (docSnap.exists()) {
          const firestoreData = docSnap.data() as Partial<GameState>; // Use Partial to handle potentially missing fields
          let loadedState: GameState = { 
            ...INITIAL_GAME_STATE, // Start with defaults
            ...firestoreData, // Override with Firestore data
          };

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
            : INITIAL_GAME_STATE.plots.map((p,i) => ({ ...p, id: i}));
          loadedState.plots = plots;
          
          const validatedInventory: GameState['inventory'] = {};
          ALL_SEED_IDS.forEach(id => validatedInventory[id] = INITIAL_GAME_STATE.inventory[id] || 0);
          ALL_CROP_IDS.forEach(id => validatedInventory[id] = INITIAL_GAME_STATE.inventory[id] || 0);
          ALL_FERTILIZER_IDS.forEach(id => validatedInventory[id] = INITIAL_GAME_STATE.inventory[id] || 0);
          if (firestoreData.inventory && typeof firestoreData.inventory === 'object') {
            for (const key in firestoreData.inventory) {
              const itemKey = key as InventoryItem;
              if (ALL_SEED_IDS.includes(itemKey as SeedId) || ALL_CROP_IDS.includes(itemKey as CropId) || ALL_FERTILIZER_IDS.includes(itemKey as FertilizerId)) {
                 validatedInventory[itemKey] = (firestoreData.inventory as any)[itemKey] || 0;
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
          
          loadedState.claimedBonuses = typeof firestoreData.claimedBonuses === 'object' && firestoreData.claimedBonuses !== null ? firestoreData.claimedBonuses : {};

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
            claimedBonuses: {}, 
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
  }, [userId, authLoading, itemDataLoaded, fertilizerDataLoaded, user, toast]);

  useEffect(() => {
    if (gameDataLoaded && gameState.level > prevLevelRef.current && prevLevelRef.current !== INITIAL_GAME_STATE.level && userId) {
      const oldTierInfo = getPlayerTierInfo(prevLevelRef.current);
      const newTierInfo = getPlayerTierInfo(gameState.level);
      
      toast({ title: "Lên Cấp!", description: `Chúc mừng! Bạn đã đạt cấp ${gameState.level}!`, className: "bg-primary text-primary-foreground" });
      
      if (newTierInfo.tier > oldTierInfo.tier) {
        toast({ title: "Thăng Hạng!", description: `Chúc mừng! Bạn đã đạt được ${newTierInfo.tierName}! Các vật phẩm và buff mới có thể đã được mở khóa.`, className: "bg-accent text-accent-foreground", duration: 7000 });
        
        // Client-side mail generation for tier-up is REMOVED.
        // This will be handled by a Cloud Function listening to GameState changes
        // and checking `bonusConfigurations` in Firestore.
        // The Cloud Function will then write to the user's mail subcollection.
        // The `claimedBonuses` field in GameState will be checked by the Cloud Function.
        // Example:
        // const bonusKey = `tierUp_${newTierInfo.tier}`;
        // if (!gameStateRef.current.claimedBonuses[bonusKey]) {
        //    // Cloud Function would trigger, find 'tierUp_2' in bonusConfigurations,
        //    // create mail in users/{userId}/mail/{newMailId}
        //    // and potentially update claimedBonuses via a transaction or another function.
        // }
      }
    }
    if (gameDataLoaded) {
        prevLevelRef.current = gameState.level;
    }
  }, [gameState.level, gameDataLoaded, toast, userId]);

  useEffect(() => {
    if (!gameDataLoaded || !itemDataLoaded || !userId || !cropData) return;

    const currentTierInfo = getPlayerTierInfo(gameStateRef.current.level);

    const gameLoopInterval = setInterval(() => {
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

    return () => clearInterval(gameLoopInterval);
  }, [gameDataLoaded, itemDataLoaded, userId, cropData]);

  const isInitialized = gameDataLoaded && itemDataLoaded && fertilizerDataLoaded && !!userId && !authLoading && !!cropData;

  return { gameState, setGameState, isInitialized, playerTierInfo, gameDataLoaded };
};
