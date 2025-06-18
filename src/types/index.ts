
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
}

export type InventoryItem = CropId | SeedId | FertilizerId;
export type Inventory = Record<InventoryItem, number>;

// --- Mail & Reward Types ---
export type RewardItemType = 'gold' | 'xp' | 'item';
export interface RewardItem {
  type: RewardItemType;
  amount?: number; // For gold or xp
  itemId?: InventoryItem; // For items
  quantity?: number; // For items
}

export type MailSenderType = 'system' | 'admin' | 'event';

export interface MailMessage {
  id: string; // Unique ID for the mail
  senderType: MailSenderType;
  senderName: string; // e.g., "System", "Game Master", "Tomato Festival"
  recipientUid: string; // Player's Firebase UID
  subject: string;
  body: string;
  rewards: RewardItem[];
  isRead: boolean;
  isClaimed: boolean; // If rewards have been claimed
  createdAt: number; // Timestamp
  expiresAt?: number; // Optional expiry for event mails
}

export type BonusTriggerType =
  | 'firstLogin'
  | 'tierUp'
  | 'firstPlotUnlock'
  | 'leaderboardWeekly'
  | 'leaderboardMonthly'
  | 'specialEvent';

export interface BonusConfiguration {
  id: string; // e.g., 'tierUp_2', 'event_springFestival'
  triggerType: BonusTriggerType;
  triggerValue?: string | number; // e.g., tier number '2', event ID 'springFestival'
  description: string; // For admin reference
  rewards: RewardItem[];
  mailSubject: string;
  mailBody: string;
  isEnabled: boolean;
}
// --- End Mail & Reward Types ---

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
  mail: MailMessage[]; // Player's mailbox
  claimedBonuses: Record<string, boolean>; // Tracks which one-time bonuses have been claimed e.g. {'tierUp_2': true}
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

export type MarketItemId = CropId | SeedId;

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
  itemId?: MarketItemId;
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
  itemId: InventoryItem;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
  type: 'buy' | 'sell';
  userId: string;
  timestamp: number;
}

export interface MarketItemDisplay {
  id: InventoryItem;
  name: string;
  price: number;
  type: 'seed' | 'crop' | 'fertilizer';
  unlockTier: number;
  icon: string;
  basePrice?: number;
  description?: string;
}
