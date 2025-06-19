
import type { GameState, BonusConfiguration, MailMessage, TierInfo, Mission } from '@/types';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp as firestoreServerTimestamp } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import { getPlayerTierInfo, INITIAL_UNLOCKED_PLOTS } from './constants';
import { assignMainMissions } from './mission-logic'; // Import assignMainMissions

export const sendBonusMail = async (
  userIdForMail: string,
  bonus: BonusConfiguration,
  dbInstance: Firestore, // Pass db instance
  toastInstance: Function // Pass toast instance
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
    }
  });

  if (firstLoginBonusFoundAndApplied) {
    // Update gameState directly only if necessary or rely on Firestore listener to pick it up.
    // For immediate UI feedback, update client state.
    setGameState(prev => ({ ...prev, claimedBonuses: tempClaimedBonuses, lastUpdate: Date.now() }));
  }
};

export const checkAndApplyTierUpBonus = async (
  userId: string,
  oldLevel: number,
  newLevel: number,
  currentGameState: GameState, // Pass the most current game state
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  dbInstance: Firestore,
  toastInstance: Function,
  tierDataDefinitions: TierInfo[], // Using TierInfo as it aligns with getPlayerTierInfo structure
  bonusDefinitions: BonusConfiguration[],
  mainMissionDefinitions: Mission[]
) => {
  const oldTierInfo = getPlayerTierInfo(oldLevel);
  const newTierInfo = getPlayerTierInfo(newLevel);
  
  toastInstance({ title: "Lên Cấp!", description: `Chúc mừng! Bạn đã đạt cấp ${newLevel}!`, className: "bg-primary text-primary-foreground" });
  
  let bonusStateChanged = false;
  let tempClaimedBonuses = { ...(currentGameState.claimedBonuses || {}) };

  if (newTierInfo.tier > oldTierInfo.tier) {
    toastInstance({ title: "Thăng Hạng!", description: `Chúc mừng! Bạn đã đạt được ${newTierInfo.tierName}! Các vật phẩm và buff mới có thể đã được mở khóa.`, className: "bg-accent text-accent-foreground", duration: 7000 });

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
      }
    });
  }
  
  // Update missions regardless of tier up, as level up might unlock main missions
  const updatedMissions = assignMainMissions(newLevel, currentGameState.activeMissions || {}, mainMissionDefinitions);
  const missionsChanged = JSON.stringify(updatedMissions) !== JSON.stringify(currentGameState.activeMissions || {});

  if (bonusStateChanged || missionsChanged) {
    setGameState(prev => {
        const finalClaimedBonuses = bonusStateChanged ? tempClaimedBonuses : prev.claimedBonuses;
        const finalActiveMissions = missionsChanged ? updatedMissions : prev.activeMissions;
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
