
import type { CropDetails, CropId, GameState, Plot, MarketItem, SeedId } from '@/types';

export const GRID_ROWS = 3;
export const GRID_COLS = 5;
export const TOTAL_PLOTS = GRID_ROWS * GRID_COLS;

export const INITIAL_GOLD = 100;
export const INITIAL_XP = 0;
export const INITIAL_LEVEL = 1;

export const CROP_DATA: Record<CropId, CropDetails> = {
  tomato: {
    name: 'Cà Chua',
    seedName: 'tomatoSeed',
    icon: '🍅',
    timeToGrowing: 60 * 1000, 
    timeToReady: 120 * 1000,
    harvestYield: 3,
    seedPrice: 5,
    cropPrice: 2,
  },
  carrot: {
    name: 'Cà Rốt',
    seedName: 'carrotSeed',
    icon: '🥕',
    timeToGrowing: 120 * 1000, 
    timeToReady: 240 * 1000, 
    harvestYield: 2,
    seedPrice: 8,
    cropPrice: 5,
  },
  corn: {
    name: 'Ngô',
    seedName: 'cornSeed',
    icon: '🌽',
    timeToGrowing: 180 * 1000, 
    timeToReady: 360 * 1000,  
    harvestYield: 1,
    seedPrice: 12,
    cropPrice: 15,
  },
};

export const ALL_CROP_IDS = Object.keys(CROP_DATA) as CropId[];
export const ALL_SEED_IDS = ALL_CROP_IDS.map(cropId => CROP_DATA[cropId].seedName as SeedId);


export const INITIAL_PLOTS: Plot[] = Array.from({ length: TOTAL_PLOTS }, (_, i) => ({
  id: i,
  state: 'empty',
}));

export const INITIAL_INVENTORY: GameState['inventory'] = {
  tomatoSeed: 5,
  carrotSeed: 3,
  cornSeed: 0,
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
  return Math.floor(100 * Math.pow(level, 1.5)); // Làm tròn xuống để đảm bảo là số nguyên
};

export const MARKET_ITEMS: MarketItem[] = [
  ...ALL_CROP_IDS.map(cropId => ({
    id: CROP_DATA[cropId].seedName as SeedId,
    name: `${CROP_DATA[cropId].name} (Hạt Giống)`,
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
