
import type { CropDetails, CropId, GameState, Plot, MarketItem, SeedId, TierInfo } from '@/types';

export const GRID_ROWS = 3;
export const GRID_COLS = 5;
export const TOTAL_PLOTS = GRID_ROWS * GRID_COLS;

export const INITIAL_GOLD = 100;
export const INITIAL_XP = 0;
export const INITIAL_LEVEL = 1;

export const TIER_NAMES: string[] = [
  "Nông Dân Tập Sự",    // Tier 1 (Level 1-9)
  "Chủ Vườn Chăm Chỉ",  // Tier 2 (Level 10-19)
  "Nhà Trồng Trọt Khéo Léo",// Tier 3 (Level 20-29)
  "Chuyên Gia Mùa Vụ", // Tier 4 (Level 30-39)
  "Bậc Thầy Nông Sản",  // Tier 5 (Level 40-49)
  "Lão Nông Uyên Bác",  // Tier 6 (Level 50-59)
  "Phú Nông Giàu Có",    // Tier 7 (Level 60-69)
  "Hoàng Gia Nông Nghiệp",// Tier 8 (Level 70-79)
  "Thần Nông Tái Thế",  // Tier 9 (Level 80-89)
  "Huyền Thoại Đất Đai" // Tier 10 (Level 90+)
];

export const getPlayerTierInfo = (level: number): TierInfo => {
  const tier = Math.min(Math.floor((level - 1) / 10) + 1, TIER_NAMES.length);
  const tierName = TIER_NAMES[tier - 1] || TIER_NAMES[TIER_NAMES.length - 1];
  const nextTierLevel = tier < TIER_NAMES.length ? tier * 10 + 1 : undefined;
  return { tier, tierName, nextTierLevel };
};


