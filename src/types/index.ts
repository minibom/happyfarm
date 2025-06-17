
export type PlotState = 'empty' | 'planted' | 'growing' | 'ready_to_harvest';

// Keep CropId as a string to allow for dynamic additions from Firestore
export type CropId = string; 
export type SeedId = `${string}Seed`; // Allows any cropId to form a seedId

export interface CropDetails {
  name: string;
  seedName: SeedId; // Ensure this is strongly typed
  icon: string; 
  timeToGrowing: number; 
  timeToReady: number; 
  harvestYield: number;
  seedPrice: number;
  cropPrice: number;
  unlockTier: number; // New: Tier required to unlock this item
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
}

export interface MarketItem {
  id: InventoryItem;
  name: string;
  price: number;
  type: 'seed' | 'crop';
  unlockTier: number; // For displaying lock status in market
  icon?: string; // Optional: for displaying crop icon for seeds
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

