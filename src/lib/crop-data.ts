
import type { CropDetails, CropId, SeedId } from '@/types';

// Crop definitions and related identifiers
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
  spinach: { name: 'Rau Bina', seedName: 'spinachSeed', icon: '🍃', timeToGrowing: 75000, timeToReady: 150000, harvestYield: 2, seedPrice: 3, cropPrice: 2, unlockTier: 2 },
  radish: { name: 'Củ Cải', seedName: 'radishSeed', icon: '⚪', timeToGrowing: 90000, timeToReady: 180000, harvestYield: 3, seedPrice: 6, cropPrice: 3, unlockTier: 2 },
  peas: { name: 'Đậu Hà Lan', seedName: 'peasSeed', icon: '🟢', timeToGrowing: 105000, timeToReady: 210000, harvestYield: 10, seedPrice: 9, cropPrice: 1, unlockTier: 2 },
  
  lemon: { name: 'Chanh Vàng', seedName: 'lemonSeed', icon: '🍋', timeToGrowing: 300000, timeToReady: 600000, harvestYield: 4, seedPrice: 9, cropPrice: 3, unlockTier: 3 },
  eggplant: { name: 'Cà Tím', seedName: 'eggplantSeed', icon: '🍆', timeToGrowing: 330000, timeToReady: 660000, harvestYield: 3, seedPrice: 11, cropPrice: 4, unlockTier: 3 },
  garlic: { name: 'Tỏi', seedName: 'garlicSeed', icon: '🧄', timeToGrowing: 240000, timeToReady: 480000, harvestYield: 5, seedPrice: 8, cropPrice: 2, unlockTier: 3 },
  zucchini: { name: 'Bí Ngòi', seedName: 'zucchiniSeed', icon: '🇿', timeToGrowing: 210000, timeToReady: 420000, harvestYield: 2, seedPrice: 7, cropPrice: 4, unlockTier: 3 },
  celery: { name: 'Cần Tây', seedName: 'celerySeed', icon: '🌿', timeToGrowing: 225000, timeToReady: 450000, harvestYield: 1, seedPrice: 5, cropPrice: 6, unlockTier: 3 },
  turnip: { name: 'Củ Cải Turnip', seedName: 'turnipSeed', icon: '🟣', timeToGrowing: 210000, timeToReady: 420000, harvestYield: 2, seedPrice: 6, cropPrice: 4, unlockTier: 3 },
  
  mango: { name: 'Xoài', seedName: 'mangoSeed', icon: '🥭', timeToGrowing: 540000 * 3, timeToReady: 1080000 * 3, harvestYield: 2 * 3, seedPrice: 20 * 2, cropPrice: 12 * 2, unlockTier: 4 },
  broccoli: { name: 'Bông Cải Xanh', seedName: 'broccoliSeed', icon: '🥦', timeToGrowing: 450000 * 3, timeToReady: 900000 * 3, harvestYield: 1 * 3, seedPrice: 10 * 2, cropPrice: 12 * 2, unlockTier: 4 },
  bellpepper: { name: 'Ớt Chuông', seedName: 'bellpepperSeed', icon: '🫑', timeToGrowing: 480000 * 3, timeToReady: 960000 * 3, harvestYield: 3 * 3, seedPrice: 13 * 2, cropPrice: 5 * 2, unlockTier: 4 },
  cabbage: { name: 'Bắp Cải', seedName: 'cabbageSeed', icon: '🥬', timeToGrowing: 390000 * 3, timeToReady: 780000 * 3, harvestYield: 1 * 3, seedPrice: 7 * 2, cropPrice: 8 * 2, unlockTier: 4 },
  cauliflower: { name: 'Súp Lơ Trắng', seedName: 'cauliflowerSeed', icon: '▫️', timeToGrowing: 450000 * 3, timeToReady: 900000 * 3, harvestYield: 1 * 3, seedPrice: 11 * 2, cropPrice: 13 * 2, unlockTier: 4 },
  beetroot: { name: 'Củ Dền', seedName: 'beetrootSeed', icon: '🔴', timeToGrowing: 360000 * 3, timeToReady: 720000 * 3, harvestYield: 2 * 3, seedPrice: 8 * 2, cropPrice: 5 * 2, unlockTier: 4 },
  
  kiwi: { name: 'Kiwi', seedName: 'kiwiSeed', icon: '🥝', timeToGrowing: 720000 * 3, timeToReady: 1440000 * 3, harvestYield: 3 * 3, seedPrice: 15 * 2, cropPrice: 6 * 2, unlockTier: 5 },
  apple: { name: 'Táo Đỏ', seedName: 'appleSeed', icon: '🍎', timeToGrowing: 780000 * 3, timeToReady: 1560000 * 3, harvestYield: 2 * 3, seedPrice: 14 * 2, cropPrice: 8 * 2, unlockTier: 5 },
  banana: { name: 'Chuối', seedName: 'bananaSeed', icon: '🍌', timeToGrowing: 660000 * 3, timeToReady: 1320000 * 3, harvestYield: 5 * 3, seedPrice: 13 * 2, cropPrice: 3 * 2, unlockTier: 5 },
  sweetpotato: { name: 'Khoai Lang', seedName: 'sweetpotatoSeed', icon: '🍠', timeToGrowing: 600000 * 3, timeToReady: 1200000 * 3, harvestYield: 3 * 3, seedPrice: 9 * 2, cropPrice: 4 * 2, unlockTier: 5 },
  ginger: { name: 'Gừng', seedName: 'gingerSeed', icon: '🫚', timeToGrowing: 690000 * 3, timeToReady: 1380000 * 3, harvestYield: 3 * 3, seedPrice: 13 * 2, cropPrice: 5 * 2, unlockTier: 5 },
  soybean: { name: 'Đậu Nành', seedName: 'soybeanSeed', icon: '🌱', timeToGrowing: 720000 * 3, timeToReady: 1440000 * 3, harvestYield: 8 * 3, seedPrice: 10 * 2, cropPrice: 2 * 2, unlockTier: 5 },

  grapes: { name: 'Nho', seedName: 'grapesSeed', icon: '🍇', timeToGrowing: 1080000 * 3, timeToReady: 2160000 * 3, harvestYield: 10 * 3, seedPrice: 18 * 2, cropPrice: 2 * 2, unlockTier: 6 },
  greenapple: { name: 'Táo Xanh', seedName: 'greenappleSeed', icon: '🍏', timeToGrowing: 990000 * 3, timeToReady: 1980000 * 3, harvestYield: 2 * 3, seedPrice: 15 * 2, cropPrice: 8 * 2, unlockTier: 6 },
  peanut: { name: 'Đậu Phộng', seedName: 'peanutSeed', icon: '🥜', timeToGrowing: 900000 * 3, timeToReady: 1800000 * 3, harvestYield: 10 * 3, seedPrice: 12 * 2, cropPrice: 1 * 2, unlockTier: 6 },
  chilipepper: { name: 'Ớt Cay', seedName: 'chilipepperSeed', icon: '🌶️', timeToGrowing: 840000 * 3, timeToReady: 1680000 * 3, harvestYield: 8 * 3, seedPrice: 11 * 2, cropPrice: 2 * 2, unlockTier: 6 },
  papaya: { name: 'Đu Đủ', seedName: 'papayaSeed', icon: '🥭', timeToGrowing: 1140000 * 3, timeToReady: 2280000 * 3, harvestYield: 2 * 3, seedPrice: 19 * 2, cropPrice: 11 * 2, unlockTier: 6 },
  leek: { name: 'Tỏi Tây (Boa-rô)', seedName: 'leekSeed', icon: '🥬', timeToGrowing: 870000 * 3, timeToReady: 1740000 * 3, harvestYield: 2 * 3, seedPrice: 7 * 2, cropPrice: 4 * 2, unlockTier: 6 },

  peach: { name: 'Đào', seedName: 'peachSeed', icon: '🍑', timeToGrowing: 1500000 * 6, timeToReady: 3000000 * 6, harvestYield: 2 * 6, seedPrice: 17 * 5, cropPrice: 10 * 5, unlockTier: 7 },
  pear: { name: 'Lê', seedName: 'pearSeed', icon: '🍐', timeToGrowing: 1560000 * 6, timeToReady: 3120000 * 6, harvestYield: 2 * 6, seedPrice: 16 * 5, cropPrice: 9 * 5, unlockTier: 7 },
  mushroom: { name: 'Nấm', seedName: 'mushroomSeed', icon: '🍄', timeToGrowing: 1260000 * 6, timeToReady: 2520000 * 6, harvestYield: 6 * 6, seedPrice: 15 * 5, cropPrice: 3 * 5, unlockTier: 7 },
  sugarcane: { name: 'Mía', seedName: 'sugarcaneSeed', icon: '🎋', timeToGrowing: 1800000 * 6, timeToReady: 3600000 * 6, harvestYield: 3 * 6, seedPrice: 14 * 5, cropPrice: 6 * 5, unlockTier: 7 },
  plum: { name: 'Mận', seedName: 'plumSeed', icon: '💜', timeToGrowing: 1620000 * 6, timeToReady: 3240000 * 6, harvestYield: 4 * 6, seedPrice: 18 * 5, cropPrice: 5 * 5, unlockTier: 7 },
  asparagus: { name: 'Măng Tây', seedName: 'asparagusSeed', icon: '🎍', timeToGrowing: 1320000 * 6, timeToReady: 2640000 * 6, harvestYield: 4 * 6, seedPrice: 15 * 5, cropPrice: 4 * 5, unlockTier: 7 },
  starfruit: { name: 'Khế', seedName: 'starfruitSeed', icon: '🌟', timeToGrowing: 1680000 * 6, timeToReady: 3360000 * 6, harvestYield: 5 * 6, seedPrice: 20 * 5, cropPrice: 5 * 5, unlockTier: 7 },
  
  cherry: { name: 'Anh Đào', seedName: 'cherrySeed', icon: '🍒', timeToGrowing: 2040000 * 6, timeToReady: 4080000 * 6, harvestYield: 8 * 6, seedPrice: 22 * 5, cropPrice: 3 * 5, unlockTier: 8 },
  orange: { name: 'Cam', seedName: 'orangeSeed', icon: '🍊', timeToGrowing: 2160000 * 6, timeToReady: 4320000 * 6, harvestYield: 3 * 6, seedPrice: 16 * 5, cropPrice: 7 * 5, unlockTier: 8 },
  rice: { name: 'Lúa Gạo', seedName: 'riceSeed', icon: '🍚', timeToGrowing: 2340000 * 6, timeToReady: 4680000 * 6, harvestYield: 15 * 6, seedPrice: 10 * 5, cropPrice: 1 * 5, unlockTier: 8 },
  pumpkin: { name: 'Bí Ngô', seedName: 'pumpkinSeed', icon: '🎃', timeToGrowing: 2520000 * 6, timeToReady: 5040000 * 6, harvestYield: 1 * 6, seedPrice: 20 * 5, cropPrice: 25 * 5, unlockTier: 8 },
  artichoke: { name: 'Atiso', seedName: 'artichokeSeed', icon: '🌸', timeToGrowing: 2280000 * 6, timeToReady: 4560000 * 6, harvestYield: 1 * 6, seedPrice: 22 * 5, cropPrice: 25 * 5, unlockTier: 8 },
  lentil: { name: 'Đậu Lăng', seedName: 'lentilSeed', icon: '🟤', timeToGrowing: 1860000 * 6, timeToReady: 3720000 * 6, harvestYield: 12 * 6, seedPrice: 11 * 5, cropPrice: 1 * 5, unlockTier: 8 },
  lychee: { name: 'Vải Thiều', seedName: 'lycheeSeed', icon: '🔴', timeToGrowing: 2400000 * 6, timeToReady: 4800000 * 6, harvestYield: 10 * 6, seedPrice: 25 * 5, cropPrice: 3 * 5, unlockTier: 8 },
  
  watermelon: { name: 'Dưa Hấu', seedName: 'watermelonSeed', icon: '🍉', timeToGrowing: 2880000 * 6, timeToReady: 5760000 * 6, harvestYield: 1 * 6, seedPrice: 25 * 5, cropPrice: 30 * 5, unlockTier: 9 },
  avocado: { name: 'Bơ', seedName: 'avocadoSeed', icon: '🥑', timeToGrowing: 3000000 * 6, timeToReady: 6000000 * 6, harvestYield: 2 * 6, seedPrice: 28 * 5, cropPrice: 18 * 5, unlockTier: 9 },
  olive: { name: 'Ô Liu', seedName: 'oliveSeed', icon: '🫒', timeToGrowing: 2640000 * 6, timeToReady: 5280000 * 6, harvestYield: 6 * 6, seedPrice: 26 * 5, cropPrice: 5 * 5, unlockTier: 9 },
  chestnut: { name: 'Hạt Dẻ', seedName: 'chestnutSeed', icon: '🌰', timeToGrowing: 3240000 * 6, timeToReady: 6480000 * 6, harvestYield: 2 * 6, seedPrice: 35 * 5, cropPrice: 20 * 5, unlockTier: 9 },
  dragonfruit: { name: 'Thanh Long', seedName: 'dragonfruitSeed', icon: '🩷', timeToGrowing: 2520000 * 6, timeToReady: 5040000 * 6, harvestYield: 2 * 6, seedPrice: 30 * 5, cropPrice: 18 * 5, unlockTier: 9 },

  pineapple: { name: 'Dứa (Thơm)', seedName: 'pineappleSeed', icon: '🍍', timeToGrowing: 3600000 * 12, timeToReady: 7200000 * 12, harvestYield: 1 * 12, seedPrice: 30 * 10, cropPrice: 35 * 10, unlockTier: 10 },
  coconut: { name: 'Dừa', seedName: 'coconutSeed', icon: '🥥', timeToGrowing: 3960000 * 12, timeToReady: 7920000 * 12, harvestYield: 1 * 12, seedPrice: 40 * 10, cropPrice: 45 * 10, unlockTier: 10 },
  durian: { name: 'Sầu Riêng', seedName: 'durianSeed', icon: '🤢', timeToGrowing: 4320000 * 12, timeToReady: 8640000 * 12, harvestYield: 1 * 12, seedPrice: 100 * 10, cropPrice: 150 * 10, unlockTier: 10 },
};

export const ALL_CROP_IDS = Object.keys(CROP_DATA) as CropId[];
export const ALL_SEED_IDS = ALL_CROP_IDS.map(cropId => CROP_DATA[cropId].seedName as SeedId);
