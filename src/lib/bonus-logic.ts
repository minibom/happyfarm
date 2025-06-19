
import type { GameState, BonusConfiguration, MailMessage, TierInfo, Mission, PlayerMissionProgress } from '@/types';
import { db, analytics } from '@/lib/firebase'; // Added analytics
import { logEvent } from 'firebase/analytics'; // Added logEvent
import { collection, addDoc, serverTimestamp as firestoreServerTimestamp } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import { getPlayerTierInfo, INITIAL_UNLOCKED_PLOTS } from './constants';
import { assignMainMissions } from './mission-logic'; 

export const sendBonusMail = async (
  userIdForMail: string,
  bonus: BonusConfiguration,
  dbInstance: Firestore, 
  toastInstance: Function 
): Promise<void> => {
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
    const mailCollectionRef = collection(dbInstance, 'users', userIdForMail, 'mail');
    await addDoc(mailCollectionRef, mailMessage);
  } catch (mailError) {
    console.error(`Failed to send mail for bonus ${bonus.id}:`, mailError);
    toastInstance({ title: "Lỗi Gửi Thư Bonus", description: `Không thể gửi thư cho bonus ${bonus.description}.`, variant: "destructive" });
  }
};

export const checkAndApplyFirstLoginBonus = async (
  userId: string,
  currentGameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  dbInstance: Firestore,
  toastInstance: Function,
  bonusDefinitions: BonusConfiguration[]
) => {
  let tempClaimedBonuses = { ...(currentGameState.claimedBonuses || {}) };
  let firstLoginBonusFoundAndApplied = false;

  bonusDefinitions.forEach(bonus => {
    if (bonus.triggerType === 'firstLogin' && bonus.isEnabled && !tempClaimedBonuses[bonus.id]) {
      tempClaimedBonuses[bonus.id] = true;
      sendBonusMail(userId, bonus, dbInstance, toastInstance);
      firstLoginBonusFoundAndApplied = true;
      if (analytics) {
        logEvent(analytics, 'apply_first_login_bonus', {
            bonus_id: bonus.id,
        });
      }
    }
  });

  if (firstLoginBonusFoundAndApplied) {
    setGameState(prev => ({ ...prev, claimedBonuses: tempClaimedBonuses, lastUpdate: Date.now() }));
  }
};

const updateReachLevelMissionProgress = (
  currentActiveMissions: Record<string, PlayerMissionProgress>,
  newPlayerLevel: number
): Record<string, PlayerMissionProgress> => {
  const updatedMissions = { ...currentActiveMissions };
  let missionChanged = false;

  Object.keys(updatedMissions).forEach(key => {
    const mission = updatedMissions[key];
    if (mission.status === 'active' && mission.type === 'reach_level') {
      if (newPlayerLevel >= mission.targetQuantity) {
        if (mission.status !== 'completed_pending_claim') { // Avoid re-triggering if already completed
            updatedMissions[key] = { ...mission, progress: mission.targetQuantity, status: 'completed_pending_claim' };
            missionChanged = true;
        }
      } else {
        if (mission.progress !== newPlayerLevel) {
          updatedMissions[key] = { ...mission, progress: newPlayerLevel };
          missionChanged = true;
        }
      }
    }
  });
  return missionChanged ? updatedMissions : currentActiveMissions;
};


