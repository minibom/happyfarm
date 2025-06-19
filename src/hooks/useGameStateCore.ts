
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
} from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './useAuth';
import { db } from '@/lib/firebase';
import { doc, setDoc, onSnapshot, type Unsubscribe, Timestamp, collection, query, where, addDoc, serverTimestamp as firestoreServerTimestamp } from 'firebase/firestore';


interface UseGameStateCoreProps {
  cropData: Record<CropId, CropDetails> | null;
  itemDataLoaded: boolean;
  fertilizerDataLoaded: boolean;
}

const NUMBER_OF_DAILY_MISSIONS = 3;
const NUMBER_OF_WEEKLY_MISSIONS = 3;
// const ONE_DAY_MS = 24 * 60 * 60 * 1000; // Not directly used for 00:00 reset
// const ONE_WEEK_MS = 7 * ONE_DAY_MS; // Not directly used for Monday 00:00 reset


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
        const data = docSnap.data() as Omit<ActiveGameEvent, 'id'>;
        if (data.endTime.toMillis() > now.toMillis()) {
          fetchedEvents.push({ id: docSnap.id, ...data });
        }
      });
      setActiveGameEvents(fetchedEvents);
    }, (error) => {
      console.error("Error fetching active game events:", error);
      toast({ title: "Lỗi Tải Sự Kiện", description: "Không thể tải dữ liệu sự kiện game.", variant: "destructive" });
    });

    return () => unsubscribeEvents();
  }, [userId, toast]);

  const assignMainMissions = useCallback((currentLevel: number, currentActiveMissions: Record<string, PlayerMissionProgress>) => {
    const newActiveMissions = { ...currentActiveMissions };
    let missionAdded = false;
    MAIN_MISSIONS_DATA.forEach(missionDef => {
      if (currentLevel >= (missionDef.requiredLevelUnlock || 1) && !newActiveMissions[missionDef.id]) {
        newActiveMissions[missionDef.id] = {
          missionId: missionDef.id,
          progress: 0,
          status: 'active',
          title: missionDef.title,
          description: missionDef.description,
          category: missionDef.category,
          type: missionDef.type,
          targetItemId: missionDef.targetItemId,
          targetQuantity: missionDef.targetQuantity,
          rewards: missionDef.rewards,
          icon: missionDef.icon,
          requiredLevelUnlock: missionDef.requiredLevelUnlock,
        };
        missionAdded = true;
      }
    });
    return missionAdded ? newActiveMissions : currentActiveMissions;
  }, []);

