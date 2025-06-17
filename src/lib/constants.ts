
import type { CropDetails, CropId, GameState, Plot, SeedId, TierInfo } from '@/types';

export const GRID_ROWS = 5;
export const GRID_COLS = 5;
export const TOTAL_PLOTS = GRID_ROWS * GRID_COLS;

export const INITIAL_GOLD = 100;
export const INITIAL_XP = 0;
export const INITIAL_LEVEL = 1;
export const INITIAL_UNLOCKED_PLOTS = 10;

export interface TierDetail {
  name: string;
  icon: string;
  colorClass: string;
  levelStart: number;
  xpBoostPercent: number;
  sellPriceBoostPercent: number;
  growthTimeReductionPercent: number;
}

export const TIER_DATA: TierDetail[] = [
  { name: "Nông Dân Tập Sự",        icon: "🌱", colorClass: "bg-green-500 hover:bg-green-600 text-green-50", levelStart: 1, xpBoostPercent: 0, sellPriceBoostPercent: 0, growthTimeReductionPercent: 0 },
  { name: "Chủ Vườn Chăm Chỉ",      icon: "🧑‍🌾", colorClass: "bg-lime-500 hover:bg-lime-600 text-lime-900", levelStart: 11, xpBoostPercent: 0.02, sellPriceBoostPercent: 0.01, growthTimeReductionPercent: 0.01 },
  { name: "Nhà Trồng Trọt Khéo Léo", icon: "🌿", colorClass: "bg-teal-500 hover:bg-teal-600 text-teal-50", levelStart: 21, xpBoostPercent: 0.04, sellPriceBoostPercent: 0.02, growthTimeReductionPercent: 0.02 },
  { name: "Chuyên Gia Mùa Vụ",      icon: "🌾", colorClass: "bg-yellow-400 hover:bg-yellow-500 text-yellow-900", levelStart: 31, xpBoostPercent: 0.06, sellPriceBoostPercent: 0.03, growthTimeReductionPercent: 0.03 },
  { name: "Bậc Thầy Nông Sản",      icon: "🏆", colorClass: "bg-amber-400 hover:bg-amber-500 text-amber-900", levelStart: 41, xpBoostPercent: 0.08, sellPriceBoostPercent: 0.04, growthTimeReductionPercent: 0.04 },
  { name: "Lão Nông Uyên Bác",      icon: "🦉", colorClass: "bg-orange-500 hover:bg-orange-600 text-orange-50", levelStart: 51, xpBoostPercent: 0.10, sellPriceBoostPercent: 0.05, growthTimeReductionPercent: 0.05 },
  { name: "Phú Nông Giàu Có",        icon: "💰", colorClass: "bg-red-500 hover:bg-red-600 text-red-50", levelStart: 61, xpBoostPercent: 0.12, sellPriceBoostPercent: 0.06, growthTimeReductionPercent: 0.06 },
  { name: "Hoàng Gia Nông Nghiệp",   icon: "👑", colorClass: "bg-purple-500 hover:bg-purple-600 text-purple-50", levelStart: 71, xpBoostPercent: 0.15, sellPriceBoostPercent: 0.07, growthTimeReductionPercent: 0.07 },
  { name: "Thần Nông Tái Thế",      icon: "✨", colorClass: "bg-pink-500 hover:bg-pink-600 text-pink-50", levelStart: 81, xpBoostPercent: 0.18, sellPriceBoostPercent: 0.08, growthTimeReductionPercent: 0.08 },
  { name: "Huyền Thoại Đất Đai",    icon: "🌟", colorClass: "bg-indigo-500 hover:bg-indigo-600 text-indigo-50", levelStart: 91, xpBoostPercent: 0.20, sellPriceBoostPercent: 0.10, growthTimeReductionPercent: 0.10 },
];

