
import type { GameState, Plot, MarketState, SeedId, CropId } from '@/types';
import { TOTAL_PLOTS, INITIAL_GOLD, INITIAL_XP, INITIAL_LEVEL, INITIAL_UNLOCKED_PLOTS } from './game-config';
import { CROP_DATA, ALL_CROP_IDS, ALL_SEED_IDS } from './crop-data';

// Initial game state structures
export const INITIAL_PLOTS: Plot[] = Array.from({ length: TOTAL_PLOTS }, (_, i) => ({
  id: i,
  state: 'empty',
}));

export const INITIAL_INVENTORY: GameState['inventory'] = {};
ALL_SEED_IDS.forEach(seedId => {
  INITIAL_INVENTORY[seedId] = seedId === 'tomatoSeed' ? 5 :
                              seedId === 'carrotSeed' ? 3 :
                              seedId === 'strawberrySeed' ? 2 :
                              0;
});
ALL_CROP_IDS.forEach(cropId => {
  INITIAL_INVENTORY[cropId] = 0;
});


export const INITIAL_GAME_STATE: GameState = {
  gold: INITIAL_GOLD,
  xp: INITIAL_XP,
  level: INITIAL_LEVEL,
  plots: INITIAL_PLOTS,
  inventory: INITIAL_INVENTORY,
  lastUpdate: 0,
  unlockedPlotsCount: INITIAL_UNLOCKED_PLOTS,
  status: 'active',
  lastLogin: 0,
  email: undefined,
  displayName: undefined,
};

// Initial Market State
const initialMarketPrices: MarketState['prices'] = {};
const initialMarketPriceChanges: MarketState['priceChanges'] = {};

ALL_CROP_IDS.forEach(cropId => {
  const cropDetail = CROP_DATA[cropId];
  if (cropDetail) {
    initialMarketPrices[cropDetail.seedName] = cropDetail.seedPrice;
    initialMarketPrices[cropId] = cropDetail.cropPrice;
    initialMarketPriceChanges[cropDetail.seedName] = 0;
    initialMarketPriceChanges[cropId] = 0;
  }
});

export const INITIAL_MARKET_STATE: MarketState = {
  prices: initialMarketPrices,
  priceChanges: initialMarketPriceChanges,
  currentEvent: null,
  lastUpdated: Date.now(),
};
