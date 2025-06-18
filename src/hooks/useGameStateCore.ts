
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { GameState, TierInfo, Plot, PlotState, CropId, SeedId, FertilizerId, InventoryItem } from '@/types';
import {
  INITIAL_GAME_STATE,
  LEVEL_UP_XP_THRESHOLD,
  TOTAL_PLOTS,
  getPlayerTierInfo,
  INITIAL_UNLOCKED_PLOTS,
  ALL_SEED_IDS,
  ALL_CROP_IDS,
  ALL_FERTILIZER_IDS
} from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './useAuth';
import { db } from '@/lib/firebase';
import { doc, setDoc, onSnapshot, type Unsubscribe } from 'firebase/firestore';
import type { CropDetails } from '@/types'; // Keep CropDetails for game loop

interface UseGameStateCoreProps {
  cropData: Record<CropId, CropDetails> | null;
  itemDataLoaded: boolean;
  fertilizerDataLoaded: boolean; // Added this to ensure all data is ready
}

export const useGameStateCore = ({ cropData, itemDataLoaded, fertilizerDataLoaded }: UseGameStateCoreProps) => {
  const { user, userId, loading: authLoading } = useAuth();
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [gameDataLoaded, setGameDataLoaded] = useState(false); // Tracks if Firestore data for *this user* is loaded
  const [playerTierInfo, setPlayerTierInfo] = useState<TierInfo>(getPlayerTierInfo(INITIAL_GAME_STATE.level));
  const { toast } = useToast();

  const prevLevelRef = useRef(gameState.level);
  const gameStateRef = useRef(gameState); // Ref to always get the latest gameState in callbacks

  useEffect(() => {
    gameStateRef.current = gameState;
    setPlayerTierInfo(getPlayerTierInfo(gameState.level));
  }, [gameState]);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const saveGameStateToFirestore = useCallback(() => {
    if (userId && gameDataLoaded && itemDataLoaded && fertilizerDataLoaded) { // Ensure all data sources are ready
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          const gameDocRef = doc(db, 'users', userId, 'gameState', 'data');
          // Sanitize state for Firestore (handle undefined)
          const stateToSave = JSON.parse(JSON.stringify(gameStateRef.current, (key, value) => {
            return value === undefined ? null : value; // Firestore doesn't like undefined
          }));
          await setDoc(gameDocRef, stateToSave);
        } catch (error) {
          console.error("Failed to save game state:", error);
          toast({ title: "Lỗi Lưu Trữ", description: "Không thể lưu tiến trình trò chơi của bạn.", variant: "destructive" });
        }
      }, 1000); // Debounce save
    }
  }, [userId, gameDataLoaded, itemDataLoaded, fertilizerDataLoaded, toast]);

  useEffect(() => {
    // Trigger save whenever gameState changes, if all conditions are met
    if (gameDataLoaded && itemDataLoaded && fertilizerDataLoaded && userId) {
      saveGameStateToFirestore();
    }
  }, [gameState, gameDataLoaded, itemDataLoaded, fertilizerDataLoaded, userId, saveGameStateToFirestore]);

  // Firestore listener for game state
  useEffect(() => {
    if (authLoading) {
      setGameDataLoaded(false);
      return;
    }
    let unsubscribe: Unsubscribe | undefined;

    if (!userId) {
      setGameState(INITIAL_GAME_STATE); // Reset to initial if no user
      setGameDataLoaded(false);
      return;
    }
    
    // Only set up listener if item data is already loaded, or will be loaded
    // This ensures cropData is available for the game loop that might run on loaded state.
    if (userId && itemDataLoaded && fertilizerDataLoaded) {
      const gameDocRef = doc(db, 'users', userId, 'gameState', 'data');
      unsubscribe = onSnapshot(gameDocRef, (docSnap) => {
        let finalStateToSet: GameState;
        if (docSnap.exists()) {
          const firestoreData = docSnap.data() as GameState;
          // Deep merge/validate with INITIAL_GAME_STATE structure
          let loadedState = { ...INITIAL_GAME_STATE, ...firestoreData };

          // Validate plots
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
            : INITIAL_GAME_STATE.plots.map((p,i) => ({ ...p, id: i})); // Ensure IDs are set
          loadedState.plots = plots;
          
          // Validate inventory: Ensure all known item types are present, default to 0 if missing
          const validatedInventory: GameState['inventory'] = {};
          // Initialize with all possible items from constants
          ALL_SEED_IDS.forEach(id => validatedInventory[id] = INITIAL_GAME_STATE.inventory[id] || 0);
          ALL_CROP_IDS.forEach(id => validatedInventory[id] = INITIAL_GAME_STATE.inventory[id] || 0);
          ALL_FERTILIZER_IDS.forEach(id => validatedInventory[id] = INITIAL_GAME_STATE.inventory[id] || 0);
          // Then overlay with Firestore data
          if (firestoreData.inventory && typeof firestoreData.inventory === 'object') {
            for (const key in firestoreData.inventory) {
              const itemKey = key as InventoryItem;
              // Only accept keys that are known item IDs
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
          
          loadedState.lastLogin = firestoreData.lastLogin || Date.now(); // Update lastLogin from Firestore or set new
          loadedState.lastUpdate = firestoreData.lastUpdate || gameStateRef.current.lastUpdate || Date.now(); // Keep local if newer, or Firestore's

          finalStateToSet = loadedState;

        } else {
          // No existing game state, create a fresh one
           const newInitialUserState: GameState = {
            ...INITIAL_GAME_STATE,
            inventory: { ...INITIAL_GAME_STATE.inventory }, // Deep copy
            plots: INITIAL_GAME_STATE.plots.map(p => ({ ...p })), // Deep copy
            email: user?.email || undefined,
            displayName: user?.displayName || undefined,
            lastLogin: Date.now(),
            lastUpdate: Date.now(),
            unlockedPlotsCount: INITIAL_UNLOCKED_PLOTS,
            status: 'active' as const,
          };
          finalStateToSet = newInitialUserState;
          // Save this initial state immediately
          // setDoc(gameDocRef, newInitialUserState); // This will be handled by the saveGameStateToFirestore effect
        }
        
        setGameState(finalStateToSet);
        prevLevelRef.current = finalStateToSet.level; // Sync prevLevelRef with loaded level

        if (!gameDataLoaded && !authLoading && userId) { // Mark user-specific game data as loaded
            setGameDataLoaded(true);
        }

      }, (error) => {
        console.error("Error listening to game state:", error);
        toast({ title: "Lỗi Kết Nối", description: "Không thể đồng bộ dữ liệu trò chơi.", variant: "destructive" });
        setGameState(INITIAL_GAME_STATE); // Fallback to initial state
        prevLevelRef.current = INITIAL_GAME_STATE.level;
         if (!gameDataLoaded && !authLoading && userId) { // Still mark as loaded to unblock UI, even with error state
          setGameDataLoaded(true);
        }
      });

      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [userId, authLoading, itemDataLoaded, fertilizerDataLoaded, user, toast]); // Added itemDataLoaded, fertilizerDataLoaded

  // Level Up Toast Effect
  useEffect(() => {
    if (gameDataLoaded && gameState.level > prevLevelRef.current && prevLevelRef.current !== INITIAL_GAME_STATE.level) { // Only show if not initial load to level 1
      const oldTierInfo = getPlayerTierInfo(prevLevelRef.current);
      const newTierInfo = getPlayerTierInfo(gameState.level);
      toast({ title: "Lên Cấp!", description: `Chúc mừng! Bạn đã đạt cấp ${gameState.level}!`, className: "bg-primary text-primary-foreground" });
      if (newTierInfo.tier > oldTierInfo.tier) {
        toast({ title: "Thăng Hạng!", description: `Chúc mừng! Bạn đã đạt được Bậc ${newTierInfo.tierName}! Các vật phẩm và buff mới có thể đã được mở khóa.`, className: "bg-accent text-accent-foreground", duration: 7000 });
      }
    }
    if (gameDataLoaded) { // Ensure prevLevelRef is updated only after gameDataLoaded
        prevLevelRef.current = gameState.level;
    }
  }, [gameState.level, gameDataLoaded, toast]);

  // Game Loop for crop progression
  useEffect(() => {
    // Ensure all necessary data is loaded before starting the game loop.
    if (!gameDataLoaded || !itemDataLoaded || !userId || !cropData) return;

    const currentTierInfo = getPlayerTierInfo(gameStateRef.current.level); // Use ref for latest level

    const gameLoopInterval = setInterval(() => {
      setGameState(prev => {
        if (!prev || !prev.plots || !cropData) return prev; // cropData check again
        const now = Date.now();
        const updatedPlots = prev.plots.map(plot => {
          if (plot.id >= prev.unlockedPlotsCount) return plot; // Skip locked plots

          const currentCropDetail = plot.cropId ? cropData[plot.cropId] : null;
          if (!currentCropDetail) return plot; // Skip if no crop or crop detail missing

          // Apply growth time reduction from player's tier
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

        // Only update state if plots actually changed to prevent unnecessary re-renders/saves
        if (JSON.stringify(updatedPlots) !== JSON.stringify(prev.plots)) {
          return { ...prev, plots: updatedPlots, lastUpdate: now };
        }
        return prev;
      });
    }, 1000); // Run every second

    return () => clearInterval(gameLoopInterval);
  }, [gameDataLoaded, itemDataLoaded, userId, cropData]); // Added cropData as dependency

  // isInitialized depends on all data sources being ready
  const isInitialized = gameDataLoaded && itemDataLoaded && fertilizerDataLoaded && !!userId && !authLoading && !!cropData;

  return { gameState, setGameState, isInitialized, playerTierInfo, gameDataLoaded };
};
