
import type { CropDetails, CropId, GameState, Plot, SeedId, TierInfo } from '@/types';

export const GRID_ROWS = 5;
export const GRID_COLS = 5;
export const TOTAL_PLOTS = GRID_ROWS * GRID_COLS;

export const INITIAL_GOLD = 100;
export const INITIAL_XP = 0;
export const INITIAL_LEVEL = 1;
export const INITIAL_UNLOCKED_PLOTS = 10;

export const TIER_NAMES: string[] = [
  "Nông Dân Tập Sự",
  "Chủ Vườn Chăm Chỉ",
  "Nhà Trồng Trọt Khéo Léo",
  "Chuyên Gia Mùa Vụ",
  "Bậc Thầy Nông Sản",
  "Lão Nông Uyên Bác",
  "Phú Nông Giàu Có",
  "Hoàng Gia Nông Nghiệp",
  "Thần Nông Tái Thế",
  "Huyền Thoại Đất Đai"
];

export const getPlayerTierInfo = (level: number): TierInfo => {
  const tier = Math.min(Math.floor((level - 1) / 10) + 1, TIER_NAMES.length);
  const tierName = TIER_NAMES[tier - 1] || TIER_NAMES[TIER_NAMES.length - 1];
  const nextTierLevel = tier < TIER_NAMES.length ? tier * 10 + 1 : undefined;
  return { tier, tierName, nextTierLevel };
};

export const getPlotUnlockCost = (plotIndex: number): number => {
  if (plotIndex < INITIAL_UNLOCKED_PLOTS) return 0;
  const baseCost = 500;
  const increment = 250;
  return baseCost + (plotIndex - INITIAL_UNLOCKED_PLOTS) * increment;
};


