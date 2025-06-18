
export type PlotState = 'empty' | 'planted' | 'growing' | 'ready_to_harvest' | 'locked';

export type CropId = string;
export type SeedId = `${string}Seed`;

export interface CropDetails {
  name: string;
  seedName: SeedId;
  icon: string;
  timeToGrowing: number;
  timeToReady: number;
  harvestYield: number;
  seedPrice: number;
  cropPrice: number;
  unlockTier: number;
}

export interface Plot {
  id: number;
  state: PlotState;
  cropId?: CropId;
  plantedAt?: number;
}

export type InventoryItem = CropId | SeedId;
export type Inventory = Record<InventoryItem, number>;

export interface GameState {
  gold: number;
  xp: number;
  level: number;
  plots: Plot[];
  inventory: Inventory;
  lastUpdate: number;
  unlockedPlotsCount: number;
  status: 'active' | 'banned_chat';
  lastLogin: number;
  email?: string;
  displayName?: string;
}

export interface ChatMessage {
  id: string;
  senderUid: string;
  senderDisplayName: string;
  text: string;
  timestamp: number;
}

export interface TierInfo {
  tier: number;
  tierName: string;
  icon: string;
  colorClass: string;
  nextTierLevel?: number;
  xpBoostPercent: number;
  sellPriceBoostPercent: number;
  growthTimeReductionPercent: number;
}

export interface AdminUserView extends GameState {
  uid: string;
}
