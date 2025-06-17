
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
  status: 'active' | 'banned_chat'; // For user status, e.g., chat ban
  lastLogin: number; // Timestamp of last login or game data load
  email?: string; // User's email, for display in admin
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
  icon: string;
  colorClass: string;
  nextTierLevel?: number;
}

// For Admin User Page
export interface AdminUserView extends GameState {
  uid: string;
  // email is already optional in GameState, so it's covered
}

