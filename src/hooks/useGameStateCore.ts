
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { GameState, TierInfo, Plot, PlotState, CropId, SeedId, FertilizerId, InventoryItem, ActiveGameEvent, CropDetails, PlayerMissionProgress, Mission, MissionType, BonusConfiguration, MailMessage } from '@/types';
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
  MAX_GROWTH_TIME_REDUCTION_CAP,
  MAIN_MISSIONS_DATA,
  DAILY_MISSION_TEMPLATES_DATA,
  WEEKLY_MISSION_TEMPLATES_DATA,
  BONUS_CONFIGURATIONS_DATA,
  NUMBER_OF_DAILY_MISSIONS,
  NUMBER_OF_WEEKLY_MISSIONS
} from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './useAuth';
import { db, analytics } from '@/lib/firebase';
import { logEvent } from 'firebase/analytics';
import { doc, setDoc, onSnapshot, type Unsubscribe, Timestamp, collection, query, where, addDoc, serverTimestamp as firestoreServerTimestamp } from 'firebase/firestore';
import { assignMainMissions, refreshTimedMissions } from '@/lib/mission-logic';
import { checkAndApplyFirstLoginBonus, checkAndApplyTierUpBonus, checkAndApplyPlotUnlockBonus } from '@/lib/bonus-logic';


interface UseGameStateCoreProps {
  cropData: Record<CropId, CropDetails> | null;
  itemDataLoaded: boolean;
  fertilizerDataLoaded: boolean;
}