export const CROP_DATA: Record<CropId, CropDetails> = {
  tomato: { name: 'Cà Chua', seedName: 'tomatoSeed', icon: '🍅', timeToGrowing: 45000, timeToReady: 90000, harvestYield: 3, seedPrice: 5, cropPrice: 2, unlockTier: 1 },
  carrot: { name: 'Cà Rốt', seedName: 'carrotSeed', icon: '🥕', timeToGrowing: 60000, timeToReady: 120000, harvestYield: 2, seedPrice: 8, cropPrice: 5, unlockTier: 1 },
  corn: { name: 'Ngô', seedName: 'cornSeed', icon: '🌽', timeToGrowing: 75000, timeToReady: 150000, harvestYield: 1, seedPrice: 12, cropPrice: 15, unlockTier: 1 },
  strawberry: { name: 'Dâu Tây', seedName: 'strawberrySeed', icon: '🍓', timeToGrowing: 30000, timeToReady: 60000, harvestYield: 4, seedPrice: 10, cropPrice: 3, unlockTier: 1 },
  potato: { name: 'Khoai Tây', seedName: 'potatoSeed', icon: '🥔', timeToGrowing: 60000, timeToReady: 135000, harvestYield: 4, seedPrice: 7, cropPrice: 2, unlockTier: 1 },
  lettuce: { name: 'Xà Lách', seedName: 'lettuceSeed', icon: '🥬', timeToGrowing: 20000, timeToReady: 45000, harvestYield: 1, seedPrice: 4, cropPrice: 5, unlockTier: 1 },
  
  blueberry: { name: 'Việt Quất', seedName: 'blueberrySeed', icon: '🫐', timeToGrowing: 120000, timeToReady: 240000, harvestYield: 5, seedPrice: 12, cropPrice: 3, unlockTier: 2 },
  onion: { name: 'Hành Tây', seedName: 'onionSeed', icon: '🧅', timeToGrowing: 105000, timeToReady: 210000, harvestYield: 3, seedPrice: 6, cropPrice: 2, unlockTier: 2 },
  cucumber: { name: 'Dưa Chuột', seedName: 'cucumberSeed', icon: '🥒', timeToGrowing: 90000, timeToReady: 180000, harvestYield: 2, seedPrice: 5, cropPrice: 3, unlockTier: 2 },
  spinach: { name: 'Rau Bina', seedName: 'spinachSeed', icon: '🥬', timeToGrowing: 60000, timeToReady: 150000, harvestYield: 2, seedPrice: 3, cropPrice: 2, unlockTier: 2 },
  radish: { name: 'Củ Cải', seedName: 'radishSeed', icon: '⚪', timeToGrowing: 75000, timeToReady: 165000, harvestYield: 3, seedPrice: 6, cropPrice: 3, unlockTier: 2 },
  peas: { name: 'Đậu Hà Lan', seedName: 'peasSeed', icon: '🟢', timeToGrowing: 90000, timeToReady: 195000, harvestYield: 10, seedPrice: 9, cropPrice: 1, unlockTier: 2 },
  
  lemon: { name: 'Chanh Vàng', seedName: 'lemonSeed', icon: '🍋', timeToGrowing: 240000, timeToReady: 480000, harvestYield: 4, seedPrice: 9, cropPrice: 3, unlockTier: 3 },
  eggplant: { name: 'Cà Tím', seedName: 'eggplantSeed', icon: '🍆', timeToGrowing: 270000, timeToReady: 540000, harvestYield: 3, seedPrice: 11, cropPrice: 4, unlockTier: 3 },
  garlic: { name: 'Tỏi', seedName: 'garlicSeed', icon: '🧄', timeToGrowing: 210000, timeToReady: 420000, harvestYield: 5, seedPrice: 8, cropPrice: 2, unlockTier: 3 },
  zucchini: { name: 'Bí Ngòi', seedName: 'zucchiniSeed', icon: '🥒', timeToGrowing: 180000, timeToReady: 390000, harvestYield: 2, seedPrice: 7, cropPrice: 4, unlockTier: 3 },
  celery: { name: 'Cần Tây', seedName: 'celerySeed', icon: '🥬', timeToGrowing: 195000, timeToReady: 450000, harvestYield: 1, seedPrice: 5, cropPrice: 6, unlockTier: 3 },
  turnip: { name: 'Củ Cải Turnip', seedName: 'turnipSeed', icon: '🟣', timeToGrowing: 180000, timeToReady: 360000, harvestYield: 2, seedPrice: 6, cropPrice: 4, unlockTier: 3 },
  
  mango: { name: 'Xoài', seedName: 'mangoSeed', icon: '🥭', timeToGrowing: 420000, timeToReady: 840000, harvestYield: 2, seedPrice: 20, cropPrice: 12, unlockTier: 4 },
  broccoli: { name: 'Bông Cải Xanh', seedName: 'broccoliSeed', icon: '🥦', timeToGrowing: 360000, timeToReady: 720000, harvestYield: 1, seedPrice: 10, cropPrice: 12, unlockTier: 4 },
  bellpepper: { name: 'Ớt Chuông', seedName: 'bellpepperSeed', icon: '🫑', timeToGrowing: 390000, timeToReady: 780000, harvestYield: 3, seedPrice: 13, cropPrice: 5, unlockTier: 4 },
  cabbage: { name: 'Bắp Cải', seedName: 'cabbageSeed', icon: '🥬', timeToGrowing: 330000, timeToReady: 660000, harvestYield: 1, seedPrice: 7, cropPrice: 8, unlockTier: 4 },
  cauliflower: { name: 'Súp Lơ Trắng', seedName: 'cauliflowerSeed', icon: '🥦', timeToGrowing: 360000, timeToReady: 750000, harvestYield: 1, seedPrice: 11, cropPrice: 13, unlockTier: 4 },
  beetroot: { name: 'Củ Dền', seedName: 'beetrootSeed', icon: '🔴', timeToGrowing: 300000, timeToReady: 600000, harvestYield: 2, seedPrice: 8, cropPrice: 5, unlockTier: 4 },
  
  kiwi: { name: 'Kiwi', seedName: 'kiwiSeed', icon: '🥝', timeToGrowing: 600000, timeToReady: 1200000, harvestYield: 3, seedPrice: 15, cropPrice: 6, unlockTier: 5 },
  apple: { name: 'Táo Đỏ', seedName: 'appleSeed', icon: '🍎', timeToGrowing: 660000, timeToReady: 1320000, harvestYield: 2, seedPrice: 14, cropPrice: 8, unlockTier: 5 },
  banana: { name: 'Chuối', seedName: 'bananaSeed', icon: '🍌', timeToGrowing: 540000, timeToReady: 1080000, harvestYield: 5, seedPrice: 13, cropPrice: 3, unlockTier: 5 },
  sweetpotato: { name: 'Khoai Lang', seedName: 'sweetpotatoSeed', icon: '🍠', timeToGrowing: 510000, timeToReady: 1020000, harvestYield: 3, seedPrice: 9, cropPrice: 4, unlockTier: 5 },
  ginger: { name: 'Gừng', seedName: 'gingerSeed', icon: '🌾', timeToGrowing: 570000, timeToReady: 1140000, harvestYield: 3, seedPrice: 13, cropPrice: 5, unlockTier: 5 },
  soybean: { name: 'Đậu Nành', seedName: 'soybeanSeed', icon: '🌱', timeToGrowing: 600000, timeToReady: 1260000, harvestYield: 8, seedPrice: 10, cropPrice: 2, unlockTier: 5 },

  grapes: { name: 'Nho', seedName: 'grapesSeed', icon: '🍇', timeToGrowing: 900000, timeToReady: 1800000, harvestYield: 10, seedPrice: 18, cropPrice: 2, unlockTier: 6 },
  greenapple: { name: 'Táo Xanh', seedName: 'greenappleSeed', icon: '🍏', timeToGrowing: 840000, timeToReady: 1680000, harvestYield: 2, seedPrice: 15, cropPrice: 8, unlockTier: 6 },
  peanut: { name: 'Đậu Phộng', seedName: 'peanutSeed', icon: '🥜', timeToGrowing: 780000, timeToReady: 1560000, harvestYield: 10, seedPrice: 12, cropPrice: 1, unlockTier: 6 },
  chilipepper: { name: 'Ớt Cay', seedName: 'chilipepperSeed', icon: '🌶️', timeToGrowing: 720000, timeToReady: 1500000, harvestYield: 8, seedPrice: 11, cropPrice: 2, unlockTier: 6 },
  papaya: { name: 'Đu Đủ', seedName: 'papayaSeed', icon: '🥭', timeToGrowing: 960000, timeToReady: 1920000, harvestYield: 2, seedPrice: 19, cropPrice: 11, unlockTier: 6 },
  leek: { name: 'Tỏi Tây (Boa-rô)', seedName: 'leekSeed', icon: '🧅', timeToGrowing: 750000, timeToReady: 1620000, harvestYield: 2, seedPrice: 7, cropPrice: 4, unlockTier: 6 },

  peach: { name: 'Đào', seedName: 'peachSeed', icon: '🍑', timeToGrowing: 1200000, timeToReady: 2400000, harvestYield: 2, seedPrice: 17, cropPrice: 10, unlockTier: 7 },
  pear: { name: 'Lê', seedName: 'pearSeed', icon: '🍐', timeToGrowing: 1260000, timeToReady: 2520000, harvestYield: 2, seedPrice: 16, cropPrice: 9, unlockTier: 7 },
  mushroom: { name: 'Nấm', seedName: 'mushroomSeed', icon: '🍄', timeToGrowing: 1080000, timeToReady: 2160000, harvestYield: 6, seedPrice: 15, cropPrice: 3, unlockTier: 7 },
  sugarcane: { name: 'Mía', seedName: 'sugarcaneSeed', icon: '🎋', timeToGrowing: 1440000, timeToReady: 2880000, harvestYield: 3, seedPrice: 14, cropPrice: 6, unlockTier: 7 },
  plum: { name: 'Mận', seedName: 'plumSeed', icon: '🍑', timeToGrowing: 1320000, timeToReady: 2700000, harvestYield: 4, seedPrice: 18, cropPrice: 5, unlockTier: 7 },
  asparagus: { name: 'Măng Tây', seedName: 'asparagusSeed', icon: '🌿', timeToGrowing: 1140000, timeToReady: 2280000, harvestYield: 4, seedPrice: 15, cropPrice: 4, unlockTier: 7 },
  starfruit: { name: 'Khế', seedName: 'starfruitSeed', icon: '🌟', timeToGrowing: 1380000, timeToReady: 2760000, harvestYield: 5, seedPrice: 20, cropPrice: 5, unlockTier: 7 },
  
  cherry: { name: 'Anh Đào', seedName: 'cherrySeed', icon: '🍒', timeToGrowing: 1680000, timeToReady: 3360000, harvestYield: 8, seedPrice: 22, cropPrice: 3, unlockTier: 8 },
  orange: { name: 'Cam', seedName: 'orangeSeed', icon: '🍊', timeToGrowing: 1800000, timeToReady: 3600000, harvestYield: 3, seedPrice: 16, cropPrice: 7, unlockTier: 8 },
  rice: { name: 'Lúa Gạo', seedName: 'riceSeed', icon: '🌾', timeToGrowing: 1980000, timeToReady: 3900000, harvestYield: 15, seedPrice: 10, cropPrice: 1, unlockTier: 8 },
  pumpkin: { name: 'Bí Ngô', seedName: 'pumpkinSeed', icon: '🎃', timeToGrowing: 2100000, timeToReady: 4200000, harvestYield: 1, seedPrice: 20, cropPrice: 25, unlockTier: 8 },
  artichoke: { name: 'Atiso', seedName: 'artichokeSeed', icon: '🌸', timeToGrowing: 1920000, timeToReady: 3840000, harvestYield: 1, seedPrice: 22, cropPrice: 25, unlockTier: 8 },
  lentil: { name: 'Đậu Lăng', seedName: 'lentilSeed', icon: '🟤', timeToGrowing: 1560000, timeToReady: 3120000, harvestYield: 12, seedPrice: 11, cropPrice: 1, unlockTier: 8 },
  lychee: { name: 'Vải Thiều', seedName: 'lycheeSeed', icon: '🔴', timeToGrowing: 2040000, timeToReady: 4080000, harvestYield: 10, seedPrice: 25, cropPrice: 3, unlockTier: 8 },
  
  watermelon: { name: 'Dưa Hấu', seedName: 'watermelonSeed', icon: '🍉', timeToGrowing: 2400000, timeToReady: 4800000, harvestYield: 1, seedPrice: 25, cropPrice: 30, unlockTier: 9 },
  avocado: { name: 'Bơ', seedName: 'avocadoSeed', icon: '🥑', timeToGrowing: 2520000, timeToReady: 5100000, harvestYield: 2, seedPrice: 28, cropPrice: 18, unlockTier: 9 },
  olive: { name: 'Ô Liu', seedName: 'oliveSeed', icon: '🫒', timeToGrowing: 2280000, timeToReady: 4560000, harvestYield: 6, seedPrice: 26, cropPrice: 5, unlockTier: 9 },
  chestnut: { name: 'Hạt Dẻ', seedName: 'chestnutSeed', icon: '🌰', timeToGrowing: 2700000, timeToReady: 5400000, harvestYield: 2, seedPrice: 35, cropPrice: 20, unlockTier: 9 },
  dragonfruit: { name: 'Thanh Long', seedName: 'dragonfruitSeed', icon: '🩷', timeToGrowing: 2160000, timeToReady: 4320000, harvestYield: 2, seedPrice: 30, cropPrice: 18, unlockTier: 9 },

  pineapple: { name: 'Dứa (Thơm)', seedName: 'pineappleSeed', icon: '🍍', timeToGrowing: 3000000, timeToReady: 6000000, harvestYield: 1, seedPrice: 30, cropPrice: 35, unlockTier: 10 },
  coconut: { name: 'Dừa', seedName: 'coconutSeed', icon: '🥥', timeToGrowing: 3300000, timeToReady: 6600000, harvestYield: 1, seedPrice: 40, cropPrice: 45, unlockTier: 10 },
  durian: { name: 'Sầu Riêng', seedName: 'durianSeed', icon: '🤢', timeToGrowing: 3600000, timeToReady: 7200000, harvestYield: 1, seedPrice: 100, cropPrice: 150, unlockTier: 10 },
};

export const ALL_CROP_IDS = Object.keys(CROP_DATA) as CropId[];
export const ALL_SEED_IDS = ALL_CROP_IDS.map(cropId => CROP_DATA[cropId].seedName as SeedId);

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
};

export const LEVEL_UP_XP_THRESHOLD = (level: number): number => {
  return Math.floor(100 * Math.pow(level, 1.5));
};

export const LOCAL_STORAGE_GAME_KEY = 'happyFarmGame';