export const checkAndApplyTierUpBonus = async (
  userId: string,
  oldLevel: number,
  newLevel: number,
  currentGameState: GameState, 
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  dbInstance: Firestore,
  toastInstance: Function,
  tierDataDefinitions: TierInfo[], 
  bonusDefinitions: BonusConfiguration[],
  mainMissionDefinitions: Mission[]
) => {
  const oldTierInfo = getPlayerTierInfo(oldLevel);
  const newTierInfo = getPlayerTierInfo(newLevel);
  
  toastInstance({ title: "Lên Cấp!", description: `Chúc mừng! Bạn đã đạt cấp ${newLevel}!`, className: "bg-primary text-primary-foreground" });
  if (analytics && userId) {
    logEvent(analytics, 'level_up', {
      level: newLevel,
      character: userId, // Using userId as character identifier
    });
  }
  
  let bonusStateChanged = false;
  let tempClaimedBonuses = { ...(currentGameState.claimedBonuses || {}) };
  let activeMissionsAfterLevelUp = { ...(currentGameState.activeMissions || {}) };

  if (newTierInfo.tier > oldTierInfo.tier) {
    toastInstance({ title: "Thăng Hạng!", description: `Chúc mừng! Bạn đã đạt được ${newTierInfo.tierName}! Các vật phẩm và buff mới có thể đã được mở khóa.`, className: "bg-accent text-accent-foreground", duration: 7000 });
    if (analytics && userId) {
      logEvent(analytics, 'tier_up', { // Custom event
        tier: newTierInfo.tier,
        tier_name: newTierInfo.tierName,
        character: userId,
      });
    }

    bonusDefinitions.forEach(bonus => {
      if (
        bonus.triggerType === 'tierUp' &&
        bonus.triggerValue === newTierInfo.tier && 
        bonus.isEnabled &&
        !tempClaimedBonuses[bonus.id] 
      ) {
        tempClaimedBonuses[bonus.id] = true;
        sendBonusMail(userId, bonus, dbInstance, toastInstance); 
        bonusStateChanged = true;
        if (analytics) {
            logEvent(analytics, 'apply_tier_up_bonus', {
                bonus_id: bonus.id,
                tier: newTierInfo.tier,
            });
        }
      }
    });
  }
  
  activeMissionsAfterLevelUp = assignMainMissions(newLevel, activeMissionsAfterLevelUp, mainMissionDefinitions);
  activeMissionsAfterLevelUp = updateReachLevelMissionProgress(activeMissionsAfterLevelUp, newLevel);

  const missionsChanged = JSON.stringify(activeMissionsAfterLevelUp) !== JSON.stringify(currentGameState.activeMissions || {});

  if (bonusStateChanged || missionsChanged) {
    setGameState(prev => {
        const finalClaimedBonuses = bonusStateChanged ? tempClaimedBonuses : prev.claimedBonuses;
        const finalActiveMissions = missionsChanged ? activeMissionsAfterLevelUp : prev.activeMissions;
        return {...prev, claimedBonuses: finalClaimedBonuses, activeMissions: finalActiveMissions, lastUpdate: Date.now() };
    });
  }
};

export const checkAndApplyPlotUnlockBonus = async (
  userId: string,
  oldUnlockedPlotsCount: number,
  newUnlockedPlotsCount: number,
  currentGameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  dbInstance: Firestore,
  toastInstance: Function,
  bonusDefinitions: BonusConfiguration[]
) => {
  let bonusStateChanged = false;
  let tempClaimedBonuses = { ...(currentGameState.claimedBonuses || {}) };

  if (oldUnlockedPlotsCount < INITIAL_UNLOCKED_PLOTS + 1 && newUnlockedPlotsCount >= INITIAL_UNLOCKED_PLOTS + 1) {
    bonusDefinitions.forEach(bonus => {
      if (
        bonus.triggerType === 'firstPlotUnlock' &&
        bonus.isEnabled &&
        !tempClaimedBonuses[bonus.id]
      ) {
        tempClaimedBonuses[bonus.id] = true;
        sendBonusMail(userId, bonus, dbInstance, toastInstance);
        bonusStateChanged = true;
        if (analytics) {
            logEvent(analytics, 'apply_plot_unlock_bonus', {
                bonus_id: bonus.id,
                trigger_type: 'firstPlotUnlock',
            });
        }
      }
    });
  }

  const plots15BonusId = "plotsUnlocked_15";
  if (newUnlockedPlotsCount >= 15 && !tempClaimedBonuses[plots15BonusId]) {
      const plots15Bonus = bonusDefinitions.find(b => b.id === plots15BonusId && b.triggerType === 'specialEvent' && b.triggerValue === 'plots_15');
      if (plots15Bonus && plots15Bonus.isEnabled) {
          tempClaimedBonuses[plots15Bonus.id] = true;
          sendBonusMail(userId, plots15Bonus, dbInstance, toastInstance);
          bonusStateChanged = true;
           if (analytics) {
            logEvent(analytics, 'apply_plot_unlock_bonus', {
                bonus_id: plots15Bonus.id,
                trigger_type: 'specialEvent',
                trigger_value: 'plots_15',
                unlocked_plots: newUnlockedPlotsCount,
            });
          }
      }
  }
  
  if (bonusStateChanged) {
    setGameState(prev => ({
        ...prev,
        claimedBonuses: tempClaimedBonuses,
        lastUpdate: Date.now(),
    }));
  }
};
