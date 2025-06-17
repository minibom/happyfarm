
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
  state: PlotState; // Can include 'locked' if we explicitly set it, or derive from unlockedPlotsCount
  cropId?: CropId;
  plantedAt?: number;
}

export type InventoryItem = CropId | SeedId;
export type Inventory = Record<InventoryItem, number>;

export interface GameState {
  gold: number;
  xp: number;
  level: number;
  plots: Plot[]; // Plot state might be dynamically determined rather than stored as 'locked'
  inventory: Inventory;
  lastUpdate: number;
  unlockedPlotsCount: number; // New: to track how many plots are unlocked
}

export interface MarketItem {
  id: InventoryItem;
  name: string;
  price: number;
  type: 'seed' | 'crop';
  unlockTier: number;
  icon?: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
}

export interface TierInfo {
  tier: number;
  tierName: string;
  nextTierLevel?: number;
}
