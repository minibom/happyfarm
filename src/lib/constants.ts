import type { CropDetails, CropId, GameState, Plot, MarketItem } from '@/types';

export const GRID_ROWS = 3;
export const GRID_COLS = 5;
export const TOTAL_PLOTS = GRID_ROWS * GRID_COLS;

export const INITIAL_GOLD = 100;
export const INITIAL_XP = 0;
export const INITIAL_LEVEL = 1;

export const CROP_DATA: Record<CropId, CropDetails> = {
  tomato: {
    name: 'Tomato',
    seedName: 'Tomato Seed',
    icon: '🍅',
    timeToGrowing: 5 * 1000, // 5 seconds
    timeToReady: 10 * 1000,  // 10 seconds total
    harvestYield: 3,
    seedPrice: 5,
    cropPrice: 2,
  },
  carrot: {
    name: 'Carrot',
    seedName: 'Carrot Seed',
    icon: '🥕',
    timeToGrowing: 8 * 1000, // 8 seconds
    timeToReady: 15 * 1000, // 15 seconds total
    harvestYield: 2,
    seedPrice: 8,
    cropPrice: 5,
  },
  corn: {
    name: 'Corn',
    seedName: 'Corn Seed',
    icon: '🌽',
    timeToGrowing: 12 * 1000, // 12 seconds
    timeToReady: 25 * 1000,  // 25 seconds total
    harvestYield: 1,
    seedPrice: 12,
    cropPrice: 15,
  },
};

export const ALL_CROP_IDS = Object.keys(CROP_DATA) as CropId[];
export const ALL_SEED_IDS = ALL_CROP_IDS.map(cropId => CROP_DATA[cropId].seedName as `${CropId}Seed`);


export const INITIAL_PLOTS: Plot[] = Array.from({ length: TOTAL_PLOTS }, (_, i) => ({
  id: i,
  state: 'empty',
}));

export const INITIAL_INVENTORY: GameState['inventory'] = {
  'Tomato Seed': 5,
  'Carrot Seed': 3,
  'Corn Seed': 0,
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
  ...ALL_CROP_IDS.map(id => ({ id: CROP_DATA[id].seedName as `${CropId}Seed`, name: CROP_DATA[id].seedName, price: CROP_DATA[id].seedPrice, type: 'seed' as 'seed' })),
  ...ALL_CROP_IDS.map(id => ({ id, name: CROP_DATA[id].name, price: CROP_DATA[id].cropPrice, type: 'crop' as 'crop' })),
];

export const LOCAL_STORAGE_GAME_KEY = 'happyFarmGame';