const refreshTimedMissions = useCallback((
    currentActiveMissions: Record<string, PlayerMissionProgress>,
    lastRefreshTime: number | undefined,
    missionTemplates: Mission[],
    numberOfMissionsToAssign: number,
    missionCategory: 'daily' | 'weekly'
  ): { updatedMissions: Record<string, PlayerMissionProgress>, newRefreshTime: number, missionsChanged: boolean } => {
    const now = Date.now();
    const currentDate = new Date(now);
    let missionsChanged = false;
    const updatedMissions = { ...currentActiveMissions };
    let shouldReset = false;

    // Expire old missions first
    Object.keys(updatedMissions).forEach(missionId => {
      const mission = updatedMissions[missionId];
      if (mission.category === missionCategory && mission.status === 'active' && mission.expiresAt && now >= mission.expiresAt) {
        updatedMissions[missionId] = { ...mission, status: 'expired' };
        missionsChanged = true;
      }
    });

    if (!lastRefreshTime) { // First time ever for this user or category
      shouldReset = true;
    } else {
      const lastRefreshDate = new Date(lastRefreshTime);
      if (missionCategory === 'daily') {
        if (
          currentDate.getFullYear() > lastRefreshDate.getFullYear() ||
          currentDate.getMonth() > lastRefreshDate.getMonth() ||
          currentDate.getDate() > lastRefreshDate.getDate()
        ) {
          shouldReset = true;
        }
      } else if (missionCategory === 'weekly') {
        const dayOfWeekCurrent = currentDate.getDay(); // 0 for Sunday, 1 for Monday...
        const diffToCurrentMonday = (dayOfWeekCurrent === 0 ? -6 : 1 - dayOfWeekCurrent); // days to subtract to get to current week's Monday
        const startOfCurrentWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + diffToCurrentMonday);
        startOfCurrentWeek.setHours(0, 0, 0, 0);

        const dayOfWeekLast = lastRefreshDate.getDay();
        const diffToLastMonday = (dayOfWeekLast === 0 ? -6 : 1 - dayOfWeekLast);
        const startOfLastRefreshWeek = new Date(lastRefreshDate.getFullYear(), lastRefreshDate.getMonth(), lastRefreshDate.getDate() + diffToLastMonday);
        startOfLastRefreshWeek.setHours(0, 0, 0, 0);

        if (startOfCurrentWeek.getTime() > startOfLastRefreshWeek.getTime()) {
          shouldReset = true;
        }
      }
    }
    
    if (shouldReset) {
      missionsChanged = true;
      // Remove old, unclaimable missions of this category
      Object.keys(updatedMissions).forEach(missionId => {
        if (updatedMissions[missionId].category === missionCategory && updatedMissions[missionId].status !== 'claimed') {
          delete updatedMissions[missionId];
        }
      });

      const availableTemplates = missionTemplates.filter(
        def => !Object.keys(updatedMissions).some(activeId => activeId.startsWith(def.id)) 
      );
      const shuffledTemplates = [...availableTemplates].sort(() => 0.5 - Math.random());
      const newMissionsToAdd = shuffledTemplates.slice(0, numberOfMissionsToAssign);

      let newExpirationTime: number;
      if (missionCategory === 'daily') {
        const endOfToday = new Date(currentDate);
        endOfToday.setHours(23, 59, 59, 999);
        newExpirationTime = endOfToday.getTime();
      } else { // weekly
        const endOfWeek = new Date(currentDate);
        const dayOfWeek = endOfWeek.getDay(); // 0 for Sunday
        const daysUntilNextSundayEnd = (7 - dayOfWeek) % 7; 
        endOfWeek.setDate(endOfWeek.getDate() + daysUntilNextSundayEnd);
        endOfWeek.setHours(23, 59, 59, 999);
        newExpirationTime = endOfWeek.getTime();
      }

      newMissionsToAdd.forEach(missionDef => {
        const newMissionId = `${missionDef.id}_${now}`; 
        updatedMissions[newMissionId] = {
          missionId: newMissionId, 
          progress: 0,
          status: 'active',
          assignedAt: now,
          expiresAt: newExpirationTime,
          title: missionDef.title,
          description: missionDef.description,
          category: missionDef.category,
          type: missionDef.type,
          targetItemId: missionDef.targetItemId,
          targetQuantity: missionDef.targetQuantity,
          rewards: missionDef.rewards,
          icon: missionDef.icon,
          requiredLevelUnlock: missionDef.requiredLevelUnlock,
        };
      });
      return { updatedMissions, newRefreshTime: now, missionsChanged };
    }
    return { updatedMissions, newRefreshTime: lastRefreshTime || now, missionsChanged };
  }, []);


  const sendBonusMail = useCallback(async (userIdForMail: string, bonus: BonusConfiguration) => {
    if (!userIdForMail) return;

    const mailMessage: Omit<MailMessage, 'id'> = {
      senderType: 'system',
      senderName: 'Hệ Thống Happy Farm',
      subject: bonus.mailSubject,
      body: bonus.mailBody,
      rewards: bonus.rewards,
      isRead: false,
      isClaimed: false,
      createdAt: firestoreServerTimestamp(),
      bonusId: bonus.id,
    };
    try {
      const mailCollectionRef = collection(db, 'users', userIdForMail, 'mail');
      await addDoc(mailCollectionRef, mailMessage);
    } catch (mailError) {
      console.error(`Failed to send mail for bonus ${bonus.id}:`, mailError);
      toast({ title: "Lỗi Gửi Thư Bonus", description: `Không thể gửi thư cho bonus ${bonus.description}.`, variant: "destructive" });
    }
  }, [toast]);


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
          
          let newActiveMissions = assignMainMissions(loadedState.level, loadedState.activeMissions || {});
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
          
          let newActiveMissions = assignMainMissions(newInitialUserState.level, newInitialUserState.activeMissions);
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
          const tempClaimedBonuses = {...finalStateToSet.claimedBonuses};
          let firstLoginBonusFoundAndApplied = false;
          BONUS_CONFIGURATIONS_DATA.forEach(bonus => {
            if (bonus.triggerType === 'firstLogin' && bonus.isEnabled && !tempClaimedBonuses[bonus.id]) {
              tempClaimedBonuses[bonus.id] = true;
              sendBonusMail(userId, bonus);
              firstLoginBonusFoundAndApplied = true;
            }
          });
          if (firstLoginBonusFoundAndApplied) {
            finalStateToSet = {...finalStateToSet, claimedBonuses: tempClaimedBonuses };
          }
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
  }, [userId, authLoading, itemDataLoaded, fertilizerDataLoaded, user, toast, gameDataLoaded, assignMainMissions, refreshTimedMissions, sendBonusMail]);

  
  useEffect(() => {
    if (gameDataLoaded && gameState.level > prevLevelRef.current && prevLevelRef.current !== INITIAL_GAME_STATE.level && userId) {
      const oldLevel = prevLevelRef.current;
      const newLevel = gameState.level;
      const oldTierInfo = getPlayerTierInfo(oldLevel);
      const newTierInfo = getPlayerTierInfo(newLevel);
      
      toast({ title: "Lên Cấp!", description: `Chúc mừng! Bạn đã đạt cấp ${newLevel}!`, className: "bg-primary text-primary-foreground" });
      
      let bonusStateChangedInLevelUp = false;

      if (newTierInfo.tier > oldTierInfo.tier) {
        toast({ title: "Thăng Hạng!", description: `Chúc mừng! Bạn đã đạt được ${newTierInfo.tierName}! Các vật phẩm và buff mới có thể đã được mở khóa.`, className: "bg-accent text-accent-foreground", duration: 7000 });

        let tempClaimedBonuses = {...gameStateRef.current.claimedBonuses};
        let tierBonusAppliedThisCheck = false;

        BONUS_CONFIGURATIONS_DATA.forEach(bonus => {
          if (
            bonus.triggerType === 'tierUp' &&
            bonus.triggerValue === newTierInfo.tier && 
            bonus.isEnabled &&
            !tempClaimedBonuses[bonus.id] 
          ) {
            tempClaimedBonuses[bonus.id] = true;
            sendBonusMail(userId, bonus); 
            tierBonusAppliedThisCheck = true;
          }
        });

        if (tierBonusAppliedThisCheck) {
            setGameState(prev => ({...prev, claimedBonuses: tempClaimedBonuses, lastUpdate: Date.now() }));
            bonusStateChangedInLevelUp = true;
        }
      }
      
      setGameState(prev => {
        const updatedMissions = assignMainMissions(prev.level, prev.activeMissions);
        if (updatedMissions !== prev.activeMissions || bonusStateChangedInLevelUp) { 
          return { ...prev, activeMissions: updatedMissions, lastUpdate: Date.now() };
        }
        return prev; 
      });
    }
    if (gameDataLoaded) {
        prevLevelRef.current = gameState.level;
    }
  }, [gameState.level, gameDataLoaded, toast, userId, assignMainMissions, sendBonusMail, setGameState]); 


  useEffect(() => {
    if (gameDataLoaded && userId && gameState.unlockedPlotsCount > prevUnlockedPlotsCountRef.current) {
      let bonusStateChangedInPlotUnlock = false;
      let tempClaimedBonuses = {...gameStateRef.current.claimedBonuses};

      if (prevUnlockedPlotsCountRef.current < INITIAL_UNLOCKED_PLOTS + 1 && gameState.unlockedPlotsCount >= INITIAL_UNLOCKED_PLOTS + 1) {
        BONUS_CONFIGURATIONS_DATA.forEach(bonus => {
          if (
            bonus.triggerType === 'firstPlotUnlock' &&
            bonus.isEnabled &&
            !tempClaimedBonuses[bonus.id]
          ) {
            tempClaimedBonuses[bonus.id] = true;
            sendBonusMail(userId, bonus);
            bonusStateChangedInPlotUnlock = true;
          }
        });
      }

      const plots15BonusId = "plotsUnlocked_15";
      if (gameState.unlockedPlotsCount >= 15 && !tempClaimedBonuses[plots15BonusId]) {
          const plots15Bonus = BONUS_CONFIGURATIONS_DATA.find(b => b.id === plots15BonusId && b.triggerType === 'specialEvent' && b.triggerValue === 'plots_15');
          if (plots15Bonus && plots15Bonus.isEnabled) {
              tempClaimedBonuses[plots15Bonus.id] = true;
              sendBonusMail(userId, plots15Bonus);
              bonusStateChangedInPlotUnlock = true;
          }
      }
      
      if (bonusStateChangedInPlotUnlock) {
        setGameState(prev => ({
            ...prev,
            claimedBonuses: tempClaimedBonuses,
            lastUpdate: Date.now(),
        }));
      }
    }
    if (gameDataLoaded) {
      prevUnlockedPlotsCountRef.current = gameState.unlockedPlotsCount;
    }
  }, [gameState.unlockedPlotsCount, gameDataLoaded, userId, sendBonusMail, setGameState]);


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

