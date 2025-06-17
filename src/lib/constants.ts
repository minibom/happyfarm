
import type { CropDetails, CropId, GameState, Plot, MarketItem, SeedId } from '@/types';

export const GRID_ROWS = 3;
export const GRID_COLS = 5;
export const TOTAL_PLOTS = GRID_ROWS * GRID_COLS;

export const INITIAL_GOLD = 100;
export const INITIAL_XP = 0;
export const INITIAL_LEVEL = 1;

export const CROP_DATA: Record<CropId, CropDetails> = {
  tomato: {
    name: 'Tomato',
    seedName: 'tomatoSeed', // Changed from 'Tomato Seed'
    icon: '🍅',
    timeToGrowing: 5 * 1000, // 5 seconds
    timeToReady: 10 * 1000,  // 10 seconds total
    harvestYield: 3,
    seedPrice: 5,
    cropPrice: 2,
  },
  carrot: {
    name: 'Carrot',
    seedName: 'carrotSeed', // Changed from 'Carrot Seed'
    icon: '🥕',
    timeToGrowing: 8 * 1000, // 8 seconds
    timeToReady: 15 * 1000, // 15 seconds total
    harvestYield: 2,
    seedPrice: 8,
    cropPrice: 5,
  },
  corn: {
    name: 'Corn',
    seedName: 'cornSeed', // Changed from 'Corn Seed'
    icon: '🌽',
    timeToGrowing: 12 * 1000, // 12 seconds
    timeToReady: 25 * 1000,  // 25 seconds total
    harvestYield: 1,
    seedPrice: 12,
    cropPrice: 15,
  },
};

export const ALL_CROP_IDS = Object.keys(CROP_DATA) as CropId[];
// This now correctly maps to 'tomatoSeed', etc. and matches SeedId type
export const ALL_SEED_IDS = ALL_CROP_IDS.map(cropId => CROP_DATA[cropId].seedName as SeedId);


export const INITIAL_PLOTS: Plot[] = Array.from({ length: TOTAL_PLOTS }, (_, i) => ({
  id: i,
  state: 'empty',
}));

export const INITIAL_INVENTORY: GameState['inventory'] = {
  tomatoSeed: 5, // Changed key
  carrotSeed: 3, // Changed key
  cornSeed: 0,   // Changed key
  tomato: 0,
  carrot: 0,
  corn: 0,
};

export const INITIAL_GAME_STATE: GameState = {
  gold: INITIAL_GOLD,
  xp: INITIAL_XP,
  level: INITIAL_LEVEL,
  plots: INITIAL_PLOTS,
  inventory: INITIAL_INVENTORY,
  lastUpdate: Date.now(),
};

export const LEVEL_UP_XP_THRESHOLD = (level: number): number => {
  return 100 * Math.pow(level, 1.5);
};

export const MARKET_ITEMS: MarketItem[] = [
  ...ALL_CROP_IDS.map(cropId => ({ 
    id: CROP_DATA[cropId].seedName as SeedId, 
    name: `${CROP_DATA[cropId].name} Seed`, // Display name
    price: CROP_DATA[cropId].seedPrice, 
    type: 'seed' as 'seed' 
  })),
  ...ALL_CROP_IDS.map(cropId => ({ 
    id: cropId, 
    name: CROP_DATA[cropId].name, 
    price: CROP_DATA[cropId].cropPrice, 
    type: 'crop' as 'crop' 
  })),
];

export const LOCAL_STORAGE_GAME_KEY = 'happyFarmGame';