export const CROP_DATA: Record<CropId, CropDetails> = {
  tomato: { name: 'Cà Chua', seedName: 'tomatoSeed', icon: '🍅', timeToGrowing: 60000, timeToReady: 120000, harvestYield: 3, seedPrice: 5, cropPrice: 2, unlockTier: 1 },
  carrot: { name: 'Cà Rốt', seedName: 'carrotSeed', icon: '🥕', timeToGrowing: 120000, timeToReady: 240000, harvestYield: 2, seedPrice: 8, cropPrice: 5, unlockTier: 1 },
  corn: { name: 'Ngô', seedName: 'cornSeed', icon: '🌽', timeToGrowing: 180000, timeToReady: 360000, harvestYield: 1, seedPrice: 12, cropPrice: 15, unlockTier: 1 },
  strawberry: { name: 'Dâu Tây', seedName: 'strawberrySeed', icon: '🍓', timeToGrowing: 90000, timeToReady: 200000, harvestYield: 4, seedPrice: 10, cropPrice: 3, unlockTier: 1 },
  potato: { name: 'Khoai Tây', seedName: 'potatoSeed', icon: '🥔', timeToGrowing: 115000, timeToReady: 240000, harvestYield: 4, seedPrice: 7, cropPrice: 2, unlockTier: 1 },
  lettuce: { name: 'Xà Lách', seedName: 'lettuceSeed', icon: '🥬', timeToGrowing: 65000, timeToReady: 150000, harvestYield: 1, seedPrice: 4, cropPrice: 5, unlockTier: 1 },
  
  blueberry: { name: 'Việt Quất', seedName: 'blueberrySeed', icon: '🫐', timeToGrowing: 100000, timeToReady: 220000, harvestYield: 5, seedPrice: 12, cropPrice: 3, unlockTier: 2 },
  onion: { name: 'Hành Tây', seedName: 'onionSeed', icon: '🧅', timeToGrowing: 95000, timeToReady: 200000, harvestYield: 3, seedPrice: 6, cropPrice: 2, unlockTier: 2 },
  cucumber: { name: 'Dưa Chuột', seedName: 'cucumberSeed', icon: '🥒', timeToGrowing: 75000, timeToReady: 180000, harvestYield: 2, seedPrice: 5, cropPrice: 3, unlockTier: 2 },
  spinach: { name: 'Rau Bina', seedName: 'spinachSeed', icon: '🥬', timeToGrowing: 50000, timeToReady: 110000, harvestYield: 2, seedPrice: 3, cropPrice: 2, unlockTier: 2 },
  radish: { name: 'Củ Cải', seedName: 'radishSeed', icon: '⚪', timeToGrowing: 70000, timeToReady: 160000, harvestYield: 3, seedPrice: 6, cropPrice: 3, unlockTier: 2 },
  peas: { name: 'Đậu Hà Lan', seedName: 'peasSeed', icon: '🟢', timeToGrowing: 60000, timeToReady: 130000, harvestYield: 10, seedPrice: 9, cropPrice: 1, unlockTier: 2 },
  
  lemon: { name: 'Chanh Vàng', seedName: 'lemonSeed', icon: '🍋', timeToGrowing: 100000, timeToReady: 230000, harvestYield: 4, seedPrice: 9, cropPrice: 3, unlockTier: 3 },
  eggplant: { name: 'Cà Tím', seedName: 'eggplantSeed', icon: '🍆', timeToGrowing: 135000, timeToReady: 270000, harvestYield: 3, seedPrice: 11, cropPrice: 4, unlockTier: 3 },
  garlic: { name: 'Tỏi', seedName: 'garlicSeed', icon: '🧄', timeToGrowing: 85000, timeToReady: 190000, harvestYield: 5, seedPrice: 8, cropPrice: 2, unlockTier: 3 },
  zucchini: { name: 'Bí Ngòi', seedName: 'zucchiniSeed', icon: '🥒', timeToGrowing: 80000, timeToReady: 170000, harvestYield: 2, seedPrice: 7, cropPrice: 4, unlockTier: 3 },
  celery: { name: 'Cần Tây', seedName: 'celerySeed', icon: '🥬', timeToGrowing: 70000, timeToReady: 150000, harvestYield: 1, seedPrice: 5, cropPrice: 6, unlockTier: 3 },
  turnip: { name: 'Củ Cải Turnip', seedName: 'turnipSeed', icon: '🟣', timeToGrowing: 75000, timeToReady: 160000, harvestYield: 2, seedPrice: 6, cropPrice: 4, unlockTier: 3 },
  
  mango: { name: 'Xoài', seedName: 'mangoSeed', icon: '🥭', timeToGrowing: 180000, timeToReady: 400000, harvestYield: 2, seedPrice: 20, cropPrice: 12, unlockTier: 4 },
  broccoli: { name: 'Bông Cải Xanh', seedName: 'broccoliSeed', icon: '🥦', timeToGrowing: 105000, timeToReady: 220000, harvestYield: 1, seedPrice: 10, cropPrice: 12, unlockTier: 4 },
  bellpepper: { name: 'Ớt Chuông', seedName: 'bellpepperSeed', icon: '🫑', timeToGrowing: 125000, timeToReady: 260000, harvestYield: 3, seedPrice: 13, cropPrice: 5, unlockTier: 4 },
  cabbage: { name: 'Bắp Cải', seedName: 'cabbageSeed', icon: '🥬', timeToGrowing: 110000, timeToReady: 230000, harvestYield: 1, seedPrice: 7, cropPrice: 8, unlockTier: 4 },
  cauliflower: { name: 'Súp Lơ Trắng', seedName: 'cauliflowerSeed', icon: '🥦', timeToGrowing: 115000, timeToReady: 240000, harvestYield: 1, seedPrice: 11, cropPrice: 13, unlockTier: 4 },
  beetroot: { name: 'Củ Dền', seedName: 'beetrootSeed', icon: '🔴', timeToGrowing: 90000, timeToReady: 200000, harvestYield: 2, seedPrice: 8, cropPrice: 5, unlockTier: 4 },
  
  kiwi: { name: 'Kiwi', seedName: 'kiwiSeed', icon: '🥝', timeToGrowing: 130000, timeToReady: 280000, harvestYield: 3, seedPrice: 15, cropPrice: 6, unlockTier: 5 },
  apple: { name: 'Táo Đỏ', seedName: 'appleSeed', icon: '🍎', timeToGrowing: 140000, timeToReady: 290000, harvestYield: 2, seedPrice: 14, cropPrice: 8, unlockTier: 5 },
  banana: { name: 'Chuối', seedName: 'bananaSeed', icon: '🍌', timeToGrowing: 125000, timeToReady: 260000, harvestYield: 5, seedPrice: 13, cropPrice: 3, unlockTier: 5 },
  sweetpotato: { name: 'Khoai Lang', seedName: 'sweetpotatoSeed', icon: '🍠', timeToGrowing: 130000, timeToReady: 280000, harvestYield: 3, seedPrice: 9, cropPrice: 4, unlockTier: 5 },
  ginger: { name: 'Gừng', seedName: 'gingerSeed', icon: '🌾', timeToGrowing: 120000, timeToReady: 250000, harvestYield: 3, seedPrice: 13, cropPrice: 5, unlockTier: 5 },
  soybean: { name: 'Đậu Nành', seedName: 'soybeanSeed', icon: '🌱', timeToGrowing: 140000, timeToReady: 300000, harvestYield: 8, seedPrice: 10, cropPrice: 2, unlockTier: 5 },

  grapes: { name: 'Nho', seedName: 'grapesSeed', icon: '🍇', timeToGrowing: 150000, timeToReady: 300000, harvestYield: 10, seedPrice: 18, cropPrice: 2, unlockTier: 6 },
  greenapple: { name: 'Táo Xanh', seedName: 'greenappleSeed', icon: '🍏', timeToGrowing: 145000, timeToReady: 300000, harvestYield: 2, seedPrice: 15, cropPrice: 8, unlockTier: 6 },
  peanut: { name: 'Đậu Phộng', seedName: 'peanutSeed', icon: '🥜', timeToGrowing: 145000, timeToReady: 300000, harvestYield: 10, seedPrice: 12, cropPrice: 1, unlockTier: 6 },
  chilipepper: { name: 'Ớt Cay', seedName: 'chilipepperSeed', icon: '🌶️', timeToGrowing: 100000, timeToReady: 210000, harvestYield: 8, seedPrice: 11, cropPrice: 2, unlockTier: 6 },
  papaya: { name: 'Đu Đủ', seedName: 'papayaSeed', icon: '🥭', timeToGrowing: 175000, timeToReady: 360000, harvestYield: 2, seedPrice: 19, cropPrice: 11, unlockTier: 6 },
  leek: { name: 'Tỏi Tây (Boa-rô)', seedName: 'leekSeed', icon: '🧅', timeToGrowing: 85000, timeToReady: 180000, harvestYield: 2, seedPrice: 7, cropPrice: 4, unlockTier: 6 },

  peach: { name: 'Đào', seedName: 'peachSeed', icon: '🍑', timeToGrowing: 160000, timeToReady: 320000, harvestYield: 2, seedPrice: 17, cropPrice: 10, unlockTier: 7 },
  pear: { name: 'Lê', seedName: 'pearSeed', icon: '🍐', timeToGrowing: 155000, timeToReady: 310000, harvestYield: 2, seedPrice: 16, cropPrice: 9, unlockTier: 7 },
  mushroom: { name: 'Nấm', seedName: 'mushroomSeed', icon: '🍄', timeToGrowing: 55000, timeToReady: 120000, harvestYield: 6, seedPrice: 15, cropPrice: 3, unlockTier: 7 },
  sugarcane: { name: 'Mía', seedName: 'sugarcaneSeed', icon: '🎋', timeToGrowing: 190000, timeToReady: 380000, harvestYield: 3, seedPrice: 14, cropPrice: 6, unlockTier: 7 },
  plum: { name: 'Mận', seedName: 'plumSeed', icon: '🍑', timeToGrowing: 165000, timeToReady: 330000, harvestYield: 4, seedPrice: 18, cropPrice: 5, unlockTier: 7 },
  asparagus: { name: 'Măng Tây', seedName: 'asparagusSeed', icon: '🌿', timeToGrowing: 100000, timeToReady: 220000, harvestYield: 4, seedPrice: 15, cropPrice: 4, unlockTier: 7 },
  
  cherry: { name: 'Anh Đào', seedName: 'cherrySeed', icon: '🍒', timeToGrowing: 110000, timeToReady: 250000, harvestYield: 8, seedPrice: 22, cropPrice: 3, unlockTier: 8 },
  orange: { name: 'Cam', seedName: 'orangeSeed', icon: '🍊', timeToGrowing: 170000, timeToReady: 350000, harvestYield: 3, seedPrice: 16, cropPrice: 7, unlockTier: 8 },
  rice: { name: 'Lúa Gạo', seedName: 'riceSeed', icon: '🌾', timeToGrowing: 200000, timeToReady: 420000, harvestYield: 15, seedPrice: 10, cropPrice: 1, unlockTier: 8 },
  pumpkin: { name: 'Bí Ngô', seedName: 'pumpkinSeed', icon: '🎃', timeToGrowing: 220000, timeToReady: 470000, harvestYield: 1, seedPrice: 20, cropPrice: 25, unlockTier: 8 },
  artichoke: { name: 'Atiso', seedName: 'artichokeSeed', icon: '🌸', timeToGrowing: 190000, timeToReady: 390000, harvestYield: 1, seedPrice: 22, cropPrice: 25, unlockTier: 8 },
  lentil: { name: 'Đậu Lăng', seedName: 'lentilSeed', icon: '🟤', timeToGrowing: 130000, timeToReady: 280000, harvestYield: 12, seedPrice: 11, cropPrice: 1, unlockTier: 8 },
  
  watermelon: { name: 'Dưa Hấu', seedName: 'watermelonSeed', icon: '🍉', timeToGrowing: 200000, timeToReady: 450000, harvestYield: 1, seedPrice: 25, cropPrice: 30, unlockTier: 9 },
  avocado: { name: 'Bơ', seedName: 'avocadoSeed', icon: '🥑', timeToGrowing: 220000, timeToReady: 480000, harvestYield: 2, seedPrice: 28, cropPrice: 18, unlockTier: 9 },
  olive: { name: 'Ô Liu', seedName: 'oliveSeed', icon: '🫒', timeToGrowing: 240000, timeToReady: 490000, harvestYield: 6, seedPrice: 26, cropPrice: 5, unlockTier: 9 },
  chestnut: { name: 'Hạt Dẻ', seedName: 'chestnutSeed', icon: '🌰', timeToGrowing: 280000, timeToReady: 550000, harvestYield: 2, seedPrice: 35, cropPrice: 20, unlockTier: 9 },

  pineapple: { name: 'Dứa (Thơm)', seedName: 'pineappleSeed', icon: '🍍', timeToGrowing: 250000, timeToReady: 500000, harvestYield: 1, seedPrice: 30, cropPrice: 35, unlockTier: 10 },
  coconut: { name: 'Dừa', seedName: 'coconutSeed', icon: '🥥', timeToGrowing: 300000, timeToReady: 600000, harvestYield: 1, seedPrice: 40, cropPrice: 45, unlockTier: 10 },
  // Add more items here, ensuring they also have `unlockTier`
  durian: { name: 'Sầu Riêng', seedName: 'durianSeed', icon: '🤢', timeToGrowing: 400000, timeToReady: 800000, harvestYield: 1, seedPrice: 100, cropPrice: 150, unlockTier: 10 },
  starfruit: { name: 'Khế', seedName: 'starfruitSeed', icon: '🌟', timeToGrowing: 180000, timeToReady: 350000, harvestYield: 5, seedPrice: 20, cropPrice: 5, unlockTier: 7 },
  lychee: { name: 'Vải Thiều', seedName: 'lycheeSeed', icon: '🔴', timeToGrowing: 220000, timeToReady: 450000, harvestYield: 10, seedPrice: 25, cropPrice: 3, unlockTier: 8 },
  dragonfruit: { name: 'Thanh Long', seedName: 'dragonfruitSeed', icon: '🩷', timeToGrowing: 200000, timeToReady: 400000, harvestYield: 2, seedPrice: 30, cropPrice: 18, unlockTier: 9 },

};


