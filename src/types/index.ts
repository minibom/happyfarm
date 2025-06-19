
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
  id: string; // Firestore Document ID
  senderType: MailSenderType;
  senderName: string; // e.g., "System", "Game Master", "Tomato Festival"
  subject: string;
  body: string;
  rewards: RewardItem[];
  isRead: boolean;
  isClaimed: boolean; // If rewards have been claimed
  createdAt: any; // Firestore Timestamp or number for client-side
  expiresAt?: any; // Optional expiry for event mails, Firestore Timestamp or number
  bonusId?: string; // ID of the BonusConfiguration that triggered this mail, if applicable
}

export type BonusTriggerType =
  | 'firstLogin'
  | 'tierUp'
  | 'firstPlotUnlock'
  | 'leaderboardWeekly'
  | 'leaderboardMonthly'
  | 'specialEvent';

export interface BonusConfiguration {
  id: string; // Firestore Document ID, e.g., 'tierUp_2', 'event_springFestival'
  triggerType: BonusTriggerType;
  triggerValue?: string | number; // e.g., tier number '2', event ID 'springFestival'
  description: string; // For admin reference
  rewards: RewardItem[];
  mailSubject: string;
  mailBody: string;
  isEnabled: boolean;
}

export interface AdminMailLogEntry {
  id?: string; // Firestore document ID
  sentAt: any; // Firestore Timestamp for sorting
  mailSubject: string;
  mailBodyPreview: string; // e.g., first 100 chars of the body
  targetAudience: 'all' | 'specific';
  specificUidsPreview?: string; // e.g., "uid1, uid2, (+3 more)" or "N/A"
  rewardCount: number;
  sentByUid: string;
  sentByName: string; // Admin's display name or email
}

// --- Game Event Types ---
export type GameEventType =
  | 'CROP_GROWTH_TIME_REDUCTION' // Percentage reduction for all or specific crops
  | 'ITEM_PURCHASE_PRICE_MODIFIER' // Percentage modifier for specific buyable items (seeds, fertilizers)
  | 'ITEM_SELL_PRICE_MODIFIER'; // Percentage modifier for specific sellable items (crops)

export interface GameEventEffect {
  type: GameEventType;
  value: number; // e.g., 0.1 for 10% reduction/increase. For price modifiers, >1 for increase, <1 for decrease.
  affectedItemIds?: InventoryItem[] | 'ALL_CROPS' | 'ALL_SEEDS' | 'ALL_FERTILIZERS'; // Specific items or categories
}

export interface GameEventConfig { // For templates / definitions
  id: string; // Unique ID for the template, e.g., "weekendHarvestBoom"
  templateName: string; // Admin-facing name for the template
  description: string; // Admin-facing description of what the event does
  defaultEffects: GameEventEffect[];
  defaultDurationHours: number; // Suggested duration in hours
  defaultMailSubject?: string;
  defaultMailBody?: string;
  icon?: string; // Optional icon for the event type
}

export interface ActiveGameEvent { // For Firestore `activeGameEvents` collection
  id: string; // Firestore document ID for the active event
  configId?: string; // ID of the GameEventConfig it was based on, if any
  name: string; // Player-facing event name
  description: string; // Player-facing event description
  effects: GameEventEffect[];
  startTime: any; // Firestore Timestamp
  endTime: any; // Firestore Timestamp
  isActive: boolean; // Calculated or manually set
}
// --- End Game Event Types ---

// --- AI Greeting Type ---
export interface AIGreetingOutput {
    greeting: string;
}
// --- End AI Greeting Type ---

// --- Mission System Types ---
export type MissionType =
  | 'harvest_crop'        // Thu hoạch N [cropId]
  | 'plant_seed'          // Trồng N [seedId]
  | 'buy_item'            // Mua N [itemId] (seed or fertilizer)
  | 'sell_item'           // Bán N [cropId]
  | 'reach_level'         // Đạt cấp độ N
  | 'earn_gold'           // Kiếm được N vàng (trong một phiên, hoặc tổng)
  | 'unlock_plots'        // Mở khóa N ô đất
  | 'use_fertilizer'      // Sử dụng N [fertilizerId] (hoặc N phân bón bất kỳ)
  | 'complete_daily_missions' // Hoàn thành N nhiệm vụ ngày
  | 'complete_weekly_missions'; // Hoàn thành N nhiệm vụ tuần

export type MissionCategory = 'main' | 'daily' | 'weekly' | 'event' | 'random'; // Added 'event' category
export type MissionStatus = 'locked' | 'active' | 'completed_pending_claim' | 'claimed' | 'expired';

export interface MissionReward extends RewardItem {} // Re-using RewardItem for mission rewards

export interface Mission {
  id: string; // Unique mission ID, e.g., "main_harvest_tomato_1", "daily_plant_any_5"
  title: string;
  description?: string;
  category: MissionCategory;
  type: MissionType;
  targetItemId?: InventoryItem; // For harvest, plant, buy, sell, use_fertilizer
  targetQuantity: number;
  requiredLevelUnlock?: number; // Level required to unlock/see this mission
  rewards: MissionReward[];
  resetFrequency?: 'daily' | 'weekly'; // For daily/weekly missions
  icon?: string; // Optional icon for the mission type or category
  eventSourceId?: string; // If this mission is tied to a specific game event
}

export interface PlayerMissionProgress {
  missionId: string; // References a Mission.id from constants (e.g. 'main_harvest_tomato_10')
  progress: number;
  status: MissionStatus;
  assignedAt?: number; // Timestamp when the mission was assigned (for daily/weekly)
  expiresAt?: number; // Timestamp for daily/weekly/event missions
  // Definition fields that are useful to have directly on the player's active mission
  title: string;
  description?: string;
  category: MissionCategory;
  type: MissionType;
  targetItemId?: InventoryItem;
  targetQuantity: number;
  rewards: MissionReward[];
  icon?: string;
  requiredLevelUnlock?: number;
}
// --- End Mission System Types ---

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
  claimedBonuses: Record<string, boolean>;
  activeMissions: Record<string, PlayerMissionProgress>; // Keyed by mission definition ID
  lastDailyMissionRefresh?: number; // Timestamp
  lastWeeklyMissionRefresh?: number; // Timestamp
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

export type MarketItemId = CropId | SeedId | FertilizerId; // Extended to include FertilizerId

export interface MarketPriceData {
  [itemId: string]: number;
}

export interface MarketPriceChange {
  [itemId:string]: number;
}

export interface MarketEventData { // This existing one might be simplified or integrated with ActiveGameEvent
  isActive: boolean;
  eventName: string;
  description: string;
  itemId?: MarketItemId;
  priceModifier?: number;
  effectDescription?: string;
  expiresAt?: number;
  durationHours?: number;
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

export interface TierDataFromFirestore {
  name: string;
  icon: string;
  colorClass: string;
  levelStart: number;
  xpBoostPercent: number;
  sellPriceBoostPercent: number;
  growthTimeReductionPercent: number;
}

  
