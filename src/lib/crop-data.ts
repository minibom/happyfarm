
import type { CropDetails, CropId, SeedId } from '@/types';

// Base times and prices for Tier 10 crops for scaling
const T10_PINEAPPLE_TIMES = { growing: 3600000 * 12, ready: 7200000 * 12 };
const T10_PINEAPPLE_PRICES = { seed: 30 * 10, crop: 35 * 10 };
const T10_PINEAPPLE_YIELD = 1 * 12; // Base yield is an integer

// Crop definitions and related identifiers
export const CROP_DATA: Record<CropId, CropDetails> = {
  // --- Existing Crops (Tier 1-10) ---
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

  pineapple: { name: 'Dứa (Thơm)', seedName: 'pineappleSeed', icon: '🍍', timeToGrowing: T10_PINEAPPLE_TIMES.growing, timeToReady: T10_PINEAPPLE_TIMES.ready, harvestYield: T10_PINEAPPLE_YIELD, seedPrice: T10_PINEAPPLE_PRICES.seed, cropPrice: T10_PINEAPPLE_PRICES.crop, unlockTier: 10 },
  coconut: { name: 'Dừa', seedName: 'coconutSeed', icon: '🥥', timeToGrowing: T10_PINEAPPLE_TIMES.growing * 1.1, timeToReady: T10_PINEAPPLE_TIMES.ready * 1.1, harvestYield: T10_PINEAPPLE_YIELD, seedPrice: T10_PINEAPPLE_PRICES.seed * 1.3, cropPrice: T10_PINEAPPLE_PRICES.crop * 1.3, unlockTier: 10 },
  durian: { name: 'Sầu Riêng', seedName: 'durianSeed', icon: '🤢', timeToGrowing: T10_PINEAPPLE_TIMES.growing * 1.2, timeToReady: T10_PINEAPPLE_TIMES.ready * 1.2, harvestYield: T10_PINEAPPLE_YIELD, seedPrice: T10_PINEAPPLE_PRICES.seed * 3.3, cropPrice: T10_PINEAPPLE_PRICES.crop * 4.3, unlockTier: 10 },

  // --- New Crops for Tiers 11-15 (HarvestYield rounded) ---
  celestialCarrot: { name: 'Cà Rốt Thiên Giới', seedName: 'celestialCarrotSeed', icon: '🌟🥕', timeToGrowing: T10_PINEAPPLE_TIMES.growing * 1.3, timeToReady: T10_PINEAPPLE_TIMES.ready * 1.3, harvestYield: Math.floor(T10_PINEAPPLE_YIELD * 1.1), seedPrice: Math.floor(T10_PINEAPPLE_PRICES.seed * 1.5), cropPrice: Math.floor(T10_PINEAPPLE_PRICES.crop * 1.2), unlockTier: 11 },
  starBean: { name: 'Đậu Ngôi Sao', seedName: 'starBeanSeed', icon: '✨🌱', timeToGrowing: T10_PINEAPPLE_TIMES.growing * 1.35, timeToReady: T10_PINEAPPLE_TIMES.ready * 1.35, harvestYield: Math.floor(T10_PINEAPPLE_YIELD * 1.5), seedPrice: Math.floor(T10_PINEAPPLE_PRICES.seed * 1.6), cropPrice: Math.floor(T10_PINEAPPLE_PRICES.crop * 1.1), unlockTier: 11 },
  moonHerb: { name: 'Thảo Dược Mặt Trăng', seedName: 'moonHerbSeed', icon: '🌙🌿', timeToGrowing: T10_PINEAPPLE_TIMES.growing * 1.4, timeToReady: T10_PINEAPPLE_TIMES.ready * 1.4, harvestYield: Math.floor(T10_PINEAPPLE_YIELD * 1.2), seedPrice: Math.floor(T10_PINEAPPLE_PRICES.seed * 1.7), cropPrice: Math.floor(T10_PINEAPPLE_PRICES.crop * 1.3), unlockTier: 12 },
  sunBerry: { name: 'Dâu Mặt Trời', seedName: 'sunBerrySeed', icon: '☀️🍓', timeToGrowing: T10_PINEAPPLE_TIMES.growing * 1.45, timeToReady: T10_PINEAPPLE_TIMES.ready * 1.45, harvestYield: Math.floor(T10_PINEAPPLE_YIELD * 1.2), seedPrice: Math.floor(T10_PINEAPPLE_PRICES.seed * 1.8), cropPrice: Math.floor(T10_PINEAPPLE_PRICES.crop * 1.4), unlockTier: 12 },
  galaxyGrain: { name: 'Ngũ Cốc Ngân Hà', seedName: 'galaxyGrainSeed', icon: '🌌🌾', timeToGrowing: T10_PINEAPPLE_TIMES.growing * 1.5, timeToReady: T10_PINEAPPLE_TIMES.ready * 1.5, harvestYield: Math.floor(T10_PINEAPPLE_YIELD * 1.6), seedPrice: Math.floor(T10_PINEAPPLE_PRICES.seed * 1.9), cropPrice: Math.floor(T10_PINEAPPLE_PRICES.crop * 1.2), unlockTier: 13 },
  cometCorn: { name: 'Ngô Sao Chổi', seedName: 'cometCornSeed', icon: '☄️🌽', timeToGrowing: T10_PINEAPPLE_TIMES.growing * 1.55, timeToReady: T10_PINEAPPLE_TIMES.ready * 1.55, harvestYield: Math.floor(T10_PINEAPPLE_YIELD * 0.8), seedPrice: Math.floor(T10_PINEAPPLE_PRICES.seed * 2.0), cropPrice: Math.floor(T10_PINEAPPLE_PRICES.crop * 1.8), unlockTier: 13 },
  nebulaNectarine: { name: 'Đào Tinh Vân', seedName: 'nebulaNectarineSeed', icon: '🍑✨', timeToGrowing: T10_PINEAPPLE_TIMES.growing * 1.6, timeToReady: T10_PINEAPPLE_TIMES.ready * 1.6, harvestYield: Math.floor(T10_PINEAPPLE_YIELD * 0.9), seedPrice: Math.floor(T10_PINEAPPLE_PRICES.seed * 2.2), cropPrice: Math.floor(T10_PINEAPPLE_PRICES.crop * 2.0), unlockTier: 14 },
  voidRoot: { name: 'Rễ Hư Vô', seedName: 'voidRootSeed', icon: '⚫🥔', timeToGrowing: T10_PINEAPPLE_TIMES.growing * 1.65, timeToReady: T10_PINEAPPLE_TIMES.ready * 1.65, harvestYield: Math.floor(T10_PINEAPPLE_YIELD * 1.3), seedPrice: Math.floor(T10_PINEAPPLE_PRICES.seed * 2.3), cropPrice: Math.floor(T10_PINEAPPLE_PRICES.crop * 1.5), unlockTier: 14 },
  quantumQuince: { name: 'Mộc Qua Lượng Tử', seedName: 'quantumQuinceSeed', icon: '⚛️🍈', timeToGrowing: T10_PINEAPPLE_TIMES.growing * 1.7, timeToReady: T10_PINEAPPLE_TIMES.ready * 1.7, harvestYield: T10_PINEAPPLE_YIELD, seedPrice: Math.floor(T10_PINEAPPLE_PRICES.seed * 2.5), cropPrice: Math.floor(T10_PINEAPPLE_PRICES.crop * 2.2), unlockTier: 15 },
  phantomPepper: { name: 'Ớt Bóng Ma', seedName: 'phantomPepperSeed', icon: '👻🌶️', timeToGrowing: T10_PINEAPPLE_TIMES.growing * 1.75, timeToReady: T10_PINEAPPLE_TIMES.ready * 1.75, harvestYield: Math.floor(T10_PINEAPPLE_YIELD * 1.4), seedPrice: Math.floor(T10_PINEAPPLE_PRICES.seed * 2.6), cropPrice: Math.floor(T10_PINEAPPLE_PRICES.crop * 1.7), unlockTier: 15 },

  // --- Special Event Crops (10 examples, unlockTier 999) ---
  goldenPumpkin: { name: 'Bí Ngô Hoàng Kim', seedName: 'goldenPumpkinSeed', icon: '🎃🌟', timeToGrowing: 60000 * 5, timeToReady: 120000 * 5, harvestYield: 1, seedPrice: 500, cropPrice: 2500, unlockTier: 999 },
  crystalMelon: { name: 'Dưa Hấu Pha Lê', seedName: 'crystalMelonSeed', icon: '💎🍉', timeToGrowing: 3600000 * 2, timeToReady: 7200000 * 2, harvestYield: 1, seedPrice: 1000, cropPrice: 10000, unlockTier: 999 },
  moonflowerBloom: { name: 'Nguyệt Dạ Hoa', seedName: 'moonflowerBloomSeed', icon: '🌸🌙', timeToGrowing: 60 * 60 * 1000 * 4, timeToReady: 60 * 60 * 1000 * 8, harvestYield: 3, seedPrice: 300, cropPrice: 300, unlockTier: 999 }, // 4h grow, 8h ready
  sunpetalRose: { name: 'Hồng Mặt Trời', seedName: 'sunpetalRoseSeed', icon: '🌹☀️', timeToGrowing: 60 * 60 * 1000 * 3, timeToReady: 60 * 60 * 1000 * 6, harvestYield: 2, seedPrice: 250, cropPrice: 400, unlockTier: 999 },
  luckyClover: { name: 'Cỏ Ba Lá May Mắn', seedName: 'luckyCloverSeed', icon: '🍀', timeToGrowing: 10 * 60 * 1000, timeToReady: 20 * 60 * 1000, harvestYield: 1, seedPrice: 100, cropPrice: 777, unlockTier: 999 }, // 10m grow, 20m ready
  loveBerry: { name: 'Dâu Tình Yêu', seedName: 'loveBerrySeed', icon: '🍓❤️', timeToGrowing: 14 * 60 * 1000, timeToReady: 20 * 60 * 1000, harvestYield: 5, seedPrice: 50, cropPrice: 50, unlockTier: 999 },
  ghostPepperEvent: { name: 'Ớt Ma Quái (Event)', seedName: 'ghostPepperEventSeed', icon: '🌶️👻', timeToGrowing: 4 * 444 * 1000, timeToReady: 4 * 444 * 1000, harvestYield: 4, seedPrice: 44, cropPrice: 444, unlockTier: 999 }, // Note: Renamed ID slightly to avoid conflict if 'ghostPepper' is used as a regular crop
  rainbowTulip: { name: 'Tulip Cầu Vồng', seedName: 'rainbowTulipSeed', icon: '🌷🌈', timeToGrowing: 60 * 60 * 1000 * 6, timeToReady: 60 * 60 * 1000 * 12, harvestYield: 1, seedPrice: 500, cropPrice: 1500, unlockTier: 999 },
  starAniseEvent: { name: 'Hồi Ngôi Sao (Event)', seedName: 'starAniseEventSeed', icon: '🌟🍂', timeToGrowing: 30 * 60 * 1000, timeToReady: 60 * 60 * 1000, harvestYield: 10, seedPrice: 80, cropPrice: 20, unlockTier: 999 },
  dreamWeed: { name: 'Cỏ Mộng Mơ', seedName: 'dreamWeedSeed', icon: '🌿💭', timeToGrowing: 60 * 60 * 1000 * 1, timeToReady: 60 * 60 * 1000 * 2, harvestYield: 1, seedPrice: 10, cropPrice: 1, unlockTier: 999 }, // Low value, maybe for crafting or special effect
};

export const ALL_CROP_IDS = Object.keys(CROP_DATA) as CropId[];
export const ALL_SEED_IDS = ALL_CROP_IDS.map(cropId => CROP_DATA[cropId].seedName as SeedId);

// It's good practice to also ensure that if an ID like 'ghostPepper' was used elsewhere as a regular crop,
// the event crop ID should be unique. I've added "Event" to 'ghostPepperEventSeed' and its corresponding CropId.
// If 'phantomPepper' was meant to be the regular version and 'ghostPepperEvent' the special, they are now distinct.
// If 'ghostPepper' was a typo for 'phantomPepper', the above data should be fine.
// Let's assume 'phantomPepper' is the regular Tier 15 crop and 'ghostPepperEvent' is the special one.
// If 'ghostPepper' was meant to be the regular one, then 'phantomPepper' might need renaming or removal.
// For now, both `phantomPepper` (Tier 15) and `ghostPepperEvent` (Tier 999) exist.
