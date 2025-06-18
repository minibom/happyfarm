
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
  seedPrice: number; // This will become the base/default price
  cropPrice: number;  // This will become the base/default price
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

// Types for Dynamic Market System
export type MarketItemId = CropId | SeedId;

export interface MarketPriceData {
  [itemId: string]: number; // Current price for the item
}

export interface MarketPriceChange {
  [itemId: string]: number; // Percentage change (e.g., 0.05 for +5%, -0.1 for -10%)
}

export interface MarketEventData {
  isActive: boolean;
  eventName: string;
  description: string;
  itemId?: MarketItemId; // Optional: event might affect a specific item or be general
  priceModifier?: number; // e.g., 1.2 for +20% price, 0.8 for -20%
  effectDescription?: string; // e.g. "Giá bán cà chua tăng 20%"
  expiresAt?: number; // Timestamp for when the event ends
}

export interface MarketState {
  prices: MarketPriceData;
  priceChanges: MarketPriceChange; // To show up/down arrows
  currentEvent: MarketEventData | null;
  lastUpdated: number; // Timestamp of the last price update
}

export interface MarketActivityLog {
  logId?: string;
  itemId: MarketItemId;
  quantity: number;
  pricePerUnit: number; // Price at which the transaction occurred
  totalPrice: number;
  type: 'buy' | 'sell';
  userId: string;
  timestamp: number; // Firestore server timestamp
}
