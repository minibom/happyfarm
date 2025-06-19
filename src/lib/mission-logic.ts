
import type { PlayerMissionProgress, Mission } from '@/types';

export const assignMainMissions = (
  currentLevel: number,
  currentActiveMissions: Record<string, PlayerMissionProgress>,
  mainMissionDefinitions: Mission[]
): Record<string, PlayerMissionProgress> => {
  const newActiveMissions = { ...currentActiveMissions };
  let missionAdded = false;
  mainMissionDefinitions.forEach(missionDef => {
    if (currentLevel >= (missionDef.requiredLevelUnlock || 1) && !newActiveMissions[missionDef.id]) {
      const progressData: PlayerMissionProgress = {
        missionId: missionDef.id,
        progress: 0,
        status: 'active',
        title: missionDef.title,
        category: missionDef.category,
        type: missionDef.type,
        targetQuantity: missionDef.targetQuantity,
        rewards: missionDef.rewards,
      };
      if (missionDef.description !== undefined) progressData.description = missionDef.description;
      if (missionDef.targetItemId !== undefined) progressData.targetItemId = missionDef.targetItemId;
      if (missionDef.icon !== undefined) progressData.icon = missionDef.icon;
      if (missionDef.requiredLevelUnlock !== undefined) progressData.requiredLevelUnlock = missionDef.requiredLevelUnlock;
      if (missionDef.eventSourceId !== undefined) progressData.eventSourceId = missionDef.eventSourceId;
      // assignedAt and expiresAt are not typically set here for main missions from definitions

      newActiveMissions[missionDef.id] = progressData;
      missionAdded = true;
    }
  });
  return missionAdded ? newActiveMissions : currentActiveMissions;
};

export const refreshTimedMissions = (
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

  Object.keys(updatedMissions).forEach(missionId => {
    const mission = updatedMissions[missionId];
    if (mission.category === missionCategory && mission.status === 'active' && mission.expiresAt && now >= mission.expiresAt) {
      updatedMissions[missionId] = { ...mission, status: 'expired' };
      missionsChanged = true;
    }
  });

  if (!lastRefreshTime) {
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
      const dayOfWeekCurrent = currentDate.getDay();
      const diffToCurrentMonday = (dayOfWeekCurrent === 0 ? -6 : 1 - dayOfWeekCurrent);
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
    } else {
      const endOfWeek = new Date(currentDate);
      const dayOfWeek = endOfWeek.getDay();
      const daysUntilNextSundayEnd = (7 - dayOfWeek) % 7;
      endOfWeek.setDate(endOfWeek.getDate() + daysUntilNextSundayEnd);
      endOfWeek.setHours(23, 59, 59, 999);
      newExpirationTime = endOfWeek.getTime();
    }

    newMissionsToAdd.forEach(missionDef => {
      const newMissionId = `${missionDef.id}_${now}`;
      const progressData: PlayerMissionProgress = {
        missionId: newMissionId,
        progress: 0,
        status: 'active',
        assignedAt: now,
        expiresAt: newExpirationTime,
        title: missionDef.title,
        category: missionDef.category,
        type: missionDef.type,
        targetQuantity: missionDef.targetQuantity,
        rewards: missionDef.rewards,
      };
      if (missionDef.description !== undefined) progressData.description = missionDef.description;
      if (missionDef.targetItemId !== undefined) progressData.targetItemId = missionDef.targetItemId;
      if (missionDef.icon !== undefined) progressData.icon = missionDef.icon;
      if (missionDef.requiredLevelUnlock !== undefined) progressData.requiredLevelUnlock = missionDef.requiredLevelUnlock;
      if (missionDef.eventSourceId !== undefined) progressData.eventSourceId = missionDef.eventSourceId;

      updatedMissions[newMissionId] = progressData;
    });
    return { updatedMissions, newRefreshTime: now, missionsChanged };
  }
  return { updatedMissions, newRefreshTime: lastRefreshTime || now, missionsChanged };
};