export const ALL_CROP_IDS = Object.keys(CROP_DATA) as CropId[];
export const ALL_SEED_IDS = ALL_CROP_IDS.map(cropId => CROP_DATA[cropId].seedName as SeedId);


export const INITIAL_PLOTS: Plot[] = Array.from({ length: TOTAL_PLOTS }, (_, i) => ({
  id: i,
  state: 'empty',
}));

export const INITIAL_INVENTORY: GameState['inventory'] = {
  tomatoSeed: 5, carrotSeed: 3, cornSeed: 2, strawberrySeed: 2, potatoSeed: 1, lettuceSeed: 1,
  tomato: 0, carrot: 0, corn: 0, strawberry: 0, potato: 0, lettuce: 0,
};

// Initialize all other defined seeds and crops to 0 in inventory
ALL_SEED_IDS.forEach(seedId => {
  if (!INITIAL_INVENTORY[seedId]) {
    INITIAL_INVENTORY[seedId] = 0;
  }
});
ALL_CROP_IDS.forEach(cropId => {
  if (!INITIAL_INVENTORY[cropId]) {
    INITIAL_INVENTORY[cropId] = 0;
  }
});


export const INITIAL_GAME_STATE: GameState = {
  gold: INITIAL_GOLD,
  xp: INITIAL_XP,
  level: INITIAL_LEVEL,
  plots: INITIAL_PLOTS,
  inventory: INITIAL_INVENTORY,
  lastUpdate: Date.now(),
};

export const LEVEL_UP_XP_THRESHOLD = (level: number): number => {
  return Math.floor(100 * Math.pow(level, 1.5));
};

// MARKET_ITEMS will now be derived dynamically in useGameLogic based on CROP_DATA from Firestore
// This constant can be removed or kept for reference/fallback if needed.
// For now, I'll comment it out to emphasize the shift to dynamic market items.
/*
export const MARKET_ITEMS: MarketItem[] = [
  ...ALL_CROP_IDS.map(cropId => ({
    id: CROP_DATA[cropId].seedName as SeedId,
    name: `${CROP_DATA[cropId].name} (Hạt Giống)`,
    price: CROP_DATA[cropId].seedPrice,
    type: 'seed' as 'seed',
    unlockTier: CROP_DATA[cropId].unlockTier, // Add unlockTier here
  })),
  ...ALL_CROP_IDS.map(cropId => ({
    id: cropId,
    name: CROP_DATA[cropId].name,
    price: CROP_DATA[cropId].cropPrice,
    type: 'crop' as 'crop',
    unlockTier: CROP_DATA[cropId].unlockTier, // Add unlockTier here, though usually crops are always sellable
  })),
];
*/

export const LOCAL_STORAGE_GAME_KEY = 'happyFarmGame';