export const getPlayerTierInfo = (level: number): TierInfo => {
  const tierIndex = Math.min(Math.floor((level - 1) / 10), TIER_DATA.length - 1);
  const currentTierData = TIER_DATA[tierIndex];
  const nextTierData = tierIndex + 1 < TIER_DATA.length ? TIER_DATA[tierIndex + 1] : undefined;

  return {
    tier: tierIndex + 1,
    tierName: currentTierData.name,
    icon: currentTierData.icon,
    colorClass: currentTierData.colorClass,
    nextTierLevel: nextTierData?.levelStart,
    xpBoostPercent: currentTierData.xpBoostPercent,
    sellPriceBoostPercent: currentTierData.sellPriceBoostPercent,
    growthTimeReductionPercent: currentTierData.growthTimeReductionPercent,
  };
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
  potato: { name: 'Khoai Tây', seedName: 'potatoSeed', icon: '🥔', timeToGrowing: 90000, timeToReady: 180000, harvestYield: 4, seedPrice: 7, cropPrice: 2, unlockTier: 1 },
  lettuce: { name: 'Xà Lách', seedName: 'lettuceSeed', icon: '🥬', timeToGrowing: 45000, timeToReady: 90000, harvestYield: 1, seedPrice: 4, cropPrice: 5, unlockTier: 1 },
  
  blueberry: { name: 'Việt Quất', seedName: 'blueberrySeed', icon: '🫐', timeToGrowing: 150000, timeToReady: 300000, harvestYield: 5, seedPrice: 12, cropPrice: 3, unlockTier: 2 },
  onion: { name: 'Hành Tây', seedName: 'onionSeed', icon: '🧅', timeToGrowing: 120000, timeToReady: 240000, harvestYield: 3, seedPrice: 6, cropPrice: 2, unlockTier: 2 },
  cucumber: { name: 'Dưa Chuột', seedName: 'cucumberSeed', icon: '🥒', timeToGrowing: 105000, timeToReady: 210000, harvestYield: 2, seedPrice: 5, cropPrice: 3, unlockTier: 2 },
  spinach: { name: 'Rau Bina', seedName: 'spinachSeed', icon: '🍃', timeToGrowing: 75000, timeToReady: 150000, harvestYield: 2, seedPrice: 3, cropPrice: 2, unlockTier: 2 }, // Changed icon
  radish: { name: 'Củ Cải', seedName: 'radishSeed', icon: '⚪', timeToGrowing: 90000, timeToReady: 180000, harvestYield: 3, seedPrice: 6, cropPrice: 3, unlockTier: 2 },
  peas: { name: 'Đậu Hà Lan', seedName: 'peasSeed', icon: '🟢', timeToGrowing: 105000, timeToReady: 210000, harvestYield: 10, seedPrice: 9, cropPrice: 1, unlockTier: 2 },
  
  lemon: { name: 'Chanh Vàng', seedName: 'lemonSeed', icon: '🍋', timeToGrowing: 300000, timeToReady: 600000, harvestYield: 4, seedPrice: 9, cropPrice: 3, unlockTier: 3 },
  eggplant: { name: 'Cà Tím', seedName: 'eggplantSeed', icon: '🍆', timeToGrowing: 330000, timeToReady: 660000, harvestYield: 3, seedPrice: 11, cropPrice: 4, unlockTier: 3 },
  garlic: { name: 'Tỏi', seedName: 'garlicSeed', icon: '🧄', timeToGrowing: 240000, timeToReady: 480000, harvestYield: 5, seedPrice: 8, cropPrice: 2, unlockTier: 3 },
  zucchini: { name: 'Bí Ngòi', seedName: 'zucchiniSeed', icon: '🇿', timeToGrowing: 210000, timeToReady: 420000, harvestYield: 2, seedPrice: 7, cropPrice: 4, unlockTier: 3 }, // Changed icon
  celery: { name: 'Cần Tây', seedName: 'celerySeed', icon: '🌿', timeToGrowing: 225000, timeToReady: 450000, harvestYield: 1, seedPrice: 5, cropPrice: 6, unlockTier: 3 },
  turnip: { name: 'Củ Cải Turnip', seedName: 'turnipSeed', icon: '🟣', timeToGrowing: 210000, timeToReady: 420000, harvestYield: 2, seedPrice: 6, cropPrice: 4, unlockTier: 3 },
  
  mango: { name: 'Xoài', seedName: 'mangoSeed', icon: '🥭', timeToGrowing: 540000, timeToReady: 1080000, harvestYield: 2, seedPrice: 20, cropPrice: 12, unlockTier: 4 },
  broccoli: { name: 'Bông Cải Xanh', seedName: 'broccoliSeed', icon: '🥦', timeToGrowing: 450000, timeToReady: 900000, harvestYield: 1, seedPrice: 10, cropPrice: 12, unlockTier: 4 },
  bellpepper: { name: 'Ớt Chuông', seedName: 'bellpepperSeed', icon: '🫑', timeToGrowing: 480000, timeToReady: 960000, harvestYield: 3, seedPrice: 13, cropPrice: 5, unlockTier: 4 },
  cabbage: { name: 'Bắp Cải', seedName: 'cabbageSeed', icon: '🥬', timeToGrowing: 390000, timeToReady: 780000, harvestYield: 1, seedPrice: 7, cropPrice: 8, unlockTier: 4 },
  cauliflower: { name: 'Súp Lơ Trắng', seedName: 'cauliflowerSeed', icon: '▫️', timeToGrowing: 450000, timeToReady: 900000, harvestYield: 1, seedPrice: 11, cropPrice: 13, unlockTier: 4 }, // Changed icon
  beetroot: { name: 'Củ Dền', seedName: 'beetrootSeed', icon: '🔴', timeToGrowing: 360000, timeToReady: 720000, harvestYield: 2, seedPrice: 8, cropPrice: 5, unlockTier: 4 },
  
  kiwi: { name: 'Kiwi', seedName: 'kiwiSeed', icon: '🥝', timeToGrowing: 720000, timeToReady: 1440000, harvestYield: 3, seedPrice: 15, cropPrice: 6, unlockTier: 5 },
  apple: { name: 'Táo Đỏ', seedName: 'appleSeed', icon: '🍎', timeToGrowing: 780000, timeToReady: 1560000, harvestYield: 2, seedPrice: 14, cropPrice: 8, unlockTier: 5 },
  banana: { name: 'Chuối', seedName: 'bananaSeed', icon: '🍌', timeToGrowing: 660000, timeToReady: 1320000, harvestYield: 5, seedPrice: 13, cropPrice: 3, unlockTier: 5 },
  sweetpotato: { name: 'Khoai Lang', seedName: 'sweetpotatoSeed', icon: '🍠', timeToGrowing: 600000, timeToReady: 1200000, harvestYield: 3, seedPrice: 9, cropPrice: 4, unlockTier: 5 },
  ginger: { name: 'Gừng', seedName: 'gingerSeed', icon: '🫚', timeToGrowing: 690000, timeToReady: 1380000, harvestYield: 3, seedPrice: 13, cropPrice: 5, unlockTier: 5 }, // Changed icon
  soybean: { name: 'Đậu Nành', seedName: 'soybeanSeed', icon: '🌱', timeToGrowing: 720000, timeToReady: 1440000, harvestYield: 8, seedPrice: 10, cropPrice: 2, unlockTier: 5 },

  grapes: { name: 'Nho', seedName: 'grapesSeed', icon: '🍇', timeToGrowing: 1080000, timeToReady: 2160000, harvestYield: 10, seedPrice: 18, cropPrice: 2, unlockTier: 6 },
  greenapple: { name: 'Táo Xanh', seedName: 'greenappleSeed', icon: '🍏', timeToGrowing: 990000, timeToReady: 1980000, harvestYield: 2, seedPrice: 15, cropPrice: 8, unlockTier: 6 },
  peanut: { name: 'Đậu Phộng', seedName: 'peanutSeed', icon: '🥜', timeToGrowing: 900000, timeToReady: 1800000, harvestYield: 10, seedPrice: 12, cropPrice: 1, unlockTier: 6 },
  chilipepper: { name: 'Ớt Cay', seedName: 'chilipepperSeed', icon: '🌶️', timeToGrowing: 840000, timeToReady: 1680000, harvestYield: 8, seedPrice: 11, cropPrice: 2, unlockTier: 6 },
  papaya: { name: 'Đu Đủ', seedName: 'papayaSeed', icon: '🥭', timeToGrowing: 1140000, timeToReady: 2280000, harvestYield: 2, seedPrice: 19, cropPrice: 11, unlockTier: 6 },
  leek: { name: 'Tỏi Tây (Boa-rô)', seedName: 'leekSeed', icon: '🥬', timeToGrowing: 870000, timeToReady: 1740000, harvestYield: 2, seedPrice: 7, cropPrice: 4, unlockTier: 6 }, // Changed icon

  peach: { name: 'Đào', seedName: 'peachSeed', icon: '🍑', timeToGrowing: 1500000, timeToReady: 3000000, harvestYield: 2, seedPrice: 17, cropPrice: 10, unlockTier: 7 },
  pear: { name: 'Lê', seedName: 'pearSeed', icon: '🍐', timeToGrowing: 1560000, timeToReady: 3120000, harvestYield: 2, seedPrice: 16, cropPrice: 9, unlockTier: 7 },
  mushroom: { name: 'Nấm', seedName: 'mushroomSeed', icon: '🍄', timeToGrowing: 1260000, timeToReady: 2520000, harvestYield: 6, seedPrice: 15, cropPrice: 3, unlockTier: 7 },
  sugarcane: { name: 'Mía', seedName: 'sugarcaneSeed', icon: '🎋', timeToGrowing: 1800000, timeToReady: 3600000, harvestYield: 3, seedPrice: 14, cropPrice: 6, unlockTier: 7 },
  plum: { name: 'Mận', seedName: 'plumSeed', icon: '💜', timeToGrowing: 1620000, timeToReady: 3240000, harvestYield: 4, seedPrice: 18, cropPrice: 5, unlockTier: 7 }, // Changed icon
  asparagus: { name: 'Măng Tây', seedName: 'asparagusSeed', icon: '🎍', timeToGrowing: 1320000, timeToReady: 2640000, harvestYield: 4, seedPrice: 15, cropPrice: 4, unlockTier: 7 }, // Changed icon
  starfruit: { name: 'Khế', seedName: 'starfruitSeed', icon: '🌟', timeToGrowing: 1680000, timeToReady: 3360000, harvestYield: 5, seedPrice: 20, cropPrice: 5, unlockTier: 7 },
  
  cherry: { name: 'Anh Đào', seedName: 'cherrySeed', icon: '🍒', timeToGrowing: 2040000, timeToReady: 4080000, harvestYield: 8, seedPrice: 22, cropPrice: 3, unlockTier: 8 },
  orange: { name: 'Cam', seedName: 'orangeSeed', icon: '🍊', timeToGrowing: 2160000, timeToReady: 4320000, harvestYield: 3, seedPrice: 16, cropPrice: 7, unlockTier: 8 },
  rice: { name: 'Lúa Gạo', seedName: 'riceSeed', icon: '🍚', timeToGrowing: 2340000, timeToReady: 4680000, harvestYield: 15, seedPrice: 10, cropPrice: 1, unlockTier: 8 }, // Changed icon
  pumpkin: { name: 'Bí Ngô', seedName: 'pumpkinSeed', icon: '🎃', timeToGrowing: 2520000, timeToReady: 5040000, harvestYield: 1, seedPrice: 20, cropPrice: 25, unlockTier: 8 },
  artichoke: { name: 'Atiso', seedName: 'artichokeSeed', icon: '🌸', timeToGrowing: 2280000, timeToReady: 4560000, harvestYield: 1, seedPrice: 22, cropPrice: 25, unlockTier: 8 },
  lentil: { name: 'Đậu Lăng', seedName: 'lentilSeed', icon: '🟤', timeToGrowing: 1860000, timeToReady: 3720000, harvestYield: 12, seedPrice: 11, cropPrice: 1, unlockTier: 8 },
  lychee: { name: 'Vải Thiều', seedName: 'lycheeSeed', icon: '🔴', timeToGrowing: 2400000, timeToReady: 4800000, harvestYield: 10, seedPrice: 25, cropPrice: 3, unlockTier: 8 },
  
  watermelon: { name: 'Dưa Hấu', seedName: 'watermelonSeed', icon: '🍉', timeToGrowing: 2880000, timeToReady: 5760000, harvestYield: 1, seedPrice: 25, cropPrice: 30, unlockTier: 9 },
  avocado: { name: 'Bơ', seedName: 'avocadoSeed', icon: '🥑', timeToGrowing: 3000000, timeToReady: 6000000, harvestYield: 2, seedPrice: 28, cropPrice: 18, unlockTier: 9 },
  olive: { name: 'Ô Liu', seedName: 'oliveSeed', icon: '🫒', timeToGrowing: 2640000, timeToReady: 5280000, harvestYield: 6, seedPrice: 26, cropPrice: 5, unlockTier: 9 },
  chestnut: { name: 'Hạt Dẻ', seedName: 'chestnutSeed', icon: '🌰', timeToGrowing: 3240000, timeToReady: 6480000, harvestYield: 2, seedPrice: 35, cropPrice: 20, unlockTier: 9 },
  dragonfruit: { name: 'Thanh Long', seedName: 'dragonfruitSeed', icon: '🩷', timeToGrowing: 2520000, timeToReady: 5040000, harvestYield: 2, seedPrice: 30, cropPrice: 18, unlockTier: 9 },

  pineapple: { name: 'Dứa (Thơm)', seedName: 'pineappleSeed', icon: '🍍', timeToGrowing: 3600000, timeToReady: 7200000, harvestYield: 1, seedPrice: 30, cropPrice: 35, unlockTier: 10 },
  coconut: { name: 'Dừa', seedName: 'coconutSeed', icon: '🥥', timeToGrowing: 3960000, timeToReady: 7920000, harvestYield: 1, seedPrice: 40, cropPrice: 45, unlockTier: 10 },
  durian: { name: 'Sầu Riêng', seedName: 'durianSeed', icon: '🤢', timeToGrowing: 4320000, timeToReady: 8640000, harvestYield: 1, seedPrice: 100, cropPrice: 150, unlockTier: 10 },
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
