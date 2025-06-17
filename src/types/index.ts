
export type PlotState = 'empty' | 'planted' | 'growing' | 'ready_to_harvest';
export type CropId = 'tomato' | 'carrot' | 'corn';
export type SeedId = `${CropId}Seed`;

export interface CropDetails {
  name: string;
  seedName: string;
  icon: string; // emoji or path to SVG
  timeToGrowing: number; // ms from planted to growing
  timeToReady: number; // ms from planted to ready_to_harvest
  harvestYield: number;
  seedPrice: number;
  cropPrice: number;
}

export interface Plot {
  id: number;
  state: PlotState;
  cropId?: CropId;
  plantedAt?: number; // timestamp
}

export type InventoryItem = CropId | SeedId;
export type Inventory = Record<InventoryItem, number>;

export interface GameState {
  gold: number;
  xp: number;
  level: number;
  plots: Plot[];
  inventory: Inventory;
  lastUpdate: number; // timestamp for calculating offline progress
}

export interface MarketItem {
  id: InventoryItem;
  name: string;
  price: number;
  type: 'seed' | 'crop';
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: number; // or firebase.database.ServerValue.TIMESTAMP type if more specific typing is needed
}

// export interface GeneratedItem {
//   name: string;
//   description: string;
//   cropId: CropId;
// }