export const useGameStateCore = ({ cropData, itemDataLoaded, fertilizerDataLoaded }: UseGameStateCoreProps) => {
  const { user, userId, loading: authLoading } = useAuth();
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [activeGameEvents, setActiveGameEvents] = useState<ActiveGameEvent[]>([]);
  const [gameDataLoaded, setGameDataLoaded] = useState(false);
  const [playerTierInfo, setPlayerTierInfo] = useState<TierInfo>(getPlayerTierInfo(INITIAL_GAME_STATE.level));
  const { toast } = useToast();

  const prevLevelRef = useRef(gameState.level);
  const prevUnlockedPlotsCountRef = useRef(gameState.unlockedPlotsCount);
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
          const stateToSave = { ...gameStateRef.current };

          if (stateToSave.email === undefined) delete (stateToSave as any).email;
          if (stateToSave.displayName === undefined) delete (stateToSave as any).displayName;

          await setDoc(gameDocRef, JSON.parse(JSON.stringify(stateToSave, (key, value) => {
             return value === undefined ? null : value;
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
    if (!userId) return;

    const now = Timestamp.now();
    const eventsCollectionRef = collection(db, 'activeGameEvents');
    const q = query(
      eventsCollectionRef,
      where('isActive', '==', true),
      where('startTime', '<=', now)
    );
    const unsubscribeEvents = onSnapshot(q, (snapshot) => {
      const fetchedEvents: ActiveGameEvent[] = [];
      snapshot.forEach(docSnap => {
        const eventDocData = docSnap.data() as Omit<ActiveGameEvent, 'id'>;

        const startTimeMillis = eventDocData.startTime && typeof eventDocData.startTime === 'object' && 'toMillis' in eventDocData.startTime
          ? (eventDocData.startTime as unknown as Timestamp).toMillis()
          : typeof eventDocData.startTime === 'number' ? eventDocData.startTime : Date.now();

        const endTimeMillis = eventDocData.endTime && typeof eventDocData.endTime === 'object' && 'toMillis' in eventDocData.endTime
          ? (eventDocData.endTime as unknown as Timestamp).toMillis()
          : typeof eventDocData.endTime === 'number' ? eventDocData.endTime : Date.now() + 24 * 60 * 60 * 1000;

        if (endTimeMillis > now.toMillis()) {
           fetchedEvents.push({
            id: docSnap.id,
            ...eventDocData,
            startTime: startTimeMillis,
            endTime: endTimeMillis,
          });
        }
      });
      setActiveGameEvents(fetchedEvents);
    }, (error) => {
      console.error("Error fetching active game events:", error);
      toast({ title: "Lỗi Tải Sự Kiện", description: "Không thể tải dữ liệu sự kiện game.", variant: "destructive" });
    });

    return () => unsubscribeEvents();
  }, [userId, toast]);


  useEffect(() => {
    if (authLoading) {
      setGameDataLoaded(false);
      return;
    }
    let unsubscribeGameState: Unsubscribe | undefined;

    if (!userId) {
      setGameState(INITIAL_GAME_STATE);
      setGameDataLoaded(false);
      return;
    }

    if (userId && itemDataLoaded && fertilizerDataLoaded) {
      const gameDocRef = doc(db, 'users', userId, 'gameState', 'data');
      unsubscribeGameState = onSnapshot(gameDocRef, (docSnap) => {
        let finalStateToSet: GameState;
        let isNewUser = !docSnap.exists();

        if (docSnap.exists()) {
          const firestoreData = docSnap.data() as Partial<GameState>;
          let loadedState: GameState = {
            ...INITIAL_GAME_STATE,
            ...firestoreData,
            activeMissions: firestoreData.activeMissions || {},
            claimedBonuses: firestoreData.claimedBonuses || {},
            lastDailyMissionRefresh: firestoreData.lastDailyMissionRefresh || 0,
            lastWeeklyMissionRefresh: firestoreData.lastWeeklyMissionRefresh || 0,
          };

          let plots = (firestoreData.plots && Array.isArray(firestoreData.plots) && firestoreData.plots.length === TOTAL_PLOTS)
            ? firestoreData.plots.map((loadedPlotData: any, index: number) => {
                const basePlot = INITIAL_GAME_STATE.plots[index] || { id: index, state: 'empty' as PlotState };
                const newPlot: Plot = {
                  id: loadedPlotData.id !== undefined ? loadedPlotData.id : basePlot.id,
                  state: loadedPlotData.state || basePlot.state,
                };
                if (loadedPlotData.cropId) newPlot.cropId = loadedPlotData.cropId;
                if (loadedPlotData.plantedAt) {
                  if (typeof loadedPlotData.plantedAt === 'number') {
                    newPlot.plantedAt = loadedPlotData.plantedAt;
                  } else if (typeof loadedPlotData.plantedAt === 'object' && 'toMillis' in loadedPlotData.plantedAt) {
                    newPlot.plantedAt = (loadedPlotData.plantedAt as unknown as Timestamp).toMillis();
                  } else {
                    newPlot.plantedAt = undefined;
                  }
                }
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

          loadedState.lastLogin = firestoreData.lastLogin && typeof firestoreData.lastLogin === 'object' && 'toMillis' in (firestoreData.lastLogin as any)
            ? (firestoreData.lastLogin as unknown as Timestamp).toMillis()
            : typeof firestoreData.lastLogin === 'number' ? firestoreData.lastLogin : Date.now();

          loadedState.lastUpdate = firestoreData.lastUpdate && typeof firestoreData.lastUpdate === 'object' && 'toMillis' in (firestoreData.lastUpdate as any)
            ? (firestoreData.lastUpdate as unknown as Timestamp).toMillis()
            : typeof firestoreData.lastUpdate === 'number' ? firestoreData.lastUpdate : gameStateRef.current.lastUpdate || Date.now();

          let newActiveMissions = assignMainMissions(loadedState.level, loadedState.activeMissions || {}, MAIN_MISSIONS_DATA);
          const dailyResult = refreshTimedMissions(newActiveMissions, loadedState.lastDailyMissionRefresh, DAILY_MISSION_TEMPLATES_DATA, NUMBER_OF_DAILY_MISSIONS, 'daily');
          if (dailyResult.missionsChanged) {
            newActiveMissions = dailyResult.updatedMissions;
            loadedState.lastDailyMissionRefresh = dailyResult.newRefreshTime;
          }
          const weeklyResult = refreshTimedMissions(newActiveMissions, loadedState.lastWeeklyMissionRefresh, WEEKLY_MISSION_TEMPLATES_DATA, NUMBER_OF_WEEKLY_MISSIONS, 'weekly');
          if (weeklyResult.missionsChanged) {
            newActiveMissions = weeklyResult.updatedMissions;
            loadedState.lastWeeklyMissionRefresh = weeklyResult.newRefreshTime;
          }
          loadedState.activeMissions = newActiveMissions;
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
            activeMissions: {},
            lastDailyMissionRefresh: 0,
            lastWeeklyMissionRefresh: 0,
          };

          let newActiveMissions = assignMainMissions(newInitialUserState.level, newInitialUserState.activeMissions, MAIN_MISSIONS_DATA);
          const dailyResult = refreshTimedMissions(newActiveMissions, newInitialUserState.lastDailyMissionRefresh, DAILY_MISSION_TEMPLATES_DATA, NUMBER_OF_DAILY_MISSIONS, 'daily');
          newActiveMissions = dailyResult.updatedMissions;
          newInitialUserState.lastDailyMissionRefresh = dailyResult.newRefreshTime;

          const weeklyResult = refreshTimedMissions(newActiveMissions, newInitialUserState.lastWeeklyMissionRefresh, WEEKLY_MISSION_TEMPLATES_DATA, NUMBER_OF_WEEKLY_MISSIONS, 'weekly');
          newActiveMissions = weeklyResult.updatedMissions;
          newInitialUserState.lastWeeklyMissionRefresh = weeklyResult.newRefreshTime;

          newInitialUserState.activeMissions = newActiveMissions;
          finalStateToSet = newInitialUserState;
        }

        if (isNewUser && userId) {
          checkAndApplyFirstLoginBonus(userId, finalStateToSet, setGameState, db, toast, BONUS_CONFIGURATIONS_DATA);
        }

        setGameState(finalStateToSet);
        prevLevelRef.current = finalStateToSet.level;
        prevUnlockedPlotsCountRef.current = finalStateToSet.unlockedPlotsCount;

        if (!gameDataLoaded && !authLoading && userId) {
            setGameDataLoaded(true);
        }

      }, (error) => {
        console.error("Error listening to game state:", error);
        toast({ title: "Lỗi Kết Nối", description: "Không thể đồng bộ dữ liệu trò chơi.", variant: "destructive" });
        setGameState(INITIAL_GAME_STATE);
        prevLevelRef.current = INITIAL_GAME_STATE.level;
        prevUnlockedPlotsCountRef.current = INITIAL_GAME_STATE.unlockedPlotsCount;
         if (!gameDataLoaded && !authLoading && userId) {
          setGameDataLoaded(true);
        }
      });

      return () => {
        if (unsubscribeGameState) unsubscribeGameState();
      };
    }
  }, [userId, authLoading, itemDataLoaded, fertilizerDataLoaded, user, toast, gameDataLoaded]);


  useEffect(() => {
    if (gameDataLoaded && gameState.level > prevLevelRef.current && prevLevelRef.current !== INITIAL_GAME_STATE.level && userId) {
        const oldLevel = prevLevelRef.current;
        checkAndApplyTierUpBonus(userId, oldLevel, gameState.level, gameStateRef.current, setGameState, db, toast, TIER_DATA, BONUS_CONFIGURATIONS_DATA, MAIN_MISSIONS_DATA);
    }
    if (gameDataLoaded) {
        prevLevelRef.current = gameState.level;
    }
  }, [gameState.level, gameDataLoaded, toast, userId, setGameState]);


  useEffect(() => {
    if (gameDataLoaded && userId && gameState.unlockedPlotsCount > prevUnlockedPlotsCountRef.current) {
        checkAndApplyPlotUnlockBonus(userId, prevUnlockedPlotsCountRef.current, gameState.unlockedPlotsCount, gameStateRef.current, setGameState, db, toast, BONUS_CONFIGURATIONS_DATA);
    }
    if (gameDataLoaded) {
      prevUnlockedPlotsCountRef.current = gameState.unlockedPlotsCount;
    }
  }, [gameState.unlockedPlotsCount, gameDataLoaded, userId, setGameState, toast]);


  useEffect(() => {
    if (!gameDataLoaded || !itemDataLoaded || !userId || !cropData) return;

    const currentTierInfo = getPlayerTierInfo(gameStateRef.current.level);

    const gameLoopInterval = setInterval(() => {
      setGameState(prev => {
        if (!prev || !prev.plots || !cropData) return prev;
        const now = Date.now();
        const updatedPlots = prev.plots.map(plot => {
          if (plot.id >= prev.unlockedPlotsCount || !plot.cropId) return plot;

          const cropDetail = cropData[plot.cropId];
          if (!cropDetail) return plot;

          let totalGrowthTimeReduction = currentTierInfo.growthTimeReductionPercent;
          activeGameEvents.forEach(event => {
            const eventStartTime = typeof event.startTime === 'number' ? event.startTime : 0;
            const eventEndTime = typeof event.endTime === 'number' ? event.endTime : 0;

            if (now >= eventStartTime && now <= eventEndTime) {
              if (event.effects.some(eff => eff.type === 'CROP_GROWTH_TIME_REDUCTION')) {
                   event.effects.forEach(eff => {
                      if (eff.type === 'CROP_GROWTH_TIME_REDUCTION') {
                          const affectsAllCrops = eff.affectedItemIds === 'ALL_CROPS';
                          const affectsSpecificCrop = Array.isArray(eff.affectedItemIds) && eff.affectedItemIds.includes(plot.cropId!);
                          if (affectsAllCrops || affectsSpecificCrop) {
                              totalGrowthTimeReduction += eff.value;
                          }
                      }
                   });
              }
            }
          });
          totalGrowthTimeReduction = Math.min(totalGrowthTimeReduction, MAX_GROWTH_TIME_REDUCTION_CAP);

          const effectiveTimeToGrowing = cropDetail.timeToGrowing * (1 - totalGrowthTimeReduction);
          const effectiveTimeToReady = cropDetail.timeToReady * (1 - totalGrowthTimeReduction);

          let newPlotState = plot.state;
          if (plot.state === 'planted' && plot.plantedAt && now >= plot.plantedAt + effectiveTimeToGrowing) {
            newPlotState = 'growing';
          } else if (plot.state === 'growing' && plot.plantedAt && now >= plot.plantedAt + effectiveTimeToReady) {
            newPlotState = 'ready_to_harvest';
          }

          if (newPlotState !== plot.state) {
            return { ...plot, state: newPlotState as PlotState };
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
  }, [gameDataLoaded, itemDataLoaded, userId, cropData, activeGameEvents, playerTierInfo]);

  const isInitialized = gameDataLoaded && itemDataLoaded && fertilizerDataLoaded && !!userId && !authLoading && !!cropData;

  return { gameState, setGameState, isInitialized, playerTierInfo, gameDataLoaded, activeGameEvents };
};

