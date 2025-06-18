
export type PlotState = 'empty' | 'planted' | 'growing' | 'ready_to_harvest' | 'locked';

export type CropId = string;
export type SeedId = `${string}Seed`;
export type FertilizerId = string;

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

export interface FertilizerDetails {
  id: FertilizerId;
  name: string;
  icon: string;
  description: string;
  unlockTier: number;
  timeReductionPercent: number; // e.g., 0.1 for 10% of *remaining* time
  price: number;
}

export interface Plot {
  id: number;
  state: PlotState;
  cropId?: CropId;
  plantedAt?: number;
  // lastFertilizedAt?: number; // Could be used to prevent re-fertilizing too soon if needed
}

export type InventoryItem = CropId | SeedId | FertilizerId;
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

// Types for Dynamic Market System
export type MarketItemId = CropId | SeedId; // Fertilizers are not part of dynamic market for now

export interface MarketPriceData {
  [itemId: string]: number;
}

export interface MarketPriceChange {
  [itemId:string]: number;
}

export interface MarketEventData {
  isActive: boolean;
  eventName: string;
  description: string;
  itemId?: MarketItemId; // Affects only crops/seeds for now
  priceModifier?: number;
  effectDescription?: string;
  expiresAt?: number;
}

export interface MarketState {
  prices: MarketPriceData;
  priceChanges: MarketPriceChange;
  currentEvent: MarketEventData | null;
  lastUpdated: number;
}

export interface MarketActivityLog {
  logId?: string;
  itemId: InventoryItem; // Can be CropId, SeedId, or FertilizerId
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
  type: 'buy' | 'sell';
  userId: string;
  timestamp: number;
}

// Used by MarketModal to prepare items for display
export interface MarketItemDisplay {
  id: InventoryItem;
  name: string;
  price: number; // This will be the *current* price to use for transaction
  type: 'seed' | 'crop' | 'fertilizer';
  unlockTier: number;
  icon: string;
  basePrice?: number; // Original base price for reference (especially for seeds/crops)
  description?: string; // For fertilizers
}
